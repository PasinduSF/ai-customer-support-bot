import { MessageCircle, X } from "lucide-react";
import React from "react";

interface FloatingButtonProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const FloatingButton = ({ isOpen, setIsOpen }: FloatingButtonProps) => {
  return (
    <button
      onClick={() => setIsOpen(!isOpen)}
      className={`${
        isOpen
          ? "bg-slate-800 rotate-90 scale-90"
          : "bg-linear-to-r from-violet-600 to-indigo-600 hover:scale-110 hover:shadow-[0_0_20px_rgba(79,70,229,0.5)]"
      } text-white p-4 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center group`}>
      {isOpen ? (
        <X size={28} />
      ) : (
        <MessageCircle size={28} className="fill-current" />
      )}

      {!isOpen && (
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
        </span>
      )}
    </button>
  );
};

export default FloatingButton;
