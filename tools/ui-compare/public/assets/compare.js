import { notifyRepoChanged } from "./repo-sync.js";

const params = new URLSearchParams(window.location.search);
const sessionId = params.get("session");

const subtitle = document.getElementById("compare-subtitle");
const routeTabs = document.getElementById("route-tabs");
const leftFrame = document.getElementById("left-frame");
const rightFrame = document.getElementById("right-frame");
const leftVersion = document.getElementById("left-version");
const rightVersion = document.getElementById("right-version");
const leftPicker = document.getElementById("left-picker");
const rightPicker = document.getElementById("right-picker");
const leftPickerList = document.getElementById("left-picker-list");
const rightPickerList = document.getElementById("right-picker-list");
const leftPickerHint = document.getElementById("left-picker-hint");
const rightPickerHint = document.getElementById("right-picker-hint");
const notesList = document.getElementById("notes-list");
const mismatchLine = document.getElementById("mismatch-line");
const routeStatus = document.getElementById("route-status");
const decisionStatus = document.getElementById("decision-status");
const closeBtn = document.getElementById("close-btn");
const syncScrollGutter = document.getElementById("sync-scroll-gutter");
const syncScrollSpacer = document.getElementById("sync-scroll-spacer");

const paneMetrics = {
  left: null,
  right: null,
};

let applyingSyncScroll = false;
let syncingGutter = false;

const sides = {
  left: {
    frame: leftFrame,
    version: leftVersion,
    picker: leftPicker,
    pickerList: leftPickerList,
    pickerHint: leftPickerHint,
    actions: document.getElementById("left-actions"),
    pane: document.getElementById("left-pane"),
  },
  right: {
    frame: rightFrame,
    version: rightVersion,
    picker: rightPicker,
    pickerList: rightPickerList,
    pickerHint: rightPickerHint,
    actions: document.getElementById("right-actions"),
    pane: document.getElementById("right-pane"),
  },
};

let session = null;
let currentRoute = "/";

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function formatPaneVersion(pane, side) {
  if (!pane?.id) return "No version loaded";
  const commit = pane.commit && pane.commit !== "working-copy"
    ? pane.commit.slice(0, 7)
    : pane.commit === "working-copy"
      ? "working tree"
      : "—";
  const port = pane.port ? ` · :${pane.port}` : "";
  const kept = session.keptSide === side ? ' <span class="kept-badge">Kept</span>' : "";
  const inactive = pane.active ? "" : ' <span class="inactive-badge">Cleared</span>';
  return `<strong>${escapeHtml(pane.label || pane.id)}</strong><span class="meta">${escapeHtml(pane.id)} @ ${escapeHtml(commit)}${port}</span>${kept}${inactive}`;
}

function baselinePane() {
  if (session.keptSide) return session[session.keptSide];
  const left = session.left;
  const right = session.right;
  if (left?.active && !right?.active) return left;
  if (right?.active && !left?.active) return right;
  return null;
}

function updateSubtitle() {
  const left = session.left;
  const right = session.right;
  const kept = session.keptSide ? session[session.keptSide] : null;
  if (kept) {
    subtitle.textContent = `Kept: ${kept.label} — compare next version on the other pane`;
    return;
  }
  if (left?.active && right?.active) {
    subtitle.textContent = `${left.label} vs ${right.label}`;
    return;
  }
  subtitle.textContent = "Select a replacement version on the cleared pane";
}

function updatePaneChrome() {
  for (const side of ["left", "right"]) {
    const ui = sides[side];
    const pane = session[side];
    ui.version.innerHTML = formatPaneVersion(pane, side);

    const isKept = session.keptSide === side;
    const isActive = pane?.active && pane?.url;

    ui.picker.hidden = isActive;
    ui.frame.hidden = !isActive;
    ui.pane.classList.toggle("picker-open", !isActive);

    ui.actions.querySelectorAll("button").forEach((btn) => {
      const action = btn.dataset.action;
      if (action === "keep") {
        btn.disabled = !pane?.id || isKept;
        btn.textContent = isKept ? "Kept" : "Keep";
        btn.classList.toggle("kept-active", isKept);
      } else if (action === "reject" || action === "replace") {
        btn.disabled = !pane?.id || isKept || !isActive;
      }
    });
  }
  updateSubtitle();
}

function maxScrollTop(metrics) {
  if (!metrics) return 0;
  return Math.max(0, metrics.scrollHeight - metrics.clientHeight);
}

function scrollRatio(metrics) {
  const max = maxScrollTop(metrics);
  return max > 0 ? metrics.scrollTop / max : 0;
}

function postSetScroll(frame, ratio) {
  if (!frame?.contentWindow) return;
  frame.contentWindow.postMessage({ type: "ui-compare-set-scroll", ratio }, "*");
}

function requestPaneMetrics() {
  for (const frame of [leftFrame, rightFrame]) {
    frame.contentWindow?.postMessage({ type: "ui-compare-request-metrics" }, "*");
  }
}

function updateSyncSpacerHeight() {
  const heights = ["left", "right"]
    .map((side) => paneMetrics[side]?.scrollHeight ?? 0)
    .filter((h) => h > 0);
  const tallest = heights.length ? Math.max(...heights) : 0;
  syncScrollSpacer.style.height = tallest ? `${tallest}px` : "100%";
}

function gutterScrollRatio() {
  const max = Math.max(
    0,
    syncScrollGutter.scrollHeight - syncScrollGutter.clientHeight,
  );
  return max > 0 ? syncScrollGutter.scrollTop / max : 0;
}

function setGutterScrollRatio(ratio) {
  const max = Math.max(
    0,
    syncScrollGutter.scrollHeight - syncScrollGutter.clientHeight,
  );
  syncingGutter = true;
  syncScrollGutter.scrollTop = ratio * max;
  syncingGutter = false;
}

function applyLinkedScrollRatio(ratio, sourceSide = null) {
  applyingSyncScroll = true;
  if (sourceSide !== "left") postSetScroll(leftFrame, ratio);
  if (sourceSide !== "right") postSetScroll(rightFrame, ratio);
  window.setTimeout(() => {
    applyingSyncScroll = false;
  }, 80);
}

function syncFromPaneScroll(sourceSide) {
  if (applyingSyncScroll) return;
  const metrics = paneMetrics[sourceSide];
  if (!metrics) return;
  const ratio = scrollRatio(metrics);
  setGutterScrollRatio(ratio);
  applyLinkedScrollRatio(ratio, sourceSide);
}

function setupSyncScroll() {
  window.addEventListener("message", (event) => {
    const data = event.data;
    if (!data || data.type !== "ui-compare-scroll") return;

    const side =
      event.source === leftFrame.contentWindow
        ? "left"
        : event.source === rightFrame.contentWindow
          ? "right"
          : null;
    if (!side) return;

    paneMetrics[side] = {
      scrollTop: data.scrollTop,
      scrollHeight: data.scrollHeight,
      clientHeight: data.clientHeight,
    };
    updateSyncSpacerHeight();
    syncFromPaneScroll(side);
  });

  syncScrollGutter.addEventListener(
    "scroll",
    () => {
      if (syncingGutter || applyingSyncScroll) return;
      applyLinkedScrollRatio(gutterScrollRatio());
    },
    { passive: true },
  );

  for (const frame of [leftFrame, rightFrame]) {
    frame.addEventListener("load", () => {
      paneMetrics.left = null;
      paneMetrics.right = null;
      window.setTimeout(requestPaneMetrics, 300);
    });
  }
}

function setLiveFrames(route) {
  currentRoute = route;
  if (session.left?.active && session.left?.url) {
    leftFrame.src = `${session.left.url}${route}`;
  }
  if (session.right?.active && session.right?.url) {
    rightFrame.src = `${session.right.url}${route}`;
  }
}

function renderNotes(annotations) {
  if (!annotations?.length) {
    notesList.innerHTML =
      "<li>No indexed visual differences detected on this route (or analysis still running).</li>";
    return;
  }
  notesList.innerHTML = annotations
    .map((ann) => `<li><strong>${ann.index}.</strong> ${escapeHtml(ann.note)}</li>`)
    .join("");
}

async function analyzeRoute(route) {
  if (!session.left?.active || !session.right?.active) {
    notesList.innerHTML = "<li>Load both panes to run visual diff notes.</li>";
    mismatchLine.textContent = "";
    return;
  }
  const res = await fetch(
    `/api/compare/session/${sessionId}/route?path=${encodeURIComponent(route)}&analyze=1`,
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Analysis failed");
  if (data.error) {
    notesList.innerHTML = `<li>${escapeHtml(data.error)}</li>`;
    return;
  }
  renderNotes(data.annotations);
  if (typeof data.mismatchPercentage === "number") {
    mismatchLine.textContent = `${data.mismatchPercentage.toFixed(2)}% visual difference on ${route} (background scan).`;
  }
}

function loadRoute(route) {
  setLiveFrames(route);
  routeStatus.className = "status";
  if (session.left?.active && session.right?.active) {
    routeStatus.textContent = `Live apps loaded for ${route}. Interact in each pane.`;
    notesList.innerHTML = "<li>Analyzing differences in the background…</li>";
    mismatchLine.textContent = "";
    analyzeRoute(route).catch((error) => {
      notesList.innerHTML = `<li>Could not analyze: ${escapeHtml(error.message)}</li>`;
    });
  } else {
    routeStatus.textContent = session.keptSide
      ? "Pick a replacement version on the cleared pane to continue comparing."
      : "One pane is cleared — choose a version to load.";
    notesList.innerHTML = "<li>Difference notes resume when both panes are active.</li>";
    mismatchLine.textContent = "";
  }
}

function buildRouteTabs(routes) {
  routeTabs.innerHTML = "";
  for (const route of routes) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = route;
    btn.classList.toggle("active", route === routes[0]);
    btn.addEventListener("click", () => {
      routeTabs.querySelectorAll("button").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      loadRoute(route);
    });
    routeTabs.appendChild(btn);
  }
}

function collectTargets(overview, excludeId) {
  const items = [];
  if (overview.main?.id && overview.main.id !== excludeId) {
    items.push({
      id: overview.main.id,
      title: `Main (${overview.main.name})`,
      meta: overview.main.commit?.slice(0, 7),
    });
  }
  for (const branch of [...(overview.branches || []), ...(overview.remoteOnlyBranches || [])]) {
    if (branch.id === excludeId) continue;
    items.push({
      id: branch.id,
      title: branch.name,
      meta: `${branch.kind} · ${branch.diffStat?.summary || ""}`,
    });
  }
  if (overview.uncommitted?.id && overview.uncommitted.id !== excludeId && overview.uncommitted.dirty) {
    items.push({
      id: overview.uncommitted.id,
      title: overview.uncommitted.name,
      meta: overview.uncommitted.diffStat?.summary,
    });
  }
  for (const commit of overview.commits || []) {
    if (commit.id === excludeId) continue;
    items.push({
      id: commit.id,
      title: commit.name,
      meta: commit.description,
    });
  }
  return items;
}

function showPicker(side, overview) {
  const ui = sides[side];
  const baseline = baselinePane();
  ui.pickerHint.textContent = baseline
    ? `Compare against kept version: ${baseline.label} (${baseline.id})`
    : "Select a branch or commit to load in this pane.";

  const targets = collectTargets(overview, baseline?.id);
  if (!targets.length) {
    ui.pickerList.innerHTML = "<p class='meta'>No other versions available.</p>";
    return;
  }

  ui.pickerList.innerHTML = targets
    .map(
      (t) => `
      <button type="button" class="picker-item" data-target-id="${escapeHtml(t.id)}">
        <span class="picker-title">${escapeHtml(t.title)}</span>
        <span class="picker-meta">${escapeHtml(t.meta || "")}</span>
      </button>`,
    )
    .join("");

  ui.pickerList.querySelectorAll(".picker-item").forEach((btn) => {
    btn.addEventListener("click", () => selectReplacement(side, btn.dataset.targetId));
  });
}

async function selectReplacement(side, targetId) {
  decisionStatus.className = "status";
  decisionStatus.textContent = "Starting dev server for selected version…";
  try {
    const res = await fetch(`/api/compare/session/${sessionId}/replace-with`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ side, targetId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to load version");
    session = data.session;
    updatePaneChrome();
    loadRoute(currentRoute);
    decisionStatus.className = "status ok";
    decisionStatus.textContent = `Loaded ${session[side].label} on the ${side} pane.`;
  } catch (error) {
    decisionStatus.className = "status error";
    decisionStatus.textContent = error.message;
  }
}

async function handleDecision(side, action) {
  const paneId = session[side]?.id;
  const confirmReject =
    action === "reject"
      ? window.confirm(
          paneId === "working-copy"
            ? "Discard all uncommitted changes in this repo and clear this pane? This cannot be undone."
            : `Delete branch "${paneId}" from the repo and clear this pane? This cannot be undone.`,
        )
      : true;
  if (!confirmReject) return;

  decisionStatus.className = "status";
  decisionStatus.textContent =
    action === "keep"
      ? "Keeping version…"
      : action === "reject"
        ? "Rejecting and removing branch…"
        : "Clearing pane…";

  try {
    const res = await fetch(`/api/compare/session/${sessionId}/decision`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ side, action }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Action failed");

    const removedTargetId = action === "reject" ? paneId : null;
    session = data.session;
    updatePaneChrome();

    if (removedTargetId) {
      notifyRepoChanged({ branchId: removedTargetId, action: "reject" });
    }

    if (data.showPicker && data.pickerSide && data.overview) {
      showPicker(data.pickerSide, data.overview);
      routeStatus.textContent =
        action === "reject"
          ? `Branch removed. Choose the next version to compare.`
          : "Pane cleared. Choose a replacement version.";
      notesList.innerHTML = "<li>Difference notes resume when both panes are active.</li>";
      decisionStatus.className = "status ok";
      decisionStatus.textContent =
        action === "reject"
          ? paneId === "working-copy"
            ? "Uncommitted changes discarded. Select the next version below."
            : "Branch deleted. Select the next version below."
          : "Select a replacement version below.";
    } else {
      loadRoute(currentRoute);
      decisionStatus.className = "status ok";
      if (action === "keep" && data.showPicker) {
        showPicker(data.pickerSide, data.overview);
        decisionStatus.textContent = "Kept version pinned. Choose what to load on the other pane.";
      } else {
        decisionStatus.textContent =
          action === "keep"
            ? `${session[side].label} is kept — use Reject or Replace on the other pane to review the next version.`
            : "Done.";
      }
    }
  } catch (error) {
    decisionStatus.className = "status error";
    decisionStatus.textContent = error.message;
  }
}

for (const side of ["left", "right"]) {
  sides[side].actions.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => handleDecision(side, btn.dataset.action));
  });
}

closeBtn.addEventListener("click", async () => {
  await fetch(`/api/compare/session/${sessionId}/stop`, { method: "POST" });
  window.close();
});

async function init() {
  if (!sessionId) {
    subtitle.textContent = "Missing session id.";
    return;
  }

  setupSyncScroll();

  const res = await fetch(`/api/compare/session/${sessionId}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Session not found");

  session = data.session;
  updatePaneChrome();
  buildRouteTabs(session.routes);
  loadRoute(session.routes[0]);
}

init().catch((error) => {
  subtitle.textContent = error.message;
  routeStatus.className = "status error";
  routeStatus.textContent = error.message;
});
