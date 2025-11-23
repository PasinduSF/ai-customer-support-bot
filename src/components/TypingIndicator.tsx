import { Bot } from "lucide-react";

const TypingIndicator = () => (
  <div className="flex justify-start animate-in fade-in slide-in-from-bottom-1 duration-300 mb-4">
    <div className="w-8 h-8 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shrink-0 mx-2 mt-1 opacity-70 shadow-sm">
      <Bot size={14} />
    </div>
    <div className="bg-white border border-slate-100 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1.5">
      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
    </div>
  </div>
);

export default TypingIndicator;
