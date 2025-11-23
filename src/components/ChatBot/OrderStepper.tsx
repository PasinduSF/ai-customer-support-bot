import { Calendar, Check, Clock, Package, Truck } from "lucide-react";

const OrderStepper = ({
  status,
  orderDate,
  deliveryDate,
  orderId,
}: {
  status: string;
  orderDate: string;
  deliveryDate: string;
  orderId: string;
}) => {
  const steps = ["Ordered", "Processing", "Shipped", "Delivered"];
  const normalizedStatus =
    status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  const currentStep =
    steps.indexOf(normalizedStatus) !== -1
      ? steps.indexOf(normalizedStatus)
      : 1;

  return (
    <div className="mt-4 bg-white p-0 rounded-xl border border-slate-200 shadow-sm w-full overflow-hidden">
      <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Package size={14} className="text-indigo-600" />
          <span className="text-xs font-bold text-slate-700">
            Order #{orderId}
          </span>
        </div>
        <span className="text-[10px] text-indigo-500 font-semibold cursor-pointer hover:underline">
          Track
        </span>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-center relative mb-6 px-2">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -z-10 rounded-full"></div>
          <div
            className="absolute top-1/2 left-0 h-1 bg-green-500 -z-10 rounded-full transition-all duration-500"
            style={{
              width: `${(currentStep / (steps.length - 1)) * 100}%`,
            }}></div>

          {steps.map((step, index) => {
            const isActive = index <= currentStep;
            const isCompleted = index < currentStep;

            return (
              <div
                key={step}
                className="flex flex-col items-center group relative">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all duration-300 z-10 ${
                    isActive
                      ? "bg-white border-green-500 text-green-600 scale-110 shadow-sm"
                      : "bg-slate-50 border-slate-200 text-slate-300"
                  }`}>
                  {isCompleted ? (
                    <Check size={14} strokeWidth={3} />
                  ) : index === currentStep ? (
                    <Clock size={14} />
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={`absolute -bottom-5 text-[9px] font-medium transition-colors ${
                    isActive ? "text-slate-700" : "text-slate-300"
                  }`}>
                  {step}
                </span>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 mt-2">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <Calendar size={10} />
              Ordered
            </div>
            <p className="text-xs font-semibold text-slate-700">{orderDate}</p>
          </div>
          <div className="flex flex-col gap-1 text-right items-end">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <Truck size={10} />
              Est. Delivery
            </div>
            <p
              className={`text-xs font-semibold ${
                normalizedStatus === "Delivered"
                  ? "text-green-600"
                  : "text-indigo-600"
              }`}>
              {deliveryDate}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderStepper;
