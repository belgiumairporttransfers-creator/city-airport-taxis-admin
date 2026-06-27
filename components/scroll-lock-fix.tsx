"use client";

import { useEffect } from "react";

export const resetScrollLockCompensation = () => {
  if (!document.body.hasAttribute("data-scroll-locked")) return;

  document.body.style.setProperty("margin-right", "0", "important");
  document.body.style.setProperty("padding-right", "0", "important");
  document.body.style.setProperty(
    "--removed-body-scroll-bar-size",
    "0",
    "important"
  );
};

export const scheduleScrollLockReset = () => {
  resetScrollLockCompensation();
  requestAnimationFrame(resetScrollLockCompensation);
  setTimeout(resetScrollLockCompensation, 0);
};

const ScrollLockFix = () => {
  useEffect(() => {
    const observer = new MutationObserver(scheduleScrollLockReset);

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["data-scroll-locked", "style"],
    });

    return () => observer.disconnect();
  }, []);

  return null;
};

export default ScrollLockFix;
