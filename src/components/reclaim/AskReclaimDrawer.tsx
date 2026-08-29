'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  RotateCcw,
  ExternalLink,
  ChevronRight,
  AlertTriangle,
  Clock,
  CheckCircle2,
  HelpCircle,
  Zap,
} from 'lucide-react';
import { useReclaim } from '@/context/ReclaimContext';
import { processAskQuery, AskResponse, AskContext } from '@/lib/ask-engine';
import { formatINR } from '@/lib/utils';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  responsePayload?: AskResponse;
  timestamp: string;
}

interface AskReclaimDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialCaseId?: string;
}

export const AskReclaimDrawer: React.FC<AskReclaimDrawerProps> = ({
  isOpen,
  onClose,
  initialCaseId,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const { cases, kpis, guardrails } = useReclaim();

  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingStatusText, setThinkingStatusText] = useState('Checking recovery data...');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Determine current active case from route or prop
  const currentCaseId =
    initialCaseId ||
    (pathname.startsWith('/recovery/') ? pathname.replace('/recovery/', '') : undefined);
  const activeCase = cases.find((c) => c.id === currentCaseId);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
      scrollToBottom();
    }
  }, [isOpen, messages]);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Determine context type for suggestion questions
  const getContextualSuggestions = () => {
    if (activeCase) {
      return [
        `When will ${activeCase.customer.company}'s payment likely recover?`,
        'Why did Reclaim choose this action?',
        'What happens if the next retry fails?',
        'What other recovery methods can we try?',
        'When will Reclaim stop trying?',
      ];
    }

    if (pathname.includes('/agent/guardrails')) {
      return [
        'What happens when the retry limit is reached?',
        'Which actions require human approval?',
        'Why was this action blocked?',
        'Which cases need my attention?',
      ];
    }

    if (pathname.includes('/agent/activity') || pathname.includes('/agent/decisions')) {
      return [
        'Why did Reclaim take this action?',
        'Which actions recovered the most revenue?',
        'Why did this workflow stop?',
        'Where are we losing the most revenue?',
      ];
    }

    // Default dashboard suggestions
    return [
      'Where are we losing the most revenue?',
      'How much did Reclaim recover today?',
      'Which cases need my attention?',
      'Which recovery method performs best?',
    ];
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || isThinking) return;

    const userMessage: ChatMessage = {
      id: `msg_usr_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputQuery('');
    setIsThinking(true);

    // Dynamic thinking indicator copy
    const thinkingStates = [
      'Checking recovery data...',
      activeCase ? `Analyzing ${activeCase.customer.company}'s case...` : 'Evaluating workspace telemetry...',
      'Reviewing guardrail constraints...',
    ];
    setThinkingStatusText(thinkingStates[0]);

    // Small delay to simulate intelligent parsing and allow UX feedback
    await new Promise((r) => setTimeout(r, 650));
    setThinkingStatusText(thinkingStates[1]);
    await new Promise((r) => setTimeout(r, 550));

    const askContext: AskContext = {
      caseId: activeCase?.id,
      contextType: activeCase ? 'case' : 'dashboard',
      currentRoute: pathname,
    };

    const responsePayload = processAskQuery(query, askContext, cases, kpis, guardrails);

    const assistantMessage: ChatMessage = {
      id: `msg_asst_${Date.now()}`,
      sender: 'assistant',
      text: responsePayload.content,
      responsePayload,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, assistantMessage]);
    setIsThinking(false);
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs transition-opacity duration-200"
      />

      {/* Drawer Panel */}
      <div
        className="relative w-full max-w-[460px] bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-250 ease-out border-l border-neutral-200"
        role="dialog"
        aria-modal="true"
        aria-label="Ask Reclaim Intelligence Layer"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-200 bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600 shadow-2xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-bold text-neutral-900 leading-tight">
                  Ask Reclaim
                </h2>
                <span className="text-brand-500 font-extrabold text-xs">✦</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-brand-50 text-brand-700 font-bold uppercase tracking-wider border border-brand-200">
                  Copilot
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                Revenue intelligence & decision support
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <button
                onClick={handleClearChat}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors text-xs font-medium"
                title="Clear conversation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
              aria-label="Close Ask Reclaim"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Active Context Banner */}
        <div className="px-4 py-2 bg-neutral-50 border-b border-neutral-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-neutral-600 truncate">
            <span className="w-2 h-2 rounded-full bg-brand-500 shrink-0" />
            <span className="text-neutral-400 font-medium">Context:</span>
            {activeCase ? (
              <span className="font-bold text-neutral-900 truncate">
                {activeCase.customer.company} ({formatINR(activeCase.amount)} at risk)
              </span>
            ) : (
              <span className="font-bold text-neutral-900">
                Workspace Overview ({formatINR(kpis.revenueAtRisk)} at risk)
              </span>
            )}
          </div>

          <span className="text-[10px] text-neutral-400 shrink-0 ml-2 font-medium">
            Live Telemetry
          </span>
        </div>

        {/* Chat Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-[#F8FAFC]">
          {messages.length === 0 ? (
            /* Empty State */
            <div className="space-y-6 pt-4 pb-2 animate-in fade-in duration-200">
              <div className="text-center space-y-2 max-w-xs mx-auto">
                <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-center mx-auto text-brand-600 shadow-2xs">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-neutral-900">
                  ✦ Ask Reclaim
                </h3>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  Your context-aware revenue recovery copilot. Ask about at-risk invoices, timing, decisions, or guardrails.
                </p>
              </div>

              {/* Contextual Suggested Questions */}
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider px-1">
                  Suggested Questions
                </p>
                <div className="space-y-1.5">
                  {getContextualSuggestions().map((qText, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(qText)}
                      className="w-full text-left p-3 rounded-xl border border-neutral-200 bg-white hover:border-brand-300 hover:bg-brand-50/40 text-xs font-semibold text-neutral-800 transition-all shadow-2xs hover:shadow-xs flex items-center justify-between group"
                    >
                      <span className="leading-snug pr-2">{qText}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-neutral-300 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-neutral-100/80 rounded-xl border border-neutral-200 text-[11px] text-neutral-500 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                <p>
                  Grounded in live workspace data and configured safety guardrails.
                </p>
              </div>
            </div>
          ) : (
            /* Active Message List */
            <>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === 'user' ? 'items-end' : 'items-start'
                  } space-y-1.5 animate-in fade-in slide-in-from-bottom-1 duration-200`}
                >
                  {/* Message Bubble */}
                  <div
                    className={`max-w-[92%] rounded-2xl p-3.5 sm:p-4 text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-neutral-900 text-white rounded-br-xs shadow-xs font-medium'
                        : 'bg-white border border-neutral-200 text-neutral-800 rounded-bl-xs shadow-card space-y-3'
                    }`}
                  >
                    {msg.sender === 'assistant' ? (
                      <div>
                        {/* Assistant Header Badge */}
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-brand-700 mb-2 pb-1.5 border-b border-neutral-100">
                          <Bot className="w-3.5 h-3.5 text-brand-600" />
                          <span>Reclaim Intelligence</span>
                          <span className="text-neutral-300">·</span>
                          <span className="text-neutral-400 font-normal text-[10px]">{msg.timestamp}</span>
                        </div>

                        {/* Content formatted with bullet points & line breaks */}
                        <div className="space-y-2 whitespace-pre-line text-neutral-800 font-normal leading-relaxed">
                          {msg.text.split('\n\n').map((paragraph, pIdx) => (
                            <p key={pIdx} className="leading-relaxed">
                              {/* Simple Bold text parser */}
                              {paragraph.split('**').map((chunk, cIdx) => (
                                cIdx % 2 === 1 ? (
                                  <strong key={cIdx} className="font-bold text-neutral-900">
                                    {chunk}
                                  </strong>
                                ) : (
                                  chunk
                                )
                              ))}
                            </p>
                          ))}
                        </div>

                        {/* Mini Metric Highlight Pills */}
                        {msg.responsePayload?.metrics && msg.responsePayload.metrics.length > 0 && (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-2">
                            {msg.responsePayload.metrics.map((m, mIdx) => (
                              <div
                                key={mIdx}
                                className={`p-2 rounded-lg border text-left ${
                                  m.variant === 'success'
                                    ? 'bg-success-50 border-success-200 text-success-900'
                                    : m.variant === 'warning'
                                    ? 'bg-warning-50 border-warning-200 text-warning-900'
                                    : m.variant === 'brand'
                                    ? 'bg-brand-50 border-brand-200 text-brand-900'
                                    : 'bg-neutral-50 border-neutral-200 text-neutral-900'
                                }`}
                              >
                                <span className="text-[10px] text-neutral-500 font-medium block truncate">
                                  {m.label}
                                </span>
                                <span className="text-xs font-bold block truncate tabular-nums">
                                  {m.value}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Action CTA Button */}
                        {msg.responsePayload?.actionButton && (
                          <div className="pt-2">
                            <button
                              type="button"
                              onClick={() => {
                                if (msg.responsePayload?.actionButton?.href) {
                                  router.push(msg.responsePayload.actionButton.href);
                                  onClose();
                                }
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-colors shadow-2xs"
                            >
                              <span>{msg.responsePayload.actionButton.label}</span>
                            </button>
                          </div>
                        )}

                        {/* Source Context Footnote */}
                        {msg.responsePayload?.sourceContext && (
                          <div className="pt-1.5 text-[10px] text-neutral-400 italic flex items-center gap-1">
                            <span>ℹ</span>
                            <span>{msg.responsePayload.sourceContext}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span>{msg.text}</span>
                    )}
                  </div>

                  {/* Follow-up Suggestion Chips under Assistant Response */}
                  {msg.sender === 'assistant' && msg.responsePayload?.suggestedFollowUps && (
                    <div className="flex flex-wrap gap-1.5 pt-1 pl-1 max-w-[95%]">
                      {msg.responsePayload.suggestedFollowUps.map((chipText, cIdx) => (
                        <button
                          key={cIdx}
                          onClick={() => handleSendMessage(chipText)}
                          className="px-2.5 py-1 rounded-full bg-white hover:bg-brand-50 text-neutral-600 hover:text-brand-700 border border-neutral-200 hover:border-brand-300 text-[11px] font-medium transition-all shadow-2xs"
                        >
                          {chipText}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Thinking / Analyzing Indicator */}
              {isThinking && (
                <div className="flex items-start space-y-1 animate-in fade-in">
                  <div className="bg-white border border-neutral-200 rounded-2xl rounded-bl-xs p-3.5 shadow-card space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-brand-700">
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
                      <span>{thinkingStatusText}</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Footer */}
        <div className="p-3.5 sm:p-4 border-t border-neutral-200 bg-white space-y-2 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask anything about recovery cases, timing, or rules..."
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-neutral-300 bg-neutral-50/70 focus:bg-white text-xs font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all"
            />

            <button
              type="submit"
              disabled={!inputQuery.trim() || isThinking}
              className="w-9 h-9 rounded-xl bg-brand-500 hover:bg-brand-600 active:bg-brand-700 disabled:opacity-40 text-white flex items-center justify-center transition-colors shadow-2xs shrink-0"
              aria-label="Send query"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          <p className="text-[10px] text-neutral-400 text-center leading-tight">
            Reclaim Copilot answers are estimates grounded in active workspace telemetry.
          </p>
        </div>
      </div>
    </div>
  );
};
