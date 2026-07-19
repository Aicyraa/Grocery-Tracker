import { useEffect, useRef, useState } from 'react'
import type React from 'react'
import { MessageCircle, X, Send, Eraser, KeyRound } from 'lucide-react'
import { loadSavedEntries } from '../../utils/storage'
import { loadCategories } from '../../utils/categories.util'
import { buildDataSnapshot, streamGeminiReply, type GeminiMessage } from '../../utils/gemini.util'
import { loadGeminiKey, saveGeminiKey, clearGeminiKey } from '../../utils/geminiKey'
import { loadChatHistory, saveChatHistory, type ChatMessage } from '../../utils/chatStorage'

const WELCOME_MESSAGE: ChatMessage = {
   id: 0,
   role: 'assistant',
   text: "Hi! Ask me anything about your grocery spending, or just chat — I can see your entries, items, and categories.",
}

const POSITION_KEY = 'Storage-Chat-Button-Position'
const BUTTON_SIZE = 56
const DRAG_THRESHOLD = 5
// Extra breathing room from screen edges — helps keep the button clear of
// notches, rounded corners, and gesture-nav bars on phones. Not true
// env(safe-area-inset-*) support (that needs a CSS-based approach rather
// than JS-computed pixel positions), but a reasonable practical buffer.
const EDGE_MARGIN = 16

function clamp(value: number, min: number, max: number) {
   return Math.min(Math.max(value, min), max)
}

function loadPosition(): { x: number; y: number } {
   const fallback = {
      x: window.innerWidth - BUTTON_SIZE - 16,
      y: window.innerHeight - BUTTON_SIZE - 160,
   }
   let candidate = fallback
   try {
      const raw = localStorage.getItem(POSITION_KEY)
      if (raw) {
         const parsed = JSON.parse(raw)
         if (typeof parsed.x === 'number' && typeof parsed.y === 'number') candidate = parsed
      }
   } catch {
      candidate = fallback
   }

   // A position saved on a bigger screen (desktop, or landscape) can land
   // fully off-screen on a smaller one (a phone, or after rotating) —
   // always clamp against the *current* viewport before ever using it.
   return {
      x: clamp(candidate.x, EDGE_MARGIN, window.innerWidth - BUTTON_SIZE - EDGE_MARGIN),
      y: clamp(candidate.y, EDGE_MARGIN, window.innerHeight - BUTTON_SIZE - EDGE_MARGIN),
   }
}

function ChatBot() {
   const [isOpen, setIsOpen] = useState(false)
   const [messages, setMessages] = useState<ChatMessage[]>(() => loadChatHistory([WELCOME_MESSAGE]))
   const [input, setInput] = useState('')
   const [isThinking, setIsThinking] = useState(false)
   const [apiKey, setApiKey] = useState(() => loadGeminiKey())
   const [keyInput, setKeyInput] = useState('')
   const [position, setPosition] = useState(loadPosition)

   const messagesEndRef = useRef<HTMLDivElement>(null)
   const dragStart = useRef<{ x: number; y: number } | null>(null)
   const dragOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
   const hasMoved = useRef(false)

   useEffect(() => {
      saveChatHistory(messages)
   }, [messages])

   useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
   }, [messages, isOpen])

   // Rotating the phone (or resizing any window) changes the viewport —
   // re-clamp so the button never ends up stranded off-screen mid-session.
   useEffect(() => {
      function handleResize() {
         setPosition(prev => {
            const next = {
               x: clamp(prev.x, EDGE_MARGIN, window.innerWidth - BUTTON_SIZE - EDGE_MARGIN),
               y: clamp(prev.y, EDGE_MARGIN, window.innerHeight - BUTTON_SIZE - EDGE_MARGIN),
            }
            localStorage.setItem(POSITION_KEY, JSON.stringify(next))
            return next
         })
      }
      window.addEventListener('resize', handleResize)
      window.addEventListener('orientationchange', handleResize)
      return () => {
         window.removeEventListener('resize', handleResize)
         window.removeEventListener('orientationchange', handleResize)
      }
   }, [])

   function handlePointerDown(e: React.PointerEvent<HTMLButtonElement>) {
      dragStart.current = { x: e.clientX, y: e.clientY }
      dragOffset.current = { x: e.clientX - position.x, y: e.clientY - position.y }
      hasMoved.current = false
      e.currentTarget.setPointerCapture(e.pointerId)
   }

   function handlePointerMove(e: React.PointerEvent<HTMLButtonElement>) {
      if (!dragStart.current) return
      const dx = e.clientX - dragStart.current.x
      const dy = e.clientY - dragStart.current.y
      if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
         hasMoved.current = true
      }
      if (hasMoved.current) {
         const nextX = clamp(e.clientX - dragOffset.current.x, EDGE_MARGIN, window.innerWidth - BUTTON_SIZE - EDGE_MARGIN)
         const nextY = clamp(e.clientY - dragOffset.current.y, EDGE_MARGIN, window.innerHeight - BUTTON_SIZE - EDGE_MARGIN)
         setPosition({ x: nextX, y: nextY })
      }
   }

   function handlePointerUp() {
      if (!hasMoved.current) {
         setIsOpen(prev => !prev)
      } else {
         localStorage.setItem(POSITION_KEY, JSON.stringify(position))
      }
      dragStart.current = null
   }

   function handleSaveKey() {
      const trimmed = keyInput.trim()
      if (!trimmed) return
      saveGeminiKey(trimmed)
      setApiKey(trimmed)
      setKeyInput('')
   }

   function handleChangeKey() {
      clearGeminiKey()
      setApiKey(null)
   }

   function handleClearChat() {
      setMessages([WELCOME_MESSAGE])
   }

   async function handleSend() {
      const question = input.trim()
      if (!question || isThinking || !apiKey) return

      const userMessage: ChatMessage = { id: Date.now(), role: 'user', text: question }
      const assistantId = Date.now() + 1
      const nextMessages = [...messages, userMessage, { id: assistantId, role: 'assistant' as const, text: '' }]
      setMessages(nextMessages)
      setInput('')
      setIsThinking(true)

      const entries = loadSavedEntries()
      const categories = loadCategories()
      const dataSnapshot = buildDataSnapshot(entries, categories)

      const systemInstruction =
         'You are a friendly assistant inside a personal grocery budgeting app. ' +
         'Answer questions naturally and conversationally, like a helpful human would. ' +
         "You have access to the user's actual grocery data below as JSON — use it to answer accurately, " +
         'and never invent numbers that are not derivable from this data. ' +
         'If the question is unrelated to groceries/budgeting (e.g. a greeting or small talk), just respond warmly.\n\n' +
         `User's data:\n${dataSnapshot}`

      // Gemini's roles are 'user' / 'model' rather than 'user' / 'assistant'.
      const history: GeminiMessage[] = nextMessages
         .filter(m => m.id !== assistantId)
         .map(m => ({ role: m.role === 'user' ? 'user' : 'model', text: m.text }))

      function updateAssistantText(updater: (prev: string) => string) {
         setMessages(prev => prev.map(m => (m.id === assistantId ? { ...m, text: updater(m.text) } : m)))
      }

      try {
         await streamGeminiReply(apiKey, systemInstruction, history, chunk =>
            updateAssistantText(prev => prev + chunk),
         )
      } catch (error) {
         const message = error instanceof Error ? error.message : 'Something went wrong.'
         updateAssistantText(
            () => `I couldn't reach Gemini (${message}). Double-check your API key is correct and try again.`,
         )
      }

      setIsThinking(false)
   }

   const buttonStyle: React.CSSProperties = {
      position: 'fixed',
      left: position.x,
      top: position.y,
      touchAction: 'none',
   }

   const panelWidth = 320
   const panelHeight = 384
   const panelLeft = clamp(position.x - panelWidth + BUTTON_SIZE, EDGE_MARGIN, window.innerWidth - panelWidth - EDGE_MARGIN)
   const panelTop =
      position.y - panelHeight - 12 > 8 ? position.y - panelHeight - 12 : position.y + BUTTON_SIZE + 12

   return (
      <>
         <button
            type="button"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            aria-label="Open grocery assistant"
            style={buttonStyle}
            className="z-40 flex h-14 w-14 cursor-grab items-center justify-center rounded-full bg-green-700 text-white shadow-lg hover:bg-green-800 active:cursor-grabbing"
         >
            {isOpen ? <X size={22} /> : <MessageCircle size={22} />}
         </button>

         {isOpen && (
            <div
               style={{ position: 'fixed', left: panelLeft, top: panelTop, width: panelWidth, height: panelHeight }}
               className="z-40 flex flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
            >
               <div className="flex items-center justify-between border-b border-green-100 bg-green-700 px-4 py-3">
                  <h4 className="text-sm font-semibold text-white">Grocery Assistant</h4>
                  {apiKey && (
                     <div className="flex items-center gap-1">
                        <button
                           type="button"
                           onClick={handleClearChat}
                           aria-label="Clear chat"
                           className="rounded-md p-1.5 text-white/80 hover:bg-white/10 hover:text-white"
                        >
                           <Eraser size={15} />
                        </button>
                        <button
                           type="button"
                           onClick={handleChangeKey}
                           aria-label="Change API key"
                           className="rounded-md p-1.5 text-white/80 hover:bg-white/10 hover:text-white"
                        >
                           <KeyRound size={15} />
                        </button>
                     </div>
                  )}
               </div>

               {!apiKey ? (
                  <div className="flex flex-1 flex-col justify-center gap-3 p-6">
                     <p className="text-sm text-neutral-600">
                        Enter your free Gemini API key to enable the assistant. It's stored only
                        in your browser and sent directly to Google — never through any server of
                        ours.
                     </p>
                     <a
                        href="https://aistudio.google.com/apikey"
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-medium text-green-700 underline"
                     >
                        Get a free key at Google AI Studio →
                     </a>
                     <input
                        value={keyInput}
                        onChange={e => setKeyInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSaveKey()}
                        placeholder="Paste your API key"
                        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-green-600 focus:outline-none"
                     />
                     <button
                        type="button"
                        onClick={handleSaveKey}
                        className="w-full rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800"
                     >
                        Save Key
                     </button>
                  </div>
               ) : (
                  <>
                     <div className="flex-1 space-y-2 overflow-y-auto px-3 py-3">
                        {messages.map(message => (
                           <div
                              key={message.id}
                              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                           >
                              <p
                                 className={`max-w-[85%] whitespace-pre-wrap rounded-xl px-3 py-2 text-sm ${
                                    message.role === 'user'
                                       ? 'bg-green-700 text-white'
                                       : 'bg-green-50 text-neutral-700'
                                 }`}
                              >
                                 {message.text || (isThinking ? '…' : '')}
                              </p>
                           </div>
                        ))}
                        <div ref={messagesEndRef} />
                     </div>

                     <div className="flex items-center gap-2 border-t border-green-100 p-2">
                        <input
                           value={input}
                           onChange={e => setInput(e.target.value)}
                           onKeyDown={e => e.key === 'Enter' && handleSend()}
                           placeholder="Ask about your spending..."
                           className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-green-600 focus:outline-none"
                        />
                        <button
                           type="button"
                           onClick={handleSend}
                           disabled={isThinking}
                           aria-label="Send"
                           className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-700 text-white hover:bg-green-800 disabled:opacity-50"
                        >
                           <Send size={16} />
                        </button>
                     </div>
                  </>
               )}
            </div>
         )}
      </>
   )
}

export default ChatBot
