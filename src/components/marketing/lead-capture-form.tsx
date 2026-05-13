"use client";

import { useState, type FormEvent } from "react";
import { Send, ArrowRight } from "lucide-react";

const interestOptions = [
  "Nature OT Groups",
  "Individual OT",
  "Summer Camps",
  "Parent Workshop",
  "Provider Referral",
  "Not Sure Yet",
];

interface FormData {
  name: string;
  email: string;
  phone: string;
  childAge: string;
  city: string;
  interest: string;
  message: string;
  consent: boolean;
}

const initial: FormData = {
  name: "",
  email: "",
  phone: "",
  childAge: "",
  city: "",
  interest: "",
  message: "",
  consent: false,
};

export function LeadCaptureForm() {
  const [form, setForm] = useState<FormData>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [submitted, setSubmitted] = useState(false);

  function validate(): boolean {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Please enter a valid email";
    if (!form.consent) e.consent = "Please check the consent box";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(ev: FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    console.log("Lead form submission:", form);
    setSubmitted(true);
  }

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  if (submitted) {
    return (
      <section id="contact" className="bg-sage/10 py-16 lg:py-24">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-moss/20">
            <Send className="size-7 text-moss" />
          </div>
          <h2 className="font-[family-name:var(--font-fraunces)] text-3xl font-semibold text-forest">
            Thank You!
          </h2>
          <p className="mt-3 text-forest/65">
            We received your inquiry and will follow up with next steps soon.
          </p>
        </div>
      </section>
    );
  }

  const inputClass =
    "w-full rounded-xl border border-sand/80 bg-white px-4 py-3 text-sm text-forest placeholder:text-forest/35 focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/15 transition";
  const labelClass = "block text-sm font-medium text-forest mb-1.5";
  const errorClass = "mt-1 text-xs text-terracotta";

  return (
    <section id="contact" className="bg-sage/10 py-16 lg:py-24">
      <div className="mx-auto max-w-2xl px-4 lg:px-6">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-moss">Get in Touch</p>
          <h2 className="mt-3 font-[family-name:var(--font-fraunces)] text-3xl font-semibold text-forest sm:text-4xl">
            Start Here
          </h2>
          <p className="mt-3 text-forest/60">
            Tell us a little about your child and what you&rsquo;re looking for.
            We&rsquo;ll follow up with next steps.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="mt-10 space-y-5 rounded-2xl border border-sand/60 bg-card p-6 shadow-sm lg:p-8"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="lc-name" className={labelClass}>
                Parent / Caregiver Name
              </label>
              <input
                id="lc-name"
                type="text"
                className={inputClass}
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Your name"
              />
              {errors.name && <p className={errorClass}>{errors.name}</p>}
            </div>
            <div>
              <label htmlFor="lc-email" className={labelClass}>
                Email
              </label>
              <input
                id="lc-email"
                type="email"
                className={inputClass}
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="you@example.com"
              />
              {errors.email && <p className={errorClass}>{errors.email}</p>}
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="lc-phone" className={labelClass}>
                Phone <span className="font-normal text-forest/40">(optional)</span>
              </label>
              <input
                id="lc-phone"
                type="tel"
                className={inputClass}
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="(555) 555-5555"
              />
            </div>
            <div>
              <label htmlFor="lc-age" className={labelClass}>
                Child&rsquo;s Age Range
              </label>
              <input
                id="lc-age"
                type="text"
                className={inputClass}
                value={form.childAge}
                onChange={(e) => set("childAge", e.target.value)}
                placeholder="e.g. 5–7"
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="lc-city" className={labelClass}>
                City / Area
              </label>
              <input
                id="lc-city"
                type="text"
                className={inputClass}
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
                placeholder="e.g. Frisco, TX"
              />
            </div>
            <div>
              <label htmlFor="lc-interest" className={labelClass}>
                Interested In
              </label>
              <select
                id="lc-interest"
                className={inputClass}
                value={form.interest}
                onChange={(e) => set("interest", e.target.value)}
              >
                <option value="">Select an option</option>
                {interestOptions.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="lc-message" className={labelClass}>
              Anything else you&rsquo;d like us to know? <span className="font-normal text-forest/40">(optional)</span>
            </label>
            <textarea
              id="lc-message"
              rows={4}
              className={inputClass}
              value={form.message}
              onChange={(e) => set("message", e.target.value)}
              placeholder="Tell us a bit about your child and what you're looking for\u2026"
            />
          </div>

          <div className="flex items-start gap-2.5">
            <input
              id="lc-consent"
              type="checkbox"
              checked={form.consent}
              onChange={(e) => set("consent", e.target.checked)}
              className="mt-1 size-4 shrink-0 rounded border-sand accent-forest"
            />
            <label htmlFor="lc-consent" className="text-xs leading-relaxed text-forest/60">
              I understand this form is for general inquiries and should not
              include urgent medical information.
            </label>
          </div>
          {errors.consent && <p className={errorClass}>{errors.consent}</p>}

          <button
            type="submit"
            className="group inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-forest px-8 text-base font-semibold text-cream shadow-md shadow-forest/15 transition hover:bg-forest/90 hover:shadow-lg sm:w-auto"
          >
            Send Inquiry
            <ArrowRight className="size-4 transition group-hover:translate-x-0.5" aria-hidden />
          </button>

          <p className="text-xs text-forest/45">
            We&rsquo;ll never share your information. We&rsquo;ll provide appropriate intake
            instructions if services are a good fit.
          </p>
        </form>
      </div>
    </section>
  );
}
