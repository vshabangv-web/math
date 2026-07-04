"use client";

import React, { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const PRESET_QUESTIONS = [
  { text: "실수와 허수가 어떻게 다른가요? 🤔", value: "실수와 허수가 어떻게 다르고 실생활에서 어떤 의미가 있는지 아주 쉽게 설명해 주세요!" },
  { text: "근의 공식 공식과 유도법을 알려줘요! 📐", value: "이차방정식의 근의 공식 공식이 무엇이고, 완전제곱식을 이용해 어떻게 유도하는지 단계별로 친절하게 증명해 주세요." },
  { text: "오일러의 등식이 왜 위대한가요? ✨", value: "오일러의 등식 e^(iπ) + 1 = 0 이 무엇이고, 왜 세상에서 가장 아름다운 공식이라고 불리는지 쉽게 풀어 설명해 주세요." },
  { text: "피타고라스 정리의 실생활 쓰임새는? 🏠", value: "피타고라스의 정리가 무엇인지 간단하게 복습하고, 실제로 실생활에서 어떻게 유용하게 쓰이는지 구체적인 사례를 들어 가르쳐 주세요." }
];

export default function MathChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "안녕하세요! 수학 공부를 돕기 위해 찾아온 수학 전문 AI 멘토 **에듀봇(EduBot)**입니다. 📐✨\n\n" +
        "실수와 허수의 개념이 헷갈리거나, 이해하기 어려운 공식 증명이 있거나, 혼자 풀기 벅찬 수학 원리가 있다면 무엇이든 편하게 물어보세요! " +
        "다정하고 세세하게 가르쳐 줄게요. 어떤 질문부터 시작해 볼까요? 😊"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll to bottom when messages update
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    setErrorMessage("");
    const userMessage: Message = { role: "user", content: textToSend };
    
    // Update local chat history
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const chatHistory = [...messages, userMessage];

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: chatHistory }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `서버 에러 (${response.status})`);
      }

      const assistantMessage = await response.json();
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error("Chat error:", error);
      setErrorMessage(
        error.message || "서버와 통신하는 도중 오류가 발생했습니다. 환경변수 설정을 확인해 주세요."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(input);
  };

  // Custom Formatter to render LaTeX / Inline Math cleanly in HTML
  const formatText = (text: string) => {
    if (!text) return "";

    // 1. Break text into blocks by $$ (block math) and $ (inline math)
    // We will parse inline math ($...$) and format it beautifully.
    // Also parse markdown bold (**...**)
    
    // First, let's escape HTML characters to prevent XSS
    let html = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Format Block Math $$ ... $$
    html = html.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
      return `<div class="my-3 p-3 bg-indigo-950/40 border border-indigo-500/20 rounded-xl font-mono text-center text-cyan-300 text-sm overflow-x-auto select-all shadow-inner">
        ${math.trim()}
      </div>`;
    });

    // Format Inline Math $ ... $
    html = html.replace(/\$(.*?)\$/g, (_, math) => {
      return `<code class="px-1.5 py-0.5 mx-0.5 bg-purple-950/50 border border-purple-500/20 text-pink-300 rounded font-mono text-xs select-all">
        ${math.trim()}
      </code>`;
    });

    // Format Markdown bold ** ... **
    html = html.replace(/\*\*(.*?)\*\*/g, (_, bold) => {
      return `<strong class="font-bold text-white">${bold}</strong>`;
    });

    // Format newlines into <br />
    html = html.replace(/\n/g, "<br />");

    return <div dangerouslySetInnerHTML={{ __html: html }} className="leading-relaxed whitespace-pre-wrap text-sm md:text-base text-slate-350" />;
  };

  return (
    <div className="w-full flex-1 flex flex-col bg-[#07011d] py-10 px-4 md:px-8 text-white relative overflow-hidden font-sans">
      {/* Parallax glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-4xl z-10 mx-auto flex flex-col flex-1 min-h-[600px]">
        {/* Title Header */}
        <div className="text-center mb-6">
          <span className="inline-flex items-center gap-1 bg-purple-500/10 px-3 py-1 rounded-full text-xs font-semibold text-purple-400 border border-purple-500/20 mb-2">
            🤖 AUTOMATED MATH TUTOR
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
            에듀봇: AI 수학 멘토 챗봇
          </h1>
          <p className="mt-1.5 text-xs md:text-sm text-slate-400">
            수학 공식 유도, 원리 이해, 기초 개념 구별까지 자상하고 꼼꼼한 에듀봇 선생님에게 편하게 질문하세요.
          </p>
        </div>

        {/* CHAT CONTAINER */}
        <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md shadow-2xl flex flex-col overflow-hidden min-h-[500px]">
          
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 max-h-[500px]">
            {messages.map((msg, index) => {
              const isUser = msg.role === "user";
              return (
                <div
                  key={index}
                  className={`flex ${isUser ? "justify-end" : "justify-start"} items-start gap-2.5 animate-fadeIn`}
                >
                  {/* Bot Avatar */}
                  {!isUser && (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center text-sm shadow-md font-bold shrink-0">
                      🎓
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 border shadow-md ${
                      isUser
                        ? "bg-purple-600/20 border-purple-500/30 text-white rounded-tr-none"
                        : "bg-slate-900/60 border-white/5 rounded-tl-none"
                    }`}
                  >
                    {/* Header role name */}
                    <div className="text-[10px] text-slate-400 font-semibold uppercase mb-1">
                      {isUser ? "Student" : "EduBot"}
                    </div>
                    {/* Formatted body content */}
                    {formatText(msg.content)}
                  </div>
                </div>
              );
            })}

            {/* Thinking / Loading indicator */}
            {isLoading && (
              <div className="flex justify-start items-start gap-2.5">
                <div className="w-9 h-9 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center text-sm shadow-md font-bold shrink-0">
                  🎓
                </div>
                <div className="bg-slate-900/60 border border-white/5 rounded-2xl rounded-tl-none px-4 py-3 shadow-md flex items-center gap-1.5">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase hidden">EduBot</div>
                  <span className="text-xs text-slate-400 mr-1">에듀봇 답변 연구 중</span>
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce delay-100" />
                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce delay-200" />
                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce delay-300" />
                  </div>
                </div>
              </div>
            )}

            {/* Error Message banner */}
            {errorMessage && (
              <div className="bg-red-950/20 border border-red-500/30 p-4 rounded-xl text-center space-y-2">
                <p className="text-red-400 text-sm font-semibold flex items-center justify-center gap-1.5">
                  ⚠️ {errorMessage}
                </p>
                <p className="text-xs text-slate-400">
                  Vercel 설정에서 <code>OPENAI_API_KEY</code>가 올바르게 인가되었는지 확인하고, 로컬 환경일 경우 <code>.env.local</code> 파일을 생성해 기입해 주시기 바랍니다.
                </p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Preset Question Chips */}
          <div className="p-3 border-t border-white/5 bg-slate-950/20 flex flex-wrap gap-2 items-center">
            <span className="text-[10px] font-semibold text-slate-450 uppercase tracking-wider mr-1">추천 질문:</span>
            {PRESET_QUESTIONS.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(chip.value)}
                disabled={isLoading}
                className="text-xs px-3 py-1.5 bg-white/5 hover:bg-purple-500/10 border border-white/10 hover:border-purple-500/30 rounded-full transition-all text-slate-300 hover:text-purple-300 disabled:opacity-40"
              >
                {chip.text}
              </button>
            ))}
          </div>

          {/* Input Submission Bar */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-white/10 bg-slate-900/40 flex gap-2">
            <input
              type="text"
              required
              disabled={isLoading}
              placeholder="예: 근의 공식을 알려줘, i의 거듭제곱의 순환에 대해 가르쳐줘..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 h-12 bg-slate-950/60 border border-white/10 rounded-xl px-4 text-white text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="h-12 px-6 bg-gradient-to-r from-purple-500 to-indigo-650 hover:from-purple-400 hover:to-indigo-550 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-40"
            >
              전송
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
