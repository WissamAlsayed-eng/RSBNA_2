/* ============================================================
   WSM — مرجع خصائص CSS (قسم مستقل)
   • مصدر البيانات الأساسي: data/wsm/css-properties.json
   • يعتمد على أدوات script.js المشتركة ($, $$, esc)
   • إدارة كاملة (إضافة/تعديل/حذف) تُحفظ محليًا (localStorage)
     مع إمكانية تصدير JSON محدّث لاستبدال الملف، والعودة لبيانات الملف.
   • لا مكتبات خارجية
   ============================================================ */
"use strict";

/* ---------- إعدادات ومفاتيح التخزين ---------- */
const WSM_JSON_URL = "data/wsm/css-properties.json";
const WSM_LS_KEY   = "wsm_css_ref_v1";   // نسخة العمل (تعديلات المستخدم)

// حالة القسم
const WSM = {
  data: null,       // { title, subtitle, source, categories: [...] }
  loaded: false,
  edited: false     // هل البيانات المعروضة من التعديلات المحلية؟
};

/* ---------- كود سطري بنفس نمط الموقع ---------- */
function wsmCode(s) {
  return '<code class="ref-code" dir="ltr">' + esc(s) + "</code>";
}

/* ---------- توليد معرّف فريد لخاصية جديدة ---------- */
function wsmUid() {
  return "p-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 6);
}

/* ---------- تحميل البيانات ----------
   الأولوية: تعديلات المستخدم المحفوظة محليًا، وإلا ملف JSON. */
async function wsmLoad(force = false) {
  if (WSM.loaded && !force) return WSM.data;

  // 1) نسخة العمل المحلية (تعديلات المستخدم)
  if (!force) {
    try {
      const local = localStorage.getItem(WSM_LS_KEY);
      if (local) {
        const parsed = JSON.parse(local);
        if (parsed && Array.isArray(parsed.categories)) {
          WSM.data = parsed;
          WSM.edited = true;
          WSM.loaded = true;
          return WSM.data;
        }
      }
    } catch { /* تجاهل والانتقال للملف */ }
  }

  // 2) ملف JSON المستقل
  const res = await fetch(WSM_JSON_URL, { cache: "no-store" });
  if (!res.ok) throw new Error("WSM JSON load failed: " + res.status);
  WSM.data = await res.json();
  WSM.edited = false;
  WSM.loaded = true;
  return WSM.data;
}

// حفظ نسخة العمل محليًا بعد أي تعديل
function wsmPersist() {
  try {
    localStorage.setItem(WSM_LS_KEY, JSON.stringify(WSM.data));
    WSM.edited = true;
  } catch (e) {
    alert("تعذّر الحفظ محليًا (قد تكون مساحة التخزين ممتلئة).");
  }
}

/* ---------- إحصاءات ---------- */
function wsmTotals() {
  const cats = WSM.data.categories;
  let props = 0, added = 0;
  cats.forEach(c => c.properties.forEach(p => { props++; if (p.source === "added") added++; }));
  return { cats: cats.length, props, added, fromPdf: props - added };
}

/* ============================================================
   نقطة الدخول من الموجّه (router)
   ============================================================ */
async function renderWSM() {
  const box = $("#view-wsm");
  box.innerHTML = `
    <div class="loading-wrap" style="padding:40px 0">
      <div class="spinner"></div><p>جارٍ تحميل مرجع WSM…</p>
    </div>`;
  try {
    await wsmLoad();
    wsmRenderPage();
  } catch (e) {
    box.innerHTML = `
      <div class="empty-state card">
        <div class="empty-icon">⚠️</div>
        <p>تعذّر تحميل بيانات المرجع من الملف <code class="ref-code" dir="ltr">${esc(WSM_JSON_URL)}</code>.</p>
        <p style="font-size:.86rem;color:var(--muted)">تأكد من تشغيل الموقع عبر خادم محلي (وليس فتح الملف مباشرة).</p>
      </div>`;
  }
}

/* ============================================================
   عرض الصفحة الكاملة
   ============================================================ */
function wsmRenderPage() {
  const box = $("#view-wsm");
  const d = WSM.data;
  const t = wsmTotals();

  box.innerHTML = `
    <div class="card lec-hero wsm-hero" style="--course-color:#2965f1">
      <span class="lec-icon-big" style="background:#2965f122;font-size:2rem">🎨</span>
      <div>
        <div class="lec-sub">مرجع خصائص CSS · مصدر أساسي: ${esc(d.source || "Chapter 2 CSS.pdf")}</div>
        <h2>${esc(d.title || "WSM")}</h2>
      </div>
      <div class="lec-actions">
        <button class="btn btn-primary btn-sm" id="wsm-add">➕ إضافة خاصية</button>
        <button class="btn btn-sm" id="wsm-export" title="تنزيل نسخة JSON محدّثة">⬇️ تصدير JSON</button>
        <button class="btn btn-sm" id="wsm-reset" title="العودة إلى بيانات الملف الأصلية">↺ استرجاع الملف</button>
      </div>
    </div>

    ${WSM.edited ? `
    <div class="card wsm-note">
      ✏️ أنت تعرض <strong>نسختك المعدّلة</strong> المحفوظة في المتصفح. لحفظها بشكل دائم في المشروع اضغط
      «تصدير JSON» ثم استبدل الملف <code class="ref-code" dir="ltr">${esc(WSM_JSON_URL)}</code>.
      لاستعادة نسخة الملف الأصلية اضغط «استرجاع الملف».
    </div>` : ""}

    <div class="card wsm-legend">
      <span class="wsm-badge pdf">📄 من ملف الـ PDF</span>
      <span class="wsm-badge added">➕ مُضافة لإكمال المرجع (أساسي → متوسط)</span>
      <span style="margin-inline-start:auto;color:var(--muted);font-size:.85rem">
        ${t.cats} فئة · ${t.props} خاصية (${t.fromPdf} من الملف · ${t.added} مُضافة)
      </span>
    </div>

    <div class="card ref-controls">
      <input type="search" id="wsm-filter" placeholder="🔎 ابحث عن خاصية أو قيمة أو شرح…" autocomplete="off" />
      <div class="ref-cat-nav">
        ${d.categories.map(c => `<a href="#wsm-cat-${esc(c.id)}" class="chip ref-cat-chip">${c.icon} ${esc(c.name)}</a>`).join("")}
      </div>
    </div>

    <div id="wsm-cats">
      ${d.categories.map(c => wsmCategoryHTML(c)).join("")}
    </div>

    <div id="wsm-no-results" class="empty-state card" hidden>
      <div class="empty-icon">🤷</div><p>لا توجد نتائج مطابقة — جرّب كلمة أخرى.</p>
    </div>

    <!-- نافذة التحرير/الإضافة -->
    <div id="wsm-modal" class="wsm-modal" hidden>
      <div class="wsm-modal-backdrop" data-close="1"></div>
      <div class="wsm-modal-card card" role="dialog" aria-modal="true" aria-labelledby="wsm-modal-title">
        <div class="wsm-modal-head">
          <h3 id="wsm-modal-title">إضافة خاصية</h3>
          <button class="icon-btn" id="wsm-modal-close" aria-label="إغلاق">✕</button>
        </div>
        <form id="wsm-form" autocomplete="off">
          <input type="hidden" name="catId" />
          <input type="hidden" name="propId" />
          <label class="wsm-field">
            <span>الفئة</span>
            <select name="category" required></select>
          </label>
          <label class="wsm-field">
            <span>اسم الخاصية <em>*</em></span>
            <input type="text" name="prop" dir="ltr" placeholder="مثال: text-align" required />
          </label>
          <label class="wsm-field">
            <span>الشرح المختصر <em>*</em></span>
            <textarea name="desc" rows="2" placeholder="شرح مختصر لوظيفة الخاصية" required></textarea>
          </label>
          <label class="wsm-field">
            <span>أشهر القيم</span>
            <input type="text" name="values" dir="ltr" placeholder="مثال: center · left · right" />
          </label>
          <label class="wsm-field">
            <span>مثال (اختياري)</span>
            <input type="text" name="example" dir="ltr" placeholder="مثال: p { text-align: center; }" />
          </label>
          <label class="wsm-field">
            <span>المصدر</span>
            <select name="source">
              <option value="added">➕ مُضافة</option>
              <option value="pdf">📄 من الـ PDF</option>
            </select>
          </label>
          <div class="wsm-modal-actions">
            <button type="submit" class="btn btn-primary">💾 حفظ</button>
            <button type="button" class="btn" id="wsm-form-cancel">إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  `;

  wsmBindPage();
}

/* بطاقة فئة واحدة (جدول قابل للإدارة) */
function wsmCategoryHTML(cat) {
  const rows = cat.properties.map(p => wsmRowHTML(cat.id, p)).join("");
  return `
    <section class="ref-cat card wsm-cat" id="wsm-cat-${esc(cat.id)}" data-cat="${esc(cat.id)}">
      <h3 class="ref-cat-title">
        ${cat.icon} ${esc(cat.name)} <span class="chip">${cat.properties.length}</span>
      </h3>
      <div class="table-scroll">
        <table class="lesson-table ref-table wsm-table">
          <thead>
            <tr>
              <th>الخاصية</th><th>الوظيفة</th><th>أشهر القيم</th><th>مثال</th><th>المصدر</th><th>إدارة</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </section>`;
}

/* صف خاصية واحدة */
function wsmRowHTML(catId, p) {
  const searchStr = esc((p.prop + " " + p.desc + " " + (p.values || "") + " " + (p.example || "")).toLowerCase());
  const badge = p.source === "pdf"
    ? '<span class="wsm-badge pdf" title="من ملف الـ PDF">📄 PDF</span>'
    : '<span class="wsm-badge added" title="مُضافة لإكمال المرجع">➕ مُضافة</span>';
  return `
    <tr class="ref-row wsm-row" data-search="${searchStr}" data-cat="${esc(catId)}" data-id="${esc(p.id)}">
      <td>${wsmCode(p.prop)}</td>
      <td>${esc(p.desc)}</td>
      <td>${p.values ? `<span class="ref-attrs">${esc(p.values)}</span>` : "—"}</td>
      <td>${p.example ? wsmCode(p.example) : "—"}</td>
      <td>${badge}</td>
      <td class="wsm-row-actions">
        <button class="icon-btn wsm-edit" title="تعديل" aria-label="تعديل">✏️</button>
        <button class="icon-btn wsm-del" title="حذف" aria-label="حذف">🗑️</button>
      </td>
    </tr>`;
}

/* ============================================================
   ربط الأحداث
   ============================================================ */
function wsmBindPage() {
  // بحث/تصفية فوري
  const input = $("#wsm-filter");
  if (input) {
    input.addEventListener("input", () => {
      const term = input.value.trim().toLowerCase();
      let anyVisible = false;
      $$(".wsm-cat").forEach(cat => {
        let catVisible = false;
        $$(".wsm-row", cat).forEach(row => {
          const match = !term || (row.dataset.search || "").includes(term);
          row.hidden = !match;
          if (match) catVisible = true;
        });
        cat.hidden = !catVisible;
        if (catVisible) anyVisible = true;
      });
      const empty = $("#wsm-no-results");
      if (empty) empty.hidden = anyVisible;
    });
  }

  // أزرار الترويسة
  $("#wsm-add").addEventListener("click", () => wsmOpenModal(null, null));
  $("#wsm-export").addEventListener("click", wsmExport);
  $("#wsm-reset").addEventListener("click", wsmReset);

  // أزرار الصفوف (تفويض الحدث)
  $("#wsm-cats").addEventListener("click", (e) => {
    const editBtn = e.target.closest(".wsm-edit");
    const delBtn = e.target.closest(".wsm-del");
    if (editBtn) {
      const row = editBtn.closest(".wsm-row");
      wsmOpenModal(row.dataset.cat, row.dataset.id);
    } else if (delBtn) {
      const row = delBtn.closest(".wsm-row");
      wsmDelete(row.dataset.cat, row.dataset.id);
    }
  });

  // نافذة التحرير
  $("#wsm-modal-close").addEventListener("click", wsmCloseModal);
  $("#wsm-form-cancel").addEventListener("click", wsmCloseModal);
  $("#wsm-modal .wsm-modal-backdrop").addEventListener("click", wsmCloseModal);
  $("#wsm-form").addEventListener("submit", wsmSaveForm);
  document.addEventListener("keydown", wsmEscHandler);
}

// إغلاق النافذة بمفتاح Esc
function wsmEscHandler(e) {
  if (e.key === "Escape") {
    const modal = $("#wsm-modal");
    if (modal && !modal.hidden) wsmCloseModal();
  }
}

/* ============================================================
   نافذة الإضافة/التعديل
   ============================================================ */
function wsmOpenModal(catId, propId) {
  const modal = $("#wsm-modal");
  const form = $("#wsm-form");
  const sel = form.category;

  // ملء قائمة الفئات
  sel.innerHTML = WSM.data.categories
    .map(c => `<option value="${esc(c.id)}">${c.icon} ${esc(c.name)}</option>`).join("");

  const editing = !!(catId && propId);
  $("#wsm-modal-title").textContent = editing ? "تعديل خاصية" : "إضافة خاصية جديدة";

  if (editing) {
    const cat = WSM.data.categories.find(c => c.id === catId);
    const p = cat && cat.properties.find(x => x.id === propId);
    if (!p) return;
    form.catId.value = catId;
    form.propId.value = propId;
    sel.value = catId;
    form.prop.value = p.prop || "";
    form.desc.value = p.desc || "";
    form.values.value = p.values || "";
    form.example.value = p.example || "";
    form.source.value = p.source === "pdf" ? "pdf" : "added";
  } else {
    form.reset();
    form.catId.value = "";
    form.propId.value = "";
    sel.value = catId || WSM.data.categories[0].id; // فئة مبدئية
    form.source.value = "added";
  }

  modal.hidden = false;
  document.body.style.overflow = "hidden";
  setTimeout(() => form.prop.focus(), 50);
}

function wsmCloseModal() {
  const modal = $("#wsm-modal");
  if (modal) modal.hidden = true;
  document.body.style.overflow = "";
}

function wsmSaveForm(e) {
  e.preventDefault();
  const form = e.target;
  const prop = form.prop.value.trim();
  const desc = form.desc.value.trim();
  if (!prop || !desc) return;

  const record = {
    prop,
    desc,
    values: form.values.value.trim(),
    example: form.example.value.trim(),
    source: form.source.value === "pdf" ? "pdf" : "added"
  };

  const oldCatId = form.catId.value;
  const propId = form.propId.value;
  const newCatId = form.category.value;
  const newCat = WSM.data.categories.find(c => c.id === newCatId);
  if (!newCat) return;

  if (oldCatId && propId) {
    // تعديل: احذف من الفئة القديمة إن تغيّرت، ثم أضف/حدّث
    const oldCat = WSM.data.categories.find(c => c.id === oldCatId);
    if (oldCatId === newCatId) {
      const p = newCat.properties.find(x => x.id === propId);
      Object.assign(p, record);
    } else {
      if (oldCat) oldCat.properties = oldCat.properties.filter(x => x.id !== propId);
      newCat.properties.push({ id: propId, ...record });
    }
  } else {
    // إضافة جديدة
    newCat.properties.push({ id: wsmUid(), ...record });
  }

  wsmPersist();
  wsmCloseModal();
  wsmRenderPage();
}

/* ============================================================
   الحذف
   ============================================================ */
function wsmDelete(catId, propId) {
  const cat = WSM.data.categories.find(c => c.id === catId);
  const p = cat && cat.properties.find(x => x.id === propId);
  if (!p) return;
  if (!confirm(`حذف الخاصية «${p.prop}» مع شرحها؟`)) return;
  cat.properties = cat.properties.filter(x => x.id !== propId);
  wsmPersist();
  wsmRenderPage();
}

/* ============================================================
   تصدير JSON محدّث (تنزيل ملف)
   ============================================================ */
function wsmExport() {
  const out = JSON.stringify(WSM.data, null, 2);
  const blob = new Blob([out], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "css-properties.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* ============================================================
   العودة إلى بيانات الملف الأصلية (مسح التعديلات المحلية)
   ============================================================ */
async function wsmReset() {
  if (WSM.edited && !confirm("سيتم حذف تعديلاتك المحلية والعودة إلى بيانات الملف الأصلية. متابعة؟")) return;
  localStorage.removeItem(WSM_LS_KEY);
  WSM.loaded = false;
  try {
    await wsmLoad(true);
    wsmRenderPage();
  } catch {
    $("#view-wsm").innerHTML = `<div class="empty-state card"><div class="empty-icon">⚠️</div><p>تعذّر إعادة التحميل من الملف.</p></div>`;
  }
}