/**
 * The enquiry API end to end through the real Express middleware chain
 * (server/app.ts), with Resend stubbed so no email is ever sent.
 */
import { after, before, beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { MAX_BODY_BYTES } from "../api/contact";
import { buildZip, freshIp, postEnquiry, request, startApp, stubResend, WORD_DOCUMENT_PARTS, type RunningApp } from "./helpers";

const VALID = {
  name: "Asha Rao",
  email: "asha@example.com",
  phone: "+91 90000 00000",
  organization: "Example College",
  enquiryType: "Website",
  budget: "Not decided",
  source: "Google",
  message: "We need a new website for our department.",
};

let app: RunningApp;
let resend: ReturnType<typeof stubResend>;

before(async () => {
  process.env.RESEND_API_KEY = "re_test_key_not_real";
  process.env.CONTACT_EMAIL = "inbox@example.com";
  process.env.SMTP_FROM = "Nexyronix <noreply@example.com>";
  app = await startApp();
});

after(async () => {
  await app.close();
});

beforeEach(() => {
  resend?.restore();
  resend = stubResend();
});

describe("POST /api/contact — delivery", () => {
  it("delivers a valid enquiry with the expected Resend request", async () => {
    const res = await postEnquiry(app.port, VALID, freshIp());
    assert.equal(res.status, 200);
    assert.deepEqual(res.json(), { ok: true });
    assert.equal(res.headers["cache-control"], "no-store");

    assert.equal(resend.calls.length, 1);
    const { headers, body } = resend.calls[0];
    assert.equal(headers.authorization, "Bearer re_test_key_not_real");
    assert.deepEqual(body.to, ["inbox@example.com"]);
    assert.equal(body.from, "Nexyronix <noreply@example.com>");
    assert.equal(body.reply_to, "asha@example.com");
    assert.equal(body.subject, "New Website Enquiry - Nexyronix");
    assert.ok(!JSON.stringify(body).includes("re_test_key_not_real"), "API key never in the payload");
  });

  it("keeps the line breaks of a multi-line message (B1)", async () => {
    const message = "Line one of the brief.\r\nLine two: budget details.\n\n- bullet a\n- bullet b";
    const res = await postEnquiry(app.port, { ...VALID, message }, freshIp());
    assert.equal(res.status, 200);
    const { text, html } = resend.calls[0].body;
    assert.ok(text.includes("Message: Line one of the brief.\nLine two: budget details.\n\n- bullet a\n- bullet b"), text);
    assert.ok(html.includes("Line one of the brief.\nLine two: budget details.\n\n- bullet a\n- bullet b"));
    assert.ok(html.includes("white-space:pre-wrap"), "the email renders those line breaks");
  });

  it("escapes HTML in the email and keeps header fields single-line", async () => {
    const res = await postEnquiry(
      app.port,
      { ...VALID, name: "Asha\r\nBcc: x@example.com", message: "<script>alert(1)</script> hello there" },
      freshIp()
    );
    assert.equal(res.status, 200);
    const { html, text } = resend.calls[0].body;
    assert.ok(!html.includes("<script>"));
    assert.ok(html.includes("&lt;script&gt;"));
    assert.ok(text.includes("Name: Asha  Bcc: x@example.com"), "newline became a space");
  });

  it("attaches a valid DOCX resume with a generated filename", async () => {
    const docx = buildZip(WORD_DOCUMENT_PARTS.map((name) => ({ name })));
    const res = await postEnquiry(
      app.port,
      { ...VALID, enquiryType: "Internship", resume: { filename: "../../My CV.docx", mimeType: "text/html", base64: docx.toString("base64") } },
      freshIp()
    );
    assert.equal(res.status, 200);
    const [attachment] = resend.calls[0].body.attachments;
    assert.match(attachment.filename, /^resume-asha-rao-\d+\.docx$/);
    assert.equal(attachment.content_type, "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    assert.equal(attachment.content, docx.toString("base64"));
  });

  it("rejects a ZIP posing as a DOCX, without sending anything (M7)", async () => {
    const zip = buildZip([{ name: "invoice.pdf.exe" }]);
    const res = await postEnquiry(
      app.port,
      { ...VALID, enquiryType: "Internship", resume: { filename: "cv.docx", mimeType: "", base64: zip.toString("base64") } },
      freshIp()
    );
    assert.equal(res.status, 400);
    assert.ok(res.json().errors.resume);
    assert.equal(resend.calls.length, 0);
  });

  it("answers a Resend failure with a generic 500 that leaks nothing", async () => {
    resend.restore();
    resend = stubResend(() => new Response('{"message":"domain not verified: secret detail"}', { status: 422 }));
    const errors: unknown[] = [];
    const originalError = console.error;
    console.error = (...args: unknown[]) => errors.push(args);
    try {
      const res = await postEnquiry(app.port, VALID, freshIp());
      assert.equal(res.status, 500);
      assert.deepEqual(res.json(), { ok: false, message: "We couldn't submit your request right now. Please try again." });
      assert.ok(!res.text.includes("secret detail"));
      assert.equal(errors.length, 1, "logged server-side instead");
    } finally {
      console.error = originalError;
    }
  });

  it("takes the honeypot silently: 200, nothing sent", async () => {
    const res = await postEnquiry(app.port, { ...VALID, website: "http://spam.example" }, freshIp());
    assert.equal(res.status, 200);
    assert.equal(resend.calls.length, 0);
  });

  it("returns field errors for invalid input", async () => {
    const res = await postEnquiry(app.port, { name: "", email: "nope", enquiryType: "Bogus", message: "short" }, freshIp());
    assert.equal(res.status, 400);
    const { errors } = res.json();
    assert.ok(errors.name && errors.email && errors.enquiryType && errors.message);
    assert.equal(resend.calls.length, 0);
  });
});

describe("POST /api/contact — protocol errors (M1)", () => {
  it("405 with Allow for other methods", async () => {
    for (const method of ["GET", "PUT", "DELETE"]) {
      const res = await request(app.port, { method, path: "/api/contact" });
      assert.equal(res.status, 405, method);
      assert.equal(res.headers.allow, "POST");
    }
  });

  it("415 for anything that isn't JSON", async () => {
    const res = await request(app.port, {
      method: "POST",
      path: "/api/contact",
      headers: { "content-type": "text/plain", "x-forwarded-for": freshIp() },
      body: "name=Asha",
    });
    assert.equal(res.status, 415);
  });

  it("400 for malformed JSON, as a clean JSON error", async () => {
    const res = await postEnquiry(app.port, "{not json", freshIp());
    assert.equal(res.status, 400);
    assert.equal(res.json().ok, false);
  });

  it("413 for a body over the limit — refused before it is read", async () => {
    const body = JSON.stringify({ message: "a".repeat(MAX_BODY_BYTES) });
    const res = await postEnquiry(app.port, body, freshIp());
    assert.equal(res.status, 413);
  });
});

describe("POST /api/contact — rate limiting (L7)", () => {
  it("allows 5 accepted enquiries per client, then 429", async () => {
    const ip = freshIp();
    for (let i = 0; i < 5; i++) assert.equal((await postEnquiry(app.port, VALID, ip)).status, 200, `#${i + 1}`);
    const sixth = await postEnquiry(app.port, VALID, ip);
    assert.equal(sixth.status, 429);
    assert.equal(resend.calls.length, 5);
    assert.equal((await postEnquiry(app.port, VALID, freshIp())).status, 200, "other clients unaffected");
  });

  it("does not spend the allowance on rejected submissions", async () => {
    const ip = freshIp();
    for (let i = 0; i < 6; i++) assert.equal((await postEnquiry(app.port, { ...VALID, email: "typo" }, ip)).status, 400);
    for (let i = 0; i < 5; i++) assert.equal((await postEnquiry(app.port, VALID, ip)).status, 200, `valid #${i + 1}`);
  });

  it("caps raw attempts at 20 per client, valid or not", async () => {
    const ip = freshIp();
    for (let i = 0; i < 20; i++) assert.equal((await postEnquiry(app.port, { name: "" }, ip)).status, 400, `#${i + 1}`);
    assert.equal((await postEnquiry(app.port, { name: "" }, ip)).status, 429);
  });

  it("refuses a limited client without parsing its body, and still answers cleanly mid-upload", async () => {
    const ip = freshIp();
    for (let i = 0; i < 20; i++) await postEnquiry(app.port, { name: "" }, ip);
    // Malformed JSON just under the cap: parsing it would give 400. Getting a
    // clean 429 (not 400, not a connection reset) shows the body was
    // discarded unparsed — the 6th-submission-with-a-big-resume case.
    const nearCap = "{" + "a".repeat(MAX_BODY_BYTES - 1024);
    const res = await postEnquiry(app.port, nearCap, ip);
    assert.equal(res.status, 429);
    assert.equal(res.json().ok, false);
  });

  it("answers a limited client declaring an oversize body at once, closing the connection", async () => {
    const ip = freshIp();
    for (let i = 0; i < 20; i++) await postEnquiry(app.port, { name: "" }, ip);
    const res = await request(app.port, {
      method: "POST",
      path: "/api/contact",
      headers: { "content-type": "application/json", "content-length": String(50 * 1024 * 1024), "x-forwarded-for": ip },
    });
    assert.equal(res.status, 429);
    assert.equal(res.headers.connection, "close");
  });

  it("ignores a forged X-Forwarded-For: the trusted hop's entry decides", async () => {
    const real = freshIp();
    for (let i = 0; i < 5; i++) {
      assert.equal((await postEnquiry(app.port, VALID, `10.9.9.${i}, ${real}`)).status, 200);
    }
    assert.equal((await postEnquiry(app.port, VALID, `10.9.9.99, ${real}`)).status, 429);
  });
});
