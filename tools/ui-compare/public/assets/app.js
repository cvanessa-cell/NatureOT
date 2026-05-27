import { notifyRepoChanged, onRepoChanged } from "./repo-sync.js";

const versionsEl = document.getElementById("versions");
const commitPanel = document.getElementById("commit-panel");
const commitMessage = document.getElementById("commit-message");
const commitBtn = document.getElementById("commit-btn");
const commitStatus = document.getElementById("commit-status");
const refreshBtn = document.getElementById("refresh-btn");
const compareBtn = document.getElementById("compare-btn");
const compareStatus = document.getElementById("compare-status");

let overview = null;
let leftId = null;
let rightId = null;

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderPickers(id) {
  return `
    <label class="pick"><input type="radio" name="left" value="${escapeHtml(id)}" /> Left</label>
    <label class="pick"><input type="radio" name="right" value="${escapeHtml(id)}" /> Right</label>
  `;
}

function cardHtml({ title, body, meta, id, badge, deletable = false }) {
  const deleteBtn = deletable
    ? `<button type="button" class="delete-btn" data-delete-branch="${escapeHtml(id)}">Delete branch</button>`
    : "";
  return `
    <article class="card" data-id="${escapeHtml(id)}">
      <h2>${escapeHtml(title)} ${badge ? `<span class="meta">(${escapeHtml(badge)})</span>` : ""}</h2>
      <p>${escapeHtml(body)}</p>
      <p class="meta">${escapeHtml(meta)}</p>
      <div class="card-actions">
        <div class="pick-row">${renderPickers(id)}</div>
        ${deleteBtn}
      </div>
    </article>
  `;
}

function updateCompareButton() {
  compareBtn.disabled = !(leftId && rightId && leftId !== rightId);
}

function bindDeleteButtons() {
  document.querySelectorAll("[data-delete-branch]").forEach((btn) => {
    btn.addEventListener("click", () => deleteBranch(btn.dataset.deleteBranch));
  });
}

async function deleteBranch(branchId) {
  const confirmed = window.confirm(
    `Permanently delete branch "${branchId}" from this repo and remove it from the dashboard? This cannot be undone.`,
  );
  if (!confirmed) return;

  compareStatus.className = "status";
  compareStatus.textContent = `Deleting branch "${branchId}"…`;

  try {
    const res = await fetch("/api/repo/delete-branch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ branchId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Delete failed");

    if (leftId === branchId) leftId = null;
    if (rightId === branchId) rightId = null;

    renderOverview(data.overview);
    notifyRepoChanged({ branchId, action: "delete" });

    compareStatus.className = "status ok";
    const parts = [];
    if (data.deletedBranch) parts.push("branch removed from git");
    if (data.removedWorktrees > 0) {
      parts.push(`${data.removedWorktrees} worktree(s) removed`);
    }
    if (data.discardedWorkingCopy) parts.push("uncommitted changes discarded");
    compareStatus.textContent = parts.length
      ? `Deleted "${branchId}" (${parts.join(", ")}).`
      : `Removed "${branchId}" from the dashboard.`;
  } catch (error) {
    compareStatus.className = "status error";
    compareStatus.textContent = error.message;
  }
}

function bindPicks() {
  document.querySelectorAll('input[name="left"]').forEach((input) => {
    input.addEventListener("change", () => {
      leftId = input.value;
      updateCompareButton();
    });
  });
  document.querySelectorAll('input[name="right"]').forEach((input) => {
    input.addEventListener("change", () => {
      rightId = input.value;
      updateCompareButton();
    });
  });
}

function knownVersionIds(data) {
  const ids = new Set([data.main.id, data.uncommitted.id]);
  for (const branch of data.branches) ids.add(branch.id);
  for (const branch of data.remoteOnlyBranches || []) ids.add(branch.id);
  return ids;
}

function renderOverview(data) {
  overview = data;
  const ids = knownVersionIds(data);
  if (leftId && !ids.has(leftId)) leftId = null;
  if (rightId && !ids.has(rightId)) rightId = null;

  const cards = [];

  cards.push(
    cardHtml({
      id: data.main.id,
      title: `Main (${data.main.name})`,
      badge: "baseline",
      body: data.main.description,
      meta: `Commit ${data.main.commit.slice(0, 7)}`,
    }),
  );

  for (const branch of data.branches) {
    const commits =
      branch.recentCommits?.length > 0
        ? `Recent: ${branch.recentCommits.slice(0, 2).join("; ")}`
        : "No unique commits vs main";
    cards.push(
      cardHtml({
        id: branch.id,
        title: branch.name,
        badge: branch.kind,
        body: branch.description,
        meta: `${branch.diffStat.summary}. ${commits}`,
        deletable: true,
      }),
    );
  }

  for (const branch of data.remoteOnlyBranches || []) {
    cards.push(
      cardHtml({
        id: branch.id,
        title: branch.name,
        badge: "remote only",
        body: branch.description,
        meta: "Not removed by Reject in compare (no local branch).",
      }),
    );
  }

  cards.push(
    cardHtml({
      id: data.uncommitted.id,
      title: data.uncommitted.name,
      badge: data.uncommitted.dirty ? "dirty" : "clean",
      body: data.uncommitted.description,
      meta: data.uncommitted.dirty
        ? `${data.uncommitted.changedFiles.length} file(s): ${data.uncommitted.changedFiles.slice(0, 4).join(", ")}${data.uncommitted.changedFiles.length > 4 ? "…" : ""}`
        : "Nothing to commit",
    }),
  );

  versionsEl.innerHTML = cards.join("");
  bindPicks();
  bindDeleteButtons();
  if (leftId) {
    const leftInput = document.querySelector(`input[name="left"][value="${CSS.escape(leftId)}"]`);
    if (leftInput) leftInput.checked = true;
  }
  if (rightId) {
    const rightInput = document.querySelector(`input[name="right"][value="${CSS.escape(rightId)}"]`);
    if (rightInput) rightInput.checked = true;
  }
  updateCompareButton();
  commitPanel.hidden = !data.uncommitted.dirty;
}

async function loadOverview() {
  compareStatus.textContent = "Loading repository state…";
  const res = await fetch("/api/repo");
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to load repo");
  renderOverview(data);
  compareStatus.textContent = "";
}

commitBtn.addEventListener("click", async () => {
  commitStatus.className = "status";
  commitStatus.textContent = "Committing…";
  commitBtn.disabled = true;
  try {
    const res = await fetch("/api/commit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: commitMessage.value }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Commit failed");
    commitStatus.className = "status ok";
    commitStatus.textContent = "Committed.";
    commitMessage.value = "";
    renderOverview(data.overview);
  } catch (error) {
    commitStatus.className = "status error";
    commitStatus.textContent = error.message;
  } finally {
    commitBtn.disabled = false;
  }
});

compareBtn.addEventListener("click", async () => {
  compareStatus.className = "status";
  compareStatus.textContent = "Starting dev servers and opening split view (first run may take a few minutes)…";
  compareBtn.disabled = true;
  try {
    const res = await fetch("/api/compare/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leftId, rightId, openBrowser: true }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Compare failed");
    compareStatus.className = "status ok";
    compareStatus.textContent = `Comparison ready. If the window did not open: ${data.compareUrl}`;
    window.open(data.compareUrl, "_blank", "noopener,noreferrer");
  } catch (error) {
    compareStatus.className = "status error";
    compareStatus.textContent = error.message;
  } finally {
    compareBtn.disabled = false;
    updateCompareButton();
  }
});

refreshBtn.addEventListener("click", () => {
  loadOverview().catch((error) => {
    compareStatus.className = "status error";
    compareStatus.textContent = error.message;
  });
});

onRepoChanged(() => {
  loadOverview().catch(() => {});
});

loadOverview().catch((error) => {
  compareStatus.className = "status error";
  compareStatus.textContent = error.message;
});
