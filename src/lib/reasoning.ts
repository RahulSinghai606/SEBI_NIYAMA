// Server-side client for the NIYAMA Reasoning Layer.
// Talks to an Azure AI Foundry Responses API endpoint. The key never leaves the server.

const ENDPOINT = process.env.AZURE_AI_ENDPOINT ?? "";
const KEY = process.env.AZURE_AI_KEY ?? "";
const DEPLOYMENT = process.env.AZURE_AI_DEPLOYMENT ?? "";

type ResponsesOutput = {
  output?: { type: string; content?: { type: string; text?: string }[] }[];
  output_text?: string;
};

export async function reason(input: { system: string; user: string; maxTokens?: number }): Promise<string | null> {
  if (!ENDPOINT || !KEY || !DEPLOYMENT) return null;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 50_000);
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", "api-key": KEY },
      body: JSON.stringify({
        model: DEPLOYMENT,
        instructions: input.system,
        input: input.user,
        max_output_tokens: input.maxTokens ?? 2200,
      }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) {
      console.error("Reasoning layer HTTP", res.status, await res.text().catch(() => ""));
      return null;
    }
    const data = (await res.json()) as ResponsesOutput;
    if (typeof data.output_text === "string" && data.output_text.length > 0) return data.output_text;
    const msg = data.output?.find((o) => o.type === "message");
    const text = msg?.content?.find((c) => c.type === "output_text")?.text;
    return text ?? null;
  } catch (e) {
    console.error("Reasoning layer error", e);
    return null;
  }
}

export function extractJson<T>(raw: string): T | null {
  const start = raw.indexOf("{");
  if (start === -1) return null;
  const body = raw.slice(start);
  // 1) clean parse
  try {
    return JSON.parse(body.slice(0, body.lastIndexOf("}") + 1)) as T;
  } catch {
    /* fall through to repair */
  }
  // 2) repair a TRUNCATED response (LLM hit the token cap mid-array): drop the
  //    trailing incomplete element and close every open string / bracket.
  try {
    return JSON.parse(repairTruncatedJson(body)) as T;
  } catch {
    return null;
  }
}

function repairTruncatedJson(s: string): string {
  const stack: string[] = [];
  let inStr = false;
  let esc = false;
  let lastSafe = -1; // index just after a completed array element or object member
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (inStr) {
      if (esc) esc = false;
      else if (c === "\\") esc = true;
      else if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') { inStr = true; continue; }
    if (c === "{" || c === "[") stack.push(c);
    else if (c === "}" || c === "]") stack.pop();
    // a comma or a closing bracket at any depth marks a point we can safely cut back to
    if (c === "," || c === "}" || c === "]") lastSafe = i;
  }
  // trim any half-written trailing token back to the last completed element,
  // then re-scan to know which brackets remain open.
  let out = lastSafe >= 0 ? s.slice(0, lastSafe + 1).replace(/,\s*$/, "") : s;
  const open: string[] = [];
  let str = false, e2 = false;
  for (let i = 0; i < out.length; i++) {
    const c = out[i];
    if (str) { if (e2) e2 = false; else if (c === "\\") e2 = true; else if (c === '"') str = false; continue; }
    if (c === '"') str = true;
    else if (c === "{" || c === "[") open.push(c);
    else if (c === "}" || c === "]") open.pop();
  }
  for (let i = open.length - 1; i >= 0; i--) out += open[i] === "{" ? "}" : "]";
  return out;
}
