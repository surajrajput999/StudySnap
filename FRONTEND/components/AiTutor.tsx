'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useStore } from '@/lib/store/useStore';
import { API, apiFetch } from '@/lib/config';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import {
  Sparkles, Send, Paperclip, Mic, Bot, User, BookOpen,
  FileText, LayoutGrid, HelpCircle, Languages, Lightbulb,
  StopCircle, Copy, Check, X, ChevronDown, ChevronUp, Loader2
} from 'lucide-react';

const QUICK_CHIPS = [
  { id: 'explain', label: 'Explain', icon: BookOpen, color: '#3B82F6', prompt: 'Explain this concept in simple terms with examples.' },
  { id: 'summarize', label: 'Summarize', icon: FileText, color: '#10B981', prompt: 'Summarize the key points concisely.' },
  { id: 'flashcards', label: 'Flashcards', icon: LayoutGrid, color: '#8B5CF6', prompt: 'Create a set of flashcards from this content.' },
  { id: 'quiz', label: 'Quiz Me', icon: HelpCircle, color: '#F59E0B', prompt: 'Quiz me with questions to test my understanding.' },
  { id: 'translate', label: 'Translate', icon: Languages, color: '#EC4899', prompt: 'Translate this content.' },
  { id: 'solve', label: 'Solve Doubts', icon: Lightbulb, color: '#06B6D4', prompt: 'Help me solve my doubts about this topic.' },
];

interface Message {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

type CodeLanguage = 'javascript' | 'typescript' | 'python' | 'java' | 'cpp' | 'c' | 'html' | 'css' | 'bash' | 'sql' | 'json' | 'xml' | 'rust' | 'go' | 'ruby' | 'php' | 'swift' | 'kotlin' | 'text';

function detectLanguage(code: string): CodeLanguage {
  const patterns: [RegExp, CodeLanguage][] = [
    [/^(import |export |function |const |let |var |interface |type |class |async |await |=>)/m, 'typescript'],
    [/^(import |def |class |> |from )/m, 'python'],
    [/^(public |private |protected |class |void |int |String |@)/m, 'java'],
    [/^(#include|int main|std::)/m, 'cpp'],
    [/^(package |import |func |go )/m, 'go'],
    [/^(use |fn |let |mut )/m, 'rust'],
    [/^(SELECT |FROM |WHERE |INSERT |UPDATE |CREATE |ALTER |DROP )/im, 'sql'],
    [/^(<!DOCTYPE|<html|<head|<body|<div)/im, 'html'],
  ];
  if (/^[@{}$]/.test(code) && /^(\.\w+|#\w+|\w+\s*\{)/m.test(code)) return 'css';
  for (const [pattern, lang] of patterns) {
    if (pattern.test(code)) return lang;
  }
  return 'text';
}

function CodeBlock({ code, language: langProp }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);
  const language = (langProp || detectLanguage(code)) as CodeLanguage;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="tutor-code-block">
      <div className="tutor-code-header">
        <span className="tutor-code-lang">{language}</span>
        <button className="tutor-code-copy" onClick={handleCopy}>
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre><code className={`language-${language}`}>{code}</code></pre>
    </div>
  );
}

function InlineCode({ children }: { children: React.ReactNode }) {
  return <code className="tutor-inline-code">{children}</code>;
}

function streamText(fullText: string, onChunk: (text: string) => void, onDone: () => void) {
  let index = 0;
  const CHUNK_SIZE = 3;

  const interval = setInterval(() => {
    if (index >= fullText.length) {
      clearInterval(interval);
      onDone();
      return;
    }
    const end = Math.min(index + CHUNK_SIZE, fullText.length);
    onChunk(fullText.slice(index, end));
    index = end;
  }, 20);

  return () => clearInterval(interval);
}

const TOOL_PROMPTS: Record<string, string> = {
  summarize: 'Please summarize the key points of the following study material concisely and clearly.',
  mcq: 'Generate a set of multiple choice questions with answers to test my knowledge on this topic.',
  flashcards: 'Create a set of flashcards (question/answer pairs) from this study material for revision.',
  quiz: 'Quiz me with interactive questions to test my understanding of this subject.',
  translate: 'Translate the following content between Hindi and English as needed.',
  explain: 'Explain this concept in simple, easy-to-understand terms with examples.',
  mindmap: 'Create a mind map structure or outline that visualizes the key concepts and their relationships.',
  pdf: 'I have a PDF document. Please help me analyze, summarize, and extract key information from it.',
};

export default function AiTutor() {
  const { getToken } = useAuth();
  const { activeAiTool, setActiveAiTool } = useStore();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '👋 Hi! I\'m your AI Tutor. Ask me anything about your studies, or try one of the quick actions below!' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{ name: string; content: string } | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const addStreamingMessage = useCallback((content: string) => {
    setMessages(prev => {
      const last = prev[prev.length - 1];
      if (last?.role === 'assistant' && last?.isStreaming) {
        return [...prev.slice(0, -1), { ...last, content: last.content + content }];
      }
      return [...prev, { role: 'assistant', content, isStreaming: true }];
    });
  }, []);

  const finalizeStreaming = useCallback(() => {
    setMessages(prev => {
      const last = prev[prev.length - 1];
      if (last?.isStreaming) {
        return [...prev.slice(0, -1), { ...last, isStreaming: false }];
      }
      return prev;
    });
  }, []);

  const handleSend = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || isLoading) return;

    setInput('');
    setAttachedFile(null);
    const userMsg: Message = { role: 'user', content: msg };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    const contextMessages = [...messages, userMsg].map(m => ({
      role: m.role,
      content: m.content
    }));

    try {
      const data = await apiFetch(API.ai.chat, {
        method: 'POST',
        body: JSON.stringify({ messages: contextMessages }),
        token: (await getToken()) ?? undefined
      });

      if (data.success) {
        const fullResponse = data.message?.content || data.response || data.text || JSON.stringify(data);
        let stopStream: (() => void) | null = null;

        stopStream = streamText(
          fullResponse,
          (chunk) => addStreamingMessage(chunk),
          () => {
            finalizeStreaming();
            setIsLoading(false);
          }
        );
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (err: any) {
      addStreamingMessage('');
      setTimeout(() => {
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.isStreaming) {
            return [...prev.slice(0, -1), { role: 'assistant', content: `⚠️ Error: ${err.message || 'Could not reach AI. Please try again.'}`, isStreaming: false }];
          }
          return prev;
        });
        setIsLoading(false);
      }, 100);
    }
  };

  const handleSendRef = useRef(handleSend);
  handleSendRef.current = handleSend;

  useEffect(() => {
    if (activeAiTool && TOOL_PROMPTS[activeAiTool]) {
      handleSendRef.current(TOOL_PROMPTS[activeAiTool]);
      setActiveAiTool(null);
    }
  }, [activeAiTool, setActiveAiTool]);

  const handleQuickChip = (chip: typeof QUICK_CHIPS[0]) => {
    handleSend(chip.prompt);
  };

  const handleAttachFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type === 'application/pdf') {
      const text = await file.text();
      setAttachedFile({ name: file.name, content: text.slice(0, 5000) });
    } else {
      const text = await file.text();
      setAttachedFile({ name: file.name, content: text.slice(0, 5000) });
    }
    setShowAttachMenu(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="tutor-container">
      <div className="tutor-header">
        <div className="tutor-header-left">
          <div className="tutor-avatar">
            <Sparkles size={18} />
          </div>
          <div>
            <div className="tutor-title">SnapAI Tutor</div>
            <div className="tutor-subtitle">Your personal AI study assistant</div>
          </div>
        </div>
        <div className="tutor-status">
          <span className="tutor-status-dot" />
          Online
        </div>
      </div>

      <div className="tutor-chips">
        {QUICK_CHIPS.map(chip => (
          <button
            key={chip.id}
            className="tutor-chip"
            onClick={() => handleQuickChip(chip)}
            disabled={isLoading}
            style={{ '--chip-color': chip.color } as React.CSSProperties}
          >
            <chip.icon size={14} />
            {chip.label}
          </button>
        ))}
      </div>

      <div className="tutor-chat">
        {messages.map((msg, idx) => (
          <div key={idx} className={`tutor-message tutor-message-${msg.role}`}>
            <div className="tutor-message-avatar">
              {msg.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
            </div>
            <div className="tutor-message-bubble">
              {msg.role === 'assistant' && msg.isStreaming ? (
                <div className="tutor-streaming">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                    components={{
                      code({ className, children, ...props }) {
                        const isInline = !className;
                        const codeStr = String(children).replace(/\n$/, '');
                        if (isInline) return <InlineCode>{children}</InlineCode>;
                        const language = className?.replace('language-', '') || '';
                        return <CodeBlock code={codeStr} language={language} />;
                      },
                      pre({ children }) { return <>{children}</>; },
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                  <span className="tutor-cursor" />
                </div>
              ) : (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                  components={{
                    code({ className, children, ...props }) {
                      const isInline = !className;
                      const codeStr = String(children).replace(/\n$/, '');
                      if (isInline) return <InlineCode>{children}</InlineCode>;
                      const language = className?.replace('language-', '') || '';
                      return <CodeBlock code={codeStr} language={language} />;
                    },
                    pre({ children }) { return <>{children}</>; },
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              )}
            </div>
          </div>
        ))}
        {isLoading && !messages[messages.length - 1]?.isStreaming && (
          <div className="tutor-message tutor-message-assistant">
            <div className="tutor-message-avatar">
              <Bot size={16} />
            </div>
            <div className="tutor-message-bubble">
              <div className="tutor-typing">
                <span className="tutor-typing-dot" />
                <span className="tutor-typing-dot" />
                <span className="tutor-typing-dot" />
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {attachedFile && (
        <div className="tutor-attached">
          <Paperclip size={14} />
          <span className="tutor-attached-name">{attachedFile.name}</span>
          <button className="tutor-attached-remove" onClick={() => setAttachedFile(null)}>
            <X size={14} />
          </button>
        </div>
      )}

      <div className="tutor-input-bar">
        <div className="tutor-input-actions">
          <button
            className="tutor-input-btn"
            onClick={() => setShowAttachMenu(!showAttachMenu)}
            title="Attach file"
          >
            <Paperclip size={18} />
          </button>
          <button
            className="tutor-input-btn"
            title="Voice input"
            onClick={() => {
              if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
                const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
                const recognition = new SpeechRecognition();
                recognition.lang = 'en-US';
                recognition.interimResults = false;
                recognition.onresult = (event: any) => {
                  const transcript = event.results[0][0].transcript;
                  setInput(prev => prev + transcript);
                };
                recognition.start();
              } else {
                alert('Speech recognition is not supported in this browser.');
              }
            }}
          >
            <Mic size={18} />
          </button>
        </div>
        <input
          ref={inputRef}
          type="text"
          className="tutor-input"
          placeholder="Ask your AI tutor anything..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
        />
        <button
          className="tutor-send-btn"
          onClick={() => handleSend()}
          disabled={!input.trim() || isLoading}
        >
          {isLoading ? <Loader2 size={18} className="tutor-spin" /> : <Send size={18} />}
        </button>
      </div>

      {showAttachMenu && (
        <div className="tutor-attach-menu">
          <button className="tutor-attach-option" onClick={() => fileInputRef.current?.click()}>
            <Paperclip size={16} />
            Upload PDF or Text
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt,.md,.json,.csv,.py,.js,.ts,.jsx,.tsx,.html,.css"
            style={{ display: 'none' }}
            onChange={handleAttachFile}
          />
        </div>
      )}
    </div>
  );
}
