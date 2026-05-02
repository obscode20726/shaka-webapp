export default function FloatingActions() {
  return (
    <div className="fixed bottom-5 right-4 z-10 flex flex-col gap-3 sm:right-6">
      <button
        aria-label="notifications"
        className="h-11 w-11 rounded-full bg-[#ff6a00] text-xl text-white shadow-lg"
      >
        🔔
      </button>
      <button
        aria-label="help"
        className="h-11 w-11 rounded-full bg-[#2a73d9] text-xl text-white shadow-lg"
      >
        💬
      </button>
    </div>
  );
}
