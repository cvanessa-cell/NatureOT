"use client";

import { useEffect } from "react";

type ScrollMetrics = {
  scrollTop: number;
  scrollHeight: number;
  clientHeight: number;
};

function readMetrics(): ScrollMetrics {
  const el = document.documentElement;
  return {
    scrollTop: window.scrollY,
    scrollHeight: el.scrollHeight,
    clientHeight: window.innerHeight,
  };
}

function maxScrollTop(metrics: ScrollMetrics) {
  return Math.max(0, metrics.scrollHeight - metrics.clientHeight);
}

function scrollRatio(metrics: ScrollMetrics) {
  const max = maxScrollTop(metrics);
  return max > 0 ? metrics.scrollTop / max : 0;
}

/**
 * When the app runs inside the UI compare tool iframe, report scroll position
 * to the parent and apply synced scroll commands from the middle gutter.
 */
export function UiCompareScrollBridge() {
  useEffect(() => {
    if (window.parent === window) return;

    let ignoreScroll = false;

    const report = () => {
      if (ignoreScroll) return;
      window.parent.postMessage(
        { type: "ui-compare-scroll", ...readMetrics() },
        "*",
      );
    };

    const onMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data || typeof data !== "object") return;

      if (data.type === "ui-compare-set-scroll" && typeof data.ratio === "number") {
        const metrics = readMetrics();
        const max = maxScrollTop(metrics);
        ignoreScroll = true;
        window.scrollTo(0, data.ratio * max);
        window.requestAnimationFrame(() => {
          ignoreScroll = false;
          report();
        });
        return;
      }

      if (data.type === "ui-compare-request-metrics") {
        report();
      }
    };

    window.addEventListener("scroll", report, { passive: true });
    window.addEventListener("message", onMessage);
    window.addEventListener("resize", report);
    const observer = new ResizeObserver(report);
    observer.observe(document.documentElement);

    report();

    return () => {
      window.removeEventListener("scroll", report);
      window.removeEventListener("message", onMessage);
      window.removeEventListener("resize", report);
      observer.disconnect();
    };
  }, []);

  return null;
}

export { scrollRatio, maxScrollTop };
export type { ScrollMetrics };
