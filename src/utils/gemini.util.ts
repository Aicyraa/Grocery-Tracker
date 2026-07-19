import { type GroceryEntries, type Category } from '../types'

// Kept intentionally close to the raw data (rather than pre-computing
// stats) since Gemini is capable enough to reason over it directly —
// that's what lets it answer open-ended, naturally-phrased questions
// instead of needing a hand-written pattern for every possible question.
export function buildDataSnapshot(entries: GroceryEntries[], categories: Category[]): string {
   const compactEntries = entries.map(entry => ({
      label: entry.label,
      date: entry.date,
      budget: entry.budget,
      expenses: entry.expenses,
      remaining: entry.remaining_balance,
      items: entry.items.map(item => ({
         name: item.name,
         price: item.price,
         quantity: item.quantity ?? 1,
         category: item.category,
         bought: item.isChecked,
      })),
   }))

   return JSON.stringify({
      categories: categories.map(category => category.name),
      entries: compactEntries,
   })
}

export interface GeminiMessage {
   role: 'user' | 'model'
   text: string
}

// Using the "latest" alias rather than a pinned version (e.g. gemini-2.5-flash)
// since Google has been retiring specific model versions faster than their
// published deprecation dates — this alias auto-points to whatever their
// current stable Flash model is, so it keeps working without code changes.
const MODEL = 'gemini-flash-latest'
const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'

// Streams the reply token-by-token via onChunk, and resolves with the full
// assembled text once generation ends.
export async function streamGeminiReply(
   apiKey: string,
   systemInstruction: string,
   history: GeminiMessage[],
   onChunk: (chunk: string) => void,
): Promise<string> {
   const url = `${API_BASE}/${MODEL}:streamGenerateContent?alt=sse`

   const body = {
      systemInstruction: { parts: [{ text: systemInstruction }] },
      contents: history.map(message => ({
         role: message.role,
         parts: [{ text: message.text }],
      })),
   }

   const response = await fetch(url, {
      method: 'POST',
      headers: {
         'Content-Type': 'application/json',
         'x-goog-api-key': apiKey,
      },
      body: JSON.stringify(body),
   })

   if (!response.ok || !response.body) {
      const errorText = await response.text().catch(() => '')
      throw new Error(`Gemini API error (${response.status}): ${errorText || response.statusText}`)
   }

   const reader = response.body.getReader()
   const decoder = new TextDecoder()
   let buffer = ''
   let fullText = ''

   while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })

      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
         const trimmed = line.trim()
         if (!trimmed.startsWith('data:')) continue
         const jsonStr = trimmed.slice(5).trim()
         if (!jsonStr || jsonStr === '[DONE]') continue
         try {
            const parsed = JSON.parse(jsonStr)
            const textPart = parsed?.candidates?.[0]?.content?.parts?.[0]?.text
            if (typeof textPart === 'string') {
               fullText += textPart
               onChunk(textPart)
            }
         } catch {
            // Ignore partial/malformed SSE chunks — the buffer above
            // handles reassembling lines split across reads.
         }
      }
   }

   return fullText.trim()
}
