/**
 * Unit tests for the pure parts of api/contact.ts: input cleaning, client
 * address normalisation, the rate limiter, and resume validation.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  cleanLine,
  cleanMultiline,
  rateLimitKey,
  SlidingWindowLimiter,
  validateResume,
  MAX_BODY_BYTES,
} from "../api/contact";
import { RESUME_MAX_BYTES } from "../src/shared/enquiry";
import { buildZip, DOC_BYTES, PDF_BYTES, WORD_DOCUMENT_PARTS } from "./helpers";

describe("cleanMultiline (message field)", () => {
  it("keeps line breaks and normalises CRLF / CR to LF", () => {
    assert.equal(cleanMultiline("Line one\r\nLine two\rLine three\n\n- a\n- b", 5000), "Line one\nLine two\nLine three\n\n- a\n- b");
  });

  it("keeps tabs but replaces every other control character", () => {
    assert.equal(cleanMultiline("a\tb\u0000c\u0007d\u000be\u001bf\u007fg", 5000), "a\tb c d e f g");
  });

  it("trims, caps the length, and rejects non-strings", () => {
    assert.equal(cleanMultiline("\n\n  hello  \n\n", 5000), "hello");
    assert.equal(cleanMultiline("abcdef", 3), "abc");
    assert.equal(cleanMultiline(42, 10), "");
    assert.equal(cleanMultiline(undefined, 10), "");
  });
});

describe("cleanLine (single-line fields)", () => {
  it("turns line breaks and control characters into spaces — header-injection safe", () => {
    assert.equal(cleanLine("Asha\r\nBcc: victim@example.com", 100), "Asha  Bcc: victim@example.com");
    assert.equal(cleanLine("a\tb\u0000c", 100), "a b c");
  });
});

describe("rateLimitKey", () => {
  it("keeps plain IPv4 addresses", () => assert.equal(rateLimitKey("203.0.113.5"), "203.0.113.5"));
  it("strips the port Azure's front end appends", () => assert.equal(rateLimitKey("203.0.113.5:51234"), "203.0.113.5"));
  it("unwraps IPv4-mapped IPv6", () => assert.equal(rateLimitKey("::ffff:203.0.113.5"), "203.0.113.5"));
  it("groups IPv6 by /64", () => {
    assert.equal(rateLimitKey("2001:db8:aa:bb:1:2:3:4"), "2001:db8:aa:bb::/64");
    assert.equal(rateLimitKey("[2001:db8:aa:bb::9]:443"), "2001:db8:aa:bb::/64");
    assert.equal(rateLimitKey("2001:DB8:AA:BB::1%eth0"), "2001:db8:aa:bb::/64");
  });
  it("puts anything unparseable in one shared bucket", () => {
    assert.equal(rateLimitKey(""), "unknown");
    assert.equal(rateLimitKey("not-an-ip"), "unknown");
  });
});

describe("SlidingWindowLimiter", () => {
  it("allows up to the limit, then refuses without recording", () => {
    const limiter = new SlidingWindowLimiter(3, 1000, 100);
    assert.equal(limiter.hit("a", 0), false);
    assert.equal(limiter.hit("a", 1), false);
    assert.equal(limiter.isLimited("a", 2), false);
    assert.equal(limiter.hit("a", 2), false);
    assert.equal(limiter.isLimited("a", 3), true);
    assert.equal(limiter.hit("a", 3), true);
    assert.equal(limiter.hit("b", 3), false, "other keys are independent");
  });

  it("frees the allowance as old hits leave the window", () => {
    const limiter = new SlidingWindowLimiter(2, 1000, 100);
    limiter.hit("a", 0);
    limiter.hit("a", 500);
    assert.equal(limiter.isLimited("a", 999), true);
    assert.equal(limiter.isLimited("a", 1000), false, "the hit at t=0 has expired");
    assert.equal(limiter.hit("a", 1000), false);
  });

  it("never tracks more than maxKeys, forgetting the least recently active first", () => {
    const limiter = new SlidingWindowLimiter(1, 60_000, 3);
    limiter.hit("a", 0);
    limiter.hit("b", 1);
    limiter.hit("c", 2);
    limiter.hit("d", 3); // evicts "a"
    assert.equal(limiter.size, 3);
    assert.equal(limiter.isLimited("a", 4), false, "a was evicted");
    assert.equal(limiter.isLimited("b", 4), true);
    assert.equal(limiter.isLimited("d", 4), true);
  });

  it("stays bounded under a flood of distinct clients", () => {
    const limiter = new SlidingWindowLimiter(5, 60_000, 1000);
    for (let i = 0; i < 20_000; i++) limiter.hit(`client-${i}`, i);
    assert.equal(limiter.size, 1000);
  });
});

describe("MAX_BODY_BYTES", () => {
  it("fits a maximum-size resume, base64-encoded, plus the form fields", () => {
    const largestResume = Math.ceil(RESUME_MAX_BYTES / 3) * 4;
    assert.ok(MAX_BODY_BYTES - largestResume >= 100 * 1024);
    assert.ok(MAX_BODY_BYTES < 8 * 1024 * 1024, "tighter than the previous 8 MB cap");
  });
});

describe("validateResume", () => {
  const resume = (filename: string, bytes: Buffer) => ({ filename, mimeType: "x", base64: bytes.toString("base64") });
  const docx = (names: string[]) => buildZip(names.map((name) => ({ name })));

  it("accepts real PDF, DOC and DOCX content and re-derives the attachment", () => {
    for (const [name, bytes, mime] of [
      ["cv.pdf", PDF_BYTES, "application/pdf"],
      ["cv.doc", DOC_BYTES, "application/msword"],
      ["cv.DOCX", docx(WORD_DOCUMENT_PARTS), "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
    ] as const) {
      const { error, attachment } = validateResume(resume(name, bytes), "Internship", "Asha Rao");
      assert.equal(error, undefined, name);
      assert.ok(attachment);
      assert.equal(attachment.mimeType, mime);
      assert.equal(attachment.base64, bytes.toString("base64"));
      assert.match(attachment.filename, /^resume-asha-rao-\d+\.(pdf|doc|docx)$/);
    }
  });

  it("silently drops a resume on enquiry types that don't offer one", () => {
    assert.deepEqual(validateResume(resume("cv.pdf", PDF_BYTES), "Website", "Asha"), {});
  });

  it("rejects a ZIP that is not a Word document", () => {
    const { error } = validateResume(resume("cv.docx", docx(["readme.txt", "payload/setup.dat"])), "Internship", "A");
    assert.match(String(error), /doesn't look like a valid resume/);
  });

  it("rejects a Word document with extra files outside a document's structure", () => {
    const { error } = validateResume(resume("cv.docx", docx([...WORD_DOCUMENT_PARTS, "extra/tool.dat"])), "Internship", "A");
    assert.match(String(error), /doesn't look like a valid resume/);
  });

  it("rejects macros, ActiveX, OLE embeddings and executables with a specific message", () => {
    for (const part of [
      "word/vbaProject.bin",
      "word/vbaData.xml",
      "word/activeX/activeX1.xml",
      "word/embeddings/oleObject1.bin",
      "word/media/setup.exe",
      "word/media/run.js",
    ]) {
      const { error } = validateResume(resume("cv.docx", docx([...WORD_DOCUMENT_PARTS, part])), "Career Opportunity", "A");
      assert.match(String(error), /macros or embedded objects/, part);
    }
  });

  it("rejects path tricks, missing required parts, encryption and malformed archives", () => {
    const cases: [string, Buffer][] = [
      ["traversal", docx([...WORD_DOCUMENT_PARTS, "word/../evil.xml"])],
      ["absolute", docx([...WORD_DOCUMENT_PARTS, "/word/x.xml"])],
      ["backslash", docx([...WORD_DOCUMENT_PARTS, "word\\x.xml"])],
      ["no document.xml", docx(["[Content_Types].xml", "_rels/.rels", "word/styles.xml"])],
      ["no content types", docx(["word/document.xml"])],
      ["encrypted entry", buildZip([...WORD_DOCUMENT_PARTS.map((name) => ({ name })), { name: "word/x.xml", encrypted: true }])],
      ["truncated", docx(WORD_DOCUMENT_PARTS).subarray(0, 200)],
      ["zip signature only", Buffer.concat([Buffer.from([0x50, 0x4b, 0x03, 0x04]), Buffer.alloc(100)])],
      ["pdf renamed", PDF_BYTES],
    ];
    for (const [label, bytes] of cases) {
      const { error, attachment } = validateResume(resume("cv.docx", bytes), "Internship", "A");
      assert.ok(error, label);
      assert.equal(attachment, undefined, label);
    }
  });

  it("rejects wrong signatures, bad extensions, bad base64 and oversize files", () => {
    assert.match(String(validateResume(resume("cv.pdf", Buffer.from("MZ\x90\x00")), "Internship", "A").error), /valid resume/);
    assert.match(String(validateResume(resume("cv.exe", PDF_BYTES), "Internship", "A").error), /PDF, DOC or DOCX/);
    assert.match(
      String(validateResume({ filename: "cv.pdf", mimeType: "", base64: "JVBERi0x!!!" }, "Internship", "A").error),
      /couldn't read/
    );
    assert.match(
      String(validateResume(resume("cv.pdf", Buffer.concat([PDF_BYTES, Buffer.alloc(RESUME_MAX_BYTES)])), "Internship", "A").error),
      /under 5 MB/
    );
    assert.match(String(validateResume({ filename: 1 }, "Internship", "A").error), /valid resume file/);
  });
});
