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
  TRIGGER_WELCOME,
} from "@/constants/ai-result-intent";
import { fetchWithRetry } from "@/libs/utils/fetchWithRetry.util";

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

let ANALYTICS_LOG: { intent: string; term: string; timestamp: string }[] = [];

export async function POST(request: Request) {
  try {
    if (!API_KEY) {
      return NextResponse.json(
        { intent: "error", message: "Server Error: API Key missing." },
        { status: 500 }
      );
    }
    const { message } = await request.json();

    if (message === "GET_ANALYTICS") {
      return NextResponse.json({ analytics: ANALYTICS_LOG });
    }
    let data;
    try {
      data = await fetchWithRetry(
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
    } catch (apiError) {
      console.error("Gemini API completely failed after retries:", apiError);
      return NextResponse.json({
        intent: "error",
        message:
          "I'm having a little trouble connecting to my brain right now. Please try again in a moment! 🧠",
      });
    }

    const aiResult = JSON.parse(data.candidates[0].content.parts[0].text);

    const intent = aiResult.intent ? aiResult.intent.trim() : "unknown";
    const sentiment = aiResult.sentiment || "neutral";
    const reasoning = aiResult.reasoning || "";

    if (intent !== TRIGGER_WELCOME) {
      ANALYTICS_LOG.push({
        intent: intent,
        term:
          aiResult.entities.original_term ||
          aiResult.entities.category ||
          "N/A",
        timestamp: new Date().toISOString(),
      });
    }

    let botReply = "";
    let responseType = AIResType.TEXT;
    let responseData = null;

    let prefix = "";
    if (sentiment === "negative") {
      prefix =
        "I'm truly sorry to hear that you're upset. Let me help you sort this out immediately. ";
    }

    switch (aiResult.intent) {
      case TRIGGER_WELCOME:
        const vibes = [
          {
            cat: ProdCategory.ELECTRONICS,
            msg: "⚡ Power up your day! I've found some high-performance tech for you.",
          },
          {
            cat: ProdCategory.FITNESS,
            msg: "💪 Feeling energetic? Check out these essentials to crush your goals.",
          },
          {
            cat: ProdCategory.FOOTWEAR,
            msg: "👟 Step into comfort. Here are the top trending kicks right now.",
          },
        ];
        const randomVibe = vibes[Math.floor(Math.random() * vibes.length)];
        const welcomeMatches = PRODUCTS.filter(
          (p) => p.category === randomVibe.cat
        ).slice(0, 2);

        botReply = `Welcome back! ${randomVibe.msg}`;
        responseType = AIResType.PRODUCT_LIST;
        responseData = welcomeMatches as unknown as Product[];
        break;
      case CHECK_ORDER:
        let id = aiResult.entities.order_id;
        if (id === "null" || id === "undefined") {
          id = null;
        }

        if (id) {
          const order = ORDERS.find((o) =>
            o.orderId.toLowerCase().includes(id.toLowerCase())
          );
          if (order) {
            botReply = `${prefix}I found your order details. Here is the current status:`;
            responseType = AIResType.ORDER_STATUS;
            responseData = order;
          } else {
            botReply = `${prefix}I looked for order "${id}" but couldn't find it. Please double-check the ID.`;
          }
        } else {
          botReply = `${prefix}I can check that for you. What is your Order ID?`;
        }
        break;

      case LIST_ORDERS:
        const currentUserId = "USER-001";
        const userOrders = ORDERS.filter((o) => o.customerId === currentUserId);

        if (userOrders.length > 0) {
          botReply = `${prefix}I found ${userOrders.length} recent orders in your history:`;
          responseType = AIResType.ORDER_LIST;
          responseData = userOrders;
        } else {
          botReply = `${prefix}I couldn't find any past orders for your account.`;
        }
        break;

      case LIST_CATEGORIES:
        botReply = `${prefix}We have a great selection! Here are our available categories:`;
        responseType = AIResType.CATEGORY_LIST;
        const uniqueCategories = Array.from(
          new Set(PRODUCTS.map((p) => p.category))
        );
        responseData = uniqueCategories;
        break;

      case RETURN:
        botReply = `${prefix}We want you to be happy with your purchase. Here are the details of our policy:`;
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
          botReply = `${prefix}Here are our top picks for ${
            category || searchTerm
          }. ${reasoning}`;
          responseType = AIResType.PRODUCT_LIST;
          responseData = matches;
        } else {
          botReply = `${prefix}I couldn't narrow it down to a specific category, but here are our Best Sellers that everyone loves:`;
          responseType = AIResType.PRODUCT_LIST;
          responseData = PRODUCTS.slice(0, 3);
        }
        break;

      case GREETING:
        botReply = `${prefix}Hi there! I'm Nova. I can help you find products (like 'gadgets' or 'sneakers') or check your order status.`;
        break;

      default:
        console.log("Unmatched Intent:", aiResult.intent);
        botReply = `${prefix}I'm not sure I understand. Try asking for 'electronics', 'running shoes', or 'return policy'.`;
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
