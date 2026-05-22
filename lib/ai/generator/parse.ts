// lib/ai/generator/parse.ts
// Robust JSON parsing of an LLM response — strips code fences and surrounding
// prose, then JSON.parse. Throws on genuinely unparseable output so the caller
// can log it and continue (never abort a whole run for one bad lesson).

export function parseJson<T>(text: string): T {
  let s = text.trim()

  // Strip a ```json … ``` or ``` … ``` fence if present.
  const fence = s.match(/^```(?:json)?\s*\n?([\s\S]*?)\n?```\s*$/)
  if (fence) s = fence[1].trim()

  // If there is leading/trailing prose, extract the outermost { … } or [ … ].
  if (!s.startsWith('{') && !s.startsWith('[')) {
    const firstObj = s.indexOf('{')
    const firstArr = s.indexOf('[')
    const start =
      firstArr === -1 ? firstObj : firstObj === -1 ? firstArr : Math.min(firstObj, firstArr)
    const end = Math.max(s.lastIndexOf('}'), s.lastIndexOf(']'))
    if (start >= 0 && end > start) s = s.slice(start, end + 1)
  }

  return JSON.parse(s) as T
}
