import { OrderStatus } from "@/enums/order.status";

type Order = {
  orderId: string;
  customerId: string;
  status: OrderStatus;
  items: string[];
  orderDate: string;
  deliveryEst: string;
};

export type { Order };
