"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, Sparkles, Bot, ArrowLeft, MicOff, Mic } from "lucide-react";
import { AIResType } from "@/enums/ai-res-type.enum";
import { Message } from "@/types/ai-res.types";
import { Sender } from "@/enums/sender.enum";
import { Product } from "@/types/products.types";
import { Order } from "@/types/orders.types";

// Sub-components imports
import OrderStepper from "./OrderStepper";
import ProductList from "./ProductList";
import FloatingButton from "./FloatingButton";
import SelectedProductView from "./SelectedProductView";
import ReturnPolicyCard from "./ReturnPolicyCard";
import OrderList from "./OrderList";
import TypingIndicator from "../TypingIndicator";

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
    <div
      className={`fixed z-50 flex flex-col items-end font-sans transition-all duration-300 ${
        isOpen
          ? "inset-0 sm:inset-auto sm:bottom-6 sm:right-6"
          : "bottom-6 right-6"
      }`}>
      {isOpen && (
        <div className="w-full h-full sm:w-[400px] md:w-[450px] sm:h-[600px] bg-slate-50 sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300 ring-1 ring-black/5 relative sm:mb-4">
          <div className="bg-linear-to-r from-violet-600 to-indigo-600 p-4 sm:p-5 text-white flex justify-between items-center shadow-md relative overflow-hidden shrink-0 z-20">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>

            <div className="flex items-center gap-3 relative z-10">
              {selectedProduct ? (
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="bg-white/20 p-2 rounded-xl backdrop-blur-sm hover:bg-white/30 transition cursor-pointer">
                  <ArrowLeft size={20} className="text-white" />
                </button>
              ) : (
                <div className="bg-white/20 p-1 rounded-xl backdrop-blur-sm">
                  <img
                    src="https://res.cloudinary.com/djqdqg1ph/image/upload/v1763913239/ChatGPT_Image_Nov_23_2025_09_22_15_PM_ixhfrb.png"
                    alt="Nova AI Logo"
                    className="w-10 h-10"
                  />
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
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6 bg-slate-50 scroll-smooth">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.sender === Sender.USER ? "items-end" : "items-start"
                    } animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                    <div
                      className={`flex ${
                        msg.sender === Sender.USER
                          ? "flex-row-reverse"
                          : "flex-row"
                      } items-start max-w-[90%]`}>
                      {msg.sender === Sender.BOT && (
                        <div className="w-8 h-8 rounded-full bg-linear-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white shrink-0 mx-2 shadow-sm mt-1">
                          <Sparkles size={14} />
                        </div>
                      )}

                      <div
                        className={`p-4 text-[15px] leading-relaxed shadow-sm whitespace-pre-wrap ${
                          msg.sender === Sender.USER
                            ? "bg-linear-to-r from-violet-600 to-indigo-600 text-white rounded-2xl rounded-tr-none"
                            : "bg-white text-slate-700 border border-slate-100 rounded-2xl rounded-tl-none"
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
                        {msg.type === AIResType.RETURN_POLICY && (
                          <ReturnPolicyCard />
                        )}
                      </div>
                    </div>

                    {msg.type === AIResType.PRODUCT_LIST && msg.data && (
                      <ProductList
                        msg={msg}
                        setSelectedProduct={setSelectedProduct}
                      />
                    )}

                    {msg.type === AIResType.ORDER_LIST && msg.data && (
                      <div className="mt-3 ml-12 grid gap-2 w-[85%]">
                        {msg.data.map((order: Order, index: number) => (
                          <OrderList
                            key={index}
                            order={order}
                            handleSend={() =>
                              handleSend(`Where is order ${order.orderId}`)
                            }
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && <TypingIndicator />}
                <div ref={messagesEndRef} />
              </div>

              <div className="bg-white border-t border-slate-100 shrink-0 pb-4 sm:pb-2">
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

                {/* Input Field */}
                <div className="px-4 pb-2">
                  <div className="relative flex items-center gap-2">
                    <button
                      onClick={handleVoiceInput}
                      className={`p-3 rounded-xl transition-all flex items-center justify-center border ${
                        isListening
                          ? "bg-red-50 text-red-500 border-red-200 animate-pulse"
                          : "bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100"
                      }`}
                      title="Speak">
                      {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                    </button>

                    <div className="flex-1 relative">
                      <input
                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-slate-800 placeholder:text-slate-400 text-sm font-medium pr-12"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        placeholder={
                          isListening ? "Listening..." : "Ask Nova..."
                        }
                        disabled={isLoading}
                      />
                      <button
                        className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all flex items-center justify-center ${
                          input.trim()
                            ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md"
                            : "bg-slate-200 text-slate-400 cursor-not-allowed"
                        }`}
                        onClick={() => handleSend()}
                        disabled={isLoading || (!input.trim() && !isListening)}>
                        <Send size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="text-center mt-2">
                    <span className="text-[10px] text-slate-300 font-medium">
                      Powered by Gemini AI
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      <div className={isOpen ? "hidden sm:block" : "block"}>
        <FloatingButton isOpen={isOpen} setIsOpen={setIsOpen} />
      </div>
    </div>
  );
};

export default NovaChatBot;
