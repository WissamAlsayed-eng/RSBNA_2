/* ============================================================
   منصة التعلم — محرك الدورات التعليمية (HTML / CSS / JavaScript)
   تحميل تدريجي: يُجلب ملف الدرس JSON فقط عند فتحه
   يعتمد على الأدوات المشتركة في script.js ($, esc, shuffle, ...)
   ============================================================ */
"use strict";

/* ---------- حالة الدورات ---------- */
const LEARN = {
  meta: null,        // محتوى courses.json
  lessons: {},       // كاش الدروس المحملة lessonId -> data
  exams: {},         // كاش ملفات الامتحانات
  allLoaded: false   // هل حُمّلت كل الدروس (للبحث)؟
};

const LS_LEARN_DONE = "learn_done_v1";     // الدروس المنجزة
const LS_LEARN_SCORES = "learn_scores_v1"; // أفضل نتيجة لاختبار كل فصل

// مجلد ملفات كل دورة
const COURSE_DIR = { html: "html", css: "css", js: "javascript" };

/* ---------- أدوات ---------- */
async function fetchJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error("HTTP " + res.status + " — " + path);
  return res.json();
}

async function loadCoursesMeta() {
  if (LEARN.meta) return LEARN.meta;
  LEARN.meta = await fetchJSON("data/courses.json");
  return LEARN.meta;
}

function lessonPath(courseId, lessonId) {
  return "data/" + COURSE_DIR[courseId] + "/" + lessonId + ".json";
}

async function loadLesson(courseId, lessonId) {
  if (LEARN.lessons[lessonId]) return LEARN.lessons[lessonId];
  const data = await fetchJSON(lessonPath(courseId, lessonId));
  LEARN.lessons[lessonId] = data;
  return data;
}

async function loadAllLessons(courseId) {
  const course = getCourse(courseId);
  await Promise.all(course.lessons.map(l => loadLesson(courseId, l.id)));
}

function getCourse(courseId) {
  return LEARN.meta.courses.find(c => c.id === courseId);
}

// إيجاد الدرس ودورته وموقعه من معرفه
function findLesson(lessonId) {
  for (const course of LEARN.meta.courses) {
    const idx = course.lessons.findIndex(l => l.id === lessonId);
    if (idx !== -1) return { course, ref: course.lessons[idx], index: idx };
  }
  return null;
}

/* ---------- التقدم المحفوظ ---------- */
function getLearnDone() {
  try { return JSON.parse(localStorage.getItem(LS_LEARN_DONE)) || {}; }
  catch { return {}; }
}
function setLessonDone(lessonId, done = true) {
  const p = getLearnDone();
  if (done) p[lessonId] = true; else delete p[lessonId];
  localStorage.setItem(LS_LEARN_DONE, JSON.stringify(p));
}
function getLearnScores() {
  try { return JSON.parse(localStorage.getItem(LS_LEARN_SCORES)) || {}; }
  catch { return {}; }
}
function saveLessonScore(lessonId, pct) {
  const s = getLearnScores();
  if (!(s[lessonId] >= pct)) { s[lessonId] = pct; }
  localStorage.setItem(LS_LEARN_SCORES, JSON.stringify(s));
}

function courseProgress(courseId) {
  const course = getCourse(courseId);
  const done = getLearnDone();
  const finished = course.lessons.filter(l => done[l.id]).length;
  const total = course.lessons.length;
  return { finished, total, pct: total ? Math.round((finished / total) * 100) : 0 };
}

/* ============================================================
   تلوين الأكواد (Syntax Highlighting) — خفيف بلا مكتبات
   ============================================================ */
const HL_DEFS = {
  js: [
    { re: /\/\/[^\n]*|\/\*[\s\S]*?\*\//g, cls: "tok-com" },
    { re: /"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`/g, cls: "tok-str" },
    { re: /\b(const|let|var|function|return|if|else|for|while|do|switch|case|default|break|continue|new|typeof|delete|in|of|this|true|false|null|undefined|try|catch|throw|class)\b|=>/g, cls: "tok-kw" },
    { re: /\b\d+(\.\d+)?\b/g, cls: "tok-num" }
  ],
  css: [
    { re: /\/\*[\s\S]*?\*\//g, cls: "tok-com" },
    { re: /"[^"\n]*"|'[^'\n]*'/g, cls: "tok-str" },
    { re: /@[\w-]+/g, cls: "tok-kw" },
    { re: /#[0-9a-fA-F]{3,8}\b/g, cls: "tok-num" },
    { re: /[\w-]+(?=\s*:)/g, cls: "tok-attr" },
    { re: /\b\d+(\.\d+)?(px|em|rem|%|vh|vw|s|ms|deg|fr)?\b/g, cls: "tok-num" }
  ],
  html: [
    { re: /<!--[\s\S]*?-->/g, cls: "tok-com" },
    { re: /<!DOCTYPE[^>]*>/gi, cls: "tok-kw" },
    { re: /"[^"\n]*"/g, cls: "tok-str" },
    { re: /<\/?[a-zA-Z][\w-]*|\/?>/g, cls: "tok-tag" },
    { re: /\s([\w-]+)(?==)/g, cls: "tok-attr" }
  ]
};

function hlCode(src, lang) {
  const defs = HL_DEFS[lang] || [];
  let pos = 0, html = "";
  while (pos < src.length) {
    let best = null, bestCls = "";
    for (const d of defs) {
      d.re.lastIndex = pos;
      const m = d.re.exec(src);
      if (m && m[0].length && (best === null || m.index < best.index)) {
        best = m; bestCls = d.cls;
      }
    }
    if (!best) { html += esc(src.slice(pos)); break; }
    if (best.index > pos) html += esc(src.slice(pos, best.index));
    html += '<span class="' + bestCls + '">' + esc(best[0]) + "</span>";
    pos = best.index + best[0].length;
  }
  return html;
}

/* ---------- بناء معاينة المثال داخل iframe ---------- */
const PREVIEW_BASE_CSS = "body{font-family:Tahoma,Arial,sans-serif;padding:10px;margin:0;line-height:1.7;color:#111}";
const PREVIEW_CONSOLE = "<script>(function(){var box=null;function ensure(){if(!box){box=document.createElement('pre');box.id='__console';box.style.cssText='background:#0f172a;color:#4ade80;padding:8px;border-radius:6px;font-size:12px;direction:ltr;text-align:left;white-space:pre-wrap;margin-top:10px;font-family:Consolas,monospace';document.body.appendChild(box);}}function fmt(a){try{return typeof a==='object'&&a!==null?JSON.stringify(a):String(a);}catch(e){return String(a);}}function add(pre,args){ensure();box.textContent+=pre+Array.prototype.map.call(args,fmt).join(' ')+'\\n';}var ol=console.log,oe=console.error,ow=console.warn;console.log=function(){add('',arguments);ol.apply(console,arguments);};console.error=function(){add('✗ ',arguments);oe.apply(console,arguments);};console.warn=function(){add('⚠ ',arguments);ow.apply(console,arguments);};window.onerror=function(m){add('✗ خطأ: ',[m]);};})();<\/script>";

function buildPreviewDoc(ex) {
  const dir = ex.dir || "rtl";
  const css = PREVIEW_BASE_CSS + (ex.previewCss || "");
  let body = "", script = "";
  if (ex.lang === "html") {
    // إن كان المثال مستندًا كاملًا نعرضه كما هو
    if (/<!DOCTYPE|<html/i.test(ex.source)) return ex.source;
    body = ex.source;
  } else if (ex.lang === "css") {
    body = "<style>" + ex.source + "</style>" + (ex.previewHtml || "");
  } else if (ex.lang === "js") {
    body = (ex.previewHtml || "") + PREVIEW_CONSOLE + "<script>try{" + ex.source + "\n}catch(e){console.error(e.message)}<\/script>";
  }
  return "<!DOCTYPE html><html lang='ar' dir='" + dir + "'><head><meta charset='UTF-8'><style>" + css + "</style></head><body>" + body + script + "</body></html>";
}

/* ---------- نسخ الكود ---------- */
function copyText(text, btn) {
  const ok = () => {
    const old = btn.textContent;
    btn.textContent = "✓ نُسخ!";
    setTimeout(() => { btn.textContent = old; }, 1400);
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(ok).catch(() => fallbackCopy(text, ok));
  } else fallbackCopy(text, ok);
}
function fallbackCopy(text, done) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed"; ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand("copy"); } catch {}
  ta.remove();
  done();
}

/* ============================================================
   صفحة الدورات الرئيسية (#/learn)
   ============================================================ */
function renderLearnHub() {
  const box = $("#view-learn");
  if (!LEARN.meta) {
    box.innerHTML = learnErrorHTML();
    return;
  }
  const done = getLearnDone();
  const totalLessons = LEARN.meta.courses.reduce((s, c) => s + c.lessons.length, 0);
  const totalDone = LEARN.meta.courses.reduce((s, c) => s + c.lessons.filter(l => done[l.id]).length, 0);
  const overallPct = totalLessons ? Math.round((totalDone / totalLessons) * 100) : 0;

  box.innerHTML = `
    <div class="hero glass">
      <h1>🎓 الدورات التعليمية</h1>
      <p>تعلم HTML و CSS و JavaScript من الصفر حتى المستوى المتوسط — دروس منظمة بأمثلة حية قابلة للتجربة، واختبار بعد كل فصل، وامتحان نهائي لكل لغة.</p>
      <div class="progress-wrap">
        <div class="progress-head">
          <span>تقدمك الإجمالي في الدورات</span>
          <span><strong>${totalDone}</strong> من ${totalLessons} درسًا (${overallPct}%)</span>
        </div>
        <div class="progress-bar"><div class="progress-fill" style="width:${overallPct}%"></div></div>
      </div>
    </div>

    <h2 class="section-title">📚 اختر دورتك</h2>
    <div class="courses-grid">
      ${LEARN.meta.courses.map(c => courseCardHTML(c)).join("")}
    </div>

    <h2 class="section-title">🏆 الامتحانات النهائية</h2>
    <div class="exam-cards-grid">
      ${LEARN.meta.exams.map(ex => `
        <div class="card exam-launch-card">
          <div class="exam-launch-icon">${ex.icon}</div>
          <h3>${esc(ex.title)}</h3>
          <p>${ex.lang === "all" ? "يجمع اللغات الثلاث في اختبار ختامي واحد" : "امتحان معد بعناية يغطي كل فصول الدورة"} · ⏱ ${ex.minutes} دقيقة</p>
          <button class="btn btn-primary btn-sm" data-exam="${ex.id}">🚀 ابدأ الامتحان</button>
        </div>`).join("")}
      <div class="card exam-launch-card">
        <div class="exam-launch-icon">🎲</div>
        <h3>الاختبار الشامل العشوائي</h3>
        <p>أسئلة عشوائية من كل فصول اللغات الثلاث معًا — تتجدد في كل مرة</p>
        <button class="btn btn-primary btn-sm" id="exam-random-all">🚀 ابدأ الاختبار</button>
      </div>
    </div>

    <div class="card playground-promo">
      <div>
        <h3>🧪 مختبر الأكواد</h3>
        <p>جرب ما تعلمته فورًا: محررات HTML و CSS و JavaScript مع معاينة مباشرة داخل المتصفح.</p>
      </div>
      <a class="btn btn-primary" href="#/playground">افتح المختبر</a>
    </div>
  `;

  $$("[data-exam]", box).forEach(btn =>
    btn.addEventListener("click", () => startFinalExam(btn.dataset.exam)));
  $("#exam-random-all").addEventListener("click", () => startComprehensiveExam("all"));
}

function courseCardHTML(c) {
  const prog = courseProgress(c.id);
  return `
    <a class="course-card card" href="#/learn/${c.id}" style="--course-color:${c.color}">
      <div class="course-head">
        <span class="course-icon">${c.icon}</span>
        <div>
          <h3>${esc(c.name)}</h3>
          <small>${c.lessons.length} درسًا</small>
        </div>
      </div>
      <p>${esc(c.desc)}</p>
      <div class="progress-head" style="font-size:.82rem">
        <span>${prog.finished} / ${prog.total} درس</span><span>${prog.pct}%</span>
      </div>
      <div class="progress-bar" style="height:8px"><div class="progress-fill" style="width:${prog.pct}%"></div></div>
    </a>`;
}

function learnErrorHTML() {
  return `<div class="empty-state card"><div class="empty-icon">⚠️</div>
    <p>تعذر تحميل بيانات الدورات.</p>
    <p style="font-size:.85rem">شغّل الموقع عبر خادم محلي أو GitHub Pages (فتح الملف مباشرة file:// يمنع تحميل ملفات JSON).</p></div>`;
}

/* ============================================================
   صفحة الدورة الواحدة (#/learn/html)
   ============================================================ */
function renderCoursePage(courseId) {
  const box = $("#view-learn");
  if (!LEARN.meta) { box.innerHTML = learnErrorHTML(); return; }
  const course = getCourse(courseId);
  if (!course) { location.hash = "#/learn"; return; }

  const done = getLearnDone();
  const scores = getLearnScores();
  const prog = courseProgress(courseId);
  const nextLesson = course.lessons.find(l => !done[l.id]) || course.lessons[0];
  const finalExam = LEARN.meta.exams.find(e => e.lang === courseId);

  box.innerHTML = `
    <div class="card lec-hero" style="--course-color:${course.color}">
      <span class="lec-icon-big" style="background:${course.color}22; font-size:2.2rem">${course.icon}</span>
      <div>
        <div class="lec-sub">دورة تعليمية · ${course.lessons.length} درسًا · من الصفر إلى المستوى المتوسط</div>
        <h2>${esc(course.title)}</h2>
      </div>
      <div class="lec-actions">
        <a class="btn btn-primary" href="#/lesson/${nextLesson.id}">${prog.finished ? "⏩ تابع التعلم" : "🚀 ابدأ التعلم"}</a>
      </div>
    </div>

    <div class="card" style="margin-top:14px">
      <div class="progress-head">
        <span>تقدمك في الدورة</span>
        <span><strong>${prog.finished}</strong> من ${prog.total} (${prog.pct}%)</span>
      </div>
      <div class="progress-bar"><div class="progress-fill" style="width:${prog.pct}%"></div></div>
    </div>

    <h2 class="section-title">📖 فصول الدورة</h2>
    <div class="chapter-list">
      ${course.lessons.map((l, i) => {
        const isDone = !!done[l.id];
        const score = scores[l.id];
        return `
        <a class="chapter-row card ${isDone ? "done" : ""}" href="#/lesson/${l.id}">
          <span class="chapter-status">${isDone ? "✓" : i + 1}</span>
          <span class="chapter-icon">${l.icon}</span>
          <span class="chapter-title">${esc(l.title)}</span>
          ${score != null ? `<span class="chip ${score >= 60 ? "success" : "warn"}">اختبار الفصل: ${score}%</span>` : ""}
          <span class="chapter-go">←</span>
        </a>`;
      }).join("")}
    </div>

    <h2 class="section-title">🎯 اختبارات الدورة</h2>
    <div class="exam-cards-grid">
      <div class="card exam-launch-card">
        <div class="exam-launch-icon">🎲</div>
        <h3>الاختبار الشامل — ${esc(course.name)}</h3>
        <p>أسئلة عشوائية من كل فصول الدورة، تتجدد في كل محاولة</p>
        <button class="btn btn-primary btn-sm" id="course-comp-exam">ابدأ الاختبار</button>
      </div>
      ${finalExam ? `
      <div class="card exam-launch-card">
        <div class="exam-launch-icon">${finalExam.icon}</div>
        <h3>${esc(finalExam.title)}</h3>
        <p>امتحان نهاية الدورة المعد بعناية · ⏱ ${finalExam.minutes} دقيقة</p>
        <button class="btn btn-primary btn-sm" id="course-final-exam">ابدأ الامتحان</button>
      </div>` : ""}
    </div>
  `;

  $("#course-comp-exam").addEventListener("click", () => startComprehensiveExam(courseId));
  const fe = $("#course-final-exam");
  if (fe) fe.addEventListener("click", () => startFinalExam(finalExam.id));
}

/* ============================================================
   صفحة الدرس (#/lesson/html-01) — سايدبار + محتوى + اختبار فصل
   ============================================================ */
async function renderLessonPage(lessonId) {
  const box = $("#view-lesson");
  if (!LEARN.meta) { box.innerHTML = learnErrorHTML(); return; }
  const found = findLesson(lessonId);
  if (!found) { location.hash = "#/learn"; return; }
  const { course, index } = found;

  // مؤشر تحميل (يظهر فقط عند أول جلب للدرس — التحميل تدريجي)
  if (!LEARN.lessons[lessonId]) {
    box.innerHTML = `<div class="loading-wrap"><div class="spinner"></div><p>جارٍ تحميل الدرس…</p></div>`;
  }

  let lesson;
  try {
    lesson = await loadLesson(course.id, lessonId);
  } catch (e) {
    box.innerHTML = learnErrorHTML();
    return;
  }
  // إن غادر المستخدم الصفحة أثناء التحميل لا نكمل
  if ((location.hash || "").indexOf("#/lesson/" + lessonId) !== 0) return;

  const prev = course.lessons[index - 1];
  const next = course.lessons[index + 1];
  const isDone = !!getLearnDone()[lessonId];

  box.innerHTML = `
    <div class="lesson-layout">
      <aside class="lesson-sidebar card" id="lesson-sidebar">
        ${sidebarHTML(course, lessonId)}
      </aside>
      <div class="lesson-main">
        <div class="card lesson-head" style="--course-color:${course.color}">
          <div class="lesson-head-top">
            <a class="lesson-course-link" href="#/learn/${course.id}">${course.icon} دورة ${esc(course.name)}</a>
            <span class="chip">الدرس ${index + 1} من ${course.lessons.length}</span>
            ${isDone ? '<span class="chip success">✓ منجز</span>' : ""}
          </div>
          <h1 class="lesson-title">${esc(lesson.title)}</h1>
          <p class="lesson-intro">${esc(lesson.intro)}</p>
        </div>

        <div id="lesson-sections">
          ${lesson.sections.map((s, i) => sectionHTML(s, i)).join("")}
        </div>

        <div class="card lesson-quiz-wrap" id="lesson-quiz-wrap">
          <h2 style="margin-top:0">🎯 اختبار الفصل (${lesson.quiz.length} أسئلة)</h2>
          <p style="color:var(--text-soft)">أجب عن الأسئلة للتحقق من فهمك — النجاح بـ 60% فأكثر يعلّم الدرس منجزًا تلقائيًا.</p>
          <button class="btn btn-primary" id="start-chapter-quiz">🚀 ابدأ اختبار الفصل</button>
          <div id="chapter-quiz-area"></div>
        </div>

        <div class="lesson-nav">
          ${prev ? `<a class="btn" href="#/lesson/${prev.id}">→ السابق: ${esc(prev.title)}</a>` : `<a class="btn" href="#/learn/${course.id}">→ فهرس الدورة</a>`}
          <button class="btn ${isDone ? "" : "btn-success"}" id="mark-done-btn">${isDone ? "✓ درس منجز — إلغاء العلامة" : "✓ أنهيت هذا الدرس"}</button>
          ${next ? `<a class="btn btn-primary" href="#/lesson/${next.id}">التالي: ${esc(next.title)} ←</a>` : `<button class="btn btn-primary" id="goto-course-exam">🏁 أنهيت الدورة — إلى الامتحان</button>`}
        </div>
      </div>
    </div>
  `;

  bindLessonExamples(box, lesson);
  bindSidebar(course, lessonId);

  $("#mark-done-btn").addEventListener("click", () => {
    const now = !getLearnDone()[lessonId];
    setLessonDone(lessonId, now);
    renderLessonPage(lessonId); // إعادة رسم لتحديث الحالة والسايدبار
  });

  const examBtn = $("#goto-course-exam");
  if (examBtn) examBtn.addEventListener("click", () => {
    setLessonDone(lessonId, true);
    location.hash = "#/learn/" + course.id;
  });

  $("#start-chapter-quiz").addEventListener("click", () => {
    $("#start-chapter-quiz").hidden = true;
    renderChapterQuiz($("#chapter-quiz-area"), lesson);
  });
}

/* ---------- السايدبار ---------- */
function sidebarHTML(course, activeId) {
  const done = getLearnDone();
  const prog = courseProgress(course.id);
  return `
    <div class="sidebar-course-head">
      <span>${course.icon}</span>
      <strong>دورة ${esc(course.name)}</strong>
    </div>
    <div class="progress-bar" style="height:8px;margin:8px 0"><div class="progress-fill" style="width:${prog.pct}%"></div></div>
    <div style="font-size:.78rem;color:var(--muted);margin-bottom:10px">${prog.finished} من ${prog.total} درسًا (${prog.pct}%)</div>
    <input type="search" id="sidebar-filter" placeholder="🔎 تصفية الدروس…" />
    <nav class="sidebar-lessons" id="sidebar-lessons">
      ${course.lessons.map((l, i) => `
        <a href="#/lesson/${l.id}" class="sidebar-lesson ${l.id === activeId ? "active" : ""} ${done[l.id] ? "done" : ""}" data-title="${esc(l.title)}">
          <span class="sl-check">${done[l.id] ? "✓" : i + 1}</span>
          <span class="sl-title">${esc(l.title)}</span>
        </a>`).join("")}
    </nav>
    <div class="sidebar-links">
      <a href="#/learn/${course.id}">📖 فهرس الدورة</a>
      <a href="#/learn">🎓 كل الدورات</a>
      <a href="#/playground">🧪 مختبر الأكواد</a>
    </div>`;
}

function bindSidebar() {
  const filter = $("#sidebar-filter");
  if (!filter) return;
  filter.addEventListener("input", () => {
    const term = normalizeAns(filter.value);
    $$(".sidebar-lesson").forEach(a => {
      a.hidden = term && !normalizeAns(a.dataset.title).includes(term);
    });
  });
}

/* ---------- أقسام الدرس ---------- */
function sectionHTML(s, i) {
  let html = `<div class="card lesson-section"><h2 class="lesson-section-title">${esc(s.title)}</h2>`;
  (s.text || []).forEach(p => { html += `<p class="lesson-p">${esc(p)}</p>`; });

  if (s.table) {
    html += `<div class="table-scroll"><table class="lesson-table"><thead><tr>${s.table.head.map(h => `<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>${s.table.rows.map(r => `<tr>${r.map(c => `<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
  }

  (s.examples || []).forEach((ex, j) => {
    const langLabel = { html: "HTML", css: "CSS", js: "JavaScript" }[ex.lang] || ex.lang;
    html += `
      <div class="code-example" data-sec="${i}" data-ex="${j}">
        <div class="code-head">
          <span class="code-lang">${ex.title ? esc(ex.title) + " · " : ""}${langLabel}</span>
          <button class="btn btn-sm copy-btn">📋 نسخ الكود</button>
        </div>
        <pre class="code-block" dir="ltr"><code>${hlCode(ex.source, ex.lang)}</code></pre>
        ${ex.preview ? `<div class="preview-label">النتيجة:</div><div class="preview-slot"></div>` : ""}
      </div>`;
  });

  if (s.notes && s.notes.length) {
    html += `<ul class="lesson-list notes">${s.notes.map(n => `<li>💡 ${esc(n)}</li>`).join("")}</ul>`;
  }
  if (s.tips && s.tips.length) {
    html += `<ul class="lesson-list tips">${s.tips.map(n => `<li>⭐ ${esc(n)}</li>`).join("")}</ul>`;
  }
  if (s.mistakes && s.mistakes.length) {
    html += `<div class="mistakes-head">⚠️ أخطاء شائعة:</div><ul class="lesson-list mistakes">${s.mistakes.map(n => `<li>✗ ${esc(n)}</li>`).join("")}</ul>`;
  }
  html += "</div>";
  return html;
}

// ربط أزرار النسخ وإنشاء إطارات المعاينة
function bindLessonExamples(root, lesson) {
  $$(".code-example", root).forEach(block => {
    const sec = parseInt(block.dataset.sec, 10);
    const exIdx = parseInt(block.dataset.ex, 10);
    const ex = lesson.sections[sec].examples[exIdx];

    $(".copy-btn", block).addEventListener("click", (e) => copyText(ex.source, e.currentTarget));

    const slot = $(".preview-slot", block);
    if (slot) {
      const iframe = document.createElement("iframe");
      iframe.className = "preview-frame";
      iframe.setAttribute("sandbox", "allow-scripts");
      iframe.setAttribute("title", "معاينة المثال");
      iframe.srcdoc = buildPreviewDoc(ex);
      slot.appendChild(iframe);
    }
  });
}

/* ============================================================
   اختبار الفصل (داخل صفحة الدرس)
   ============================================================ */
function renderChapterQuiz(area, lesson) {
  const questions = shuffle(lesson.quiz);
  const state = { answered: 0, correct: 0 };

  area.innerHTML = questions.map((q, i) => `
    <div class="q-card card chapter-q" data-qi="${i}">
      <div class="q-head">
        <span class="q-num">س${i + 1}</span>
        <span class="chip">${TYPE_LABELS[q.type]}</span>
        <span class="chip ${q.diff === "easy" ? "success" : q.diff === "hard" ? "danger" : "warn"}">${DIFF_LABELS[q.diff] || ""}</span>
      </div>
      <div class="q-text">${blanks(esc(q.q))}</div>
      <div class="cq-interact"></div>
      <div class="cq-feedback"></div>
    </div>
  `).join("") + `<div id="chapter-quiz-result"></div>`;

  questions.forEach((q, i) => {
    const card = $(`.chapter-q[data-qi="${i}"]`, area);
    const box = $(".cq-interact", card);
    const fb = $(".cq-feedback", card);

    const record = (ok, detail) => {
      state.answered++;
      if (ok) state.correct++;
      fb.innerHTML = `<div class="feedback ${ok ? "ok" : "no"}">${ok ? "✅ صحيح!" : "❌ خطأ."} ${detail || ""}</div>`;
      if (state.answered === questions.length) showChapterResult(area, lesson, state, questions.length);
    };

    if (q.type === "mcq") {
      box.innerHTML = `<div class="options-list">${q.options.map((o, k) =>
        `<button class="option-btn" data-k="${k}">${["أ", "ب", "ج", "د"][k] || k + 1}) ${esc(o)}</button>`).join("")}</div>`;
      $$(".option-btn", box).forEach(b => b.addEventListener("click", () => {
        const k = parseInt(b.dataset.k, 10);
        const ok = k === q.a;
        $$(".option-btn", box).forEach(x => {
          x.disabled = true;
          const xi = parseInt(x.dataset.k, 10);
          if (xi === q.a) x.classList.add("correct");
          else if (xi === k) x.classList.add("wrong");
        });
        record(ok, (ok ? "" : `الصحيح: <strong>${esc(q.options[q.a])}</strong>. `) + (q.exp ? esc(q.exp) : ""));
      }));
    } else if (q.type === "tf") {
      box.innerHTML = `<div class="tf-row">
        <button class="option-btn" data-v="true">✔ صح</button>
        <button class="option-btn" data-v="false">✘ خطأ</button></div>`;
      $$(".option-btn", box).forEach(b => b.addEventListener("click", () => {
        const v = b.dataset.v === "true";
        const ok = v === q.a;
        $$(".option-btn", box).forEach(x => {
          x.disabled = true;
          const xv = x.dataset.v === "true";
          if (xv === q.a) x.classList.add("correct");
          else if (xv === v) x.classList.add("wrong");
        });
        record(ok, (ok ? "" : `الصحيح: <strong>${q.a ? "صح" : "خطأ"}</strong>. `) + (q.exp ? esc(q.exp) : ""));
      }));
    } else if (q.type === "fill") {
      box.innerHTML = `<div class="fill-row">
        <input type="text" placeholder="اكتب إجابتك…" autocomplete="off" />
        <button class="btn btn-primary btn-sm">تحقق ✓</button></div>`;
      const input = $("input", box);
      const btn = $("button", box);
      const grade = () => {
        if (!input.value.trim()) return;
        const ok = fillMatches(input.value, q.a);
        input.disabled = true; btn.disabled = true;
        record(ok, `الإجابة: <strong>${esc(q.a[0])}</strong>. ` + (q.exp ? esc(q.exp) : ""));
      };
      btn.addEventListener("click", grade);
      input.addEventListener("keydown", e => { if (e.key === "Enter") grade(); });
    }
  });

  area.scrollIntoView({ behavior: "smooth", block: "start" });
}

function showChapterResult(area, lesson, state, total) {
  const pct = Math.round((state.correct / total) * 100);
  const passed = pct >= 60;
  saveLessonScore(lesson.id, pct);
  if (passed) setLessonDone(lesson.id, true);

  $("#chapter-quiz-result", area).innerHTML = `
    <div class="card chapter-result ${passed ? "pass" : "fail"}">
      <div class="score-ring" style="--pct:${pct}"><div class="score-inner">${pct}%</div></div>
      <h3>${passed ? "🎉 أحسنت! اجتزت اختبار الفصل" : "📖 راجع الدرس وأعد المحاولة"}</h3>
      <p>${state.correct} إجابة صحيحة من ${total}${passed ? " — عُلّم الدرس منجزًا ✓" : " — تحتاج 60% للاجتياز"}</p>
      <button class="btn btn-primary btn-sm" id="retry-chapter-quiz">🔄 إعادة الاختبار</button>
    </div>`;

  // تحديث السايدبار بعد الإنجاز
  const found = findLesson(lesson.id);
  if (found) {
    const sb = $("#lesson-sidebar");
    if (sb) { sb.innerHTML = sidebarHTML(found.course, lesson.id); bindSidebar(); }
  }

  $("#retry-chapter-quiz").addEventListener("click", () => renderChapterQuiz(area, lesson));
}

/* ============================================================
   امتحانات الدورات (تستخدم محرك الاختبار الرئيسي في script.js)
   ============================================================ */
function courseQuestionPool(courseId) {
  const course = getCourse(courseId);
  const pool = [];
  course.lessons.forEach((ref, i) => {
    const data = LEARN.lessons[ref.id];
    if (!data) return;
    data.quiz.forEach(q => pool.push({
      ...q,
      lecId: ref.id, lecNum: i + 1, lecTitle: data.title,
      srcLabel: "درس: " + data.title
    }));
  });
  return pool;
}

async function startComprehensiveExam(scope) {
  try {
    let pool = [];
    if (scope === "all") {
      for (const c of LEARN.meta.courses) { await loadAllLessons(c.id); }
      LEARN.meta.courses.forEach(c => { pool = pool.concat(courseQuestionPool(c.id)); });
    } else {
      await loadAllLessons(scope);
      pool = courseQuestionPool(scope);
    }
    const count = Math.min(20, pool.length);
    const label = scope === "all"
      ? "الاختبار الشامل — HTML + CSS + JS"
      : "الاختبار الشامل — " + getCourse(scope).name;
    launchCourseQuiz(label, pool, count, 15);
  } catch (e) {
    alert("تعذر تحميل أسئلة الاختبار — تأكد من تشغيل الموقع عبر خادم.");
  }
}

async function startFinalExam(examId) {
  try {
    const meta = LEARN.meta.exams.find(e => e.id === examId);
    if (!meta) return;
    if (!LEARN.exams[examId]) LEARN.exams[examId] = await fetchJSON(meta.file);
    const exam = LEARN.exams[examId];
    const pool = exam.questions.map(q => ({
      ...q, lecId: examId, lecNum: "", lecTitle: exam.title, srcLabel: exam.title
    }));
    launchCourseQuiz(exam.title, pool, pool.length, exam.minutes || 15);
  } catch (e) {
    alert("تعذر تحميل ملف الامتحان — تأكد من تشغيل الموقع عبر خادم.");
  }
}

function launchCourseQuiz(label, pool, count, minutes) {
  const cfg = {
    scope: "course", label, count, diff: "", types: "objective",
    minutes, customPool: pool
  };
  startQuiz(cfg, shuffle(pool).slice(0, count));
  if (location.hash === "#/quiz") route();
  else location.hash = "#/quiz";
}

/* ============================================================
   البحث في الدروس (يُستدعى من صفحة البحث في script.js)
   ============================================================ */
async function ensureAllCourses() {
  if (LEARN.allLoaded) return;
  for (const c of LEARN.meta.courses) { await loadAllLessons(c.id); }
  LEARN.allLoaded = true;
}

function renderLessonSearchPanel(container) {
  container.innerHTML = `
    <div class="card search-hero">
      <h2 class="section-title" style="margin-top:0">🔎 البحث في الدروس التعليمية</h2>
      <div class="search-row">
        <input type="search" id="lesson-search-input" placeholder="ابحث في كل دروس HTML و CSS و JavaScript… (مثال: flexbox، الروابط، localStorage)" />
      </div>
    </div>
    <div id="lesson-search-results">
      <div class="empty-state card"><div class="empty-icon">📚</div><p>اكتب كلمة للبحث في ${LEARN.meta ? LEARN.meta.courses.reduce((s, c) => s + c.lessons.length, 0) : ""} درسًا.</p></div>
    </div>`;

  let deb;
  $("#lesson-search-input").addEventListener("input", () => {
    clearTimeout(deb);
    deb = setTimeout(runLessonSearch, 300);
  });
}

async function runLessonSearch() {
  const input = $("#lesson-search-input");
  const box = $("#lesson-search-results");
  if (!input || !box) return;
  const term = normalizeAns(input.value);
  if (!term) {
    box.innerHTML = `<div class="empty-state card"><div class="empty-icon">📚</div><p>اكتب كلمة للبحث في الدروس.</p></div>`;
    return;
  }

  if (!LEARN.allLoaded) {
    box.innerHTML = `<div class="loading-wrap"><div class="spinner"></div><p>جارٍ تحميل الدروس للبحث (مرة واحدة فقط)…</p></div>`;
    try { await ensureAllCourses(); }
    catch { box.innerHTML = learnErrorHTML(); return; }
    if (normalizeAns(input.value) !== term) return; // تغير البحث أثناء التحميل
  }

  const results = [];
  for (const course of LEARN.meta.courses) {
    for (const ref of course.lessons) {
      const lesson = LEARN.lessons[ref.id];
      if (!lesson) continue;
      const hits = [];
      if (normalizeAns(lesson.title).includes(term)) hits.push({ where: "عنوان الدرس", text: lesson.title });
      lesson.sections.forEach(s => {
        if (normalizeAns(s.title).includes(term)) hits.push({ where: "قسم", text: s.title });
        (s.text || []).forEach(p => {
          if (normalizeAns(p).includes(term)) hits.push({ where: s.title, text: p });
        });
      });
      if (hits.length) results.push({ course, ref, lesson, hits: hits.slice(0, 2), total: hits.length });
    }
  }

  if (!results.length) {
    box.innerHTML = `<div class="empty-state card"><div class="empty-icon">🤷</div><p>لا نتائج في الدروس — جرّب كلمة أخرى.</p></div>`;
    return;
  }

  box.innerHTML = `
    <p style="color:var(--muted);margin-bottom:12px">وجدت <strong>${results.length}</strong> درسًا مطابقًا:</p>
    ${results.map(r => `
      <a class="card lesson-hit" href="#/lesson/${r.ref.id}">
        <div class="lesson-hit-head">
          <span>${r.course.icon}</span>
          <strong>${esc(r.lesson.title)}</strong>
          <span class="chip">${esc(r.course.name)}</span>
          <span class="chip warn">${r.total} تطابق</span>
        </div>
        ${r.hits.map(h => `<p class="lesson-hit-snippet"><span class="chip success" style="font-size:.68rem">${esc(h.where)}</span> ${snippetAround(h.text, $("#lesson-search-input").value)}</p>`).join("")}
      </a>`).join("")}`;
}

function snippetAround(text, rawTerm) {
  const t = String(text);
  const norm = normalizeAns(t);
  const nterm = normalizeAns(rawTerm);
  let start = 0;
  const idx = norm.indexOf(nterm);
  if (idx > 40) start = idx - 40;
  let snip = t.slice(start, start + 160);
  if (start > 0) snip = "…" + snip;
  if (start + 160 < t.length) snip += "…";
  return highlightText(snip, rawTerm.trim());
}
