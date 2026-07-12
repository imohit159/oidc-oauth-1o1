"use client";

import * as React from "react";
import { Loader2, Mail, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SITE } from "@/constants/site";
import { cn } from "@/lib/utils";

interface ContactFormState {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const INITIAL_FORM_STATE: ContactFormState = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

export function ContactForm({ className }: { className?: string }) {
  const [form, setForm] = React.useState<ContactFormState>(INITIAL_FORM_STATE);
  const [loading, setLoading] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);

  const updateField = (field: keyof ContactFormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.name || !form.email || !form.subject || !form.message) return;

    setLoading(true);

    const body = [
      `Name: ${form.name}`,
      `Email: ${form.email}`,
      "",
      form.message,
    ].join("\n");

    const mailtoUrl = `mailto:${SITE.SUPPORT_EMAIL}?subject=${encodeURIComponent(form.subject)}&body=${encodeURIComponent(body)}`;

    window.location.href = mailtoUrl;
    setSubmitted(true);
    setForm(INITIAL_FORM_STATE);
    setLoading(false);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <Card className="border-primary/15 border">
        <CardContent className="p-6 md:p-8">
          {submitted ? (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <div className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-full">
                <Mail className="size-5" />
              </div>
              <div className="space-y-2">
                <h2 className="font-serif text-2xl font-semibold tracking-wide">
                  Message ready to send
                </h2>
                <p className="text-muted-foreground max-w-md text-sm leading-relaxed">
                  Your email client should open with your message addressed to{" "}
                  <span className="text-foreground font-medium">
                    {SITE.SUPPORT_EMAIL}
                  </span>
                  . If it did not open, email us directly.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => setSubmitted(false)}
              >
                Send another message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <FieldGroup>
                <div className="mb-2 flex flex-col gap-2">
                  <div className="text-primary flex items-center gap-2 text-xs font-semibold tracking-[3px] uppercase">
                    <MessageSquare className="size-3.5" />
                    Reach out
                  </div>
                  <h2 className="font-serif text-2xl font-semibold tracking-wide">
                    Send us a message
                  </h2>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Questions about OIDC setup, security reviews, or platform
                    support — we read every note.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="contact-name">Name</FieldLabel>
                    <Input
                      id="contact-name"
                      value={form.name}
                      onChange={(event) =>
                        updateField("name", event.target.value)
                      }
                      placeholder="Your name"
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="contact-email">Email</FieldLabel>
                    <Input
                      id="contact-email"
                      type="email"
                      value={form.email}
                      onChange={(event) =>
                        updateField("email", event.target.value)
                      }
                      placeholder="you@company.com"
                      required
                    />
                  </Field>
                </div>

                <Field>
                  <FieldLabel htmlFor="contact-subject">Subject</FieldLabel>
                  <Input
                    id="contact-subject"
                    value={form.subject}
                    onChange={(event) =>
                      updateField("subject", event.target.value)
                    }
                    placeholder="How can we help?"
                    required
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="contact-message">Message</FieldLabel>
                  <textarea
                    id="contact-message"
                    value={form.message}
                    onChange={(event) =>
                      updateField("message", event.target.value)
                    }
                    placeholder="Tell us about your use case, integration, or issue..."
                    required
                    rows={6}
                    className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 w-full min-w-0 resize-y rounded-lg border bg-transparent px-2.5 py-2 text-base transition-colors outline-none focus-visible:ring-3 md:text-sm"
                  />
                </Field>

                <Field>
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading && (
                      <Loader2 className="mr-2 size-4 animate-spin" />
                    )}
                    Send Message
                  </Button>
                </Field>
              </FieldGroup>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
