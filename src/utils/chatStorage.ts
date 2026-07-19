const KEY = 'Storage-Chat-History'

export interface ChatMessage {
   id: number
   role: 'user' | 'assistant'
   text: string
}

export function loadChatHistory(fallback: ChatMessage[]): ChatMessage[] {
   const raw = localStorage.getItem(KEY)
   if (!raw) return fallback
   try {
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) && parsed.length ? parsed : fallback
   } catch {
      return fallback
   }
}

export function saveChatHistory(messages: ChatMessage[]): void {
   localStorage.setItem(KEY, JSON.stringify(messages))
}
