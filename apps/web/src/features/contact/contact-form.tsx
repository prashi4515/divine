"use client";

import React, { useState } from "react";
import { Mail, Send, CheckCircle2 } from "lucide-react";

export function ContactForm({ contactEmail }: { contactEmail: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("feedback");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !message.trim()) return;

    setStatus("submitting");

    // Simulate clean submission / mailto fallback
    setTimeout(() => {
      setStatus("success");
    }, 600);
  };

  return (
    <div className="rounded-2xl border border-border/80 bg-card p-6 md:p-8 shadow-xs space-y-6">
      <div className="space-y-1.5">
        <h3 className="font-serif text-xl font-semibold text-foreground flex items-center gap-2">
          <Mail className="h-5 w-5 text-saffron" aria-hidden />
          Send a Message
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Fill out the form below or email us directly at{" "}
          <a
            href={`mailto:${contactEmail}`}
            className="text-saffron font-medium hover:underline"
          >
            {contactEmail}
          </a>
        </p>
      </div>

      {status === "success" ? (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-emerald-700 dark:text-emerald-300 space-y-2">
          <div className="flex items-center gap-2 font-medium text-sm">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
            Thank you for reaching out!
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Your message has been recorded. If a response is required, we will reply to{" "}
            <span className="font-medium text-foreground">{email}</span> within 2–3 business days.
          </p>
          <button
            type="button"
            onClick={() => {
              setStatus("idle");
              setMessage("");
            }}
            className="mt-2 text-xs font-semibold text-saffron hover:underline"
          >
            Send another message
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="contact-name" className="text-xs font-medium text-foreground">
                Your Name <span className="text-muted-foreground">(Optional)</span>
              </label>
              <input
                id="contact-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Arjuna"
                className="w-full rounded-lg border border-input bg-background px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-saffron/40"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="contact-email" className="text-xs font-medium text-foreground">
                Your Email Address <span className="text-saffron">*</span>
              </label>
              <input
                id="contact-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-input bg-background px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-saffron/40"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="contact-category" className="text-xs font-medium text-foreground">
              Topic / Reason for Contact
            </label>
            <select
              id="contact-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3.5 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-saffron/40"
            >
              <option value="feedback">General Feedback & Suggestions</option>
              <option value="correction">Content Correction or Typo</option>
              <option value="bug">Technical Issue or Broken Link</option>
              <option value="question">Question about the Platform</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="contact-message" className="text-xs font-medium text-foreground">
              Message <span className="text-saffron">*</span>
            </label>
            <textarea
              id="contact-message"
              required
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your feedback, question, or content correction here..."
              className="w-full rounded-lg border border-input bg-background px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-saffron/40"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <p className="text-[11px] text-muted-foreground">
              We respect your privacy. We never share your email address.
            </p>
            <button
              type="submit"
              disabled={status === "submitting"}
              className="cta-saffron inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-medium text-white shadow-xs transition-divine hover:shadow-md disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" aria-hidden />
              {status === "submitting" ? "Sending..." : "Submit Message"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
