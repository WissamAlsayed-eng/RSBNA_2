/* ============================================================
   مختبر الأكواد (Code Playground)
   محررات HTML/CSS/JS + معاينة مباشرة داخل iframe معزول
   يعمل بالكامل داخل المتصفح بلا أي خادم أو مكتبات
   ============================================================ */
"use strict";

const PG_KEYS = { html: "pg_html_v1", css: "pg_css_v1", js: "pg_js_v1" };

/* ---------- أمثلة جاهزة ---------- */
const PG_EXAMPLES = [
  {
    id: "welcome",
    name: "👋 بطاقة ترحيب",
    html: "<div class=\"card\">\n  <h1>أهلًا بك في المختبر!</h1>\n  <p>عدّل الكود ثم اضغط <b>تشغيل ▶</b></p>\n  <button id=\"btn\">اضغطني</button>\n</div>",
    css: ".card {\n  max-width: 320px;\n  margin: 30px auto;\n  padding: 24px;\n  text-align: center;\n  background: linear-gradient(135deg, #6366f1, #06b6d4);\n  color: white;\n  border-radius: 16px;\n  font-family: Tahoma, sans-serif;\n}\nbutton {\n  padding: 8px 22px;\n  border: none;\n  border-radius: 8px;\n  cursor: pointer;\n  font-weight: bold;\n}",
    js: "document.getElementById(\"btn\").addEventListener(\"click\", () => {\n  alert(\"🎉 يعمل بنجاح!\");\n});"
  },
  {
    id: "counter",
    name: "🔢 زر عداد",
    html: "<div class=\"wrap\">\n  <h2 id=\"num\">0</h2>\n  <button id=\"inc\">+ زيادة</button>\n  <button id=\"reset\">تصفير</button>\n</div>",
    css: ".wrap { text-align: center; font-family: Tahoma; margin-top: 40px; }\n#num { font-size: 3rem; color: #6366f1; }\nbutton { padding: 8px 20px; margin: 4px; cursor: pointer; border-radius: 8px; border: 1px solid #6366f1; background: #eef2ff; }",
    js: "let count = 0;\nconst num = document.getElementById(\"num\");\n\ndocument.getElementById(\"inc\").addEventListener(\"click\", () => {\n  count++;\n  num.textContent = count;\n});\n\ndocument.getElementById(\"reset\").addEventListener(\"click\", () => {\n  count = 0;\n  num.textContent = count;\n});"
  },
  {
    id: "calc",
    name: "🧮 آلة حاسبة بسيطة",
    html: "<div class=\"calc\">\n  <input id=\"a\" type=\"number\" placeholder=\"الرقم الأول\">\n  <select id=\"op\">\n    <option value=\"+\">+</option>\n    <option value=\"-\">−</option>\n    <option value=\"*\">×</option>\n    <option value=\"/\">÷</option>\n  </select>\n  <input id=\"b\" type=\"number\" placeholder=\"الرقم الثاني\">\n  <button id=\"go\">احسب =</button>\n  <h2 id=\"result\"></h2>\n</div>",
    css: ".calc { max-width: 300px; margin: 30px auto; text-align: center; font-family: Tahoma; }\ninput, select, button { padding: 8px; margin: 4px; border-radius: 8px; border: 1px solid #cbd5e1; }\nbutton { background: #6366f1; color: white; border: none; cursor: pointer; }\n#result { color: #10b981; }",
    js: "document.getElementById(\"go\").addEventListener(\"click\", () => {\n  const a = Number(document.getElementById(\"a\").value);\n  const b = Number(document.getElementById(\"b\").value);\n  const op = document.getElementById(\"op\").value;\n  let r;\n  if (op === \"+\") r = a + b;\n  else if (op === \"-\") r = a - b;\n  else if (op === \"*\") r = a * b;\n  else r = b === 0 ? \"لا قسمة على صفر!\" : a / b;\n  document.getElementById(\"result\").textContent = \"الناتج: \" + r;\n});"
  },
  {
    id: "todo",
    name: "📝 قائمة مهام",
    html: "<div class=\"todo\">\n  <h2>مهامي</h2>\n  <form id=\"f\">\n    <input id=\"task\" placeholder=\"مهمة جديدة...\" autocomplete=\"off\">\n    <button>أضف</button>\n  </form>\n  <ul id=\"list\"></ul>\n</div>",
    css: ".todo { max-width: 340px; margin: 20px auto; font-family: Tahoma; }\ninput { padding: 8px; width: 65%; border-radius: 8px; border: 1px solid #cbd5e1; }\nbutton { padding: 8px 14px; border: none; border-radius: 8px; background: #10b981; color: white; cursor: pointer; }\nli { background: #f1f5f9; margin: 6px 0; padding: 8px 12px; border-radius: 8px; list-style: none; cursor: pointer; }\nli.done { text-decoration: line-through; opacity: 0.5; }",
    js: "const form = document.getElementById(\"f\");\nconst list = document.getElementById(\"list\");\n\nform.addEventListener(\"submit\", (e) => {\n  e.preventDefault();\n  const text = document.getElementById(\"task\").value.trim();\n  if (!text) return;\n  const li = document.createElement(\"li\");\n  li.textContent = text;\n  list.append(li);\n  form.reset();\n});\n\n// تفويض الأحداث: نقرة على المهمة تشطبها\nlist.addEventListener(\"click\", (e) => {\n  if (e.target.tagName === \"LI\") e.target.classList.toggle(\"done\");\n});"
  },
  {
    id: "clock",
    name: "⏰ ساعة رقمية",
    html: "<div id=\"clock\">--:--:--</div>",
    css: "#clock {\n  font-family: 'Courier New', monospace;\n  font-size: 4rem;\n  text-align: center;\n  margin-top: 60px;\n  color: #4ade80;\n  background: #0f172a;\n  padding: 30px;\n  border-radius: 16px;\n  direction: ltr;\n}",
    js: "function tick() {\n  const now = new Date();\n  const h = String(now.getHours()).padStart(2, \"0\");\n  const m = String(now.getMinutes()).padStart(2, \"0\");\n  const s = String(now.getSeconds()).padStart(2, \"0\");\n  document.getElementById(\"clock\").textContent = `${h}:${m}:${s}`;\n}\ntick();\nsetInterval(tick, 1000);"
  },
  {
    id: "colors",
    name: "🎨 مبدّل ألوان",
    html: "<div class=\"box\">\n  <h2>مولّد ألوان عشوائية</h2>\n  <p id=\"code\">اضغط الزر!</p>\n  <button id=\"gen\">🎲 لون جديد</button>\n</div>",
    css: "body { transition: background 0.5s ease; }\n.box { text-align: center; font-family: Tahoma; margin-top: 50px; }\n#code { font-size: 1.5rem; font-weight: bold; font-family: monospace; direction: ltr; }\nbutton { padding: 10px 24px; font-size: 1rem; cursor: pointer; border-radius: 10px; border: none; background: white; box-shadow: 0 2px 10px rgba(0,0,0,0.2); }",
    js: "document.getElementById(\"gen\").addEventListener(\"click\", () => {\n  const hex = \"#\" + Math.floor(Math.random() * 0xffffff)\n    .toString(16).padStart(6, \"0\");\n  document.body.style.background = hex;\n  document.getElementById(\"code\").textContent = hex;\n  console.log(\"اللون الجديد:\", hex);\n});"
  }
];

/* ---------- حالة المختبر ---------- */
let pgActiveTab = "html";
let pgBound = false;

function pgGet(lang) {
  const el = $("#pg-editor-" + lang);
  return el ? el.value : "";
}

/* ---------- عرض الصفحة ---------- */
function renderPlayground() {
  const box = $("#view-playground");
  // لا نعيد البناء إن كانت الصفحة مبنية (نحافظ على عمل المستخدم)
  if (box.dataset.built === "1") return;
  box.dataset.built = "1";

  box.innerHTML = `
    <div class="card pg-toolbar">
      <h2 style="margin:0;font-size:1.15rem">🧪 مختبر الأكواد</h2>
      <select id="pg-examples" class="btn" style="cursor:pointer">
        <option value="">📂 حمّل مثالًا جاهزًا…</option>
        ${PG_EXAMPLES.map(x => `<option value="${x.id}">${x.name}</option>`).join("")}
      </select>
      <div class="pg-actions">
        <button class="btn btn-primary" id="pg-run">▶ تشغيل الكود</button>
        <button class="btn" id="pg-copy">📋 نسخ الكود</button>
        <button class="btn btn-danger" id="pg-reset">↺ إعادة تعيين</button>
      </div>
    </div>

    <div class="pg-layout">
      <div class="pg-editors card">
        <div class="pg-tabs">
          <button class="pg-tab active" data-lang="html">HTML</button>
          <button class="pg-tab" data-lang="css">CSS</button>
          <button class="pg-tab" data-lang="js">JavaScript</button>
        </div>
        <textarea id="pg-editor-html" class="pg-editor" dir="ltr" spellcheck="false" placeholder="<!-- اكتب HTML هنا -->"></textarea>
        <textarea id="pg-editor-css" class="pg-editor" dir="ltr" spellcheck="false" placeholder="/* اكتب CSS هنا */" hidden></textarea>
        <textarea id="pg-editor-js" class="pg-editor" dir="ltr" spellcheck="false" placeholder="// اكتب JavaScript هنا" hidden></textarea>
      </div>

      <div class="pg-output card">
        <div class="pg-output-head">
          <span>🖥️ النتيجة</span>
          <small style="color:var(--muted)">تعمل داخل إطار معزول</small>
        </div>
        <iframe id="pg-frame" class="pg-frame" sandbox="allow-scripts allow-modals" title="نتيجة الكود"></iframe>
        <div class="pg-console-head">📟 وحدة التحكم (console)</div>
        <pre id="pg-console" class="pg-console" dir="ltr"></pre>
      </div>
    </div>
    <p style="color:var(--muted);font-size:.8rem;margin-top:10px">💾 يُحفظ كودك تلقائيًا في متصفحك · اضغط Ctrl+Enter داخل المحرر للتشغيل السريع.</p>
  `;

  // استرجاع الكود المحفوظ أو تحميل المثال الأول
  const saved = localStorage.getItem(PG_KEYS.html);
  if (saved === null) {
    pgLoadExample(PG_EXAMPLES[0], false);
  } else {
    ["html", "css", "js"].forEach(l => {
      $("#pg-editor-" + l).value = localStorage.getItem(PG_KEYS[l]) || "";
    });
  }

  bindPlayground();
  pgRun();
}

function bindPlayground() {
  // التبويبات
  $$(".pg-tab").forEach(tab => tab.addEventListener("click", () => {
    pgActiveTab = tab.dataset.lang;
    $$(".pg-tab").forEach(t => t.classList.toggle("active", t === tab));
    ["html", "css", "js"].forEach(l => { $("#pg-editor-" + l).hidden = l !== pgActiveTab; });
  }));

  // حفظ تلقائي + تشغيل سريع
  ["html", "css", "js"].forEach(l => {
    const ed = $("#pg-editor-" + l);
    ed.addEventListener("input", () => localStorage.setItem(PG_KEYS[l], ed.value));
    ed.addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.key === "Enter") { e.preventDefault(); pgRun(); }
      if (e.key === "Tab") { // إدراج مسافتين بدل مغادرة المحرر
        e.preventDefault();
        const s = ed.selectionStart;
        ed.value = ed.value.slice(0, s) + "  " + ed.value.slice(ed.selectionEnd);
        ed.selectionStart = ed.selectionEnd = s + 2;
      }
    });
  });

  $("#pg-run").addEventListener("click", pgRun);
  $("#pg-copy").addEventListener("click", (e) => copyText(pgGet(pgActiveTab), e.currentTarget));
  $("#pg-reset").addEventListener("click", () => {
    if (!confirm("سيمسح هذا كل الأكواد في المحررات الثلاثة — متابعة؟")) return;
    ["html", "css", "js"].forEach(l => {
      $("#pg-editor-" + l).value = "";
      localStorage.removeItem(PG_KEYS[l]);
    });
    $("#pg-console").textContent = "";
    pgRun();
  });

  $("#pg-examples").addEventListener("change", (e) => {
    const ex = PG_EXAMPLES.find(x => x.id === e.target.value);
    if (ex) pgLoadExample(ex, true);
    e.target.value = "";
  });

  // استقبال رسائل console من الإطار
  if (!pgBound) {
    pgBound = true;
    window.addEventListener("message", (e) => {
      if (!e.data || e.data.type !== "pg-console") return;
      const c = $("#pg-console");
      if (!c) return;
      c.textContent += e.data.prefix + e.data.text + "\n";
      c.scrollTop = c.scrollHeight;
    });
  }
}

function pgLoadExample(ex, run) {
  $("#pg-editor-html").value = ex.html;
  $("#pg-editor-css").value = ex.css;
  $("#pg-editor-js").value = ex.js;
  localStorage.setItem(PG_KEYS.html, ex.html);
  localStorage.setItem(PG_KEYS.css, ex.css);
  localStorage.setItem(PG_KEYS.js, ex.js);
  if (run) pgRun();
}

/* ---------- التشغيل ---------- */
const PG_CONSOLE_BRIDGE = "<script>(function(){function fmt(a){try{return typeof a==='object'&&a!==null?JSON.stringify(a):String(a);}catch(e){return String(a);}}function send(prefix,args){try{parent.postMessage({type:'pg-console',prefix:prefix,text:Array.prototype.map.call(args,fmt).join(' ')},'*');}catch(e){}}var ol=console.log,oe=console.error,ow=console.warn;console.log=function(){send('',arguments);ol.apply(console,arguments);};console.error=function(){send('✗ ',arguments);oe.apply(console,arguments);};console.warn=function(){send('⚠ ',arguments);ow.apply(console,arguments);};window.onerror=function(m,s,l){send('✗ خطأ (سطر '+l+'): ',[m]);};})();<\/script>";

function pgRun() {
  const consoleBox = $("#pg-console");
  if (consoleBox) consoleBox.textContent = "";
  const doc = "<!DOCTYPE html><html lang='ar' dir='rtl'><head><meta charset='UTF-8'>"
    + "<style>" + pgGet("css") + "</style></head><body>"
    + pgGet("html")
    + PG_CONSOLE_BRIDGE
    + "<script>try{" + pgGet("js") + "\n}catch(e){console.error(e.message)}<\/script>"
    + "</body></html>";
  $("#pg-frame").srcdoc = doc;
}
