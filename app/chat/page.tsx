"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import TextareaAutosize from "react-textarea-autosize";
import { Sparkles, Paperclip, Send, File, Loader2, ExternalLink, Info } from "lucide-react";
import { useRouter } from 'next/navigation';
import { askChatBot, uploadPdfs, ChatResponse, ChatSource } from "@/api/chatService"; 
import { showUploadSuccess, showUploadError } from "@/utils/alerts";

// --- Types ---

interface MessageMetadata {
  token_usage?: {
    total_tokens: number;
  };
  model_used?: string;
  sources?: ChatSource[]; 
}

interface Message {
  sender: "user" | "bot";
  text: string;
  metadata?: MessageMetadata;
}

// --- Constants ---

const suggestionChips = [
  "Benefit for major broken bone?",
  "What is max age to apply for policy?",
  "What is MetLife?",
  "What is Mortgage?",
];

const guidedQuestions = [
  "How much will unit 3 pay out for a major broken bone?",
  "How many claims can I make on the active lifestyle policy?",
  "What is the max age to apply for a policy?",
  "A policyholder receives £4,500 for fractures from an accident. Later dies from that same accident. Accidental death = £50,000 per unit * 2 units = £100,000. How much is paid?",
  "If premiums remain constant, how much more will you pay in premiums between years 5 and 15 (inclusive) than between years 1 and 5 (inclusive) for a 1-unit core+child policy? Core 1 unit = £10, child 1 unit = £2.",
  "Can borrowers repay the loan early?",
  "When does the Lifetime Mortgage become repayable?",
  "When does a Member's cover terminate?",
  "What documents are required for a death claim?",
];

export default function TruPilotChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setSessionId("user_" + Math.random().toString(36).substring(2, 10));
  }, []);

  const tokenStats = messages.reduce((acc, msg) => {
    if (msg.metadata?.token_usage) {
      return { totalTokens: acc.totalTokens + msg.metadata.token_usage.total_tokens };
    }
    return acc;
  }, { totalTokens: 0 });

  // --- Handlers ---

  const sendMessage = async (userInput?: string, autoNextQuestions: string[] = []) => {
    const text = userInput ?? input;
    if (!text.trim()) return;
 
    setMessages((prev) => [...prev, { sender: "user", text }]);
    setInput(""); 
    setLoading(true);

    try {
      const data: ChatResponse = await askChatBot(text, sessionId);
      
      const enrichedMetadata: MessageMetadata = {
        ...data.metadata,
        sources: data.source || [],
      };

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: data.answer,
          metadata: enrichedMetadata, 
        },
      ]);

      if (autoNextQuestions.length > 0) {
        const [nextQ, ...remainingQs] = autoNextQuestions;
        setTimeout(() => sendMessage(nextQ, remainingQs), 500);
      }

    } catch(error: any) {
      setMessages((prev) => [
        ...prev,
        { 
          sender: "bot", 
          text: error.message || "Something went wrong. Please try again." 
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      await uploadPdfs(files);
      showUploadSuccess();
    } catch (error) {
      showUploadError();
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handlePaperclipClick = () => fileInputRef.current?.click();

  // --- Render ---

  return (
    <div className="flex h-[100dvh] bg-[#F8F9FC] font-sans text-slate-800">
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-10">
          <div className="flex items-center gap-4">
            <button 
              className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-50 transition-colors" 
              onClick={() => router.push('/files')}
            >
              <File size={20} />
              <span>Open Files</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
             <button
                onClick={() => sendMessage(guidedQuestions[0], guidedQuestions.slice(1))}
                className="bg-[#2B235E] text-white px-4 py-2 rounded-md text-sm hover:bg-[#1a153a] transition shadow-sm"
              >
                Run Test Flow
              </button>
          </div>
        </header>

        {/* Chat Area */}
        <main className="flex-1 overflow-y-auto p-6 scrollbar-hide relative flex flex-col items-center">
          <div className="w-full max-w-4xl flex flex-col gap-8 pb-32">
            
            {/* Empty State */}
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center mt-20 space-y-8 animate-in fade-in duration-500">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-8 h-8 text-purple-400" />
                  <h1 className="text-3xl font-bold text-[#2B235E]">TruPilot</h1>
                </div>

                {/* Input Box (Empty State) */}
                <div className="w-full max-w-2xl bg-white border border-gray-200 rounded-2xl shadow-sm relative group focus-within:border-purple-400 focus-within:shadow-md transition-all">
                  <TextareaAutosize
                    minRows={3}
                    maxRows={8}
                    placeholder="Ask me anything about your policies..."
                    className="w-full resize-none border-none bg-transparent p-6 text-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-0"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                  />
                  <div className="flex items-center justify-between px-4 pb-4 mt-2">
                    <div className="flex gap-4 text-gray-400">
                      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf" multiple />
                      <button onClick={handlePaperclipClick} disabled={isUploading} className="p-2 hover:bg-gray-50 rounded-full transition disabled:opacity-50">
                        {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Paperclip className="w-4 h-4" />}
                      </button>
                    </div>
                    <button
                      onClick={() => sendMessage()}
                      disabled={!input.trim()}
                      className={`p-2 rounded-xl transition-all duration-200 ${input.trim() ? "bg-[#2B235E] text-white shadow-md hover:scale-105" : "bg-gray-100 text-gray-300 cursor-not-allowed"}`}
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Chips */}
                <div className="flex flex-wrap justify-center gap-3">
                  {suggestionChips.map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => sendMessage(chip)}
                      className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:border-purple-300 hover:text-purple-700 transition shadow-sm"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            {messages.map((msg, idx) => (
              <div key={idx} className="w-full animate-in slide-in-from-bottom-2 duration-300">
                {msg.sender === "user" ? (
                  <h2 className="text-xl font-semibold text-[#2B235E] mb-4 mt-6">{msg.text}</h2>
                ) : (
                  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm text-gray-700 leading-relaxed break-words">
                    <div className="mb-4 text-xs font-bold text-purple-600 uppercase tracking-wider bg-purple-50 inline-block px-2 py-1 rounded">
                      Answer
                    </div>

                    <div className="text-slate-600 prose prose-purple max-w-none">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                        components={{
                          table: ({ node, ...props }) => <div className="overflow-x-auto my-4 rounded-lg border border-gray-200"><table className="min-w-full divide-y divide-gray-200" {...props} /></div>,
                          thead: ({ node, ...props }) => <thead className="bg-gray-50" {...props} />,
                          th: ({ node, ...props }) => <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider" {...props} />,
                          tbody: ({ node, ...props }) => <tbody className="bg-white divide-y divide-gray-200" {...props} />,
                          tr: ({ node, ...props }) => <tr className="hover:bg-gray-50 transition-colors" {...props} />,
                          td: ({ node, ...props }) => <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap" {...props} />,
                          h3: ({ node, ...props }) => <h3 className="text-lg font-bold text-[#2B235E] mt-6 mb-3" {...props} />,
                          a: ({ node, ...props }) => <a className="text-purple-600 font-medium hover:underline" target="_blank" rel="noopener noreferrer" {...props} />
                        }}
                      >
                        {msg.text}
                      </ReactMarkdown>
                    </div>

                    {/* Metadata Footer */}
                    {msg.metadata && (
                      <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col gap-4">
                        
                        {/* Sources (Numbered Style) */}
                        {msg.metadata.sources && msg.metadata.sources.length > 0 && (
                          <div className="flex flex-col gap-2">
                             <div className="flex items-center gap-1 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Sources
                             </div>
                             <div className="flex flex-wrap gap-2">
                               {msg.metadata.sources.map((source, i) => (
                                  <a
                                    key={i}
                                    href={source.link} 
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex items-center gap-2 px-2.5 py-1.5 bg-white border border-gray-200 rounded-full hover:border-purple-300 hover:shadow-sm transition-all text-xs text-gray-600 hover:text-purple-700"
                                    title={source.file} // Show full filename on hover
                                  >
                                    {/* Number Badge */}
                                    <span className="flex items-center justify-center w-4 h-4 rounded-full bg-purple-100 text-purple-700 font-bold text-[10px]">
                                      {i + 1}
                                    </span>
                                    {/* Filename */}
                                    <span className="truncate max-w-[200px] font-medium">
                                      {source.file}
                                    </span>
                                    <ExternalLink size={10} className="opacity-50 group-hover:opacity-100" />
                                  </a>
                               ))}
                             </div>
                          </div>
                        )}

                        {/* Token Stats */}
                        {msg.metadata.token_usage && (
                          <div className="flex flex-wrap gap-4 items-center text-xs text-gray-400">
                             <span>Model: {msg.metadata.model_used || "Unknown"}</span>
                             <div className="flex items-center gap-1">
                               <span>Tokens:</span>
                               <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-mono">{msg.metadata.token_usage.total_tokens}</span>
                             </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Thinking Indicator */}
            {loading && (
              <div className="flex items-center gap-2 text-gray-500 mt-4 ml-2">
                <Sparkles className="w-5 h-5 animate-pulse text-purple-400" />
                <span className="text-sm">Thinking...</span>
              </div>
            )}
            
            <div ref={chatEndRef}></div>
          </div>
        </main>

        {/* Bottom Floating Input */}
        {messages.length > 0 && (
          <div className="p-6 bg-gradient-to-t from-[#F8F9FC] via-[#F8F9FC] to-transparent sticky bottom-0 z-10 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-full max-w-4xl">
              <div className="relative w-full bg-white border border-gray-200 rounded-2xl shadow-lg flex flex-col focus-within:ring-2 focus-within:ring-purple-100 transition-all">
                <TextareaAutosize
                  minRows={1}
                  maxRows={6}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Ask follow-up..."
                  className="w-full p-4 pr-4 bg-transparent resize-none focus:outline-none text-gray-700 placeholder-gray-400 rounded-2xl"
                />
                <div className="flex items-center justify-between px-4 pb-4 pt-1">
                  <div className="flex gap-2">
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf" multiple />
                    <button onClick={handlePaperclipClick} disabled={isUploading} className="p-2 text-gray-400 hover:bg-gray-50 rounded-full transition disabled:opacity-50">
                      {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Paperclip className="w-4 h-4" />}
                    </button>
                  </div>
                  <button
                    onClick={() => sendMessage()}
                    disabled={!input.trim()}
                    className={`p-2 rounded-xl transition ${input.trim() ? "bg-[#2B235E] text-white shadow-md" : "bg-gray-200 text-gray-400"}`}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-2 text-[10px] text-gray-400 flex gap-4">
              <span>ID: {sessionId}</span>
              <span>Total Tokens: {tokenStats.totalTokens}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}