import { Order } from "@/types/orders.types";
import { ChevronRight, Package } from "lucide-react";

interface OrderListProps {
  order: Order;
  handleSend: (textOverride?: string | undefined) => Promise<void>;
}

const OrderList = ({ order, handleSend }: OrderListProps) => {
  return (
    <button
      key={order.orderId}
      onClick={() => handleSend(`Where is order ${order.orderId}`)}
      className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all text-left group">
      <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-500 shrink-0 group-hover:bg-emerald-100 transition">
        <Package size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-800 text-sm truncate">
          Order #{order.orderId}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <p className="text-slate-500 text-xs">{order.status}</p>
        </div>
      </div>
      <ChevronRight
        size={16}
        className="text-slate-300 group-hover:text-indigo-500 transition"
      />
    </button>
  );
};

export default OrderList;
