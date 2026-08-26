import {
  CONTACT_EMAIL,
  CONTACT_PHONE_DISPLAY,
  CONTACT_PHONE_TEL,
  CONTACT_LOCATION,
  WHATSAPP_URL,
} from "@/data/site";

interface ContactDetail {
  label: string;
  value: string;
  href?: string;
  external?: boolean;
}

const DETAILS: ContactDetail[] = [
  { label: "Email", value: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
  { label: "Phone", value: CONTACT_PHONE_DISPLAY, href: `tel:${CONTACT_PHONE_TEL}` },
  { label: "WhatsApp", value: "Chat with us", href: WHATSAPP_URL, external: true },
  { label: "Location", value: CONTACT_LOCATION },
];

export function ContactInfo() {
  return (
    <div className="rounded-xl border border-border bg-surface/30 p-6 backdrop-blur-sm">
      <p className="label-eyebrow">Company</p>
      <p className="mt-2 font-display text-sm font-medium text-text">
        Nexyronix Solutions Private Limited
      </p>

      <dl className="mt-6 space-y-4">
        {DETAILS.map((detail) => (
          <div key={detail.label}>
            <dt className="label-eyebrow">{detail.label}</dt>
            <dd className="mt-1 text-sm text-text-muted">
              {detail.href ? (
                <a
                  href={detail.href}
                  {...(detail.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="transition-colors duration-200 hover:text-accent-cyan"
                >
                  {detail.value}
                </a>
              ) : (
                detail.value
              )}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
