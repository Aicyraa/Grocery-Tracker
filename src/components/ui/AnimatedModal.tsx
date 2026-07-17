import { useEffect, useState } from 'react'

interface AnimatedModalProps {
   isOpen: boolean
   onClose: () => void
   children: React.ReactNode
}

const TRANSITION_MS = 200

// Generic modal shell used for the Add Entry / Add Item / Add Category forms.
// Keeps the form mounted for TRANSITION_MS after close so the exit
// (fade + scale-down) animation can actually play before it disappears.
function AnimatedModal({ isOpen, onClose, children }: AnimatedModalProps) {
   const [shouldRender, setShouldRender] = useState(isOpen)
   const [isVisible, setIsVisible] = useState(false)

   useEffect(() => {
      if (isOpen) {
         setShouldRender(true)
         const frame = requestAnimationFrame(() => setIsVisible(true))
         return () => cancelAnimationFrame(frame)
      }

      setIsVisible(false)
      const timeout = setTimeout(() => setShouldRender(false), TRANSITION_MS)
      return () => clearTimeout(timeout)
   }, [isOpen])

   if (!shouldRender) return null

   return (
      <div
         className={`fixed inset-0 z-40 flex items-center justify-center bg-neutral-900/30 px-4 transition-opacity duration-200 ease-out ${
            isVisible ? 'opacity-100' : 'opacity-0'
         }`}
         onClick={onClose}
      >
         <div
            className={`w-full max-w-md transition-all duration-200 ease-out ${
               isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
            }`}
            onClick={e => e.stopPropagation()}
         >
            {children}
         </div>
      </div>
   )
}

export default AnimatedModal
