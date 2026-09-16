"use client";

import { useState } from "react";

/**
 * CTA — Contact Section / Form — Section 6.9.
 *
 * Submission destination is TBD (Section 6.9 / 11); this posts to a
 * placeholder `/api/contact` route that doesn't exist yet — wire it up to
 * the real backend/CRM/email system once finalized. Client-side required-
 * field validation runs regardless, and `disabled` on submit while a
 * request is in flight prevents accidental duplicate submissions.
 */
export default function ContactCTA() {
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    const form = e.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();

    if (!name || !email) {
      setError("Name and email are required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }

    setStatus("submitting");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(data)),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
      setError("Something went wrong. Please try again.");
    }
  }

  return (
    <section className="bg-brand-navy py-24 text-brand-white">
      <div className="mx-auto grid max-w-5xl gap-12 px-6 md:grid-cols-2 md:items-start">
        <div>
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            Have Questions? We&rsquo;re Here to Help.
          </h2>
          <p className="mt-4 max-w-md text-brand-white/75">
            Talk to our experts and find the right learning path for your
            goals.
          </p>
        </div>

        {status === "success" ? (
          <p
            role="status"
            className="rounded-2xl border border-brand-success/40 bg-brand-success/10 p-6 text-brand-white"
          >
            We&rsquo;ll get back to you shortly.
          </p>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="w-full rounded-lg border border-brand-white/20 bg-brand-navy-light px-4 py-3 text-brand-white placeholder:text-brand-white/40 focus:outline-none focus:ring-2 focus:ring-brand-red"
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full rounded-lg border border-brand-white/20 bg-brand-navy-light px-4 py-3 text-brand-white placeholder:text-brand-white/40 focus:outline-none focus:ring-2 focus:ring-brand-red"
              />
            </div>

            <div>
              <label htmlFor="message" className="mb-1 block text-sm font-medium">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={3}
                className="w-full rounded-lg border border-brand-white/20 bg-brand-navy-light px-4 py-3 text-brand-white placeholder:text-brand-white/40 focus:outline-none focus:ring-2 focus:ring-brand-red"
              />
            </div>

            {error && (
              <p role="alert" className="text-sm text-brand-red">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={status === "submitting"}
              className="w-full rounded-full bg-brand-red px-6 py-3 font-semibold text-brand-white transition-colors hover:bg-brand-red-dark disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {status === "submitting" ? "Sending..." : "Send message"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
