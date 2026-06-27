"use client";

import { useEffect, useRef } from "react";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

const HIDE_PREVIEW_SHORTCODE_STYLE =
  "#preview .preview-subtitle { display: none !important; }";

type ChatEmojiPickerProps = {
  onEmojiSelect: (emoji: { native: string }) => void;
};

const ChatEmojiPicker = ({ onEmojiSelect }: ChatEmojiPickerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const injectStyle = () => {
      const picker = container.querySelector("em-emoji-picker");
      const shadow = picker?.shadowRoot;
      if (!shadow || shadow.querySelector("[data-chat-emoji-picker-style]")) return;

      const style = document.createElement("style");
      style.setAttribute("data-chat-emoji-picker-style", "true");
      style.textContent = HIDE_PREVIEW_SHORTCODE_STYLE;
      shadow.appendChild(style);
    };

    injectStyle();

    const observer = new MutationObserver(injectStyle);
    observer.observe(container, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef}>
      <Picker data={data} onEmojiSelect={onEmojiSelect} theme="light" />
    </div>
  );
};

export default ChatEmojiPicker;
