import { NextResponse } from "next/server";
import OpenAI from "openai";

// Importing the Mock Database (JSON files) directly
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
import {
  buildOpenRouterMessages,
  extractJsonFromModelOutput,
  normalizeId,
} from "@/libs/utils/helpers.util";

// --- CONFIGURATION ---
const OPENROUTER_API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
const GOOGLE_GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

// Initialize the OpenAI client
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL ?? "",
    "X-Title": process.env.NEXT_PUBLIC_SITE_TITLE ?? "",
  },
});

let ANALYTICS_LOG: { intent: string; term: string; timestamp: string }[] = [];

export async function POST(request: Request) {
  try {
    if (!OPENROUTER_API_KEY && !GOOGLE_GEMINI_API_KEY) {
      return NextResponse.json(
        {
          intent: "error",
          message:
            "Server Error: No API key configured for OpenRouter or Google Gemini.",
        },
        { status: 500 }
      );
    }

    // Parse the User's Input
    const payload = await request.json();
    const userText = payload.message || payload.text || "";
    const multimodal = {
      text: userText,
      images: payload.images || payload.image_urls || [],
      videos: payload.videos || payload.video_urls || [],
      audio: payload.audio || null,
    };

    if (userText === "GET_ANALYTICS") {
      return NextResponse.json({ analytics: ANALYTICS_LOG });
    }

    const messages = buildOpenRouterMessages(SYSTEM_PROMPT, multimodal);

    let rawContent: any = "";
    let usedProvider = "openrouter";

    // Try OpenRouter (Primary Provider)
    if (OPENROUTER_API_KEY) {
      try {
        const completion = await openai.chat.completions.create({
          model: "google/gemini-2.0-flash-lite-001",
          messages,
          temperature: 0.0,
          max_tokens: 800,
        });
        rawContent = completion?.choices?.[0]?.message?.content ?? "";
      } catch (openErr) {
        console.error("OpenRouter error:", openErr);
        usedProvider = "openrouter_failed";
      }
    }

    // Fallback to Google Gemini Direct API if Attempt 1 failed
    if ((!rawContent || rawContent === "") && GOOGLE_GEMINI_API_KEY) {
      try {
        const googlePayload = {
          contents: [{ parts: [{ text: userText }] }],
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          generationConfig: { responseMimeType: "application/json" },
        };
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${GOOGLE_GEMINI_API_KEY}`;
        const data = await fetchWithRetry(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(googlePayload),
        });
        rawContent = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
        usedProvider = "google_gemini";
      } catch (googleErr) {
        console.error("Google Gemini fallback error:", googleErr);
      }
    }

    if (!rawContent || rawContent === "") {
      return NextResponse.json(
        { intent: "error", message: "All language providers failed." },
        { status: 502 }
      );
    }

    // Extract the structured JSON from the model's output
    let aiResult: any = {};
    try {
      aiResult = extractJsonFromModelOutput(rawContent) || {
        intent: "unknown",
        sentiment: "neutral",
        reasoning: "",
        reply: rawContent,
      };
    } catch (e) {
      aiResult = {
        intent: "unknown",
        sentiment: "neutral",
        reasoning: "",
        reply: rawContent,
      };
    }

    // Clean up extraction results
    const intent = aiResult.intent
      ? aiResult.intent.trim()
      : aiResult.intent || "unknown";
    const sentiment = aiResult.sentiment || "neutral";
    const reasoning = aiResult.reasoning || "";

    if (intent !== TRIGGER_WELCOME) {
      ANALYTICS_LOG.push({
        intent: intent,
        term:
          aiResult?.entities?.original_term ||
          aiResult?.entities?.category ||
          "N/A",
        timestamp: new Date().toISOString(),
      });
    }

    // Generate Bot Response based on Intent
    let botReply = "";
    let responseType = AIResType.TEXT;
    let responseData: any = null;
    let prefix = "";
    if (sentiment === "negative") {
      prefix =
        "I'm truly sorry to hear that you're upset. Let me help you sort this out immediately. ";
    }

    switch (intent) {
      case TRIGGER_WELCOME: {
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
          (p: any) => p.category === randomVibe.cat
        ).slice(0, 2);
        botReply = `Welcome back! ${randomVibe.msg}`;
        responseType = AIResType.PRODUCT_LIST;
        responseData = welcomeMatches as unknown as Product[];
        break;
      }

      case CHECK_ORDER: {
        const currentUserId =
          (payload && payload.userId) ||
          aiResult?.entities?.customer_id ||
          "USER-001";

        let id = aiResult?.entities?.order_id;
        if (id === "null" || id === "undefined") id = null;

        if (id) {
          const normalizedInputId = normalizeId(id);
          const order = ORDERS.find((o: any) =>
            normalizeId(o.orderId).includes(normalizedInputId)
          );

          if (order) {
            botReply = `${prefix}I found your order details. Here is the current status:`;
            responseType = AIResType.ORDER_STATUS;
            responseData = order;
          } else {
            const userOrders = ORDERS.filter(
              (o: any) => o.customerId === currentUserId
            );

            if (userOrders.length > 0) {
              botReply = `${prefix}I couldn't find specific order. Here are your recent orders:`;
              responseType = AIResType.ORDER_LIST;
              responseData = userOrders;
            } else {
              botReply = `${prefix}I couldn't find order "${id}". Please check the ID.`;
            }
          }
        } else {
          const userOrders = ORDERS.filter(
            (o: any) => o.customerId === currentUserId
          );

          if (userOrders.length > 0) {
            botReply = `${prefix}Here are your recent orders:`;
            responseType = AIResType.ORDER_LIST;
            responseData = userOrders;
          } else {
            botReply = `${prefix}I can check your order. What is your Order ID?`;
          }
        }
        break;
      }

      case LIST_ORDERS: {
        const currentUserId = "USER-001";
        const userOrders = ORDERS.filter(
          (o: any) => o.customerId === currentUserId
        );
        if (userOrders.length > 0) {
          botReply = `${prefix}I found ${userOrders.length} recent orders in your history:`;
          responseType = AIResType.ORDER_LIST;
          responseData = userOrders;
        } else {
          botReply = `${prefix}I couldn't find any past orders for your account.`;
        }
        break;
      }

      case LIST_CATEGORIES: {
        botReply = `${prefix}We have a great selection! Here are our available categories:`;
        responseType = AIResType.CATEGORY_LIST;
        const uniqueCategories = Array.from(
          new Set(PRODUCTS.map((p: any) => p.category))
        );
        responseData = uniqueCategories;
        break;
      }

      case RETURN: {
        botReply = `${prefix}We want you to be happy with your purchase. Here are the details of our policy:`;
        responseType = AIResType.RETURN_POLICY;
        break;
      }

      case RECOMMEND_PRODUCT: {
        const category = aiResult?.entities?.category?.toLowerCase();
        const searchTerm = aiResult?.entities?.original_term?.toLowerCase();
        let matches: Product[] = [];
        if (category && category !== "null") {
          const matched = PRODUCTS.filter(
            (p: any) => (p.category || "").toLowerCase() === category
          ).map((p: any) => ({ ...p, category: p.category as ProdCategory }));
          matches = matched as Product[];
        }
        if (matches.length === 0 && searchTerm) {
          const matchedByText = PRODUCTS.filter(
            (p: any) =>
              (p.name || "").toLowerCase().includes(searchTerm) ||
              (p.description || "").toLowerCase().includes(searchTerm)
          ).map((p: any) => ({ ...p, category: p.category as ProdCategory }));
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
      }

      case GREETING: {
        botReply = `${prefix}Hi there! I'm Nova. I can help you find products (like 'gadgets' or 'sneakers') or check your order status.`;
        break;
      }

      default: {
        console.log("Unmatched Intent:", intent, "raw:", aiResult);
        const fallbackReply =
          aiResult?.reply || aiResult?.message || rawContent || "";
        botReply = `${prefix}I'm not sure I understand. Try asking for 'electronics', 'running shoes', or 'return policy'. ${fallbackReply}`;
      }
    }

    const meta = {
      provider: usedProvider,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json({
      intent,
      message: botReply,
      type: responseType,
      data: responseData,
      meta,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { intent: "error", message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
