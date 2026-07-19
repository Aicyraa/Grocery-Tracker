const KEY = 'Storage-Gemini-Api-Key'

export function loadGeminiKey(): string | null {
   return localStorage.getItem(KEY)
}

export function saveGeminiKey(key: string): void {
   localStorage.setItem(KEY, key.trim())
}

export function clearGeminiKey(): void {
   localStorage.removeItem(KEY)
}
