"use client";
import { useEffect, useState } from "react";

const Mascot = ({ onClick }: { onClick: () => void }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
  }, []);

  return (
    <div
      className={`fixed bottom-24 right-6 z-40 transition-all duration-1000 transform cursor-pointer group ${
        visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
      }`}
      onClick={onClick}>
      <div className="absolute -top-16 right-0 bg-white px-4 py-2 rounded-2xl rounded-br-none shadow-lg border border-indigo-100 mb-2 w-48 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <p className="text-xs text-slate-600 font-medium">
          Hi there! Need help finding the perfect tech or checking your orders?
        </p>
      </div>

      <div className="mr-6 mt-9">
        <iframe
          src="https://my.spline.design/genkubgreetingrobot-8g3K01qBKgRUiV2F6kG8RkLx/"
          frameBorder="0"
          width="200%"
          height="200%"></iframe>
      </div>
    </div>
  );
};

export default Mascot;
