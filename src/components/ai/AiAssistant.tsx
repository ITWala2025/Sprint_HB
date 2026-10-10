"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  Bot,
  ExternalLink,
  LoaderCircle,
  MessageCircle,
  Send,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

type Suggestion = {
  label: string;
  query?: string;
  href?: string;
};

type ChatMessage = {
  id: string;
  role: "assistant" | "user" | "error";
  content: string;
  createdAt: Date;
  actionLink?: string;
  actionLabel?: string;
  suggestions?: Suggestion[];
};

const STARTER_SUGGESTIONS: Suggestion[] = [
  { label: "Courses", query: "Tell me about your courses" },
  {
    label: "Fees",
    query: "What is the fee and scholarship criteria?",
  },
  {
    label: "Location",
    query: "Where is the center located and timings?",
  },
  { label: "Registration", query: "How do I register for a cohort?" },
];

const CONTEXTUAL_SUGGESTIONS: {
  keywords: string[];
  suggestions: Suggestion[];
}[] = [
  {
    keywords: ["course", "program", "devops", "ai"],
    suggestions: [
      { label: "Cloud DevOps", query: "Tell me about Cloud and DevOps courses" },
      { label: "AI", query: "Tell me about AI courses" },
      { label: "Full-Stack", query: "Tell me about Full-Stack courses" },
      { label: "View All Courses", href: "/courses" },
    ],
  },
  {
    keywords: ["fee", "cost", "scholarship", "pricing", "price"],
    suggestions: [
      { label: "Scholarship Details", query: "What scholarship options are available?" },
      { label: "Payment Plans", query: "What payment plans are available?" },
      { label: "Fee Structure", href: "/contact" },
    ],
  },
  {
    keywords: ["location", "center", "centre", "hazaribagh", "address", "direction"],
    suggestions: [
      { label: "Timings", query: "What are the center timings?" },
      { label: "Directions", href: "/contact" },
      { label: "Hostel", query: "Is hostel accommodation available?" },
    ],
  },
  {
    keywords: ["register", "enroll", "enrol", "admission", "cohort"],
    suggestions: [
      { label: "Eligibility", query: "What are the admission eligibility criteria?" },
      { label: "Documents", query: "Which documents are required to apply?" },
      { label: "Start Registration", href: "/register" },
    ],
  },
  {
    keywords: ["job", "career", "placement", "employment", "hiring"],
    suggestions: [
      { label: "Placement Stats", query: "What placement support and outcomes are available?" },
      { label: "Hiring Partners", query: "Which companies hire SPRINT learners?" },
      { label: "Career Services", href: "/careers" },
    ],
  },
];

function getContextualSuggestions(message: string, reply: string): Suggestion[] {
  const findMatch = (text: string) => {
    const normalized = text.toLowerCase();
    return CONTEXTUAL_SUGGESTIONS.find(({ keywords }) =>
      keywords.some((keyword) =>
        keyword === "ai"
          ? /\bai\b/.test(normalized)
          : normalized.includes(keyword),
      ),
    );
  };
  const match = findMatch(message) ?? findMatch(reply);

  return (
    match?.suggestions ?? [
      { label: "Explore Courses", href: "/courses" },
      { label: "Contact", href: "/contact" },
      { label: "Student Portal", href: "/student/login" },
    ]
  );
}

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi! I’m the SPRINT assistant. Ask me about courses, programs, eligibility, or getting in touch.",
  createdAt: new Date(),
  suggestions: STARTER_SUGGESTIONS,
};

function cx(...values: Parameters<typeof clsx>) {
  return twMerge(clsx(...values));
}

function MessageAction({
  href,
  label,
  onNavigate,
}: {
  href: string;
  label: string;
  onNavigate: () => void;
}) {
  const isInternal = href.startsWith("/") && !href.startsWith("//");
  const className =
    "mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#f81529] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#d9142a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f81529]";
  const content = (
    <>
      {label}
      <ArrowUpRight size={14} aria-hidden="true" />
    </>
  );

  if (isInternal) {
    return (
      <Link className={className} href={href} onClick={onNavigate}>
        {content}
      </Link>
    );
  }

  return (
    <a
      className={className}
      href={href}
      onClick={onNavigate}
      target={href.startsWith("https://") ? "_blank" : undefined}
      rel={href.startsWith("https://") ? "noopener noreferrer" : undefined}
    >
      {content}
    </a>
  );
}

export default function AiAssistant() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const wasOpenRef = useRef(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    } else if (wasOpenRef.current) {
      launcherRef.current?.focus();
    }
    wasOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    messagesRef.current?.scrollTo({
      top: messagesRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isLoading]);

  function closeChat() {
    setIsOpen(false);
  }

  function handleSuggestionClick(suggestion: Suggestion) {
    if (suggestion.href) {
      closeChat();
      window.location.href = suggestion.href;
    } else if (suggestion.query) {
      void handleSend(suggestion.query);
    }
  }

  async function handleSend(value: string) {
    const message = value.trim();
    if (!message || isLoading) return;

    setMessages((current) => [
      ...current,
      { id: crypto.randomUUID(), role: "user", content: message, createdAt: new Date() },
    ]);
    setDraft("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, pathname }),
      });
      if (!response.ok) throw new Error(`Chat request failed (${response.status}).`);

      const result: {
        reply?: string;
        actionLink?: string;
        actionLabel?: string;
      } = await response.json();
      if (typeof result.reply !== "string" || !result.reply.trim()) {
        throw new Error("The chat service returned an invalid response.");
      }
      const reply = result.reply.trim();

      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: reply,
          createdAt: new Date(),
          actionLink: result.actionLink,
          actionLabel: result.actionLabel,
          suggestions: getContextualSuggestions(message, reply),
        },
      ]);
    } catch (error) {
      console.error("AI assistant request failed:", error);
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "error",
          content:
            "I couldn’t reach the chat service just now. Please try again, or contact the SPRINT team directly.",
          createdAt: new Date(),
          actionLink: "/contact",
          actionLabel: "Contact SPRINT",
          suggestions: [
            { label: "Contact SPRINT", href: "/contact" },
            { label: "Explore Courses", href: "/courses" },
          ],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void handleSend(draft);
  }

  return (
    <>
      <motion.button
        ref={launcherRef}
        type="button"
        aria-label={isOpen ? "Close SPRINT assistant" : "Open SPRINT assistant"}
        aria-hidden={isOpen}
        disabled={isOpen}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        className={cx(
          "fixed bottom-24 right-5 z-[60] grid size-14 place-items-center rounded-full bg-[#011f3e] text-white shadow-[0_12px_32px_rgba(1,31,62,0.3)] transition-colors hover:bg-[#062c52] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f81529] sm:bottom-[8.5rem] sm:right-8 sm:size-16",
          isOpen && "pointer-events-none opacity-0",
        )}
      >
        <span className="absolute inset-0 animate-ping rounded-full bg-[#f81529]/35 motion-reduce:animate-none" />
        <span className="absolute right-0 top-0 size-3.5 rounded-full border-2 border-white bg-[#f81529]" />
        {isOpen ? (
          <X className="relative" size={24} aria-hidden="true" />
        ) : (
          <MessageCircle className="relative" size={25} aria-hidden="true" />
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <div
            className="fixed inset-0 z-[59] flex items-end justify-center bg-[#001831]/45 p-0 sm:items-end sm:justify-end sm:bg-transparent sm:p-8"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) closeChat();
            }}
          >
            <motion.section
              role="dialog"
              aria-modal="true"
              aria-labelledby="ai-assistant-title"
              initial={{ opacity: 0, y: 28, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="flex h-[min(550px,88dvh)] w-full flex-col overflow-hidden rounded-t-2xl border border-[#e2e8f0] bg-white shadow-[0_24px_70px_rgba(1,31,62,0.24)] sm:w-[420px] sm:rounded-2xl"
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  closeChat();
                  return;
                }
                if (event.key === "Tab") {
                  const focusable = event.currentTarget.querySelectorAll<HTMLElement>(
                    'button:not([disabled]), input:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
                  );
                  const first = focusable[0];
                  const last = focusable[focusable.length - 1];
                  if (event.shiftKey && document.activeElement === first) {
                    event.preventDefault();
                    last?.focus();
                  } else if (!event.shiftKey && document.activeElement === last) {
                    event.preventDefault();
                    first?.focus();
                  }
                }
              }}
            >
              <header className="flex shrink-0 items-center gap-3 bg-[#011f3e] px-5 py-4 text-white">
                <div className="grid size-10 shrink-0 place-items-center rounded-xl border border-white/20 bg-white/10">
                  <Sparkles size={19} aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 id="ai-assistant-title" className="font-semibold">
                    SPRINT Assistant
                  </h2>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-white/75">
                    <span className="size-1.5 rounded-full bg-[#22c55e]" />
                    Here to help you learn
                  </p>
                </div>
                <button
                  ref={closeRef}
                  type="button"
                  aria-label="Close chat"
                  onClick={closeChat}
                  className="grid size-9 place-items-center rounded-full text-white/80 transition-colors hover:bg-white/15 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  <X size={20} aria-hidden="true" />
                </button>
              </header>

              <div
                ref={messagesRef}
                className="flex flex-1 flex-col gap-4 overflow-y-auto bg-[#f8fafc] px-4 py-5 sm:px-5"
                aria-live="polite"
                aria-relevant="additions text"
                aria-label="Chat messages"
              >
                <p className="self-center text-[10px] font-bold tracking-[0.14em] text-[#64748b]">
                  SPRINT SUPPORT
                </p>
                {messages.map((message) => {
                  const isUser = message.role === "user";
                  return (
                    <div
                      key={message.id}
                      className={cx(
                        "flex max-w-[92%] items-end gap-2",
                        isUser && "ml-auto flex-row-reverse",
                      )}
                    >
                      <div
                        className={cx(
                          "grid size-7 shrink-0 place-items-center rounded-full",
                          isUser
                            ? "bg-[#f1f5f9] text-[#475569]"
                            : "bg-[#e2e8f0] text-[#011f3e]",
                        )}
                        aria-hidden="true"
                      >
                        {isUser ? (
                          <UserRound size={14} />
                        ) : (
                          <Bot size={15} />
                        )}
                      </div>
                      <div
                        className={cx(
                          "min-w-0 rounded-2xl border px-3.5 py-3 shadow-sm",
                          isUser
                            ? "rounded-br-sm border-[#011f3e] bg-[#011f3e] text-white"
                            : message.role === "error"
                              ? "rounded-bl-sm border-[#fecdd3] bg-[#fff0f2] text-[#0f172a]"
                              : "rounded-bl-sm border-[#e2e8f0] bg-white text-[#0f172a]",
                        )}
                      >
                        <p className="whitespace-pre-line break-words text-sm leading-relaxed">
                          {message.content}
                        </p>
                        <time
                          dateTime={message.createdAt.toISOString()}
                          className={cx(
                            "mt-1.5 block text-[10px]",
                            isUser ? "text-white/65" : "text-[#64748b]",
                          )}
                        >
                          {message.createdAt.toLocaleTimeString([], {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </time>
                        {message.actionLink && message.actionLabel && (
                          <MessageAction
                            href={message.actionLink}
                            label={message.actionLabel}
                            onNavigate={closeChat}
                          />
                        )}
                        {message.suggestions && (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {message.suggestions.map((suggestion) => (
                              <button
                                key={`${suggestion.label}-${suggestion.href ?? suggestion.query}`}
                                type="button"
                                aria-label={
                                  suggestion.query
                                    ? `Ask: ${suggestion.query}`
                                    : `Navigate to ${suggestion.label}`
                                }
                                disabled={isLoading}
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="inline-flex items-center gap-1 rounded-full border border-[#e2e8f0] bg-[#f1f5f9] px-2.5 py-1.5 text-[11px] font-medium text-[#011f3e] transition-colors hover:border-[#f81529] hover:bg-[#fff0f2] hover:text-[#d9142a] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f81529]"
                              >
                                {suggestion.label}
                                {suggestion.href && (
                                  <ExternalLink
                                    size={11}
                                    aria-hidden="true"
                                  />
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                {isLoading && (
                  <div
                    className="flex items-center gap-2 self-start rounded-2xl rounded-bl-sm border border-[#e2e8f0] bg-white px-4 py-3 text-[#011f3e]"
                    role="status"
                    aria-label="SPRINT is responding"
                  >
                    <LoaderCircle
                      size={17}
                      className="animate-spin"
                      aria-hidden="true"
                    />
                    <span className="text-xs text-[#64748b]">Thinking…</span>
                  </div>
                )}
              </div>

              <form
                onSubmit={handleSubmit}
                className="flex shrink-0 items-center gap-2 border-t border-[#e2e8f0] bg-white p-3.5 sm:p-4"
              >
                <label className="sr-only" htmlFor="ai-assistant-input">
                  Your message
                </label>
                <input
                  ref={inputRef}
                  id="ai-assistant-input"
                  type="text"
                  value={draft}
                  maxLength={500}
                  autoComplete="off"
                  placeholder="Ask us anything…"
                  onChange={(event) => setDraft(event.target.value)}
                  className="min-w-0 flex-1 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 text-sm text-[#0f172a] outline-none transition placeholder:text-[#64748b] focus:border-[#f81529] focus:ring-2 focus:ring-[#f81529]/15"
                />
                <button
                  type="submit"
                  aria-label={isLoading ? "Sending message" : "Send message"}
                  disabled={!draft.trim() || isLoading}
                  className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#f81529] text-white transition-colors hover:bg-[#d9142a] disabled:cursor-not-allowed disabled:bg-[#011f3e]/35 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f81529]"
                >
                  {isLoading ? (
                    <LoaderCircle
                      size={18}
                      className="animate-spin"
                      aria-hidden="true"
                    />
                  ) : (
                    <Send size={17} aria-hidden="true" />
                  )}
                </button>
              </form>
              <p className="shrink-0 bg-white pb-2 text-center text-[10px] text-[#64748b]">
                Demo assistant · Answers may need confirmation
              </p>
            </motion.section>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
