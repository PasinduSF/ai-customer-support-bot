import { NextResponse } from "next/server";
import ORDERS from "../../../jsons/orders.json";
import PRODUCTS from "../../../jsons/products.json";
import { Product } from "@/types/products.types";
import { ProdCategory } from "@/enums/product-category.enum";
import { AIResType } from "@/enums/ai-res-type.enum";
import { SYSTEM_PROMPT } from "@/constants/systemPrompt";
import {
  CHECK_ORDER,
  GREETING,
  LIST_CATEGORIES,
  LIST_ORDERS,
  RECOMMEND_PRODUCT,
  RETURN,
} from "@/constants/ai-result-intent";

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

export async function POST(request: Request) {
  try {
    if (!API_KEY) {
      return NextResponse.json(
        { intent: "error", message: "Server Error: API Key missing." },
        { status: 500 }
      );
    }
    const { message } = await request.json();
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: message }] }],
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          generationConfig: { responseMimeType: "application/json" },
        }),
      }
    );
    const data = await response.json();
    if (!data.candidates || !data.candidates[0]) {
      return NextResponse.json({
        intent: "error",
        message: "AI Service unavailable.",
      });
    }

    const aiResult = JSON.parse(data.candidates[0].content.parts[0].text);

    let botReply = "";
    let responseType = AIResType.TEXT;
    let responseData = null;

    switch (aiResult.intent) {
      case CHECK_ORDER:
        const id = aiResult.entities.order_id;
        if (id) {
          const order = ORDERS.find((o) =>
            o.orderId.toLowerCase().includes(id.toLowerCase())
          );
          if (order) {
            botReply =
              "I found your order details. Here is the current status:";
            responseType = AIResType.ORDER_STATUS;
            responseData = order;
          } else {
            botReply = `I looked for order "${id}" but couldn't find it. Please double-check the ID.`;
          }
        } else {
          botReply = "I can check that for you. What is your Order ID?";
        }
        break;

      case LIST_ORDERS:
        const currentUserId = "USER-001";
        const userOrders = ORDERS.filter((o) => o.customerId === currentUserId);

        if (userOrders.length > 0) {
          botReply = `I found ${userOrders.length} recent orders in your history:`;
          responseType = AIResType.ORDER_LIST;
          responseData = userOrders;
        } else {
          botReply = "I couldn't find any past orders for your account.";
        }
        break;

      case LIST_CATEGORIES:
        botReply =
          "We have a great selection! Here are our available categories:";
        responseType = AIResType.CATEGORY_LIST;
        const uniqueCategories = Array.from(
          new Set(PRODUCTS.map((p) => p.category))
        );
        responseData = uniqueCategories;
        break;

      case RETURN:
        botReply =
          "We want you to be happy with your purchase. Here are the details of our policy:";
        responseType = AIResType.RETURN_POLICY;
        break;

      case RECOMMEND_PRODUCT:
        const category = aiResult.entities.category?.toLowerCase();
        const searchTerm = aiResult.entities.original_term?.toLowerCase();

        let matches: Product[] = [];

        if (category && category !== "null") {
          const matched = PRODUCTS.filter(
            (p) => (p.category || "").toLowerCase() === category
          ).map((p) => ({ ...p, category: p.category as ProdCategory }));
          matches = matched as Product[];
        }

        if (matches.length === 0 && searchTerm) {
          const matchedByText = PRODUCTS.filter(
            (p) =>
              (p.name || "").toLowerCase().includes(searchTerm) ||
              (p.description || "").toLowerCase().includes(searchTerm)
          ).map((p) => ({ ...p, category: p.category as ProdCategory }));
          matches = matchedByText as Product[];
        }

        if (matches.length > 0) {
          botReply = `Here are our top picks for ${category || searchTerm}:`;
          responseType = AIResType.PRODUCT_LIST;
          responseData = matches;
        } else {
          botReply =
            "I couldn't narrow it down to a specific category, but here are our Best Sellers that everyone loves:";
          responseType = AIResType.PRODUCT_LIST;
          responseData = PRODUCTS.slice(0, 3);
        }
        break;

      case GREETING:
        botReply =
          "Hi there! I'm Nova. I can help you find products (like 'gadgets' or 'sneakers') or check your order status.";
        break;

      default:
        console.log("Unmatched Intent:", aiResult.intent);
        botReply =
          "I'm not sure I understand. Try asking for 'electronics', 'running shoes', or 'return policy'.";
    }

    return NextResponse.json({
      intent: aiResult.intent,
      message: botReply,
      type: responseType,
      data: responseData,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { intent: "error", message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
