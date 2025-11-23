"use client";

import { useState, useRef, useEffect } from "react";
import {
  X,
  Send,
  Sparkles,
  Bot,
  ArrowLeft,
  MicOff,
  Mic,
  Package,
  ChevronRight,
} from "lucide-react";
import { AIResType } from "@/enums/ai-res-type.enum";
import { Message } from "@/types/ai-res.types";
import { Sender } from "@/enums/sender.enum";
import { Product } from "@/types/products.types";
import OrderStepper from "./OrderStepper";
import ProductList from "./ProductList";
import FloatingButton from "./FloatingButton";
import SelectedProductView from "./SelectedProductView";
import { Order } from "@/types/orders.types";
import OrderList from "./OrderList";
import ReturnPolicyCard from "./ReturnPolicyCard";

const SUGGESTIONS = [
  { label: "📦 Track Order", text: "Where is my order?" },
  { label: "👟 Best Shoes", text: "Show me popular footwear" },
  { label: "🎧 Gadgets", text: "Recommend electronics" },
  { label: "🔄 Returns", text: "What is your return policy?" },
];

const NovaChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: Sender.BOT,
      text: "Hello! 👋 I'm Nova. Looking for gadgets or checking an order?",
      type: AIResType.TEXT,
    },
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isListening, setIsListening] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages, isOpen]);

  const handleSend = async (textOverride?: string) => {
    const userText = textOverride || input;

    if (!userText.trim()) return;

    setInput("");
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: Sender.USER, text: userText },
    ]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: Sender.BOT,
          text: data.message,
          type: data.type,
          data: data.data,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: Sender.BOT,
          text: "Sorry, I'm having trouble connecting to the server right now.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Browser does not support speech recognition. Try Chrome.");
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
      handleSend();
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
      {isOpen && (
        <div className="mb-6 w-full sm:w-[450px] h-[600px] bg-white rounded-3xl shadow-2xl  flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300 ring-1 ring-black/5 relative">
          <div className="bg-linear-to-r from-violet-600 to-indigo-600 p-5 text-white flex justify-between items-center shadow-md relative overflow-hidden shrink-0">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>

            <div className="flex items-center gap-3 relative z-10">
              {selectedProduct ? (
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="bg-white/20 p-2 rounded-xl backdrop-blur-sm hover:bg-white/30 transition cursor-pointer">
                  <ArrowLeft size={20} className="text-white" />
                </button>
              ) : (
                <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                  <Bot size={24} className="text-white" />
                </div>
              )}

              <div>
                <h3 className="font-bold text-lg leading-tight">
                  {selectedProduct ? "Product Details" : "Nova AI"}
                </h3>
                {!selectedProduct && (
                  <div className="flex items-center gap-1.5 opacity-90">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
                    <span className="text-xs font-medium">Online & Ready</span>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 p-2 rounded-full transition-colors relative z-10 cursor-pointer">
              <X size={20} />
            </button>
          </div>

          {selectedProduct ? (
            <SelectedProductView
              selectedProduct={selectedProduct}
              setSelectedProduct={setSelectedProduct}
            />
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-slate-50 scroll-smooth">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.sender === "user" ? "items-end" : "items-start"
                    } animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                    <div
                      className={`flex ${
                        msg.sender === "user" ? "flex-row-reverse" : "flex-row"
                      } items-start max-w-[90%]`}>
                      {msg.sender === "bot" && (
                        <div className="w-8 h-8 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shrink-0 mx-2 shadow-sm mt-1">
                          <Sparkles size={14} />
                        </div>
                      )}

                      <div
                        className={`p-4 text-[15px] leading-relaxed shadow-sm whitespace-pre-wrap ${
                          msg.sender === "user"
                            ? "bg-linear-to-br from-violet-600 to-indigo-600 text-white rounded-2xl rounded-tr-sm"
                            : "bg-white text-slate-700 border border-slate-100 rounded-2xl rounded-tl-sm"
                        }`}>
                        {msg.text}

                        {msg.type === AIResType.ORDER_STATUS && msg.data && (
                          <OrderStepper
                            status={msg.data.status}
                            orderDate={msg.data.orderDate}
                            deliveryDate={msg.data.deliveryEst}
                            orderId={msg.data.orderId}
                          />
                        )}
                      </div>
                    </div>
                    {msg.type === AIResType.PRODUCT_LIST && msg.data && (
                      <ProductList
                        msg={msg}
                        setSelectedProduct={setSelectedProduct}
                      />
                    )}
                    {msg.type === AIResType.CATEGORY_LIST && msg.data && (
                      <div className="mt-3 ml-12 flex flex-wrap gap-2 w-[85%]">
                        {msg.data.map((category: string) => (
                          <button
                            key={category}
                            onClick={() => handleSend(`Show me ${category}`)}
                            className="px-4 py-2 bg-white border border-indigo-100 rounded-full text-sm font-medium text-indigo-600 shadow-sm hover:bg-indigo-50 hover:border-indigo-200 transition-all capitalize">
                            {category}
                          </button>
                        ))}
                      </div>
                    )}
                    {msg.type === AIResType.ORDER_LIST && msg.data && (
                      <div className="mt-3 ml-12 grid gap-2 w-[85%]">
                        {msg.data.map((order: Order) => (
                          <OrderList
                            order={order}
                            handleSend={() =>
                              handleSend(`Where is order ${order.orderId}`)
                            }
                          />
                        ))}
                      </div>
                    )}
                    {msg.type === AIResType.RETURN_POLICY && (
                      <ReturnPolicyCard />
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start animate-in fade-in duration-300">
                    <div className="w-8 h-8 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shrink-0 mx-2 mt-1 opacity-70">
                      <Bot size={14} />
                    </div>
                    <div className="bg-white border border-slate-100 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-150"></span>
                      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-300"></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 bg-white border-t border-slate-100 shrink-0">
                <div className="px-4 py-3 flex gap-2 overflow-x-auto no-scrollbar scroll-smooth">
                  {SUGGESTIONS.map((chip) => (
                    <button
                      key={chip.label}
                      onClick={() => handleSend(chip.text)}
                      className="cursor-pointer whitespace-nowrap px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-xs font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors shrink-0">
                      {chip.label}
                    </button>
                  ))}
                </div>

                <div className="relative flex items-center gap-2">
                  <button
                    onClick={handleVoiceInput}
                    className={`p-3 rounded-xl transition-all flex items-center justify-center ${
                      isListening
                        ? "bg-red-50 text-red-500 animate-pulse border border-red-200"
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    }`}
                    title="Speak">
                    {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                  </button>

                  <input
                    className="flex-1 px-4 py-3.5 bg-slate-100 border-transparent focus:bg-white border focus:border-indigo-500 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 transition-all text-slate-800 placeholder:text-slate-400 text-sm font-medium"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder={
                      isListening ? "Listening..." : "Ask about products..."
                    }
                    disabled={isLoading}
                  />

                  <button
                    className="cursor-pointer p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all disabled:opacity-50 disabled:scale-95 shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center"
                    onClick={() => handleSend()}
                    disabled={isLoading || (!input.trim() && !isListening)}>
                    <Send size={18} />
                  </button>
                </div>
                <div className="text-center mt-2">
                  <span className="text-[10px] text-slate-400 font-medium">
                    Powered by Gemini AI
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      <FloatingButton isOpen={isOpen} setIsOpen={setIsOpen} />
    </div>
  );
};

export default NovaChatBot;
