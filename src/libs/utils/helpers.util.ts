import { ChatCompletionMessageParam } from "openai/resources";

const normalizeId = (id: string) => {
  if (!id) return "";
  return id.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
};

function extractJsonFromModelOutput(raw: any): any {
  if (!raw) return null;
  if (typeof raw === "object") return raw;
  if (typeof raw !== "string") return null;
  let s = raw.trim();
  const fencedMatch = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fencedMatch && fencedMatch[1]) {
    s = fencedMatch[1].trim();
  }
  const firstBrace = s.indexOf("{");
  const lastBrace = s.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const candidate = s.slice(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(candidate);
    } catch (e) {}
  }
  try {
    if (s.startsWith("{") || s.startsWith("[")) {
      return JSON.parse(s);
    }
  } catch (e) {}
  return { intent: "unknown", sentiment: "neutral", reasoning: "", reply: raw };
}

function buildOpenRouterMessages(
  systemPrompt: string,
  payload: any
): ChatCompletionMessageParam[] {
  const contents: any[] = [];
  if (payload.text) {
    contents.push({ type: "text", text: payload.text });
  }
  if (Array.isArray(payload.images)) {
    for (const url of payload.images) {
      if (typeof url === "string" && url.length > 0) {
        contents.push({ type: "image_url", image_url: { url } });
      }
    }
  }
  if (Array.isArray(payload.videos)) {
    for (const url of payload.videos) {
      if (typeof url === "string" && url.length > 0) {
        contents.push({ type: "video_url", video_url: { url } });
      }
    }
  }
  if (payload.audio) {
    if (payload.audio.url) {
      contents.push({
        type: "input_audio",
        input_audio: { uri: payload.audio.url },
      });
    } else if (payload.audio.base64) {
      contents.push({
        type: "input_audio",
        input_audio: {
          data: payload.audio.base64,
          format: payload.audio.format || "wav",
        },
      });
    }
  }
  const messages: ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    {
      role: "user",
      content:
        contents.length === 1 ? contents[0].text || contents[0] : contents,
    },
  ];
  return messages;
}

export { normalizeId, extractJsonFromModelOutput, buildOpenRouterMessages };
