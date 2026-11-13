import React, { useState } from "react";
import { Check, ExternalLink, FileSpreadsheet, Loader2, Sheet } from "lucide-react";
import { weddingData } from "../data/weddingData";
import { useGoogleSheet } from "../context/GoogleSheetContext";

export interface RsvpState {
  guest_name: string;
  phone: string;
  attending: string;
  guest_count: string;
  functions: string[];
  message: string;
}

const initialRsvpState: RsvpState = {
  guest_name: "",
  phone: "",
  attending: "",
  guest_count: "1",
  functions: [],
  message: "",
};

const inputClass =
  "w-full border border-[#191716]/20 bg-[#FFF9F0] px-4 py-3 font-body text-sm text-[#191716] placeholder:text-[#191716]/35 focus:border-[#A88950] focus:outline-none";

export function formatWhatsAppUrl(state: RsvpState): string {
  const isYes = state.attending === "yes";
  const count = Number(state.guest_count) || 1;
  const lines = [
    `*RSVP · Shubhangi & Shobhit*`,
    `Name: ${state.guest_name}`,
    state.phone ? `Phone: ${state.phone}` : null,
    isYes
      ? `Attending: Yes · ${count} ${count === 1 ? "guest" : "guests"}`
      : `Attending: No, unable to join`,
    isYes && state.functions.length
      ? `Functions: ${state.functions.join(", ")}`
      : null,
    state.message ? `Message: ${state.message}` : null,
  ].filter(Boolean);

  return `https://wa.me/${weddingData.rsvp.whatsappNumber}?text=${encodeURIComponent(
    lines.join("\n")
  )}`;
}

export function RsvpSection() {
  const { submitRsvp, sheetConfig, openHostModal } = useGoogleSheet();
  const [form, setForm] = useState<RsvpState>(initialRsvpState);
  const [errors, setErrors] = useState<Partial<Record<keyof RsvpState, string>>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [whatsappUrl, setWhatsappUrl] = useState("");
  const [autoOpened, setAutoOpened] = useState(false);
  const [syncedToSheet, setSyncedToSheet] = useState(false);

  const isAttending = form.attending === "yes";

  const handleChange = (field: keyof RsvpState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const toggleFunction = (funcTitle: string) => {
    setForm((prev) => ({
      ...prev,
      functions: prev.functions.includes(funcTitle)
        ? prev.functions.filter((f) => f !== funcTitle)
        : [...prev.functions, funcTitle],
    }));
    setErrors((prev) => ({ ...prev, functions: undefined }));
  };

  const validate = () => {
    const newErrors: Partial<Record<keyof RsvpState, string>> = {};
    if (form.guest_name.trim().length < 2) {
      newErrors.guest_name = "Please tell us your name.";
    }
    if (
      form.phone.trim() &&
      !/^[+\d][\d\s\-()]{6,}$/.test(form.phone.trim())
    ) {
      newErrors.phone = "Please check the phone number.";
    }
    if (!form.attending) {
      newErrors.attending = "Please let us know if you can join.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "submitting" || !validate()) return;

    setStatus("submitting");
    setErrorMessage("");
    setWhatsappUrl("");

    const payload: RsvpState = {
      guest_name: form.guest_name.trim(),
      phone: form.phone.trim(),
      attending: form.attending,
      guest_count: isAttending ? form.guest_count : "0",
      functions: isAttending ? form.functions : [],
      message: form.message.trim(),
    };

    const waUrl = formatWhatsAppUrl(payload);
    setAutoOpened(false);
    setSyncedToSheet(false);

    try {
      const result = await submitRsvp(payload);
      setSyncedToSheet(result.syncedToGoogleSheet);

      // Keep local backup as well
      try {
        const existingRsvps = JSON.parse(localStorage.getItem("wedding_rsvps") || "[]");
        existingRsvps.push({ ...payload, id: result.record.id, timestamp: result.record.submittedAt });
        localStorage.setItem("wedding_rsvps", JSON.stringify(existingRsvps));
      } catch {
        // ignore storage quota errors
      }

      setWhatsappUrl(waUrl);

      // Open WhatsApp in a popup / new window
      const win = window.open(waUrl, "_blank", "noopener,noreferrer");
      if (win && !win.closed) {
        setAutoOpened(true);
      }

      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "We could not save your RSVP. Please try again."
      );
    }
  };

  const handleReset = () => {
    setForm(initialRsvpState);
    setWhatsappUrl("");
    setAutoOpened(false);
    setSyncedToSheet(false);
    setStatus("idle");
  };

  return (
    <section id="rsvp" className="relative bg-[#191716] py-24 sm:py-32">
      <div className="mx-auto max-w-2xl px-5 sm:px-8">
        {/* Section Header */}
        <div className="text-center">
          <p className="label-caps text-[#C8A96A]">RSVP</p>
          <h2 className="mt-6 font-heading text-4xl font-light text-[#FFF9F0] sm:text-6xl">
            Celebrate <em className="italic">with us</em>
          </h2>
          <div className="mx-auto mt-8 h-px w-24 bg-[#C8A96A]/60" />
          <p className="mx-auto mt-8 max-w-xl font-heading text-lg font-light leading-relaxed text-[#F8F2E8]/75 sm:text-xl">
            Kindly respond by 25 November 2026 so we can prepare a warm welcome for you.
          </p>
        </div>

        {/* Form or Success State */}
        <div className="mt-14 border border-[#C8A96A]/35 bg-[#221D1C] p-6 shadow-[0_30px_90px_-40px_rgba(0,0,0,0.85)] sm:p-12">
          {status === "success" ? (
            <div className="text-center">
              <span className="font-heading text-2xl text-[#C8A96A]">❦</span>
              <h3 className="mt-4 font-heading text-3xl font-light text-[#FFF9F0] sm:text-4xl">
                Thank you!
              </h3>
              <p className="mt-4 font-heading text-lg font-light leading-relaxed text-[#F8F2E8]/85">
                Thank you for confirming your presence. We look forward to celebrating together in Agra!
              </p>

              {/* Excel & Google Sheet Recording Status */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 border border-[#C8A96A]/40 bg-[#C8A96A]/15 px-3.5 py-1.5 text-[11px] uppercase tracking-[0.14em] text-[#E8CC92]">
                  <FileSpreadsheet className="h-3.5 w-3.5" />
                  Saved to Excel Sheet
                </span>
                {syncedToSheet && (
                  <span className="inline-flex items-center gap-1.5 border border-[#9EE2B8]/40 bg-[#9EE2B8]/10 px-3.5 py-1.5 text-[11px] uppercase tracking-[0.14em] text-[#9EE2B8]">
                    <Sheet className="h-3.5 w-3.5" />
                    Updated in Google Sheet
                  </span>
                )}
              </div>

              {whatsappUrl && (
                <div className="mt-7">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-2 bg-[#C8A96A] px-8 py-3.5 text-xs uppercase tracking-[0.24em] text-[#191716] transition-colors duration-300 hover:bg-[#D8BC85]"
                  >
                    Open WhatsApp to send details
                  </a>
                  {!autoOpened && (
                    <p className="mt-4 text-xs leading-relaxed text-[#F8F2E8]/55">
                      WhatsApp did not open automatically — tap above to deliver your details to{" "}
                      {weddingData.rsvp.contactName}.
                    </p>
                  )}
                </div>
              )}

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <a
                  href="/api/rsvps/export.xlsx"
                  download="Shubhangi-Shobhit-Wedding-RSVPs.xlsx"
                  className="inline-flex items-center gap-2 border border-[#C8A96A]/45 px-5 py-2.5 text-xs uppercase tracking-[0.18em] text-[#F8F2E8] transition-colors duration-300 hover:border-[#C8A96A] hover:bg-[#C8A96A]/15"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5 text-[#C8A96A]" />
                  Download Excel (.xlsx)
                </a>

                {sheetConfig?.spreadsheetUrl && (
                  <a
                    href={sheetConfig.spreadsheetUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-2 border border-[#C8A96A]/45 px-5 py-2.5 text-xs uppercase tracking-[0.18em] text-[#F8F2E8] transition-colors duration-300 hover:border-[#C8A96A] hover:bg-[#C8A96A]/15"
                  >
                    <ExternalLink className="h-3.5 w-3.5 text-[#C8A96A]" />
                    Open Google Sheet
                  </a>
                )}

                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 border border-[#C8A96A]/45 px-5 py-2.5 text-xs uppercase tracking-[0.18em] text-[#F8F2E8] transition-colors duration-300 hover:border-[#C8A96A] hover:bg-[#C8A96A]/15 cursor-pointer"
                >
                  Send another response
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-7">
              {/* Name & Phone */}
              <div className="grid gap-7 sm:grid-cols-2">
                <div>
                  <label htmlFor="guest_name" className="label-caps-sm block text-[#C8A96A]">
                    Your name *
                  </label>
                  <input
                    id="guest_name"
                    name="guest_name"
                    type="text"
                    value={form.guest_name}
                    onChange={(e) => handleChange("guest_name", e.target.value)}
                    placeholder="Full name"
                    autoComplete="name"
                    aria-invalid={Boolean(errors.guest_name)}
                    className={`mt-3 ${inputClass}`}
                  />
                  {errors.guest_name && (
                    <p className="mt-2 text-xs text-[#F0B7B7]">{errors.guest_name}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="phone" className="label-caps-sm block text-[#C8A96A]">
                    Phone number
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="+91 00000 00000"
                    inputMode="tel"
                    autoComplete="tel"
                    aria-invalid={Boolean(errors.phone)}
                    className={`mt-3 ${inputClass}`}
                  />
                  {errors.phone && (
                    <p className="mt-2 text-xs text-[#F0B7B7]">{errors.phone}</p>
                  )}
                </div>
              </div>

              {/* Attendance Choice */}
              <fieldset>
                <legend className="label-caps-sm text-[#C8A96A]">Will you attend? *</legend>
                <div className="mt-3 flex flex-wrap gap-3">
                  {[
                    { value: "yes", label: "Yes, I will be there" },
                    { value: "no", label: "Sorry, I cannot make it" },
                  ].map((opt) => (
                    <label
                      key={opt.value}
                      className={`cursor-pointer border px-5 py-3 text-sm transition-colors duration-300 ${
                        form.attending === opt.value
                          ? "border-[#C8A96A] bg-[#C8A96A]/20 text-[#FFF9F0]"
                          : "border-[#F8F2E8]/25 text-[#F8F2E8]/80 hover:border-[#C8A96A]/60"
                      }`}
                    >
                      <input
                        type="radio"
                        name="attending"
                        value={opt.value}
                        checked={form.attending === opt.value}
                        onChange={() => handleChange("attending", opt.value)}
                        className="sr-only"
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
                {errors.attending && (
                  <p className="mt-2 text-xs text-[#F0B7B7]">{errors.attending}</p>
                )}
              </fieldset>

              {/* Number of guests */}
              <div>
                <label
                  htmlFor="guest_count"
                  className={`label-caps-sm block ${
                    isAttending ? "text-[#C8A96A]" : "text-[#C9A9A9]/50"
                  }`}
                >
                  Number of guests
                </label>
                <select
                  id="guest_count"
                  name="guest_count"
                  value={form.guest_count}
                  onChange={(e) => handleChange("guest_count", e.target.value)}
                  disabled={!isAttending}
                  className={`mt-3 ${inputClass} disabled:cursor-not-allowed disabled:opacity-45`}
                >
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                    <option key={num} value={String(num)}>
                      {num} {num === 1 ? "guest" : "guests"}
                    </option>
                  ))}
                </select>
                {!isAttending && (
                  <p className="mt-2 text-xs text-[#F8F2E8]/50">
                    Available once you let us know you are joining.
                  </p>
                )}
              </div>

              {/* Functions Checklist */}
              <fieldset>
                <legend
                  className={`label-caps-sm ${
                    isAttending ? "text-[#C8A96A]" : "text-[#C9A9A9]/50"
                  }`}
                >
                  Which functions will you join?
                </legend>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {weddingData.events.map((evt) => {
                    const isSelected = form.functions.includes(evt.title);
                    return (
                      <label
                        key={evt.id}
                        className={`flex cursor-pointer items-center gap-3 border px-4 py-3 text-sm transition-colors duration-300 ${
                          !isAttending ? "cursor-not-allowed opacity-45" : ""
                        } ${
                          isSelected
                            ? "border-[#C8A96A] bg-[#C8A96A]/20 text-[#FFF9F0]"
                            : "border-[#F8F2E8]/25 text-[#F8F2E8]/80 hover:border-[#C8A96A]/60"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          disabled={!isAttending}
                          onChange={() => toggleFunction(evt.title)}
                          className="sr-only"
                        />
                        <span
                          className={`flex h-4 w-4 shrink-0 items-center justify-center border ${
                            isSelected
                              ? "border-[#C8A96A] bg-[#C8A96A]"
                              : "border-[#F8F2E8]/40"
                          }`}
                          aria-hidden="true"
                        >
                          {isSelected && <Check className="h-3 w-3 text-[#501D2A]" />}
                        </span>
                        <span>
                          {evt.title}
                          <span className="block text-[11px] text-[#F8F2E8]/50">
                            {evt.venue}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              {/* Personal Message */}
              <div>
                <label htmlFor="message" className="label-caps-sm block text-[#C8A96A]">
                  A message for the couple
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  value={form.message}
                  onChange={(e) => handleChange("message", e.target.value)}
                  placeholder="Wishes, blessings, or a note about your travel plans..."
                  className={`mt-3 resize-none ${inputClass}`}
                />
              </div>

              {/* Error Alert */}
              {status === "error" && errorMessage && (
                <p
                  role="alert"
                  className="border border-[#F0B7B7]/40 bg-[#F0B7B7]/10 px-4 py-3 text-sm text-[#F8D7D7]"
                >
                  {errorMessage}
                </p>
              )}

              {/* Submit Button */}
              <div className="flex flex-wrap items-center gap-5">
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="inline-flex items-center gap-2 bg-[#C8A96A] px-8 py-3.5 text-xs uppercase tracking-[0.24em] text-[#191716] transition-colors duration-300 hover:bg-[#D8BC85] disabled:cursor-wait disabled:opacity-60 cursor-pointer"
                >
                  {status === "submitting" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending
                    </>
                  ) : (
                    "Send our RSVP"
                  )}
                </button>
                <p className="text-xs text-[#F8F2E8]/50">
                  Your response is saved directly to the wedding Excel &amp; Google Sheet guest list.
                </p>
              </div>
            </form>
          )}
        </div>

        {/* Subtle Host / Couple Access Link for Google Sheet & Excel Management */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-center">
          <button
            type="button"
            onClick={openHostModal}
            className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-[#C8A96A]/80 underline decoration-[#C8A96A]/35 underline-offset-4 transition-colors hover:text-[#E8CC92] cursor-pointer"
          >
            <Sheet className="h-3.5 w-3.5" />
            Host Access: Google Sheet &amp; Excel RSVPs
          </button>

          {sheetConfig?.spreadsheetUrl && (
            <a
              href={sheetConfig.spreadsheetUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-[#F8F2E8]/65 transition-colors hover:text-[#C8A96A]"
            >
              Open Live Google Sheet
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
