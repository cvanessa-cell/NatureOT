export const REPO_CHANGED_CHANNEL = "ui-compare-repo-changed";

export function notifyRepoChanged(detail = {}) {
  try {
    const channel = new BroadcastChannel(REPO_CHANGED_CHANNEL);
    channel.postMessage({ type: "repo-changed", ...detail });
    channel.close();
  } catch {
    // BroadcastChannel unavailable
  }
  try {
    localStorage.setItem(
      "ui-compare-repo-changed",
      JSON.stringify({ at: Date.now(), ...detail }),
    );
  } catch {
    // storage blocked
  }
}

export function onRepoChanged(handler) {
  let channel = null;
  try {
    channel = new BroadcastChannel(REPO_CHANGED_CHANNEL);
    channel.onmessage = (event) => handler(event.data);
  } catch {
    // ignore
  }

  const onStorage = (event) => {
    if (event.key === "ui-compare-repo-changed") handler({ type: "repo-changed" });
  };
  window.addEventListener("storage", onStorage);

  const onVisible = () => {
    if (document.visibilityState === "visible") handler({ type: "focus" });
  };
  document.addEventListener("visibilitychange", onVisible);

  return () => {
    channel?.close();
    window.removeEventListener("storage", onStorage);
    document.removeEventListener("visibilitychange", onVisible);
  };
}
