import { AIResType } from "@/enums/ai-res-type.enum";
import { Sender } from "@/enums/sender.enum";

type Message = {
  id: number;
  sender: Sender;
  text: string;
  type?: AIResType;
  data?: any;
};
export type { Message };
