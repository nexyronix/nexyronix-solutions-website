/**
 * The contact form's state rules (src/components/Contact/formState.ts).
 * B2: choosing a different option card must keep what the visitor typed.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { acceptsResume, EMPTY_ENQUIRY, initialEnquiry, withField } from "../src/components/Contact/formState";

const typed = {
  ...EMPTY_ENQUIRY,
  name: "Asha Rao",
  email: "asha@example.com",
  phone: "+91 90000 00000",
  organization: "Example College",
  enquiryType: "Internship",
  message: "I'd like to apply for the summer internship.\nI study CSE.",
  resume: { filename: "cv.pdf", mimeType: "application/pdf", base64: "JVBERg==" },
};

describe("withField — switching the enquiry type", () => {
  it("keeps every typed field when the type changes", () => {
    const next = withField(typed, "enquiryType", "General Enquiry");
    assert.equal(next.enquiryType, "General Enquiry");
    for (const key of ["name", "email", "phone", "organization", "message"] as const) {
      assert.equal(next[key], typed[key], key);
    }
  });

  it("drops the resume only when the new type doesn't offer one", () => {
    assert.equal(withField(typed, "enquiryType", "General Enquiry").resume, undefined);
    assert.deepEqual(withField(typed, "enquiryType", "Career Opportunity").resume, typed.resume);
  });

  it("returns the same object when nothing changes", () => {
    assert.equal(withField(typed, "enquiryType", "Internship"), typed);
  });

  it("never mutates its input", () => {
    const before = JSON.stringify(typed);
    withField(typed, "name", "Someone Else");
    assert.equal(JSON.stringify(typed), before);
  });
});

describe("initialEnquiry", () => {
  it("is blank, with the card's type preselected when given", () => {
    assert.deepEqual(initialEnquiry(), EMPTY_ENQUIRY);
    assert.deepEqual(initialEnquiry("Internship"), { ...EMPTY_ENQUIRY, enquiryType: "Internship" });
    assert.notEqual(initialEnquiry(), EMPTY_ENQUIRY, "a fresh object each time");
  });
});

describe("acceptsResume", () => {
  it("is true only for Internship and Career Opportunity", () => {
    assert.equal(acceptsResume("Internship"), true);
    assert.equal(acceptsResume("Career Opportunity"), true);
    assert.equal(acceptsResume("Website"), false);
    assert.equal(acceptsResume(""), false);
  });
});
