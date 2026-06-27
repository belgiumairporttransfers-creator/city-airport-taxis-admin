const TypingIndicator = () => (
  <div className="mb-2 flex items-start px-0 md:px-6">
    <div className="rounded-md bg-default-200 px-3 py-2.5 shadow-sm">
      <span className="flex items-center gap-1" aria-label="Typing">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-default-500 [animation-delay:-0.3s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-default-500 [animation-delay:-0.15s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-default-500" />
      </span>
    </div>
  </div>
);

export default TypingIndicator;
