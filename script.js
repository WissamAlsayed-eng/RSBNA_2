/* ============================================================
   بنك أسئلة تطبيقات الإنترنت — المحرك الرئيسي
   Vanilla JavaScript — بدون أي مكتبات خارجية
   ============================================================ */
"use strict";

/* ---------- الثوابت العامة ---------- */

// تسميات أنواع الأسئلة بالعربية
const TYPE_LABELS = {
  fill: "أكمل الفراغ",
  tf: "صح أو خطأ",
  mcq: "اختر الإجابة الصحيحة",
  match: "صل بين",
  define: "عرّف",
  explain: "اشرح",
  compare: "قارن",
  reason: "علل",
  why: "لماذا",
  how: "كيف",
  diff: "ما الفرق بين",
  list: "اذكر / عدد",
  short: "سؤال قصير",
  essay: "سؤال مقالي"
};

const DIFF_LABELS = { easy: "سهل", medium: "متوسط", hard: "صعب" };

// الأنواع الموضوعية (تصحيح تلقائي)
const OBJECTIVE_TYPES = ["fill", "tf", "mcq", "match"];

// مفاتيح التخزين المحلي
const LS_THEME = "qbank_theme";
const LS_PROGRESS = "qbank_progress_v1";
const LS_QUIZ_COUNT = "qbank_quiz_count";

/* ---------- الحالة العامة ---------- */
const STATE = {
  meta: null,        // محتوى lectures.json
  lectures: {},      // بيانات كل محاضرة حسب المعرف
  quiz: null,        // حالة الاختبار الجاري
  exam: null         // حالة نموذج الامتحان المعروض
};

/* ---------- أدوات مساعدة ---------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

// تهريب النصوص قبل حقنها في HTML
function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

// تحويل الفراغات ____ إلى شكل مرئي جميل
function blanks(escapedText) {
  return escapedText.replace(/_{2,}/g, '<span class="blank"></span>');
}

// خلط مصفوفة (نسخة جديدة)
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// تطبيع الإجابات النصية للمقارنة المتسامحة (أكمل الفراغ)
function normalizeAns(s) {
  return String(s ?? "")
    .trim().toLowerCase()
    .replace(/[ً-ْـ]/g, "")   // التشكيل والتطويل
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/[<>«»"'،,.:;!؟?()\[\]{}]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// مقارنة إجابة المستخدم مع قائمة الإجابات المقبولة
function fillMatches(userInput, accepted) {
  const u = normalizeAns(userInput);
  if (!u) return false;
  const u2 = u.replace(/^ال/, "");
  return accepted.some(a => {
    const n = normalizeAns(a);
    const n2 = n.replace(/^ال/, "");
    return u === n || u2 === n2;
  });
}

/* ---------- التقدم المحفوظ ---------- */
function getProgress() {
  try { return JSON.parse(localStorage.getItem(LS_PROGRESS)) || {}; }
  catch { return {}; }
}
function saveAnswered(qid, correct) {
  const p = getProgress();
  // لا نستبدل إجابة صحيحة سابقة بخاطئة
  if (p[qid] !== true) p[qid] = !!correct;
  localStorage.setItem(LS_PROGRESS, JSON.stringify(p));
}
function getQuizCount() { return parseInt(localStorage.getItem(LS_QUIZ_COUNT) || "0", 10); }
function incQuizCount() { localStorage.setItem(LS_QUIZ_COUNT, String(getQuizCount() + 1)); }

/* ---------- تجميع الأسئلة ---------- */
function allQuestions() {
  const out = [];
  for (const lec of STATE.meta.lectures) {
    const data = STATE.lectures[lec.id];
    if (!data) continue;
    for (const q of data.questions) out.push({ ...q, lecId: lec.id, lecTitle: lec.title, lecNum: lec.num });
  }
  return out;
}
function lectureQuestions(lecId) {
  const lec = STATE.meta.lectures.find(l => l.id === lecId);
  const data = STATE.lectures[lecId];
  if (!data) return [];
  return data.questions.map(q => ({ ...q, lecId, lecTitle: lec.title, lecNum: lec.num }));
}

/* ---------- تحميل البيانات ---------- */
async function loadData() {
  // المحاولة الأولى: fetch من ملفات JSON (يعمل على GitHub Pages وأي خادم)
  try {
    const meta = await (await fetch("data/question-bank/lectures.json")).json();
    const lecs = {};
    await Promise.all(meta.lectures.map(async l => {
      lecs[l.id] = await (await fetch("data/question-bank/" + l.id + ".json")).json();
    }));
    STATE.meta = meta;
    STATE.lectures = lecs;
    return;
  } catch (e) {
    // الخطة البديلة: النسخة المدمجة embed.js (عند فتح الملف مباشرة بدون خادم)
    if (window.QBANK_EMBED) {
      STATE.meta = window.QBANK_EMBED.meta;
      STATE.lectures = window.QBANK_EMBED.lectures;
      return;
    }
    throw e;
  }
}

/* ============================================================
   التوجيه (Router)
   ============================================================ */
const VIEWS = ["home", "lectures", "lecture", "quiz", "exam", "search", "learn", "lesson", "playground"];

function showView(name) {
  $("#loading").hidden = true;
  VIEWS.forEach(v => { $("#view-" + v).hidden = v !== name; });
  // تفعيل رابط التنقل
  $$("#main-nav a").forEach(a => {
    const nav = a.dataset.nav;
    const active = nav === name ||
      (name === "lecture" && nav === "lectures") ||
      (name === "lesson" && nav === "learn");
    a.classList.toggle("active", active);
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function route() {
  const hash = location.hash || "#/home";
  const parts = hash.replace(/^#\//, "").split("/");
  const page = parts[0] || "home";

  // إيقاف مؤقت اختبار سابق عند مغادرة صفحة الاختبار
  if (page !== "quiz" && STATE.quiz && STATE.quiz.timerId) {
    clearInterval(STATE.quiz.timerId);
    STATE.quiz.timerId = null;
  }

  switch (page) {
    case "home": renderHome(); showView("home"); break;
    case "lectures": renderLecturesPage(); showView("lectures"); break;
    case "lecture":
      if (parts[1] && STATE.lectures[parts[1]]) { renderLecture(parts[1]); showView("lecture"); }
      else { location.hash = "#/lectures"; }
      break;
    case "quiz":
      if (parts[1]) {
        // طلب اختبار محاضرة محددة: نبدأ إعداداً جديداً دائماً
        if (STATE.quiz && STATE.quiz.timerId) clearInterval(STATE.quiz.timerId);
        STATE.quiz = null;
        renderQuizSetup(parts[1]);
      } else if (STATE.quiz && STATE.quiz.finished) renderQuizResults();
      else if (STATE.quiz) { renderQuizQuestion(); if (!STATE.quiz.timerId && STATE.quiz.cfg.minutes > 0 && STATE.quiz.remaining > 0) startTimer(); }
      else renderQuizSetup("");
      showView("quiz");
      break;
    case "exam": renderExamPage(parts[1] || ""); showView("exam"); break;
    case "search": renderSearchPage(); showView("search"); break;
    case "learn":
      if (parts[1]) renderCoursePage(parts[1]);
      else renderLearnHub();
      showView("learn");
      break;
    case "lesson":
      if (parts[1]) { renderLessonPage(parts[1]); showView("lesson"); }
      else { location.hash = "#/learn"; }
      break;
    case "playground": renderPlayground(); showView("playground"); break;
    default: location.hash = "#/home";
  }
}

/* ============================================================
   الصفحة الرئيسية
   ============================================================ */
function renderHome() {
  // إن تعذر تحميل بنك الأسئلة وحده نعرض صفحة الدورات
  if (!STATE.meta) { renderLearnHub(); showView("learn"); return; }
  const lectures = STATE.meta.lectures;
  const questions = allQuestions();
  const totalQ = questions.length;
  const quizCount = lectures.length * 2 + 3; // اختبار لكل محاضرة + عشوائي + شامل + نموذج امتحان لكل محاضرة + شامل

  const progress = getProgress();
  const solved = questions.filter(q => progress[q.id] === true).length;
  const pct = totalQ ? Math.round((solved / totalQ) * 100) : 0;

  $("#view-home").innerHTML = `
    <div class="hero glass">
      <h1>${esc(STATE.meta.siteName)}</h1>
      <p>${esc(STATE.meta.siteDesc)}</p>
      <div class="hero-actions">
        <a class="btn btn-primary" href="#/quiz">🎯 ابدأ اختباراً تفاعلياً</a>
        <a class="btn" href="#/exam">📝 نموذج الامتحان</a>
        <a class="btn btn-ghost" href="#/search">🔎 ابحث في الأسئلة</a>
      </div>

      <div class="stats-grid">
        <div class="stat-card card">
          <div class="stat-icon">📖</div>
          <div class="stat-num">${lectures.length}</div>
          <div class="stat-label">محاضرات</div>
        </div>
        <div class="stat-card card">
          <div class="stat-icon">❓</div>
          <div class="stat-num">${totalQ}</div>
          <div class="stat-label">سؤال في البنك</div>
        </div>
        <div class="stat-card card">
          <div class="stat-icon">🧪</div>
          <div class="stat-num">${quizCount}</div>
          <div class="stat-label">اختبار ونموذج</div>
        </div>
        <div class="stat-card card">
          <div class="stat-icon">🏆</div>
          <div class="stat-num">${getQuizCount()}</div>
          <div class="stat-label">اختبار أنجزته</div>
        </div>
      </div>

      <div class="progress-wrap">
        <div class="progress-head">
          <span>تقدمك في حل بنك الأسئلة</span>
          <span><strong>${solved}</strong> من ${totalQ} (${pct}%)</span>
        </div>
        <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
      </div>
    </div>

    ${typeof LEARN !== "undefined" && LEARN.meta ? `
    <h2 class="section-title">🎓 الدورات التعليمية — تعلم من الصفر</h2>
    <div class="courses-grid">
      ${LEARN.meta.courses.map(c => courseCardHTML(c)).join("")}
    </div>
    <div class="card playground-promo">
      <div>
        <h3>🧪 مختبر الأكواد</h3>
        <p>محررات HTML و CSS و JavaScript مع معاينة فورية — جرب أي كود مباشرة في متصفحك.</p>
      </div>
      <a class="btn btn-primary" href="#/playground">افتح المختبر</a>
    </div>` : ""}

    <h2 class="section-title">📚 محاضرات بنك الأسئلة</h2>
    <div class="lectures-grid">${lectures.map(l => lectureCardHTML(l, progress)).join("")}</div>
  `;
}

function lectureCardHTML(lec, progress) {
  const qs = lectureQuestions(lec.id);
  const solved = qs.filter(q => progress[q.id] === true).length;
  const pct = qs.length ? Math.round((solved / qs.length) * 100) : 0;
  return `
    <a class="lecture-card card" href="#/lecture/${lec.id}">
      <div class="lec-head">
        <span class="lec-icon">${lec.icon}</span>
        <div>
          <div class="lec-num">المحاضرة ${lec.num}</div>
          <h3>${esc(lec.title)}</h3>
        </div>
      </div>
      <p>${esc(lec.about)}</p>
      <div class="lec-meta">
        <span class="chip">❓ ${qs.length} سؤال</span>
        <span class="chip success">✔ ${pct}% محلول</span>
      </div>
      <div class="progress-bar" style="height:8px"><div class="progress-fill" style="width:${pct}%"></div></div>
    </a>`;
}

/* ============================================================
   صفحة قائمة المحاضرات
   ============================================================ */
function renderLecturesPage() {
  const progress = getProgress();
  $("#view-lectures").innerHTML = `
    <h2 class="section-title">📚 جميع المحاضرات</h2>
    <div class="lectures-grid">${STATE.meta.lectures.map(l => lectureCardHTML(l, progress)).join("")}</div>
  `;
}

/* ============================================================
   صفحة المحاضرة (ملخص + تعاريف + أفكار + بنك أسئلة)
   ============================================================ */
function renderLecture(lecId) {
  const lec = STATE.meta.lectures.find(l => l.id === lecId);
  const data = STATE.lectures[lecId];
  const qs = lectureQuestions(lecId);

  const tabs = [
    { id: "summary", label: "📄 الملخص" },
    { id: "defs", label: `📌 التعاريف (${data.definitions.length})` },
    { id: "ideas", label: "💡 الأفكار الرئيسية" },
    { id: "notes", label: "⚠️ ملاحظات مهمة" },
    { id: "expected", label: "🎯 متوقع في الامتحان" },
    { id: "bank", label: `❓ بنك الأسئلة (${qs.length})` }
  ];

  $("#view-lecture").innerHTML = `
    <div class="card lec-hero">
      <span class="lec-icon-big">${lec.icon}</span>
      <div>
        <div class="lec-sub">المحاضرة ${lec.num} · المصدر: ${esc(lec.source)}</div>
        <h2>${esc(lec.title)}</h2>
      </div>
      <div class="lec-actions">
        <a class="btn btn-primary btn-sm" href="#/quiz/${lec.id}">🎯 اختبار هذه المحاضرة</a>
        <a class="btn btn-sm" href="#/exam/${lec.id}">📝 نموذج امتحان</a>
      </div>
    </div>

    <div class="tabs glass" role="tablist">
      ${tabs.map((t, i) => `<button class="tab-btn ${i === 0 ? "active" : ""}" data-tab="${t.id}">${t.label}</button>`).join("")}
    </div>

    <div id="lec-tab-content"></div>
  `;

  const renderTab = (tabId) => {
    const box = $("#lec-tab-content");
    if (tabId === "summary") {
      box.innerHTML = `<div class="card">${data.summary.map(s => `
        <div class="summary-block">
          <h3>🔹 ${esc(s.h)}</h3>
          ${s.t.map(p => `<p>${esc(p)}</p>`).join("")}
        </div>`).join("")}</div>`;
    } else if (tabId === "defs") {
      box.innerHTML = `<div class="def-grid">${data.definitions.map(d => `
        <div class="def-card card">
          <div class="def-term">${esc(d.term)}</div>
          <div class="def-body">${esc(d.def)}</div>
        </div>`).join("")}</div>`;
    } else if (tabId === "ideas") {
      box.innerHTML = `<ul class="idea-list">${data.ideas.map(i => `<li>💡 ${esc(i)}</li>`).join("")}</ul>`;
    } else if (tabId === "notes") {
      box.innerHTML = `<ul class="idea-list notes">${data.notes.map(i => `<li>⚠️ ${esc(i)}</li>`).join("")}</ul>`;
    } else if (tabId === "expected") {
      box.innerHTML = `<ul class="idea-list expected">${data.expected.map(i => `<li>🎯 ${esc(i)}</li>`).join("")}</ul>`;
    } else if (tabId === "bank") {
      renderQuestionBank(box, qs);
    }
  };

  $$(".tab-btn", $("#view-lecture")).forEach(btn => {
    btn.addEventListener("click", () => {
      $$(".tab-btn", $("#view-lecture")).forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderTab(btn.dataset.tab);
    });
  });

  renderTab("summary");
}

/* ---------- بنك أسئلة المحاضرة (وضع التصفح) ---------- */
function renderQuestionBank(box, questions) {
  const types = [...new Set(questions.map(q => q.type))];
  box.innerHTML = `
    <div class="q-toolbar card">
      <select id="bank-type">
        <option value="">كل الأنواع</option>
        ${types.map(t => `<option value="${t}">${TYPE_LABELS[t]}</option>`).join("")}
      </select>
      <select id="bank-diff">
        <option value="">كل المستويات</option>
        <option value="easy">سهل</option>
        <option value="medium">متوسط</option>
        <option value="hard">صعب</option>
      </select>
      <input type="search" id="bank-search" placeholder="🔎 ابحث داخل أسئلة هذه المحاضرة…" />
    </div>
    <div id="bank-list"></div>
  `;

  const apply = () => {
    const t = $("#bank-type").value;
    const d = $("#bank-diff").value;
    const s = normalizeAns($("#bank-search").value);
    const filtered = questions.filter(q =>
      (!t || q.type === t) &&
      (!d || q.diff === d) &&
      (!s || normalizeAns(q.q).includes(s) || normalizeAns(answerText(q)).includes(s))
    );
    const list = $("#bank-list");
    if (!filtered.length) {
      list.innerHTML = `<div class="empty-state card"><div class="empty-icon">🔍</div><p>لا توجد أسئلة مطابقة للتصفية الحالية.</p></div>`;
      return;
    }
    list.innerHTML = filtered.map((q, i) => browseCardHTML(q, i + 1)).join("");
    bindBrowseCards(list, filtered);
  };

  $("#bank-type").addEventListener("change", apply);
  $("#bank-diff").addEventListener("change", apply);
  $("#bank-search").addEventListener("input", apply);
  apply();
}

// نص الإجابة الكامل (للبحث والعرض)
function answerText(q) {
  if (q.type === "tf") return (q.a ? "صح" : "خطأ") + " " + (q.exp || "");
  if (q.type === "mcq") return q.options[q.a] + " " + (q.exp || "");
  if (q.type === "fill") return q.a.join(" أو ");
  if (q.type === "match") return q.pairs.map(p => p[0] + ": " + p[1]).join(" — ");
  return q.a || "";
}

// بطاقة سؤال في وضع التصفح
function browseCardHTML(q, num, highlight = "") {
  let body = "";
  if (q.type === "mcq") {
    body = `<ol class="options-list" style="list-style:none">${q.options.map((o, i) =>
      `<li class="option-btn" style="cursor:default" data-opt="${i}">${["أ", "ب", "ج", "د"][i] || i + 1}) ${esc(o)}</li>`).join("")}</ol>`;
  } else if (q.type === "match") {
    const rights = shuffle(q.pairs.map(p => p[1]));
    body = `<div class="match-grid">${q.pairs.map((p, i) =>
      `<div class="match-row"><span class="match-left">${esc(p[0])}</span><span style="color:var(--muted)">⟸</span><span>${esc(rights[i])}</span></div>`).join("")}
      <p style="color:var(--muted);font-size:.8rem">القيم في العمود الثاني مخلوطة — اضغط "إظهار الإجابة" لرؤية الوصل الصحيح.</p></div>`;
  }
  const qText = highlight ? highlightText(q.q, highlight) : blanks(esc(q.q));
  return `
    <div class="q-card card" data-qid="${q.id}">
      <div class="q-head">
        <span class="q-num">س${num}</span>
        <span class="chip">${TYPE_LABELS[q.type]}</span>
        <span class="chip ${q.diff === "easy" ? "success" : q.diff === "hard" ? "danger" : "warn"}">${DIFF_LABELS[q.diff]}</span>
        ${q.lecTitle ? `<span class="chip">📖 محاضرة ${q.lecNum}</span>` : ""}
      </div>
      <div class="q-text">${qText}</div>
      ${body}
      <button class="btn btn-sm reveal-btn" style="margin-top:10px">👁️ إظهار الإجابة</button>
      <div class="answer-slot"></div>
    </div>`;
}

function revealAnswerHTML(q) {
  let inner = "";
  if (q.type === "tf") {
    inner = `<strong>${q.a ? "✔ صح" : "✘ خطأ"}</strong>${q.exp ? `<div>${esc(q.exp)}</div>` : ""}`;
  } else if (q.type === "mcq") {
    inner = `<strong>${esc(q.options[q.a])}</strong>${q.exp ? `<div>${esc(q.exp)}</div>` : ""}`;
  } else if (q.type === "fill") {
    inner = `<strong>${esc(q.a[0])}</strong>${q.a.length > 1 ? `<div style="font-size:.85rem">إجابات مقبولة أخرى: ${esc(q.a.slice(1).join("، "))}</div>` : ""}`;
  } else if (q.type === "match") {
    inner = q.pairs.map(p => `<div>• <strong>${esc(p[0])}</strong> ⟸ ${esc(p[1])}</div>`).join("");
  } else {
    inner = esc(q.a);
  }
  return `<div class="answer-box"><span class="answer-label">✅ الإجابة النموذجية:</span>${inner}</div>`;
}

function bindBrowseCards(root, questions) {
  $$(".q-card", root).forEach(card => {
    const btn = $(".reveal-btn", card);
    if (!btn) return;
    btn.addEventListener("click", () => {
      const q = questions.find(x => x.id === card.dataset.qid);
      const slot = $(".answer-slot", card);
      if (slot.innerHTML) {
        slot.innerHTML = "";
        btn.textContent = "👁️ إظهار الإجابة";
      } else {
        slot.innerHTML = revealAnswerHTML(q);
        btn.textContent = "🙈 إخفاء الإجابة";
      }
    });
  });
}

/* ============================================================
   الاختبار التفاعلي
   ============================================================ */
function renderQuizSetup(preselectLec) {
  if (!STATE.meta) { location.hash = "#/learn"; return; }
  STATE.quiz = null;
  const lecOptions = STATE.meta.lectures.map(l =>
    `<option value="${l.id}" ${l.id === preselectLec ? "selected" : ""}>محاضرة ${l.num}: ${esc(l.title)}</option>`).join("");

  $("#view-quiz").innerHTML = `
    <div class="card">
      <h2 class="section-title" style="margin-top:0">🎯 إعداد الاختبار التفاعلي</h2>
      <p style="color:var(--text-soft)">اختر نطاق الاختبار وعدد الأسئلة ومستوى الصعوبة، وسيتم توليد اختبار بتصحيح فوري ومؤقت زمني.</p>

      <div class="quiz-setup-grid">
        <div class="form-field">
          <label>نطاق الاختبار</label>
          <select id="qz-scope">
            ${preselectLec ? "" : `<option value="all">🏁 الاختبار الشامل (جميع المحاضرات)</option>
            <option value="random">🎲 اختبار عشوائي (من كل المحاضرات)</option>`}
            ${lecOptions}
            ${preselectLec ? `<option value="all">🏁 الاختبار الشامل (جميع المحاضرات)</option>
            <option value="random">🎲 اختبار عشوائي</option>` : ""}
          </select>
        </div>
        <div class="form-field">
          <label>عدد الأسئلة</label>
          <select id="qz-count">
            <option value="5">5 أسئلة</option>
            <option value="10" selected>10 أسئلة</option>
            <option value="15">15 سؤالاً</option>
            <option value="20">20 سؤالاً</option>
            <option value="30">30 سؤالاً</option>
            <option value="40">40 سؤالاً</option>
          </select>
        </div>
        <div class="form-field">
          <label>مستوى الصعوبة</label>
          <select id="qz-diff">
            <option value="">جميع المستويات</option>
            <option value="easy">سهل</option>
            <option value="medium">متوسط</option>
            <option value="hard">صعب</option>
          </select>
        </div>
        <div class="form-field">
          <label>نوع الأسئلة</label>
          <select id="qz-types">
            <option value="objective" selected>موضوعية — تصحيح تلقائي (فراغات، صح/خطأ، اختيارات، وصل)</option>
            <option value="subjective">كتابية — تقييم ذاتي (عرّف، اشرح، قارن، علل…)</option>
            <option value="mixed">الكل (موضوعية + كتابية)</option>
          </select>
        </div>
        <div class="form-field">
          <label>المؤقت الزمني</label>
          <select id="qz-timer">
            <option value="0">بدون مؤقت</option>
            <option value="5">5 دقائق</option>
            <option value="10" selected>10 دقائق</option>
            <option value="15">15 دقيقة</option>
            <option value="20">20 دقيقة</option>
            <option value="30">30 دقيقة</option>
          </select>
        </div>
      </div>

      <button class="btn btn-primary" id="qz-start" style="font-size:1.05rem">🚀 ابدأ الاختبار</button>
      <p id="qz-warn" style="color:var(--danger);margin-top:10px"></p>
    </div>
  `;

  $("#qz-start").addEventListener("click", () => {
    const cfg = {
      scope: $("#qz-scope").value,
      count: parseInt($("#qz-count").value, 10),
      diff: $("#qz-diff").value,
      types: $("#qz-types").value,
      minutes: parseInt($("#qz-timer").value, 10)
    };
    const pool = buildPool(cfg);
    if (pool.length === 0) {
      $("#qz-warn").textContent = "لا توجد أسئلة مطابقة لهذه الإعدادات — جرّب توسيع الاختيارات.";
      return;
    }
    startQuiz(cfg, pool);
  });
}

function buildPool(cfg) {
  // امتحانات الدورات التعليمية: مجموعة أسئلة مخصصة جاهزة
  if (cfg.customPool) return shuffle(cfg.customPool).slice(0, cfg.count || cfg.customPool.length);

  let pool = cfg.scope === "all" || cfg.scope === "random"
    ? allQuestions()
    : lectureQuestions(cfg.scope);

  if (cfg.diff) pool = pool.filter(q => q.diff === cfg.diff);
  if (cfg.types === "objective") pool = pool.filter(q => OBJECTIVE_TYPES.includes(q.type));
  else if (cfg.types === "subjective") pool = pool.filter(q => !OBJECTIVE_TYPES.includes(q.type));

  if (cfg.scope === "all") {
    // الاختبار الشامل: توزيع متوازن على المحاضرات
    const byLec = {};
    pool.forEach(q => { (byLec[q.lecId] = byLec[q.lecId] || []).push(q); });
    const buckets = Object.values(byLec).map(shuffle);
    const mixed = [];
    let added = true;
    while (mixed.length < cfg.count && added) {
      added = false;
      for (const b of buckets) {
        if (b.length && mixed.length < cfg.count) { mixed.push(b.pop()); added = true; }
      }
    }
    return shuffle(mixed);
  }
  return shuffle(pool).slice(0, cfg.count);
}

function startQuiz(cfg, pool) {
  STATE.quiz = {
    cfg,
    list: pool,
    idx: 0,
    answers: {},          // qid -> {status:'correct'|'wrong'|'skipped', user:'', done:true}
    finished: false,
    startedAt: Date.now(),
    remaining: cfg.minutes * 60,
    timerId: null
  };
  if (cfg.minutes > 0) startTimer();
  renderQuizQuestion();
}

function startTimer() {
  const qz = STATE.quiz;
  qz.timerId = setInterval(() => {
    qz.remaining--;
    const el = $("#quiz-timer");
    if (el) {
      el.textContent = "⏱ " + fmtTime(qz.remaining);
      el.classList.toggle("low", qz.remaining <= 60);
    }
    if (qz.remaining <= 0) {
      clearInterval(qz.timerId);
      qz.timerId = null;
      finishQuiz(true);
    }
  }, 1000);
}

function fmtTime(sec) {
  const m = Math.floor(Math.max(0, sec) / 60);
  const s = Math.max(0, sec) % 60;
  return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
}

function scopeLabel(cfg) {
  if (cfg.label) return cfg.label;
  if (cfg.scope === "all") return "الاختبار الشامل";
  if (cfg.scope === "random") return "اختبار عشوائي";
  const l = STATE.meta.lectures.find(x => x.id === cfg.scope);
  return l ? "اختبار: " + l.title : "اختبار";
}

/* ---------- عرض سؤال الاختبار ---------- */
function renderQuizQuestion() {
  const qz = STATE.quiz;
  const q = qz.list[qz.idx];
  const total = qz.list.length;
  const answered = qz.answers[q.id];
  const pct = Math.round((qz.idx / total) * 100);

  $("#view-quiz").innerHTML = `
    <div class="quiz-top card">
      <span class="chip">${esc(scopeLabel(qz.cfg))}</span>
      <div class="quiz-progress">
        <div class="progress-head"><span>السؤال ${qz.idx + 1} من ${total}</span><span>${pct}%</span></div>
        <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
      </div>
      ${qz.cfg.minutes > 0 ? `<span class="quiz-timer ${qz.remaining <= 60 ? "low" : ""}" id="quiz-timer">⏱ ${fmtTime(qz.remaining)}</span>` : ""}
      <button class="btn btn-danger btn-sm" id="qz-quit">إنهاء الاختبار</button>
    </div>

    <div class="q-card card" id="quiz-qcard">
      <div class="q-head">
        <span class="chip">${TYPE_LABELS[q.type]}</span>
        <span class="chip ${q.diff === "easy" ? "success" : q.diff === "hard" ? "danger" : "warn"}">${DIFF_LABELS[q.diff]}</span>
        <span class="chip">📖 ${q.srcLabel ? esc(q.srcLabel) : "محاضرة " + q.lecNum}</span>
      </div>
      <div class="q-text">${blanks(esc(q.q))}</div>
      <div id="quiz-interaction"></div>
      <div id="quiz-feedback"></div>
    </div>

    <div class="quiz-nav">
      <button class="btn" id="qz-prev" ${qz.idx === 0 ? "disabled" : ""}>→ السابق</button>
      <button class="btn btn-primary" id="qz-next">${qz.idx === total - 1 ? "🏁 عرض النتيجة" : "التالي ←"}</button>
    </div>
  `;

  $("#qz-quit").addEventListener("click", () => finishQuiz(false));
  $("#qz-prev").addEventListener("click", () => { if (qz.idx > 0) { qz.idx--; renderQuizQuestion(); } });
  $("#qz-next").addEventListener("click", () => {
    // السؤال غير المجاب يعتبر متروكاً
    if (!qz.answers[q.id]) qz.answers[q.id] = { status: "skipped", user: "" };
    if (qz.idx === total - 1) finishQuiz(false);
    else { qz.idx++; renderQuizQuestion(); }
  });

  renderInteraction(q, answered);
}

function renderInteraction(q, prev) {
  const box = $("#quiz-interaction");
  const fb = $("#quiz-feedback");

  const showFeedback = (ok, detail) => {
    fb.innerHTML = `<div class="feedback ${ok ? "ok" : "no"}">${ok ? "✅ إجابة صحيحة، أحسنت!" : "❌ إجابة خاطئة."}
      ${detail ? `<div class="fb-detail">${detail}</div>` : ""}</div>`;
  };

  const record = (status, user) => {
    STATE.quiz.answers[q.id] = { status, user };
    saveAnswered(q.id, status === "correct");
  };

  /* --- اختيار من متعدد --- */
  if (q.type === "mcq") {
    box.innerHTML = `<div class="options-list">${q.options.map((o, i) =>
      `<button class="option-btn" data-i="${i}">${["أ", "ب", "ج", "د"][i] || i + 1}) ${esc(o)}</button>`).join("")}</div>`;
    const btns = $$(".option-btn", box);
    const lock = (chosen) => {
      btns.forEach(b => {
        b.disabled = true;
        const i = parseInt(b.dataset.i, 10);
        if (i === q.a) b.classList.add("correct");
        else if (i === chosen && chosen !== q.a) b.classList.add("wrong");
      });
    };
    if (prev && prev.status !== "skipped") {
      lock(prev.userIdx);
      showFeedback(prev.status === "correct", q.exp ? esc(q.exp) : "");
    } else {
      btns.forEach(b => b.addEventListener("click", () => {
        const i = parseInt(b.dataset.i, 10);
        const ok = i === q.a;
        lock(i);
        STATE.quiz.answers[q.id] = { status: ok ? "correct" : "wrong", user: q.options[i], userIdx: i };
        saveAnswered(q.id, ok);
        showFeedback(ok, (ok ? "" : `الإجابة الصحيحة: <strong>${esc(q.options[q.a])}</strong>. `) + (q.exp ? esc(q.exp) : ""));
      }));
    }
    return;
  }

  /* --- صح أو خطأ --- */
  if (q.type === "tf") {
    box.innerHTML = `<div class="tf-row">
      <button class="option-btn" data-v="true">✔ صح</button>
      <button class="option-btn" data-v="false">✘ خطأ</button>
    </div>`;
    const btns = $$(".option-btn", box);
    const lock = (chosenVal) => {
      btns.forEach(b => {
        b.disabled = true;
        const v = b.dataset.v === "true";
        if (v === q.a) b.classList.add("correct");
        else if (v === chosenVal && chosenVal !== q.a) b.classList.add("wrong");
      });
    };
    if (prev && prev.status !== "skipped") {
      lock(prev.userVal);
      showFeedback(prev.status === "correct", q.exp ? esc(q.exp) : "");
    } else {
      btns.forEach(b => b.addEventListener("click", () => {
        const v = b.dataset.v === "true";
        const ok = v === q.a;
        lock(v);
        STATE.quiz.answers[q.id] = { status: ok ? "correct" : "wrong", user: v ? "صح" : "خطأ", userVal: v };
        saveAnswered(q.id, ok);
        showFeedback(ok, (ok ? "" : `الإجابة الصحيحة: <strong>${q.a ? "صح" : "خطأ"}</strong>. `) + (q.exp ? esc(q.exp) : ""));
      }));
    }
    return;
  }

  /* --- أكمل الفراغ --- */
  if (q.type === "fill") {
    box.innerHTML = `<div class="fill-row">
      <input type="text" id="fill-input" placeholder="اكتب إجابتك هنا…" autocomplete="off" />
      <button class="btn btn-primary" id="fill-check">تحقق ✓</button>
    </div>`;
    const input = $("#fill-input");
    const btn = $("#fill-check");

    const grade = () => {
      const val = input.value;
      if (!val.trim()) return;
      const ok = fillMatches(val, q.a);
      input.disabled = true; btn.disabled = true;
      record(ok ? "correct" : "wrong", val);
      let detail = `الإجابة الصحيحة: <strong>${esc(q.a[0])}</strong>`;
      if (!ok) detail += ` — <button class="btn btn-sm" id="fill-override">كانت إجابتي صحيحة بصياغة أخرى ✓</button>`;
      showFeedback(ok, detail);
      const ov = $("#fill-override");
      if (ov) ov.addEventListener("click", () => {
        record("correct", val);
        showFeedback(true, `الإجابة الصحيحة: <strong>${esc(q.a[0])}</strong> (تم احتسابها صحيحة)`);
      });
    };
    btn.addEventListener("click", grade);
    input.addEventListener("keydown", e => { if (e.key === "Enter") grade(); });

    if (prev && prev.status !== "skipped") {
      input.value = prev.user || ""; input.disabled = true; btn.disabled = true;
      showFeedback(prev.status === "correct", `الإجابة الصحيحة: <strong>${esc(q.a[0])}</strong>`);
    } else {
      setTimeout(() => input.focus(), 60);
    }
    return;
  }

  /* --- صل بين --- */
  if (q.type === "match") {
    const rights = shuffle(q.pairs.map(p => p[1]));
    box.innerHTML = `<div class="match-grid">
      ${q.pairs.map((p, i) => `
        <div class="match-row" data-row="${i}">
          <span class="match-left">${esc(p[0])}</span>
          <span style="color:var(--muted)">⟸</span>
          <select data-i="${i}">
            <option value="">— اختر الإجابة —</option>
            ${rights.map(r => `<option value="${esc(r)}">${esc(r)}</option>`).join("")}
          </select>
        </div>`).join("")}
      <button class="btn btn-primary" id="match-check" style="align-self:flex-start">تحقق ✓</button>
    </div>`;

    const check = () => {
      let allChosen = true, correctCount = 0;
      q.pairs.forEach((p, i) => {
        const sel = $(`select[data-i="${i}"]`, box);
        const row = $(`.match-row[data-row="${i}"]`, box);
        if (!sel.value) allChosen = false;
        const ok = sel.value === p[1];
        if (ok) correctCount++;
        row.classList.add(ok ? "correct" : "wrong");
        sel.disabled = true;
      });
      if (!allChosen && correctCount === 0) { /* يسمح بالتحقق الجزئي */ }
      $("#match-check").disabled = true;
      const ok = correctCount === q.pairs.length;
      record(ok ? "correct" : "wrong", `${correctCount}/${q.pairs.length}`);
      showFeedback(ok, ok ? "" : `أصبت في ${correctCount} من ${q.pairs.length}. الوصل الصحيح:<br>` +
        q.pairs.map(p => `• <strong>${esc(p[0])}</strong> ⟸ ${esc(p[1])}`).join("<br>"));
    };
    $("#match-check").addEventListener("click", check);

    if (prev && prev.status !== "skipped") {
      $$("select", box).forEach(s => s.disabled = true);
      $("#match-check").disabled = true;
      showFeedback(prev.status === "correct",
        q.pairs.map(p => `• <strong>${esc(p[0])}</strong> ⟸ ${esc(p[1])}`).join("<br>"));
    }
    return;
  }

  /* --- الأسئلة الكتابية (تقييم ذاتي) --- */
  box.innerHTML = `
    <textarea class="self-answer" id="self-answer" placeholder="اكتب إجابتك هنا (اختياري) ثم قارنها بالإجابة النموذجية…"></textarea>
    <button class="btn btn-primary" id="show-model">📖 إظهار الإجابة النموذجية</button>
    <div id="model-slot"></div>
  `;
  $("#show-model").addEventListener("click", () => {
    $("#model-slot").innerHTML = `
      ${revealAnswerHTML(q)}
      <p style="margin-top:10px;font-weight:700">قيّم إجابتك بنفسك:</p>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-success btn-sm" id="self-ok">✔ أجبت إجابة صحيحة</button>
        <button class="btn btn-danger btn-sm" id="self-no">✘ أخطأت / لم أعرف</button>
      </div>`;
    $("#show-model").disabled = true;
    $("#self-ok").addEventListener("click", () => {
      record("correct", $("#self-answer").value);
      showFeedback(true, "");
      $("#self-ok").disabled = true; $("#self-no").disabled = true;
    });
    $("#self-no").addEventListener("click", () => {
      record("wrong", $("#self-answer").value);
      showFeedback(false, "راجع الإجابة النموذجية أعلاه جيداً.");
      $("#self-ok").disabled = true; $("#self-no").disabled = true;
    });
  });

  if (prev && prev.status !== "skipped") {
    $("#self-answer").value = prev.user || "";
    $("#self-answer").disabled = true;
    $("#model-slot").innerHTML = revealAnswerHTML(q);
    $("#show-model").disabled = true;
    showFeedback(prev.status === "correct", "");
  }
}

/* ---------- إنهاء الاختبار والنتائج ---------- */
function finishQuiz(timeUp) {
  const qz = STATE.quiz;
  if (!qz || qz.finished) return;
  if (qz.timerId) { clearInterval(qz.timerId); qz.timerId = null; }
  // الأسئلة التي لم تجب تعتبر متروكة
  qz.list.forEach(q => { if (!qz.answers[q.id]) qz.answers[q.id] = { status: "skipped", user: "" }; });
  qz.finished = true;
  qz.timeUp = !!timeUp;
  qz.elapsed = Math.round((Date.now() - qz.startedAt) / 1000);
  incQuizCount();
  renderQuizResults();
}

function renderQuizResults() {
  const qz = STATE.quiz;
  const total = qz.list.length;
  const correct = qz.list.filter(q => qz.answers[q.id].status === "correct").length;
  const wrong = qz.list.filter(q => qz.answers[q.id].status === "wrong").length;
  const skipped = total - correct - wrong;
  const pct = Math.round((correct / total) * 100);
  const grade =
    pct >= 90 ? "🏆 ممتاز — أداء رائع!" :
    pct >= 75 ? "🥇 جيد جداً — اقتربت من الإتقان" :
    pct >= 60 ? "🥈 جيد — تحتاج مراجعة بسيطة" :
    pct >= 50 ? "🥉 مقبول — راجع الملخصات جيداً" :
    "📖 تحتاج إلى مذاكرة أعمق — راجع المحاضرة وأعد المحاولة";

  const wrongItems = qz.list.filter(q => qz.answers[q.id].status !== "correct");

  $("#view-quiz").innerHTML = `
    <div class="card result-hero">
      ${qz.timeUp ? `<p class="chip danger" style="margin-bottom:12px">⏱ انتهى الوقت!</p>` : ""}
      <div class="score-ring" style="--pct:${pct}"><div class="score-inner">${pct}%</div></div>
      <h2 style="margin-bottom:6px">${esc(scopeLabel(qz.cfg))}</h2>
      <p style="color:var(--text-soft)">${grade}</p>
      <div class="result-stats">
        <span class="chip success">✔ صحيحة: ${correct}</span>
        <span class="chip danger">✘ خاطئة: ${wrong}</span>
        <span class="chip warn">⏭ متروكة: ${skipped}</span>
        <span class="chip">⏱ الوقت: ${fmtTime(qz.elapsed)}</span>
      </div>
      <div class="hero-actions">
        <button class="btn btn-primary" id="res-retry">🔄 إعادة الاختبار</button>
        <button class="btn" id="res-new">⚙️ اختبار جديد</button>
        <a class="btn btn-ghost" href="#/home">🏠 الرئيسية</a>
      </div>
    </div>

    ${wrongItems.length ? `
      <h2 class="section-title">🩺 مراجعة الأخطاء (${wrongItems.length})</h2>
      <div id="review-list">
        ${wrongItems.map((q, i) => {
          const ans = qz.answers[q.id];
          return `
          <div class="q-card card review-item">
            <div class="q-head">
              <span class="q-num">س${i + 1}</span>
              <span class="chip">${TYPE_LABELS[q.type]}</span>
              <span class="chip">📖 ${q.srcLabel ? esc(q.srcLabel) : "محاضرة " + q.lecNum}</span>
              <span class="chip ${ans.status === "skipped" ? "warn" : "danger"}">${ans.status === "skipped" ? "متروك" : "خطأ"}</span>
            </div>
            <div class="q-text">${blanks(esc(q.q))}</div>
            ${ans.user ? `<div class="review-user-answer">إجابتك: ${esc(String(ans.user))}</div>` : ""}
            ${revealAnswerHTML(q)}
          </div>`;
        }).join("")}
      </div>` : `<div class="card empty-state"><div class="empty-icon">🎉</div><p>لا توجد أخطاء — إجابات كاملة الصحة، أحسنت!</p></div>`}
  `;

  $("#res-retry").addEventListener("click", () => {
    const cfg = qz.cfg;
    const pool = buildPool(cfg);
    startQuiz(cfg, pool);
  });
  $("#res-new").addEventListener("click", () => renderQuizSetup(""));
}

/* ============================================================
   نموذج الامتحان الجامعي
   ============================================================ */
function renderExamPage(preselect) {
  const lecOptions = STATE.meta.lectures.map(l =>
    `<option value="${l.id}" ${l.id === preselect ? "selected" : ""}>محاضرة ${l.num}: ${esc(l.title)}</option>`).join("");

  $("#view-exam").innerHTML = `
    <div class="card">
      <h2 class="section-title" style="margin-top:0">📝 مولّد نماذج الامتحان</h2>
      <p style="color:var(--text-soft)">يولد نموذج امتحان بنفس أسلوب الامتحان الجامعي: أتمتة (فراغات)، أجب عن ثلاثة أسئلة، اشرح مع المقارنة، ووضح آلية الاستخدام والفرق.</p>
      <div class="exam-toolbar" style="margin-top:14px">
        <select id="exam-scope" class="btn" style="cursor:pointer">
          <option value="all" ${!preselect ? "selected" : ""}>🏁 امتحان شامل — جميع المحاضرات</option>
          ${lecOptions}
        </select>
        <button class="btn btn-primary" id="exam-generate">🎲 توليد نموذج جديد</button>
        <button class="btn" id="exam-answers" disabled>👁️ إظهار الإجابات النموذجية</button>
        <button class="btn" id="exam-print" disabled>🖨️ طباعة النموذج</button>
      </div>
    </div>
    <div id="exam-paper-slot" style="margin-top:18px"></div>
  `;

  $("#exam-generate").addEventListener("click", generateExam);
  $("#exam-answers").addEventListener("click", toggleExamAnswers);
  $("#exam-print").addEventListener("click", () => window.print());

  generateExam();
}

function pickByTypes(pool, types, n, used) {
  const cands = shuffle(pool.filter(q => types.includes(q.type) && !used.has(q.id)));
  const out = cands.slice(0, n);
  out.forEach(q => used.add(q.id));
  return out;
}

function generateExam() {
  const scope = $("#exam-scope").value;
  const pool = scope === "all" ? allQuestions() : lectureQuestions(scope);
  const used = new Set();

  const q1 = pickByTypes(pool, ["fill"], 10, used);
  const q2 = pickByTypes(pool, ["define", "list", "short", "why", "reason"], 6, used);
  const q3 = pickByTypes(pool, ["compare"], 2, used);
  if (q3.length < 2) q3.push(...pickByTypes(pool, ["diff"], 2 - q3.length, used));
  const q4 = pickByTypes(pool, ["how"], 2, used);
  if (q4.length < 2) q4.push(...pickByTypes(pool, ["explain", "diff"], 2 - q4.length, used));

  STATE.exam = { q1, q2, q3, q4, showAnswers: false, scope };

  const scopeName = scope === "all"
    ? "امتحان شامل — جميع المحاضرات"
    : "امتحان: " + ((STATE.meta.lectures.find(l => l.id === scope) || {}).title || "");

  const item = (q, i) => `
    <div class="exam-item" data-qid="${q.id}">
      <div class="exam-item-q">${i + 1}. ${blanks(esc(q.q))}
        <span class="chip" style="font-size:.7rem">محاضرة ${q.lecNum}</span>
      </div>
      <div class="exam-ans" hidden>${revealAnswerHTML(q)}</div>
    </div>`;

  $("#exam-paper-slot").innerHTML = `
    <div class="exam-paper card">
      <div class="exam-header">
        <h2>${esc(STATE.meta.siteName)}</h2>
        <p>${esc(scopeName)} · نموذج تدريبي مولّد تلقائياً من بنك الأسئلة</p>
        <p>التاريخ: ${new Date().toLocaleDateString("ar-EG")} — أجب عن الأسئلة الآتية:</p>
      </div>

      <div class="exam-q-title">السؤال الأول: أتمتة — أكمل الفراغات التالية بما يناسبها</div>
      <p class="exam-q-note">(${q1.length} فراغات — ركّز على التعاريف والمصطلحات والكلمات المفتاحية)</p>
      ${q1.map(item).join("")}

      <div class="exam-q-title">السؤال الثاني: أجب عن ثلاثة أسئلة فقط مما يأتي</div>
      <p class="exam-q-note">(اختر أي ${Math.min(3, q2.length)} أسئلة من الأسئلة الـ${q2.length} التالية كما في الامتحان الحقيقي)</p>
      ${q2.map(item).join("")}

      <div class="exam-q-title">السؤال الثالث: اشرح مع المقارنة</div>
      <p class="exam-q-note">(وضّح أوجه التشابه والاختلاف، واذكر المزايا والعيوب والاستخدامات عند الحاجة)</p>
      ${q3.map(item).join("")}

      <div class="exam-q-title">السؤال الرابع: وضح آلية الاستخدام والفرق مع شرح لتوضيح الفكرة</div>
      <p class="exam-q-note">(اشرح كيفية عمل التقنية أو المفهوم وخطوات استخدامه والفرق بينه وبين التقنيات المشابهة مع الأمثلة)</p>
      ${q4.map(item).join("")}

      <p style="text-align:center;color:var(--muted);margin-top:24px">— انتهت الأسئلة، بالتوفيق —</p>
    </div>
  `;

  $("#exam-answers").disabled = false;
  $("#exam-print").disabled = false;
  $("#exam-answers").textContent = "👁️ إظهار الإجابات النموذجية";
}

function toggleExamAnswers() {
  const ex = STATE.exam;
  if (!ex) return;
  ex.showAnswers = !ex.showAnswers;
  $$(".exam-ans").forEach(el => { el.hidden = !ex.showAnswers; });
  $("#exam-answers").textContent = ex.showAnswers ? "🙈 إخفاء الإجابات النموذجية" : "👁️ إظهار الإجابات النموذجية";
}

/* ============================================================
   البحث الشامل
   ============================================================ */
function highlightText(text, term) {
  const escaped = esc(text);
  if (!term) return blanks(escaped);
  try {
    const safe = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return blanks(escaped.replace(new RegExp("(" + esc(safe) + ")", "gi"), "<mark>$1</mark>"));
  } catch { return blanks(escaped); }
}

function renderSearchPage() {
  const view = $("#view-search");
  view.innerHTML = `
    <div class="tabs glass search-mode-tabs">
      <button class="tab-btn active" data-mode="qbank">❓ بنك الأسئلة</button>
      <button class="tab-btn" data-mode="lessons">🎓 الدروس التعليمية</button>
    </div>
    <div id="search-panel"></div>
  `;

  const panel = $("#search-panel");
  const renderMode = (mode) => {
    if (mode === "lessons" && typeof renderLessonSearchPanel === "function" && LEARN.meta) {
      renderLessonSearchPanel(panel);
    } else if (STATE.meta) {
      renderQbankSearchPanel(panel);
    } else {
      renderLessonSearchPanel(panel);
    }
  };

  $$(".search-mode-tabs .tab-btn", view).forEach(btn => {
    btn.addEventListener("click", () => {
      $$(".search-mode-tabs .tab-btn", view).forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderMode(btn.dataset.mode);
    });
  });

  renderMode("qbank");
}

function renderQbankSearchPanel(panel) {
  const types = Object.keys(TYPE_LABELS);
  panel.innerHTML = `
    <div class="card search-hero">
      <h2 class="section-title" style="margin-top:0">🔎 البحث في بنك الأسئلة</h2>
      <div class="search-row">
        <input type="search" id="global-search" placeholder="اكتب كلمة للبحث في ${allQuestions().length} سؤال… (مثال: التبديل الحزمي، DNS، flex)" />
        <select id="search-lec" class="btn" style="cursor:pointer">
          <option value="">كل المحاضرات</option>
          ${STATE.meta.lectures.map(l => `<option value="${l.id}">محاضرة ${l.num}: ${esc(l.title)}</option>`).join("")}
        </select>
        <select id="search-type" class="btn" style="cursor:pointer">
          <option value="">كل أنواع الأسئلة</option>
          ${types.map(t => `<option value="${t}">${TYPE_LABELS[t]}</option>`).join("")}
        </select>
      </div>
    </div>
    <div id="search-results">
      <div class="empty-state card"><div class="empty-icon">🔍</div><p>اكتب في مربع البحث أو اختر محاضرة/نوعاً لعرض الأسئلة.</p></div>
    </div>
  `;

  const run = () => {
    const term = $("#global-search").value.trim();
    const lec = $("#search-lec").value;
    const type = $("#search-type").value;
    const box = $("#search-results");

    if (!term && !lec && !type) {
      box.innerHTML = `<div class="empty-state card"><div class="empty-icon">🔍</div><p>اكتب في مربع البحث أو اختر محاضرة/نوعاً لعرض الأسئلة.</p></div>`;
      return;
    }

    const nterm = normalizeAns(term);
    let results = allQuestions().filter(q =>
      (!lec || q.lecId === lec) &&
      (!type || q.type === type) &&
      (!nterm || normalizeAns(q.q).includes(nterm) || normalizeAns(answerText(q)).includes(nterm))
    );

    if (!results.length) {
      box.innerHTML = `<div class="empty-state card"><div class="empty-icon">🤷</div><p>لا توجد نتائج مطابقة — جرّب كلمة أخرى أو وسّع التصفية.</p></div>`;
      return;
    }

    const shown = results.slice(0, 60);
    box.innerHTML = `
      <p style="color:var(--muted);margin-bottom:12px">تم العثور على <strong>${results.length}</strong> نتيجة${results.length > 60 ? " (تعرض أول 60)" : ""}:</p>
      ${shown.map((q, i) => browseCardHTML(q, i + 1, term)).join("")}
    `;
    bindBrowseCards(box, shown);
  };

  let deb;
  $("#global-search").addEventListener("input", () => { clearTimeout(deb); deb = setTimeout(run, 250); });
  $("#search-lec").addEventListener("change", run);
  $("#search-type").addEventListener("change", run);
}

/* ============================================================
   المظهر (ليلي / نهاري)
   ============================================================ */
function initTheme() {
  const saved = localStorage.getItem(LS_THEME);
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = saved || (prefersDark ? "dark" : "light");
  document.documentElement.setAttribute("data-theme", theme);

  $("#theme-toggle").addEventListener("click", () => {
    const cur = document.documentElement.getAttribute("data-theme");
    const next = cur === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem(LS_THEME, next);
  });
}

/* ============================================================
   الإقلاع
   ============================================================ */
async function init() {
  initTheme();
  // تحميل بنك الأسئلة وفهرس الدورات معًا (فهرس الدورات خفيف —
  // أما الدروس نفسها فتُحمّل تدريجيًا عند فتح كل درس فقط)
  const [qbankOk, coursesOk] = await Promise.all([
    loadData().then(() => true).catch(() => false),
    loadCoursesMeta().then(() => true).catch(() => false)
  ]);

  if (!qbankOk && !coursesOk) {
    $("#loading").innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">⚠️</div>
        <p>تعذر تحميل بيانات الموقع.</p>
        <p style="font-size:.85rem">فتح الملف مباشرة (file://) يمنع تحميل ملفات JSON —
        ارفع المشروع على GitHub Pages أو شغّل خادمًا محليًا
        (مثال: <code dir="ltr">python -m http.server</code> داخل مجلد المشروع).</p>
      </div>`;
    return;
  }

  window.addEventListener("hashchange", route);
  route();
}

document.addEventListener("DOMContentLoaded", init);