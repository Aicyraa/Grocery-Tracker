interface ModalProps {
   title: string
   message: string
   confirmLabel?: string
   cancelLabel?: string
   onConfirm: () => void
   onCancel: () => void
}

// Generic confirmation dialog. Used for anything destructive (deleting an
// entry, deleting an item) so a mis-click can't silently wipe data.
function Modal({
   title,
   message,
   confirmLabel = 'Confirm',
   cancelLabel = 'Cancel',
   onConfirm,
   onCancel,
}: ModalProps) {
   return (
      <div
         className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 px-4"
         onClick={onCancel}
      >
         <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
            onClick={e => e.stopPropagation()}
         >
            <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
            <p className="mt-2 text-sm text-neutral-600">{message}</p>
            <div className="mt-6 flex justify-end gap-3">
               <button
                  type="button"
                  onClick={onCancel}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-green-50"
               >
                  {cancelLabel}
               </button>
               <button
                  type="button"
                  onClick={onConfirm}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
               >
                  {confirmLabel}
               </button>
            </div>
         </div>
      </div>
   )
}

export default Modal
