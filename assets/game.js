/* ===========================================================
   Demo Route — Great Commission Quest
   Shared game engine — drives each Team page
   =========================================================== */

(function () {
  const teamId = document.body.getAttribute("data-team");
  const team = TEAMS[teamId];
  if (!team) {
    document.getElementById("app").innerHTML = "<p style='color:#fff'>Unknown team.</p>";
    return;
  }
  const STORAGE_KEY = "demoroute_" + teamId;
  const seq = team.sequence; // array of CP numbers, length 8

  function normalize(s) {
    return (s || "").toString().trim().toLowerCase().replace(/\s+/g, " ");
  }

  function defaultState() {
    return {
      started: false,
      current: 0,
      frontier: 0,
      status: new Array(seq.length).fill("pending"), // pending | solved | skipped
      screen: "start", // start | checkpoint | final | done
      passageAnswers: {}
    };
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      const parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.status) || parsed.status.length !== seq.length) {
        return defaultState();
      }
      return parsed;
    } catch (e) {
      return defaultState();
    }
  }

  function saveState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  let state = loadState();

  const app = document.getElementById("app");

  function allSolved() {
    return state.status.every((s) => s === "solved");
  }
  function solvedCount() {
    return state.status.filter((s) => s === "solved").length;
  }

  function patternDisplay(pattern) {
    if (Array.isArray(pattern)) {
      return pattern.map((n) => Array(n).fill("_").join(" ")).join("   ·   ");
    }
    return Array(pattern).fill("_").join(" ");
  }

  function renderProgressDots(highlightCurrent) {
    let html = '<div class="progress-row">';
    seq.forEach((cpNum, i) => {
      const st = state.status[i];
      const visited = i <= state.frontier;
      let cls = "dot";
      if (st === "solved") cls += " solved";
      else if (st === "skipped") cls += " skipped";
      if (visited) cls += " visited";
      if (highlightCurrent && i === state.current) cls += " current";
      html += `<button type="button" class="${cls}" data-dot="${i}" ${visited ? "" : "disabled"} title="Checkpoint ${i + 1}">${i + 1}</button>`;
    });
    html += "</div>";
    html += `<div class="progress-caption">${solvedCount()} of ${seq.length} checkpoints solved</div>`;
    return html;
  }

  function header() {
    return `
      <div class="site-header">
        <img class="site-logo" src="assets/images/mm-logo.png" alt="Mission logo" />
        <span class="emoji">🌿</span>
        <h1>Great Commission Quest</h1>
        <p>Demo Route &middot; Preview Challenge</p>
        <p>Singapore Botanic Gardens &middot; Mission Trip Fundraiser 2026</p>
        <span class="tag">${team.label}</span>
      </div>`;
  }

  function topActions(showReset) {
    return `
      <div class="top-actions">
        <a class="back-link" href="index.html">&larr; Race Home</a>
        ${showReset ? '<button type="button" class="reset-link" id="resetLink">Reset game</button>' : ""}
      </div>`;
  }

  /* ---------------- START SCREEN ---------------- */
  function renderStart() {
    app.innerHTML = `
      ${header()}
      <div class="wrap">
        ${topActions(false)}
        <div class="card">
          <h2>Welcome, ${team.label}!</h2>
          <p>You are about to race through the Singapore Botanic Gardens, solving clues at each checkpoint.</p>
          <p>At each checkpoint, find the interpretive board, solve the clue, and key in the keyword. Can't find it? You may skip ahead &mdash; but you'll need to come back and finish every checkpoint before the final challenge unlocks.</p>
          <p>Collect all ${seq.length} keywords to unlock the final passage challenge and complete the Quest.</p>
          <button type="button" class="btn btn-primary btn-full" id="beginBtn">Begin the Race &rarr;</button>
        </div>
      </div>
      <div class="site-footer">Demo Route &middot; ${team.label}</div>
    `;
    document.getElementById("beginBtn").addEventListener("click", () => {
      state.started = true;
      state.screen = "checkpoint";
      state.current = 0;
      state.frontier = 0;
      saveState(state);
      render();
    });
  }

  /* ---------------- CHECKPOINT SCREEN ---------------- */
  function renderCheckpoint() {
    const i = state.current;
    const cpNum = seq[i];
    const cp = CP_DATA[cpNum];
    const st = state.status[i];
    const isReview = i < state.frontier;
    const solvedAll = allSolved();

    let banner = "";
    if (solvedAll) {
      banner = `
        <div class="card" style="background:linear-gradient(160deg,#fff6df,#fdeab8); border:2px solid var(--gold);">
          <h2 style="margin-top:0;">🎉 All ${seq.length} checkpoints complete!</h2>
          <p>You've gathered every keyword. Tap below to unlock the Final Challenge.</p>
          <button type="button" class="btn btn-gold btn-full" id="toFinalBtn">Proceed to Final Challenge &rarr;</button>
        </div>`;
    }

    let actionArea = "";
    if (st === "solved") {
      actionArea = `
        <div class="status-msg ok">&#10003; Solved &mdash; keyword: <strong>${cp.answer.toUpperCase()}</strong></div>
        <div class="btn-row">
          <button type="button" class="btn btn-secondary" id="backBtn" ${i === 0 ? "disabled" : ""}>&larr; Back</button>
          <button type="button" class="btn btn-primary" id="nextBtn" ${i < state.frontier ? "" : "disabled"}>Next &rarr;</button>
        </div>`;
    } else {
      const skippedNote = st === "skipped"
        ? `<div class="status-msg info">&#9203; You skipped this earlier. You can still solve it now:</div>`
        : "";
      actionArea = `
        ${skippedNote}
        <label class="field-label">Enter the keyword</label>
        <div class="pattern">${patternDisplay(cp.pattern)}</div>
        <input type="text" id="answerInput" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Type keyword here" />
        <div class="status-msg" id="answerMsg"></div>
        <div class="btn-row">
          <button type="button" class="btn btn-primary" id="submitBtn">Submit</button>
          <button type="button" class="btn btn-secondary" id="skipBtn">Skip &raquo;</button>
        </div>
        <div class="btn-row">
          <button type="button" class="btn btn-secondary" id="backBtn" ${i === 0 ? "disabled" : ""}>&larr; Back</button>
          ${isReview ? '<button type="button" class="btn btn-secondary" id="nextBtn">Next &rarr;</button>' : ""}
        </div>`;
    }

    let hintImg = cp.hint ? `<img class="photo" src="${cp.hint}" alt="Hint" /><div class="photo-caption">Look for this &mdash; a good sign you're close.</div>` : "";

    let plusCodeRow = cp.plusCode
      ? `<div class="plus-code-row">${cp.plusCode}</div>`
      : "";

    let lastStationNote = "";
    if (i === seq.length - 1 && !solvedAll && st !== "pending") {
      lastStationNote = `<p class="status-msg info">This is the last stop on your route, but ${seq.length - solvedCount()} checkpoint(s) still need answers. Use the dots above or the Back button to go complete them.</p>`;
    }

    app.innerHTML = `
      ${header()}
      <div class="wrap">
        ${topActions(false)}
        ${renderProgressDots(true)}
        ${banner}
        <div class="card">
          <h2>Checkpoint ${i + 1} of ${seq.length}: ${cp.name}</h2>
          <img class="photo" src="${cp.map}" alt="Map to ${cp.name}" />
          <div class="photo-caption">Route map &mdash; your checkpoint is marked in red.</div>
          ${plusCodeRow}
          <h3>Where to find it</h3>
          <p>${cp.where}</p>
          ${hintImg}
          <h3>Confirm the board</h3>
          <img class="photo" src="${cp.board}" alt="${cp.name} board" />
          <h3>Clue</h3>
          <p>${cp.riddle}</p>
          ${actionArea}
          ${lastStationNote}
        </div>
      </div>
      <div class="site-footer">Demo Route &middot; ${team.label}</div>
    `;

    wireCommon();
    const submitBtn = document.getElementById("submitBtn");
    if (submitBtn) {
      submitBtn.addEventListener("click", () => attemptAnswer(i, cp));
      const input = document.getElementById("answerInput");
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") attemptAnswer(i, cp);
      });
    }
    const skipBtn = document.getElementById("skipBtn");
    if (skipBtn) skipBtn.addEventListener("click", () => skipCheckpoint(i));
    const backBtn = document.getElementById("backBtn");
    if (backBtn) backBtn.addEventListener("click", () => {
      state.current = Math.max(0, state.current - 1);
      saveState(state);
      render();
    });
    const nextBtn = document.getElementById("nextBtn");
    if (nextBtn) nextBtn.addEventListener("click", () => {
      state.current = Math.min(state.frontier, state.current + 1);
      saveState(state);
      render();
    });
    const toFinalBtn = document.getElementById("toFinalBtn");
    if (toFinalBtn) toFinalBtn.addEventListener("click", () => {
      state.screen = "final";
      saveState(state);
      render();
    });
  }

  function attemptAnswer(i, cp) {
    const input = document.getElementById("answerInput");
    const msg = document.getElementById("answerMsg");
    const val = normalize(input.value);
    if (!val) {
      msg.textContent = "Please type an answer, or tap Skip.";
      msg.className = "status-msg error";
      return;
    }
    if (val === normalize(cp.answer)) {
      state.status[i] = "solved";
      input.classList.add("correct");
      if (allSolved()) {
        // That was the last checkpoint — auto-advance straight to the Final Challenge.
        msg.textContent = "Correct! All 8 checkpoints complete — loading the Final Challenge…";
        msg.className = "status-msg ok";
        state.screen = "final";
        saveState(state);
        setTimeout(render, 900);
      } else {
        msg.textContent = "Correct!";
        msg.className = "status-msg ok";
        advanceAfterAction(i);
      }
    } else {
      msg.textContent = "Not quite &mdash; check the board again, or tap Skip to come back later.";
      msg.className = "status-msg error";
      input.classList.add("error");
    }
  }

  function skipCheckpoint(i) {
    if (state.status[i] !== "solved") {
      state.status[i] = "skipped";
    }
    advanceAfterAction(i);
  }

  function advanceAfterAction(i) {
    const wasFrontier = i === state.frontier;
    if (wasFrontier && i < seq.length - 1) {
      state.frontier = i + 1;
      state.current = i + 1;
    }
    // If this was a review-mode action (an earlier skipped station), current stays
    // put so the participant can see the "solved" confirmation, then tap Next/a dot.
    saveState(state);
    setTimeout(render, 500);
  }

  /* ---------------- FINAL CHALLENGE SCREEN ---------------- */
  function renderFinal() {
    if (!allSolved()) {
      state.screen = "checkpoint";
      saveState(state);
      render();
      return;
    }
    const parts = PASSAGE_TEMPLATE.split(/\{(\d)\}/);
    let passageHtml = "";
    for (let p = 0; p < parts.length; p++) {
      if (p % 2 === 0) {
        passageHtml += escapeHtml(parts[p]);
      } else {
        const n = parts[p];
        passageHtml += `<input type="text" class="blank-input" data-blank="${n}" autocomplete="off" autocapitalize="off" spellcheck="false" size="8" />`;
      }
    }

    const bankWords = shuffledBank();

    app.innerHTML = `
      ${header()}
      <div class="wrap">
        ${topActions(false)}
        <div class="card">
          <h2>🏁 Final Challenge: The Master Passage</h2>
          <p>Fill in every blank using the keywords you collected. Use the word bank below if you need help.</p>
          <div class="passage">${passageHtml}</div>
          <div class="status-msg" id="finalMsg"></div>
          <div class="word-bank">
            <h3>Word bank</h3>
            <div class="chips">${bankWords.map((w) => `<span class="chip">${w}</span>`).join("")}</div>
          </div>
          <div class="btn-row" style="margin-top:16px;">
            <button type="button" class="btn btn-secondary" id="backToChecksBtn">&larr; Back to checkpoints</button>
            <button type="button" class="btn btn-primary" id="submitPassageBtn">Submit Passage</button>
          </div>
        </div>
      </div>
      <div class="site-footer">Demo Route &middot; ${team.label}</div>
    `;

    wireCommon();
    document.getElementById("backToChecksBtn").addEventListener("click", () => {
      state.screen = "checkpoint";
      saveState(state);
      render();
    });
    document.getElementById("submitPassageBtn").addEventListener("click", checkPassage);
  }

  function shuffledBank() {
    const words = Object.keys(BLANK_SOURCE_CP).map((n) => CP_DATA[BLANK_SOURCE_CP[n]].answer);
    const arr = words.map((w) => w.replace(/\b\w/g, (c) => c.toUpperCase()));
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function checkPassage() {
    const inputs = document.querySelectorAll(".blank-input");
    let allCorrect = true;
    inputs.forEach((inp) => {
      const n = inp.getAttribute("data-blank");
      const correctWord = CP_DATA[BLANK_SOURCE_CP[n]].answer;
      const ok = normalize(inp.value) === normalize(correctWord);
      inp.classList.remove("correct", "error");
      inp.classList.add(ok ? "correct" : "error");
      if (!ok) allCorrect = false;
    });
    const msg = document.getElementById("finalMsg");
    if (allCorrect) {
      msg.textContent = "All correct! Completing the Quest...";
      msg.className = "status-msg ok";
      state.screen = "done";
      saveState(state);
      setTimeout(render, 600);
    } else {
      msg.textContent = "Some answers aren't quite right yet &mdash; check the highlighted blanks and try again.";
      msg.className = "status-msg error";
    }
  }

  function escapeHtml(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  /* ---------------- CONGRATULATIONS SCREEN ---------------- */
  function renderDone() {
    app.innerHTML = `
      ${header()}
      <div class="wrap">
        ${topActions(false)}
        <div class="card congrats-card">
          <span class="congrats-emoji">🎉🌿🎉</span>
          <h2>Congratulations, ${team.label}!</h2>
          <p>You've completed the Demo Route trail and solved the Master Passage. Well done, Quest team!</p>
          <p><strong>Please make your way back to the gathering point now.</strong></p>
        </div>
        <div class="gm-only-reset">
          <button type="button" class="reset-link-discreet" id="resetBtn2">Reset game (facilitator only)</button>
        </div>
      </div>
      <div class="site-footer">Demo Route &middot; ${team.label}</div>
      ${resetModalHtml()}
    `;
    wireResetModal();
    document.getElementById("resetBtn2").addEventListener("click", openResetModal);
  }

  /* ---------------- RESET MODAL ---------------- */
  function resetModalHtml() {
    return `
      <div class="modal-overlay" id="resetModal">
        <div class="modal-box">
          <span class="warn-icon">⚠️</span>
          <h3>Reset the game?</h3>
          <p>This will erase all progress for ${team.label} &mdash; every checkpoint answer and the final passage &mdash; and restart the race from the beginning. This cannot be undone.</p>
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" id="cancelResetBtn">Cancel</button>
            <button type="button" class="btn btn-danger" id="confirmResetBtn">Yes, reset</button>
          </div>
        </div>
      </div>`;
  }
  function openResetModal() {
    const m = document.getElementById("resetModal");
    if (m) m.classList.add("open");
  }
  function wireResetModal() {
    const cancel = document.getElementById("cancelResetBtn");
    const confirm = document.getElementById("confirmResetBtn");
    if (cancel) cancel.addEventListener("click", () => document.getElementById("resetModal").classList.remove("open"));
    if (confirm) confirm.addEventListener("click", () => {
      state = defaultState();
      saveState(state);
      render();
    });
  }

  function wireCommon() {
    const resetLink = document.getElementById("resetLink");
    if (resetLink) {
      // inject modal if not present
      if (!document.getElementById("resetModal")) {
        app.insertAdjacentHTML("beforeend", resetModalHtml());
        wireResetModal();
      }
      resetLink.addEventListener("click", openResetModal);
    }
    document.querySelectorAll("[data-dot]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.getAttribute("data-dot"), 10);
        if (idx <= state.frontier) {
          state.current = idx;
          saveState(state);
          render();
        }
      });
    });
  }

  /* ---------------- ROUTER ---------------- */
  function render() {
    if (!state.started || state.screen === "start") {
      renderStart();
    } else if (state.screen === "final") {
      renderFinal();
    } else if (state.screen === "done") {
      renderDone();
    } else {
      renderCheckpoint();
    }
  }

  render();
})();
