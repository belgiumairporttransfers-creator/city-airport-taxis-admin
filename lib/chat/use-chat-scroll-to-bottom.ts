"use client";

import { useCallback, useEffect, useRef } from "react";

const BOTTOM_THRESHOLD = 120;

type UseChatScrollToBottomOptions = {
  conversationId: string | null;
  isLoading: boolean;
  messageCount: number;
  isPeerTyping: boolean;
};

export function useChatScrollToBottom({
  conversationId,
  isLoading,
  messageCount,
  isPeerTyping,
}: UseChatScrollToBottomOptions) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const stickToBottomRef = useRef(true);
  const previousConversationIdRef = useRef<string | null>(null);
  const previousMessageCountRef = useRef(0);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "auto") => {
    const container = containerRef.current;
    if (!container) return;

    const run = () => {
      container.scrollTo({
        top: container.scrollHeight,
        behavior,
      });
    };

    requestAnimationFrame(() => {
      requestAnimationFrame(run);
    });
  }, []);

  useEffect(() => {
    if (conversationId === previousConversationIdRef.current) return;

    stickToBottomRef.current = true;
    previousConversationIdRef.current = conversationId;
    previousMessageCountRef.current = 0;
  }, [conversationId]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const distanceFromBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight;
      stickToBottomRef.current = distanceFromBottom <= BOTTOM_THRESHOLD;
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId || isLoading || messageCount === 0) return;

    const isInitialLoad = previousMessageCountRef.current === 0;
    previousMessageCountRef.current = messageCount;

    if (isInitialLoad || stickToBottomRef.current) {
      scrollToBottom(isInitialLoad ? "auto" : "smooth");
    }
  }, [conversationId, isLoading, messageCount, scrollToBottom]);

  useEffect(() => {
    if (!conversationId || isLoading || !isPeerTyping || !stickToBottomRef.current) return;
    scrollToBottom("smooth");
  }, [conversationId, isLoading, isPeerTyping, scrollToBottom]);

  useEffect(() => {
    const content = contentRef.current;
    const container = containerRef.current;
    if (!content || !container || isLoading) return;

    const observer = new ResizeObserver(() => {
      if (!stickToBottomRef.current) return;
      container.scrollTop = container.scrollHeight;
    });

    observer.observe(content);
    return () => observer.disconnect();
  }, [conversationId, isLoading]);

  return { containerRef, contentRef };
}
