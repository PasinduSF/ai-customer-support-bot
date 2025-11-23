import { ShieldCheck, RefreshCcw, Clock, DollarSign } from "lucide-react";

const ReturnPolicyCard = () => {
  return (
    <div className="mt-3 ml-12 grid gap-2 w-[85%]">
      <div className="mt-3 w-full bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="bg-indigo-50 p-3 border-b border-indigo-100 flex items-center gap-2">
          <ShieldCheck className="text-indigo-600" size={18} />
          <span className="text-sm font-bold text-indigo-900">
            Hassle-Free Returns
          </span>
        </div>

        <div className="p-4 space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-slate-50 rounded-lg text-slate-500 shrink-0">
              <Clock size={16} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-0.5">
                Return Window
              </p>
              <p className="text-sm text-slate-600">
                You have{" "}
                <span className="font-semibold text-indigo-600">30 days</span>{" "}
                from purchase to return items.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-slate-50 rounded-lg text-slate-500 shrink-0">
              <RefreshCcw size={16} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-0.5">
                Condition
              </p>
              <p className="text-sm text-slate-600">
                Items must be unused and in original condition.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-slate-50 rounded-lg text-slate-500 shrink-0">
              <DollarSign size={16} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-0.5">
                Refund Speed
              </p>
              <p className="text-sm text-slate-600">
                Processed within{" "}
                <span className="font-semibold text-slate-800">
                  5 business days
                </span>{" "}
                of receipt.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReturnPolicyCard;
