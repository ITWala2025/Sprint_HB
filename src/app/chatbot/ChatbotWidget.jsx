"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bot, ArrowUpRight, Send, Sparkles, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { getChatbotReply } from "./chatbot-service";
import "./chatbot.css";

const WELCOME_MESSAGE = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi! I’m the SPRINT assistant. Ask me about courses, programs, eligibility, or getting in touch.",
  suggestions: ["Explore courses", "Tell me about SPRINT RISE", "Contact admissions"],
};

function MessageAction({ action, onNavigate }) {
  if (!action) return null;
  const isInternal = action.href.startsWith("/") && !action.href.startsWith("//");

  if (isInternal) {
    return (
      <Link className="sprint-chat__action" href={action.href} onClick={onNavigate}>
        {action.label}
        <ArrowUpRight size={15} aria-hidden="true" />
      </Link>
    );
  }

  return (
    <a
      className="sprint-chat__action"
      href={action.href}
      target={action.href.startsWith("https://") ? "_blank" : undefined}
      rel={action.href.startsWith("https://") ? "noopener noreferrer" : undefined}
    >
      {action.label}
      <ArrowUpRight size={15} aria-hidden="true" />
    </a>
  );
}

export default function ChatbotWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const dialogRef = useRef(null);
  const inputRef = useRef(null);
  const messageListRef = useRef(null);
  const launcherRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    inputRef.current?.focus();

    return () => launcherRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    const messageList = messageListRef.current;
    if (messageList) messageList.scrollTop = messageList.scrollHeight;
  }, [messages, isLoading]);

  const closeDialog = () => {
    if (dialogRef.current?.open) dialogRef.current.close();
    setIsOpen(false);
  };

  const sendMessage = async (value) => {
    const message = value.trim();
    if (!message || isLoading) return;

    const userMessage = { id: `${Date.now()}-user`, role: "user", content: message };
    const priorMessages = messages.filter((item) => item.role !== "error");
    setMessages((current) => [...current, userMessage]);
    setDraft("");
    setIsLoading(true);

    try {
      const result = await getChatbotReply({
        message,
        history: [...priorMessages, userMessage].map(({ role, content }) => ({
          role,
          content,
        })),
        pathname,
      });
      setMessages((current) => [
        ...current,
        {
          id: `${Date.now()}-assistant`,
          role: "assistant",
          content: result.reply,
          action: result.action,
          suggestions: result.suggestions,
        },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: `${Date.now()}-error`,
          role: "error",
          content:
            "I couldn’t reach the chat service just now. Please try again, or contact the SPRINT team directly.",
          action: { label: "Contact SPRINT", href: "/contact" },
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="sprint-chat">
      <button
        ref={launcherRef}
        className="sprint-chat__launcher"
        type="button"
        aria-label="Open SPRINT chat"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(true)}
      >
        <Bot size={25} strokeWidth={2.1} aria-hidden="true" />
        <span className="sprint-chat__launcher-label">Ask SPRINT</span>
      </button>

      {isOpen && (
        <dialog
          ref={dialogRef}
          className="sprint-chat__dialog"
          aria-labelledby="sprint-chat-title"
          onClose={() => setIsOpen(false)}
          onClick={(event) => {
            if (event.target === dialogRef.current) closeDialog();
          }}
        >
          <section className="sprint-chat__panel">
            <header className="sprint-chat__header">
              <div className="sprint-chat__avatar" aria-hidden="true">
                <Sparkles size={19} />
              </div>
              <div className="sprint-chat__heading">
                <h2 id="sprint-chat-title">SPRINT Assistant</h2>
                <p><span className="sprint-chat__status" /> Here to help you learn</p>
              </div>
              <button
                className="sprint-chat__close"
                type="button"
                aria-label="Close chat"
                onClick={closeDialog}
              >
                <X size={20} aria-hidden="true" />
              </button>
            </header>

            <div
              className="sprint-chat__messages"
              ref={messageListRef}
              aria-live="polite"
              aria-relevant="additions text"
            >
              <p className="sprint-chat__date">SPRINT SUPPORT</p>
              {messages.map((message) => (
                <div
                  className={`sprint-chat__message sprint-chat__message--${message.role}`}
                  key={message.id}
                >
                  <p>{message.content}</p>
                  <MessageAction
                    action={message.action}
                    onNavigate={closeDialog}
                  />
                  {message.suggestions?.length > 0 && (
                    <div className="sprint-chat__suggestions">
                      {message.suggestions.map((suggestion) => (
                        <button
                          type="button"
                          key={suggestion}
                          disabled={isLoading}
                          onClick={() => sendMessage(suggestion)}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="sprint-chat__message sprint-chat__message--assistant sprint-chat__typing" aria-label="SPRINT is responding">
                  <span />
                  <span />
                  <span />
                </div>
              )}
            </div>

            <form
              className="sprint-chat__composer"
              onSubmit={(event) => {
                event.preventDefault();
                sendMessage(draft);
              }}
            >
              <label className="sprint-chat__sr-only" htmlFor="sprint-chat-input">
                Your message
              </label>
              <input
                ref={inputRef}
                id="sprint-chat-input"
                type="text"
                value={draft}
                maxLength={500}
                placeholder="Ask us anything..."
                autoComplete="off"
                onChange={(event) => setDraft(event.target.value)}
              />
              <button
                type="submit"
                aria-label="Send message"
                disabled={!draft.trim() || isLoading}
              >
                <Send size={18} aria-hidden="true" />
              </button>
            </form>
            <p className="sprint-chat__disclaimer">
              Demo assistant · Answers may need confirmation
            </p>
          </section>
        </dialog>
      )}
    </div>
  );
}
