export interface ToastMessage {
  id: number;
  text: string;
}

/** Pesan singkat di bawah layar. Wilayah live selalu ada agar pembaca layar mengumumkan isinya. */
export function Toast({ message }: { message: ToastMessage | null }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-[calc(5.25rem+env(safe-area-inset-bottom))] z-50 flex justify-center px-4 md:bottom-8"
    >
      {message && (
        <div
          key={message.id}
          className="toast-in rounded-full bg-field px-4 py-2.5 text-sm font-semibold text-on-field shadow-lg"
        >
          {message.text}
        </div>
      )}
    </div>
  );
}
