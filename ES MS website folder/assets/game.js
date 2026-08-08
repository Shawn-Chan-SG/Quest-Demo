/* ===========================================================
   示范路线 — 大使命探索之旅
   共享游戏引擎 —— 驱动每个队伍页面
   =========================================================== */

(function () {
  const teamId = document.body.getAttribute("data-team");
  const team = TEAMS[teamId];
  if (!team) {
    document.getElementById("app").innerHTML = "<p style='color:#fff'>未知队伍。</p>";
    return;
  }
  const STORAGE_KEY = "demoroute_" + teamId;
  const seq = team.sequence; // 检查点编号数组

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
      html += `<button type="button" class="${cls}" data-dot="${i}" ${visited ? "" : "disabled"} title="检查点 ${i + 1}">${i + 1}</button>`;
    });
    html += "</div>";
    html += `<div class="progress-caption">已完成 ${solvedCount()} / ${seq.length} 个检查点</div>`;
    return html;
  }

  function header() {
    return `
      <div class="site-header">
        <div class="lang-toggle">
          <a href="../Team%20Demo.html">EN</a>
          <span class="lang-current">中文</span>
        </div>
        <img class="site-logo" src="assets/images/mm-logo.png" alt="Mission logo" />
        <span class="emoji">🌿</span>
        <h1>大使命探索之旅</h1>
        <p>示范路线 &middot; 预览挑战</p>
        <p>新加坡植物园 &middot; 2026年宣教之旅筹款活动</p>
        <span class="tag">${team.label}</span>
      </div>`;
  }

  function topActions(showReset) {
    return `
      <div class="top-actions">
        <a class="back-link" href="index.html">&larr; 返回首页</a>
        ${showReset ? '<button type="button" class="reset-link" id="resetLink">重置游戏</button>' : ""}
      </div>`;
  }

  /* ---------------- START SCREEN ---------------- */
  function renderStart() {
    app.innerHTML = `
      ${header()}
      <div class="wrap">
        ${topActions(false)}
        <div class="card">
          <h2>欢迎，${team.label}！</h2>
          <p>您即将在新加坡植物园展开一场比赛，在每个检查点解开线索。</p>
          <p>在每个检查点，找到解说牌，解开线索，并输入关键词。找不到？您可以先跳过 &mdash; 但必须在解锁最终挑战之前回来完成所有检查点。</p>
          <p>收集全部 ${seq.length} 个关键词，即可解锁最终段落挑战，完成本次探索之旅。</p>
          <button type="button" class="btn btn-primary btn-full" id="beginBtn">开始比赛 &rarr;</button>
        </div>
      </div>
      <div class="site-footer">示范路线 &middot; ${team.label}</div>
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
          <h2 style="margin-top:0;">🎉 全部 ${seq.length} 个检查点已完成！</h2>
          <p>您已收集所有关键词。点击下方按钮解锁最终挑战。</p>
          <button type="button" class="btn btn-gold btn-full" id="toFinalBtn">前往最终挑战 &rarr;</button>
        </div>`;
    }

    let actionArea = "";
    if (st === "solved") {
      actionArea = `
        <div class="status-msg ok">&#10003; 已解答 &mdash; 关键词：<strong>${cp.answer.toUpperCase()}</strong></div>
        <div class="btn-row">
          <button type="button" class="btn btn-secondary" id="backBtn" ${i === 0 ? "disabled" : ""}>&larr; 返回</button>
          <button type="button" class="btn btn-primary" id="nextBtn" ${i < state.frontier ? "" : "disabled"}>下一步 &rarr;</button>
        </div>`;
    } else {
      const skippedNote = st === "skipped"
        ? `<div class="status-msg info">&#9203; 您之前跳过了这一关。您现在仍可以解答：</div>`
        : "";
      actionArea = `
        ${skippedNote}
        <label class="field-label">输入关键词</label>
        <div class="pattern">${patternDisplay(cp.pattern)}</div>
        <input type="text" id="answerInput" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="在此输入关键词" />
        <div class="status-msg" id="answerMsg"></div>
        <div class="btn-row">
          <button type="button" class="btn btn-primary" id="submitBtn">提交</button>
          <button type="button" class="btn btn-secondary" id="skipBtn">跳过 &raquo;</button>
        </div>
        <div class="btn-row">
          <button type="button" class="btn btn-secondary" id="backBtn" ${i === 0 ? "disabled" : ""}>&larr; 返回</button>
          ${isReview ? '<button type="button" class="btn btn-secondary" id="nextBtn">下一步 &rarr;</button>' : ""}
        </div>`;
    }

    let hintImg = cp.hint ? `<img class="photo" src="${cp.hint}" alt="Hint" /><div class="photo-caption">寻找这个 &mdash; 说明您已经接近了。</div>` : "";

    let plusCodeRow = cp.plusCode
      ? `<div class="plus-code-row">${cp.plusCode}</div>`
      : "";

    let lastStationNote = "";
    if (i === seq.length - 1 && !solvedAll && st !== "pending") {
      lastStationNote = `<p class="status-msg info">这是您路线的最后一站，但还有 ${seq.length - solvedCount()} 个检查点尚未完成。请使用上方的圆点或返回按钮回去完成。</p>`;
    }

    app.innerHTML = `
      ${header()}
      <div class="wrap">
        ${topActions(false)}
        ${renderProgressDots(true)}
        ${banner}
        <div class="card">
          <h2>检查点 ${i + 1} / ${seq.length}：${cp.name}</h2>
          <img class="photo" src="${cp.map}" alt="${cp.name} 地图" />
          <div class="photo-caption">路线地图 &mdash; 您的检查点以红色标记。</div>
          ${plusCodeRow}
          <h3>如何找到它</h3>
          <p>${cp.where}</p>
          ${hintImg}
          <h3>确认解说牌</h3>
          <img class="photo" src="${cp.board}" alt="${cp.name} 解说牌" />
          <h3>线索</h3>
          <p>${cp.riddle}</p>
          ${actionArea}
          ${lastStationNote}
        </div>
      </div>
      <div class="site-footer">示范路线 &middot; ${team.label}</div>
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
      msg.textContent = "请输入答案，或点击跳过。";
      msg.className = "status-msg error";
      return;
    }
    if (val === normalize(cp.answer)) {
      state.status[i] = "solved";
      input.classList.add("correct");
      if (allSolved()) {
        // 这是最后一个检查点 —— 自动跳转到最终挑战。
        msg.textContent = `正确！全部 ${seq.length} 个检查点已完成 —— 正在加载最终挑战…`;
        msg.className = "status-msg ok";
        state.screen = "final";
        saveState(state);
        setTimeout(render, 900);
      } else {
        msg.textContent = "正确！";
        msg.className = "status-msg ok";
        advanceAfterAction(i);
      }
    } else {
      msg.textContent = "还不太对 &mdash; 请再次查看解说牌，或点击跳过稍后再回来。";
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
    // 如果这是回顾模式下的操作（之前跳过的站点），当前位置保持不变，
    // 让参与者先看到"已解答"的确认信息，再点击下一步或圆点导航。
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
          <h2>🏁 最终挑战：终极段落</h2>
          <p>使用您收集到的关键词填写每一个空格。如需帮助，请参考下方词库。</p>
          <div class="passage">${passageHtml}</div>
          <div class="status-msg" id="finalMsg"></div>
          <div class="word-bank">
            <h3>词库</h3>
            <div class="chips">${bankWords.map((w) => `<span class="chip">${w}</span>`).join("")}</div>
          </div>
          <div class="btn-row" style="margin-top:16px;">
            <button type="button" class="btn btn-secondary" id="backToChecksBtn">&larr; 返回检查点</button>
            <button type="button" class="btn btn-primary" id="submitPassageBtn">提交段落</button>
          </div>
        </div>
      </div>
      <div class="site-footer">示范路线 &middot; ${team.label}</div>
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
      msg.textContent = "全部正确！正在完成本次探索之旅…";
      msg.className = "status-msg ok";
      state.screen = "done";
      saveState(state);
      setTimeout(render, 600);
    } else {
      msg.textContent = "有些答案还不太对 &mdash; 请检查高亮的空格并重试。";
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
          <h2>恭喜，${team.label}！</h2>
          <p>您已完成示范路线并解开了终极段落。做得好，探索团队！</p>
          <p><strong>请立即返回集合地点。</strong></p>
        </div>
        <div class="gm-only-reset">
          <button type="button" class="reset-link-discreet" id="resetBtn2">重置游戏（仅限主持人）</button>
        </div>
      </div>
      <div class="site-footer">示范路线 &middot; ${team.label}</div>
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
          <h3>确定要重置游戏吗？</h3>
          <p>这将清除 ${team.label} 的所有进度 &mdash; 包括每个检查点的答案和最终段落 &mdash; 并从头开始比赛。此操作无法撤销。</p>
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" id="cancelResetBtn">取消</button>
            <button type="button" class="btn btn-danger" id="confirmResetBtn">是，重置</button>
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
