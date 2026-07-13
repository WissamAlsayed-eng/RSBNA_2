/* ============================================================
   المرجع السريع — HTML / CSS / JavaScript
   قسم مستقل للمراجعة السريعة قبل الامتحان + اختبارات مرجعية
   يعتمد على الأدوات المشتركة في script.js ($, esc, blanks,
   shuffle, fillMatches, TYPE_LABELS) — لا مكتبات خارجية
   البيانات مضمّنة هنا (لا حاجة لملفات JSON خارجية)
   ============================================================ */
"use strict";

/* ---------- بيانات تعريف الأقسام ---------- */
const REF_META = {
  html: { title: "مرجع HTML السريع", short: "HTML", icon: "🌐", color: "#e34f26",
    subtitle: "أشهر وسوم HTML مرتبة حسب الفئة" },
  css:  { title: "مرجع CSS السريع", short: "CSS", icon: "🎨", color: "#2965f1",
    subtitle: "أهم خصائص CSS من الأساسي إلى المتوسط" },
  js:   { title: "مرجع JavaScript السريع", short: "JavaScript", icon: "⚡", color: "#f7df1e",
    subtitle: "أساسيات JavaScript مرتبة حسب الفئة" }
};

/* ============================================================
   1) بيانات مرجع HTML
   كل عنصر: { tag: الوسم, desc: الوظيفة, attrs: أهم الخصائص, ex: مثال }
   ============================================================ */
const HTML_REF = [
  { cat: "البنية (Structure)", icon: "🏗️", items: [
    { tag: "<!DOCTYPE html>", desc: "يحدد نوع المستند بأنه HTML5، يوضع أول سطر.", attrs: "—", ex: "<!DOCTYPE html>" },
    { tag: "<html>", desc: "العنصر الجذر الذي يحتوي كامل الصفحة.", attrs: "lang, dir", ex: '<html lang="ar" dir="rtl">' },
    { tag: "<head>", desc: "يحوي بيانات الصفحة الوصفية (لا تظهر في المحتوى).", attrs: "—", ex: "<head>…</head>" },
    { tag: "<body>", desc: "يحوي محتوى الصفحة المرئي كله.", attrs: "—", ex: "<body>…</body>" },
    { tag: "<div>", desc: "حاوية كتلية عامة لتجميع العناصر (block).", attrs: "class, id", ex: '<div class="box">' },
    { tag: "<span>", desc: "حاوية سطرية عامة لجزء من النص (inline).", attrs: "class, id", ex: "<span>كلمة</span>" },
    { tag: "<br>", desc: "كسر سطر (سطر جديد). وسم فردي بلا إغلاق.", attrs: "—", ex: "سطر<br>سطر" },
    { tag: "<hr>", desc: "خط أفقي فاصل بين الأقسام.", attrs: "—", ex: "<hr>" },
    { tag: "<!-- -->", desc: "تعليق لا يظهر للمستخدم ولا ينفّذه المتصفح.", attrs: "—", ex: "<!-- ملاحظة -->" }
  ]},
  { cat: "الترويسة (Head)", icon: "📋", items: [
    { tag: "<title>", desc: "عنوان الصفحة الظاهر في تبويب المتصفح.", attrs: "—", ex: "<title>موقعي</title>" },
    { tag: "<meta>", desc: "بيانات وصفية: الترميز، الوصف، عرض الجوال…", attrs: "charset, name, content", ex: '<meta charset="UTF-8">' },
    { tag: "<meta viewport>", desc: "يضبط عرض الصفحة على الأجهزة المحمولة (Responsive).", attrs: "name, content", ex: '<meta name="viewport" content="width=device-width, initial-scale=1.0">' },
    { tag: "<link>", desc: "ربط ملف خارجي كملف CSS أو أيقونة الموقع.", attrs: "rel, href, type", ex: '<link rel="stylesheet" href="style.css">' },
    { tag: "<style>", desc: "كتابة أكواد CSS داخل الصفحة نفسها.", attrs: "—", ex: "<style>p{color:red}</style>" },
    { tag: "<script>", desc: "تضمين أو ربط كود JavaScript.", attrs: "src, defer, async", ex: '<script src="app.js"></script>' },
    { tag: "<base>", desc: "يحدد الرابط الأساسي لكل الروابط النسبية في الصفحة.", attrs: "href, target", ex: '<base href="/pages/">' }
  ]},
  { cat: "النصوص (Text)", icon: "✍️", items: [
    { tag: "<h1>…<h6>", desc: "عناوين متدرّجة الأهمية، h1 الأهم و h6 الأقل.", attrs: "—", ex: "<h1>عنوان رئيسي</h1>" },
    { tag: "<p>", desc: "فقرة نصية.", attrs: "—", ex: "<p>هذا نص.</p>" },
    { tag: "<strong>", desc: "نص مهم دلاليًا (يظهر عريضًا).", attrs: "—", ex: "<strong>هام</strong>" },
    { tag: "<b>", desc: "نص عريض بصريًا دون أهمية دلالية.", attrs: "—", ex: "<b>عريض</b>" },
    { tag: "<em>", desc: "نص مؤكَّد دلاليًا (يظهر مائلًا).", attrs: "—", ex: "<em>تأكيد</em>" },
    { tag: "<i>", desc: "نص مائل بصريًا دون دلالة.", attrs: "—", ex: "<i>مائل</i>" },
    { tag: "<mark>", desc: "تمييز/تظليل نص كأنه بقلم فسفوري.", attrs: "—", ex: "<mark>مميّز</mark>" },
    { tag: "<small>", desc: "نص أصغر (ملاحظات هامشية).", attrs: "—", ex: "<small>تنويه</small>" },
    { tag: "<sub> / <sup>", desc: "نص منخفض (H₂O) أو مرتفع (X²).", attrs: "—", ex: "H<sub>2</sub>O · X<sup>2</sup>" },
    { tag: "<blockquote>", desc: "اقتباس مطوّل من مصدر.", attrs: "cite", ex: "<blockquote>اقتباس</blockquote>" },
    { tag: "<code>", desc: "عرض جزء كود برمجي بخط ثابت.", attrs: "—", ex: "<code>x = 5</code>" },
    { tag: "<pre>", desc: "نص محفوظ التنسيق (يحترم المسافات والأسطر).", attrs: "—", ex: "<pre>  نص</pre>" },
    { tag: "<abbr>", desc: "اختصار يظهر معناه عند مرور الفأرة.", attrs: "title", ex: '<abbr title="HyperText">HTML</abbr>' }
  ]},
  { cat: "الروابط (Links)", icon: "🔗", items: [
    { tag: "<a>", desc: "رابط تشعّبي إلى صفحة أو مكان أو بريد.", attrs: "href, target, title, download", ex: '<a href="page.html">اذهب</a>' },
    { tag: 'target="_blank"', desc: "فتح الرابط في تبويب/نافذة جديدة.", attrs: "target", ex: '<a href="#" target="_blank">جديد</a>' },
    { tag: "رابط داخلي", desc: "الانتقال إلى عنصر داخل الصفحة عبر id.", attrs: "href=\"#id\"", ex: '<a href="#top">أعلى</a>' },
    { tag: "رابط بريد", desc: "فتح برنامج البريد لإرسال رسالة.", attrs: "href=\"mailto:\"", ex: '<a href="mailto:a@b.com">راسلنا</a>' },
    { tag: "رابط هاتف", desc: "الاتصال برقم على الجوال.", attrs: "href=\"tel:\"", ex: '<a href="tel:0100">اتصل</a>' }
  ]},
  { cat: "الصور (Images)", icon: "🖼️", items: [
    { tag: "<img>", desc: "إدراج صورة. وسم فردي بلا إغلاق.", attrs: "src, alt, width, height", ex: '<img src="p.jpg" alt="وصف">' },
    { tag: "alt", desc: "نص بديل يظهر إذا تعذّر تحميل الصورة (ومهم للوصولية).", attrs: "—", ex: '<img src="x" alt="شعار">' },
    { tag: "<figure>", desc: "حاوية لصورة/محتوى مع تعليق مرتبط.", attrs: "—", ex: "<figure>…</figure>" },
    { tag: "<figcaption>", desc: "تعليق توضيحي للصورة داخل figure.", attrs: "—", ex: "<figcaption>شرح</figcaption>" },
    { tag: "<picture>", desc: "عرض صور مختلفة حسب حجم الشاشة.", attrs: "—", ex: "<picture>…</picture>" }
  ]},
  { cat: "القوائم (Lists)", icon: "📑", items: [
    { tag: "<ul>", desc: "قائمة غير مرتّبة (نقاط).", attrs: "—", ex: "<ul><li>عنصر</li></ul>" },
    { tag: "<ol>", desc: "قائمة مرتّبة (أرقام).", attrs: "type, start, reversed", ex: "<ol><li>أول</li></ol>" },
    { tag: "<li>", desc: "عنصر داخل قائمة ul أو ol.", attrs: "value", ex: "<li>بند</li>" },
    { tag: "<dl>", desc: "قائمة تعريفات (مصطلح ووصفه).", attrs: "—", ex: "<dl>…</dl>" },
    { tag: "<dt> / <dd>", desc: "المصطلح (dt) وتعريفه (dd) داخل dl.", attrs: "—", ex: "<dt>HTML</dt><dd>لغة</dd>" }
  ]},
  { cat: "الجداول (Tables)", icon: "📊", items: [
    { tag: "<table>", desc: "إنشاء جدول من صفوف وأعمدة.", attrs: "border", ex: "<table>…</table>" },
    { tag: "<tr>", desc: "صف داخل الجدول (Table Row).", attrs: "—", ex: "<tr>…</tr>" },
    { tag: "<td>", desc: "خلية بيانات عادية (Table Data).", attrs: "colspan, rowspan", ex: "<td>قيمة</td>" },
    { tag: "<th>", desc: "خلية عنوان (عريضة ووسطى افتراضيًا).", attrs: "colspan, rowspan, scope", ex: "<th>الاسم</th>" },
    { tag: "<thead>/<tbody>/<tfoot>", desc: "تجميع رأس وجسم وتذييل الجدول.", attrs: "—", ex: "<thead>…</thead>" },
    { tag: "<caption>", desc: "عنوان/تسمية للجدول.", attrs: "—", ex: "<caption>النتائج</caption>" },
    { tag: "colspan / rowspan", desc: "دمج خلية عبر عدة أعمدة أو صفوف.", attrs: "—", ex: '<td colspan="2">' }
  ]},
  { cat: "النماذج (Forms)", icon: "📝", items: [
    { tag: "<form>", desc: "نموذج لجمع مدخلات المستخدم وإرسالها.", attrs: "action, method", ex: '<form action="/s" method="post">' },
    { tag: "<input>", desc: "حقل إدخال متعدد الأنواع. وسم فردي.", attrs: "type, name, value, placeholder, required", ex: '<input type="text" name="u">' },
    { tag: "type", desc: "نوع الحقل: text, password, email, number, checkbox, radio, submit, date…", attrs: "—", ex: '<input type="email">' },
    { tag: "<label>", desc: "تسمية مرتبطة بحقل (تحسّن الوصولية).", attrs: "for", ex: '<label for="u">الاسم</label>' },
    { tag: "<textarea>", desc: "حقل نص متعدد الأسطر.", attrs: "rows, cols, name", ex: '<textarea rows="4"></textarea>' },
    { tag: "<button>", desc: "زر قابل للنقر.", attrs: "type", ex: "<button>إرسال</button>" },
    { tag: "<select> / <option>", desc: "قائمة منسدلة وخياراتها.", attrs: "name, value, selected", ex: "<select><option>أ</option></select>" },
    { tag: "<fieldset>/<legend>", desc: "تجميع حقول متعلّقة مع عنوان لها.", attrs: "—", ex: "<fieldset><legend>بيانات</legend></fieldset>" },
    { tag: "placeholder / required", desc: "نص تلميح داخل الحقل / جعل الحقل إجباريًا.", attrs: "—", ex: '<input required placeholder="اكتب">' }
  ]},
  { cat: "الوسائط (Media)", icon: "🎬", items: [
    { tag: "<audio>", desc: "تشغيل ملف صوتي.", attrs: "src, controls, autoplay, loop", ex: '<audio src="s.mp3" controls>' },
    { tag: "<video>", desc: "تشغيل ملف فيديو.", attrs: "src, controls, width, poster", ex: '<video src="v.mp4" controls>' },
    { tag: "<source>", desc: "تحديد مصدر/صيغة بديلة لـ audio وvideo.", attrs: "src, type", ex: '<source src="v.webm" type="video/webm">' },
    { tag: "<iframe>", desc: "تضمين صفحة/فيديو خارجي داخل الصفحة.", attrs: "src, width, height, title", ex: '<iframe src="url"></iframe>' },
    { tag: "<canvas>", desc: "لوحة رسم برمجي عبر JavaScript.", attrs: "width, height", ex: '<canvas width="200"></canvas>' },
    { tag: "<svg>", desc: "رسومات متجهية قابلة للتحجيم دون فقد الجودة.", attrs: "width, height, viewBox", ex: "<svg>…</svg>" }
  ]},
  { cat: "العناصر الدلالية (Semantic)", icon: "🧩", items: [
    { tag: "<header>", desc: "ترويسة الصفحة أو القسم (شعار/تنقل).", attrs: "—", ex: "<header>…</header>" },
    { tag: "<nav>", desc: "قسم روابط التنقل الرئيسية.", attrs: "—", ex: "<nav>…</nav>" },
    { tag: "<main>", desc: "المحتوى الرئيسي الفريد للصفحة (مرة واحدة).", attrs: "—", ex: "<main>…</main>" },
    { tag: "<section>", desc: "قسم منطقي مستقل بموضوع واحد.", attrs: "—", ex: "<section>…</section>" },
    { tag: "<article>", desc: "محتوى قائم بذاته (مقال، تدوينة، خبر).", attrs: "—", ex: "<article>…</article>" },
    { tag: "<aside>", desc: "محتوى جانبي ثانوي (شريط جانبي/إعلان).", attrs: "—", ex: "<aside>…</aside>" },
    { tag: "<footer>", desc: "تذييل الصفحة أو القسم.", attrs: "—", ex: "<footer>…</footer>" },
    { tag: "<details>/<summary>", desc: "محتوى قابل للطي مع عنوان قابل للنقر.", attrs: "open", ex: "<details><summary>المزيد</summary>…</details>" },
    { tag: "<time>", desc: "تمثيل وقت/تاريخ بصيغة يقرأها الحاسوب.", attrs: "datetime", ex: '<time datetime="2026-07-13">اليوم</time>' }
  ]}
];

/* ============================================================
   2) بيانات مرجع CSS
   كل عنصر: { prop: الخاصية, desc: الوظيفة, vals: أشهر القيم, note: ملاحظة }
   ============================================================ */
const CSS_REF = [
  { cat: "المحددات (Selectors)", icon: "🎯", items: [
    { prop: "element", desc: "تحديد كل عناصر وسم معيّن.", vals: "p, h1, div", note: "p { color:red }" },
    { prop: ".class", desc: "تحديد العناصر ذات صنف (class) معيّن.", vals: ".box", note: "الأكثر استخدامًا لإعادة الاستعمال" },
    { prop: "#id", desc: "تحديد عنصر واحد عبر معرّفه الفريد.", vals: "#header", note: "الـ id فريد لا يتكرر" },
    { prop: "*", desc: "المحدّد الشامل: يطبّق على كل العناصر.", vals: "*", note: "يُستخدم للتصفير reset" },
    { prop: "A B (descendant)", desc: "العناصر B الموجودة داخل A (أحفاد).", vals: "div p", note: "مسافة بين المحددين" },
    { prop: "A > B (child)", desc: "العناصر B الأبناء المباشرون لـ A.", vals: "ul > li", note: "مستوى واحد فقط" },
    { prop: "A, B (group)", desc: "تطبيق نفس التنسيق على عدة محددات.", vals: "h1, h2, p", note: "الفاصلة تجمع المحددات" },
    { prop: ":hover", desc: "عند مرور مؤشر الفأرة فوق العنصر.", vals: "a:hover", note: "حالة (pseudo-class)" },
    { prop: ":nth-child(n)", desc: "تحديد عنصر بترتيبه بين إخوته.", vals: "2, odd, even", note: "li:nth-child(even)" },
    { prop: "::before / ::after", desc: "إدراج محتوى وهمي قبل/بعد العنصر.", vals: "content", note: "يتطلب خاصية content" },
    { prop: "[attr]", desc: "تحديد بحسب وجود/قيمة خاصية.", vals: '[type="text"]', note: "input[required]" }
  ]},
  { cat: "الألوان (Colors)", icon: "🌈", items: [
    { prop: "color", desc: "لون النص.", vals: "red, #333, rgb(), hsl()", note: "تخص النص فقط" },
    { prop: "اسم اللون", desc: "أسماء ألوان جاهزة.", vals: "red, blue, white, black", note: "أبسط صيغة" },
    { prop: "HEX", desc: "لون بالنظام الست عشري.", vals: "#ff0000, #f00", note: "#RRGGBB أو مختصر" },
    { prop: "rgb() / rgba()", desc: "لون بقيم أحمر/أخضر/أزرق (+ شفافية).", vals: "rgb(255,0,0) · rgba(0,0,0,.5)", note: "a بين 0 و1 للشفافية" },
    { prop: "hsl()", desc: "لون بدرجة اللون والتشبع والإضاءة.", vals: "hsl(0,100%,50%)", note: "أسهل في التحكم بالدرجات" }
  ]},
  { cat: "الخلفية (Background)", icon: "🖌️", items: [
    { prop: "background-color", desc: "لون خلفية العنصر.", vals: "#fff, transparent", note: "—" },
    { prop: "background-image", desc: "صورة أو تدرّج كخلفية.", vals: "url(bg.jpg), linear-gradient()", note: "url() للصورة" },
    { prop: "background-size", desc: "حجم صورة الخلفية.", vals: "cover, contain, 100px, auto", note: "cover يملأ العنصر" },
    { prop: "background-position", desc: "موضع صورة الخلفية.", vals: "center, top left, 50% 50%", note: "—" },
    { prop: "background-repeat", desc: "تكرار صورة الخلفية.", vals: "no-repeat, repeat, repeat-x", note: "no-repeat لمنع التكرار" },
    { prop: "background", desc: "خاصية مختصرة تجمع كل خصائص الخلفية.", vals: "#fff url() no-repeat center", note: "اختصار (shorthand)" }
  ]},
  { cat: "النص (Text)", icon: "🔤", items: [
    { prop: "text-align", desc: "محاذاة النص أفقيًا.", vals: "right, left, center, justify", note: "justify يضبط الحواف" },
    { prop: "text-decoration", desc: "خط تزييني للنص.", vals: "none, underline, line-through", note: "none لإزالة خط الروابط" },
    { prop: "text-transform", desc: "تحويل حالة الأحرف.", vals: "uppercase, lowercase, capitalize", note: "للإنجليزية" },
    { prop: "line-height", desc: "ارتفاع/تباعد السطر.", vals: "1.5, 24px, normal", note: "الرقم مضاعف لحجم الخط" },
    { prop: "letter-spacing", desc: "المسافة بين الأحرف.", vals: "2px, normal", note: "—" },
    { prop: "text-indent", desc: "إزاحة بداية السطر الأول.", vals: "20px", note: "—" },
    { prop: "text-shadow", desc: "ظل للنص.", vals: "2px 2px 4px #000", note: "أفقي رأسي تنعيم لون" },
    { prop: "direction", desc: "اتجاه النص.", vals: "rtl, ltr", note: "rtl للعربية" }
  ]},
  { cat: "الخط (Font)", icon: "🔡", items: [
    { prop: "font-family", desc: "نوع الخط، مع بدائل احتياطية.", vals: "Arial, Tahoma, sans-serif", note: "افصل البدائل بفاصلة" },
    { prop: "font-size", desc: "حجم الخط.", vals: "16px, 1.2rem, 1em, large", note: "rem نسبة لجذر الصفحة" },
    { prop: "font-weight", desc: "سماكة الخط.", vals: "normal, bold, 100–900", note: "700 = bold" },
    { prop: "font-style", desc: "نمط الخط.", vals: "normal, italic", note: "italic للمائل" },
    { prop: "font", desc: "خاصية مختصرة تجمع خصائص الخط.", vals: "italic bold 16px Arial", note: "اختصار (shorthand)" }
  ]},
  { cat: "الحدود (Border)", icon: "🔲", items: [
    { prop: "border", desc: "حد العنصر (سماكة ونمط ولون).", vals: "1px solid #333", note: "اختصار للثلاثة معًا" },
    { prop: "border-width", desc: "سماكة الحد.", vals: "1px, 2px, thin", note: "—" },
    { prop: "border-style", desc: "نمط الحد.", vals: "solid, dashed, dotted, none", note: "solid خط متصل" },
    { prop: "border-color", desc: "لون الحد.", vals: "#000, red", note: "—" },
    { prop: "border-radius", desc: "تدوير زوايا العنصر.", vals: "8px, 50%", note: "50% يجعل الدائرة" },
    { prop: "border-top/right…", desc: "تحديد حد جهة واحدة فقط.", vals: "border-top: 2px solid", note: "top/right/bottom/left" }
  ]},
  { cat: "الهامش الخارجي (Margin)", icon: "↔️", items: [
    { prop: "margin", desc: "المسافة الخارجية حول العنصر.", vals: "10px, 10px 20px, auto", note: "يفصل العنصر عمّا حوله" },
    { prop: "margin-top/right/bottom/left", desc: "هامش جهة واحدة.", vals: "20px", note: "—" },
    { prop: "margin: auto", desc: "توسيط العنصر أفقيًا (بعرض محدد).", vals: "0 auto", note: "شائع لتوسيط الحاويات" },
    { prop: "قيم مختصرة", desc: "قيمة واحدة لكل الجهات أو اثنتان/أربع.", vals: "10px · 10px 20px · 5px 10px 15px 20px", note: "أعلى يمين أسفل يسار" }
  ]},
  { cat: "الحشو الداخلي (Padding)", icon: "⬜", items: [
    { prop: "padding", desc: "المسافة الداخلية بين الحد والمحتوى.", vals: "10px, 10px 20px", note: "يوسّع مساحة العنصر داخليًا" },
    { prop: "padding-top/right/bottom/left", desc: "حشو جهة واحدة.", vals: "12px", note: "—" },
    { prop: "قيم مختصرة", desc: "قيمة لكل الجهات أو اثنتان/أربع.", vals: "10px · 10px 20px", note: "نفس ترتيب margin" }
  ]},
  { cat: "العرض والارتفاع (Width & Height)", icon: "📐", items: [
    { prop: "width", desc: "عرض العنصر.", vals: "300px, 50%, auto", note: "% نسبة للأب" },
    { prop: "height", desc: "ارتفاع العنصر.", vals: "200px, 100vh, auto", note: "vh نسبة لارتفاع الشاشة" },
    { prop: "max-width", desc: "أقصى عرض مسموح (مهم للتجاوب).", vals: "100%, 1200px", note: "يمنع تجاوز الحد" },
    { prop: "min-width", desc: "أدنى عرض مسموح.", vals: "200px", note: "—" },
    { prop: "max-height / min-height", desc: "أقصى/أدنى ارتفاع مسموح.", vals: "500px, 100px", note: "—" }
  ]},
  { cat: "العرض والتخطيط (Display)", icon: "🧱", items: [
    { prop: "display: block", desc: "عنصر كتلي يأخذ سطرًا كاملًا.", vals: "block", note: "مثل div, p" },
    { prop: "display: inline", desc: "عنصر سطري بحجم محتواه، لا يقبل width/height.", vals: "inline", note: "مثل span, a" },
    { prop: "display: inline-block", desc: "سطري لكن يقبل الأبعاد والحشو.", vals: "inline-block", note: "مزيج بين الاثنين" },
    { prop: "display: none", desc: "إخفاء العنصر تمامًا (لا يشغل مساحة).", vals: "none", note: "يختلف عن visibility:hidden" },
    { prop: "display: flex", desc: "تفعيل تخطيط مرن أحادي المحور.", vals: "flex", note: "انظر قسم Flexbox" },
    { prop: "display: grid", desc: "تخطيط شبكي ثنائي الأبعاد.", vals: "grid", note: "صفوف وأعمدة" }
  ]},
  { cat: "التموضع (Position)", icon: "📍", items: [
    { prop: "position: static", desc: "الوضع الافتراضي (تدفق الصفحة العادي).", vals: "static", note: "لا يتأثر بـ top/left" },
    { prop: "position: relative", desc: "إزاحة نسبية من موضعه الأصلي.", vals: "relative", note: "مرجع للعناصر المطلقة بداخله" },
    { prop: "position: absolute", desc: "يتموضع نسبةً لأقرب أب متموضع.", vals: "absolute", note: "يخرج من التدفق" },
    { prop: "position: fixed", desc: "يثبت نسبةً للنافذة ولا يتحرك بالتمرير.", vals: "fixed", note: "لأشرطة ثابتة" },
    { prop: "position: sticky", desc: "يلتصق عند حدّ معيّن أثناء التمرير.", vals: "sticky", note: "يحتاج top/bottom" },
    { prop: "top/right/bottom/left", desc: "تحديد موضع العنصر المتموضع.", vals: "0, 10px, 50%", note: "تعمل مع غير static" },
    { prop: "z-index", desc: "ترتيب التراكب (أيّهما فوق).", vals: "1, 10, 999", note: "الأكبر يظهر فوق" }
  ]},
  { cat: "المرونة (Flexbox)", icon: "🤸", items: [
    { prop: "display: flex", desc: "تحويل الحاوية إلى حاوية مرنة.", vals: "flex", note: "يُطبّق على الأب" },
    { prop: "flex-direction", desc: "اتجاه ترتيب العناصر.", vals: "row, column, row-reverse", note: "row أفقي (افتراضي)" },
    { prop: "justify-content", desc: "محاذاة العناصر على المحور الرئيسي.", vals: "center, space-between, flex-start", note: "أفقيًا في row" },
    { prop: "align-items", desc: "محاذاة العناصر على المحور المتقاطع.", vals: "center, stretch, flex-start", note: "رأسيًا في row" },
    { prop: "flex-wrap", desc: "السماح بنزول العناصر لسطر جديد.", vals: "nowrap, wrap", note: "wrap للتجاوب" },
    { prop: "gap", desc: "المسافة بين عناصر الـ flex/grid.", vals: "10px, 1rem", note: "أبسط من margin" },
    { prop: "flex", desc: "نموّ/تقلّص العنصر داخل الحاوية.", vals: "1, 0 0 auto", note: "flex:1 يوزّع بالتساوي" }
  ]},
  { cat: "القوائم (Lists)", icon: "•", items: [
    { prop: "list-style-type", desc: "شكل نقطة/رقم القائمة.", vals: "disc, circle, square, decimal, none", note: "none لإزالة النقاط" },
    { prop: "list-style-position", desc: "موضع النقطة داخل/خارج المحتوى.", vals: "inside, outside", note: "—" },
    { prop: "list-style-image", desc: "استخدام صورة كنقطة للقائمة.", vals: "url(dot.png)", note: "—" },
    { prop: "list-style", desc: "خاصية مختصرة لخصائص القائمة.", vals: "square inside", note: "اختصار (shorthand)" }
  ]},
  { cat: "الجداول (Tables)", icon: "🧮", items: [
    { prop: "border-collapse", desc: "دمج حدود خلايا الجدول في حد واحد.", vals: "collapse, separate", note: "collapse أنظف" },
    { prop: "border-spacing", desc: "المسافة بين الخلايا (عند separate).", vals: "5px", note: "—" },
    { prop: "table-layout", desc: "طريقة حساب عرض الأعمدة.", vals: "auto, fixed", note: "fixed أسرع وأثبت" },
    { prop: "vertical-align", desc: "محاذاة المحتوى رأسيًا داخل الخلية.", vals: "top, middle, bottom", note: "—" },
    { prop: "caption-side", desc: "موضع عنوان الجدول.", vals: "top, bottom", note: "—" }
  ]},
  { cat: "التجاوز (Overflow)", icon: "🌊", items: [
    { prop: "overflow", desc: "التعامل مع المحتوى الزائد عن العنصر.", vals: "visible, hidden, scroll, auto", note: "auto يظهر شريطًا عند الحاجة" },
    { prop: "overflow-x", desc: "التحكم بالتجاوز الأفقي فقط.", vals: "auto, hidden, scroll", note: "—" },
    { prop: "overflow-y", desc: "التحكم بالتجاوز الرأسي فقط.", vals: "auto, hidden, scroll", note: "—" }
  ]},
  { cat: "الشفافية (Opacity)", icon: "👻", items: [
    { prop: "opacity", desc: "درجة شفافية العنصر كاملًا.", vals: "0 (شفاف) → 1 (معتم)", note: "0.5 = نصف شفاف" }
  ]},
  { cat: "المؤشر (Cursor)", icon: "🖱️", items: [
    { prop: "cursor", desc: "شكل مؤشر الفأرة فوق العنصر.", vals: "pointer, default, text, move, not-allowed", note: "pointer لليد على الأزرار" }
  ]},
  { cat: "الانتقالات (Transition)", icon: "✨", items: [
    { prop: "transition", desc: "تحريك تغيّر الخصائص بسلاسة.", vals: "all 0.3s ease", note: "خاصية مدة نوع-التوقيت" },
    { prop: "transition-property", desc: "الخاصية التي سيُطبّق عليها الانتقال.", vals: "all, color, transform", note: "—" },
    { prop: "transition-duration", desc: "مدة الانتقال.", vals: "0.3s, 500ms", note: "s ثوانٍ · ms ملّي ثانية" },
    { prop: "transition-timing-function", desc: "منحنى سرعة الحركة.", vals: "ease, linear, ease-in-out", note: "—" },
    { prop: "transition-delay", desc: "تأخير بدء الانتقال.", vals: "0s, 1s", note: "—" }
  ]}
];

/* ============================================================
   3) بيانات مرجع JavaScript
   كل عنصر: { name: الاسم, desc: الوظيفة, ex: مثال }
   ============================================================ */
const JS_REF = [
  { cat: "المتغيرات (Variables)", icon: "📦", items: [
    { name: "let", desc: "متغير قابل لإعادة الإسناد، نطاقه الكتلة {}.", ex: "let x = 5;" },
    { name: "const", desc: "ثابت لا يُعاد إسناده (يُفضّل افتراضيًا).", ex: "const PI = 3.14;" },
    { name: "var", desc: "الطريقة القديمة، نطاقها الدالة (تجنّبها غالبًا).", ex: "var y = 10;" }
  ]},
  { cat: "أنواع البيانات (Data Types)", icon: "🔢", items: [
    { name: "String", desc: "نص بين علامتي اقتباس.", ex: 'let s = "مرحبا";' },
    { name: "Number", desc: "أرقام صحيحة أو عشرية.", ex: "let n = 3.14;" },
    { name: "Boolean", desc: "قيمة منطقية صح/خطأ.", ex: "let ok = true;" },
    { name: "null", desc: "قيمة فارغة مقصودة.", ex: "let a = null;" },
    { name: "undefined", desc: "متغير معرّف بلا قيمة.", ex: "let b; // undefined" },
    { name: "Array", desc: "مصفوفة (قائمة قيم مرتّبة).", ex: "let arr = [1, 2, 3];" },
    { name: "Object", desc: "كائن بأزواج مفتاح: قيمة.", ex: "let o = { a: 1 };" },
    { name: "typeof", desc: "معرفة نوع القيمة.", ex: 'typeof 5 // "number"' }
  ]},
  { cat: "المعاملات (Operators)", icon: "➕", items: [
    { name: "حسابية", desc: "جمع وطرح وضرب وقسمة وباقي القسمة والأس.", ex: "+  -  *  /  %  **" },
    { name: "الإسناد", desc: "إسناد قيمة لمتغير (مع اختصارات).", ex: "x = 5; x += 2;" },
    { name: "المقارنة", desc: "مقارنة قيمتين وإرجاع منطقي.", ex: "==  ===  !=  >  <  >=" },
    { name: "=== مقابل ==", desc: "=== يقارن القيمة والنوع (الأدق).", ex: '5 === "5" // false' },
    { name: "المنطقية", desc: "و/أو/النفي لدمج الشروط.", ex: "&&   ||   !" },
    { name: "الشرطي الثلاثي", desc: "اختصار if/else في سطر واحد.", ex: "age >= 18 ? 'بالغ' : 'قاصر'" }
  ]},
  { cat: "الشروط (Conditions)", icon: "🔀", items: [
    { name: "if", desc: "تنفيذ كود إذا تحقق شرط.", ex: "if (x > 0) { … }" },
    { name: "else / else if", desc: "بدائل عند عدم تحقق الشرط.", ex: "if(a){}else if(b){}else{}" },
    { name: "switch", desc: "اختيار بين حالات متعددة لقيمة واحدة.", ex: "switch(day){ case 1: … break; }" }
  ]},
  { cat: "الحلقات (Loops)", icon: "🔁", items: [
    { name: "for", desc: "تكرار بعدد معروف من المرات.", ex: "for(let i=0;i<5;i++){ … }" },
    { name: "while", desc: "تكرار ما دام الشرط صحيحًا.", ex: "while(x < 10){ x++; }" },
    { name: "do…while", desc: "تكرار ينفّذ مرة على الأقل ثم يفحص.", ex: "do{ … }while(cond);" },
    { name: "for…of", desc: "المرور على قيم مصفوفة/نص.", ex: "for(const v of arr){ … }" },
    { name: "for…in", desc: "المرور على مفاتيح كائن.", ex: "for(const k in obj){ … }" },
    { name: "break / continue", desc: "إيقاف الحلقة / تخطي دورة واحدة.", ex: "if(x===3) break;" }
  ]},
  { cat: "الدوال (Functions)", icon: "🧩", items: [
    { name: "function", desc: "تعريف دالة قابلة لإعادة الاستدعاء.", ex: "function add(a,b){ return a+b; }" },
    { name: "الدالة السهمية", desc: "صيغة مختصرة لكتابة الدوال.", ex: "const add = (a,b) => a + b;" },
    { name: "return", desc: "إرجاع قيمة من الدالة وإنهاؤها.", ex: "return x * 2;" },
    { name: "المعاملات (parameters)", desc: "قيم تدخل إلى الدالة، مع قيم افتراضية.", ex: "function f(n = 1){ … }" },
    { name: "الاستدعاء", desc: "تنفيذ الدالة وتمرير الوسائط.", ex: "add(2, 3); // 5" }
  ]},
  { cat: "المصفوفات (Arrays)", icon: "📚", items: [
    { name: "length", desc: "عدد عناصر المصفوفة.", ex: "arr.length" },
    { name: "push / pop", desc: "إضافة/حذف من النهاية.", ex: "arr.push(4); arr.pop();" },
    { name: "shift / unshift", desc: "حذف/إضافة من البداية.", ex: "arr.unshift(0); arr.shift();" },
    { name: "indexOf / includes", desc: "موضع قيمة / هل هي موجودة؟", ex: "arr.includes(2) // true" },
    { name: "map", desc: "إنشاء مصفوفة جديدة بتحويل كل عنصر.", ex: "arr.map(n => n * 2)" },
    { name: "filter", desc: "تصفية عناصر تحقّق شرطًا.", ex: "arr.filter(n => n > 2)" },
    { name: "forEach", desc: "تنفيذ دالة على كل عنصر.", ex: "arr.forEach(n => …)" },
    { name: "find", desc: "أول عنصر يحقّق الشرط.", ex: "arr.find(n => n > 2)" },
    { name: "join / slice", desc: "دمج في نص / اقتطاع جزء.", ex: 'arr.join("-")' },
    { name: "sort", desc: "ترتيب عناصر المصفوفة.", ex: "arr.sort()" }
  ]},
  { cat: "الكائنات (Objects)", icon: "🗂️", items: [
    { name: "كائن حرفي", desc: "إنشاء كائن بأزواج مفتاح: قيمة.", ex: 'let u = { name:"علي", age:20 };' },
    { name: "الوصول بالنقطة", desc: "قراءة/تعديل خاصية عبر النقطة.", ex: "u.name" },
    { name: "الوصول بالأقواس", desc: "الوصول لخاصية باسم متغيّر/نص.", ex: 'u["age"]' },
    { name: "Object.keys", desc: "مصفوفة بأسماء المفاتيح.", ex: "Object.keys(u)" },
    { name: "Object.values", desc: "مصفوفة بالقيم.", ex: "Object.values(u)" }
  ]},
  { cat: "النصوص (Strings)", icon: "🔤", items: [
    { name: "length", desc: "عدد أحرف النص.", ex: '"مرحبا".length' },
    { name: "toUpperCase / toLowerCase", desc: "تحويل حالة الأحرف.", ex: '"hi".toUpperCase() // "HI"' },
    { name: "includes", desc: "هل يحتوي النص جزءًا معيّنًا؟", ex: '"cat".includes("a")' },
    { name: "slice", desc: "اقتطاع جزء من النص.", ex: '"hello".slice(0,2) // "he"' },
    { name: "split", desc: "تقسيم نص إلى مصفوفة.", ex: '"a,b".split(",")' },
    { name: "replace", desc: "استبدال جزء من النص.", ex: '"a-b".replace("-"," ")' },
    { name: "trim", desc: "إزالة الفراغات من الطرفين.", ex: '"  hi ".trim()' },
    { name: "القوالب النصية", desc: "دمج متغيرات داخل نص بـ ` ${} `.", ex: "`مرحبا ${name}`" }
  ]},
  { cat: "التعامل مع الصفحة (DOM)", icon: "🌳", items: [
    { name: "getElementById", desc: "اختيار عنصر عبر معرّفه id.", ex: 'document.getElementById("app")' },
    { name: "querySelector", desc: "اختيار أول عنصر مطابق لمحدّد CSS.", ex: 'document.querySelector(".box")' },
    { name: "querySelectorAll", desc: "اختيار كل العناصر المطابقة (قائمة).", ex: 'document.querySelectorAll("li")' },
    { name: "innerHTML", desc: "قراءة/تغيير محتوى HTML الداخلي.", ex: 'el.innerHTML = "<b>نص</b>"' },
    { name: "textContent", desc: "قراءة/تغيير النص فقط (بلا وسوم).", ex: 'el.textContent = "نص"' },
    { name: "createElement", desc: "إنشاء عنصر جديد.", ex: 'document.createElement("div")' },
    { name: "appendChild", desc: "إضافة عنصر ابن.", ex: "parent.appendChild(child)" },
    { name: "classList", desc: "إضافة/إزالة/تبديل الأصناف.", ex: 'el.classList.add("active")' },
    { name: "setAttribute", desc: "ضبط خاصية على عنصر.", ex: 'el.setAttribute("id","x")' },
    { name: "style", desc: "تعديل التنسيق مباشرة.", ex: 'el.style.color = "red"' }
  ]},
  { cat: "الأحداث (Events)", icon: "👆", items: [
    { name: "addEventListener", desc: "الاستماع لحدث وتنفيذ دالة عنده.", ex: 'btn.addEventListener("click", fn)' },
    { name: "click", desc: "حدث النقر على عنصر.", ex: 'el.addEventListener("click", …)' },
    { name: "input / change", desc: "تغيّر قيمة حقل إدخال.", ex: 'inp.addEventListener("input", …)' },
    { name: "submit", desc: "حدث إرسال النموذج.", ex: 'form.addEventListener("submit", …)' },
    { name: "كائن الحدث (event)", desc: "معلومات عن الحدث (الهدف، النوع…).", ex: "e => console.log(e.target)" },
    { name: "preventDefault", desc: "منع السلوك الافتراضي (كإرسال النموذج).", ex: "e.preventDefault()" }
  ]},
  { cat: "النماذج (Forms)", icon: "🧾", items: [
    { name: "value", desc: "قراءة/ضبط قيمة حقل الإدخال.", ex: "input.value" },
    { name: "checked", desc: "حالة صندوق الاختيار/الراديو.", ex: "checkbox.checked // true" },
    { name: "حدث submit", desc: "التقاط إرسال النموذج ومعالجته.", ex: 'form.addEventListener("submit", h)' },
    { name: "preventDefault", desc: "منع إعادة تحميل الصفحة عند الإرسال.", ex: "e.preventDefault()" }
  ]},
  { cat: "JSON", icon: "🧬", items: [
    { name: "JSON.stringify", desc: "تحويل كائن/مصفوفة إلى نص JSON.", ex: "JSON.stringify({a:1})" },
    { name: "JSON.parse", desc: "تحويل نص JSON إلى كائن.", ex: 'JSON.parse("{\\"a\\":1}")' }
  ]},
  { cat: "التخزين المحلي (Local Storage)", icon: "💾", items: [
    { name: "setItem", desc: "حفظ قيمة نصية بمفتاح في المتصفح.", ex: 'localStorage.setItem("k","v")' },
    { name: "getItem", desc: "قراءة قيمة محفوظة بمفتاحها.", ex: 'localStorage.getItem("k")' },
    { name: "removeItem", desc: "حذف عنصر محفوظ.", ex: 'localStorage.removeItem("k")' },
    { name: "clear", desc: "مسح كل المخزّن المحلي.", ex: "localStorage.clear()" }
  ]}
];

const REF_DATA = { html: HTML_REF, css: CSS_REF, js: JS_REF };

/* ============================================================
   اختبارات المرجع
   أنواع الأسئلة: mcq (اختيار), tf (صح/خطأ), fill (أكمل الفراغ)
   ============================================================ */
const REF_QUIZZES = {
  html: [
    { type: "mcq", q: "أي وسم يُستخدم لإنشاء رابط تشعّبي؟", options: ["<link>", "<a>", "<href>", "<url>"], a: 1, exp: "الوسم <a> ينشئ الروابط، وتحدَّد وجهته بخاصية href." },
    { type: "mcq", q: "ما الخاصية التي تحدّد وجهة الرابط في <a>؟", options: ["src", "link", "href", "target"], a: 2, exp: "href تحمل عنوان الوجهة." },
    { type: "fill", q: "لإدراج صورة نستخدم الوسم ____ .", a: ["<img>", "img"], exp: "<img> وسم فردي يتطلب src وalt." },
    { type: "tf", q: "الوسم <img> يتطلب وسم إغلاق </img>.", a: false, exp: "<img> وسم فردي (ذاتي الإغلاق) بلا وسم إغلاق." },
    { type: "mcq", q: "ما الخاصية التي تعرض نصًا بديلًا عند تعذّر تحميل الصورة؟", options: ["title", "alt", "src", "name"], a: 1, exp: "alt تعرض نصًا بديلًا ومهمة للوصولية." },
    { type: "mcq", q: "أيّ وسم يُنشئ قائمة مرتّبة بالأرقام؟", options: ["<ul>", "<li>", "<ol>", "<dl>"], a: 2, exp: "<ol> مرتّبة (أرقام)، و<ul> غير مرتّبة (نقاط)." },
    { type: "fill", q: "كل عنصر داخل القائمة يُكتب داخل الوسم ____ .", a: ["<li>", "li"], exp: "<li> يمثّل بندًا في ul أو ol." },
    { type: "mcq", q: "أي وسم يمثّل صفًا داخل الجدول؟", options: ["<td>", "<tr>", "<th>", "<table>"], a: 1, exp: "<tr> صف، و<td> خلية بيانات، و<th> خلية عنوان." },
    { type: "tf", q: "الوسم <th> يمثّل خلية عنوان وتظهر عريضة ووسطى افتراضيًا.", a: true, exp: "th = table header." },
    { type: "fill", q: "لدمج خلية عبر عدة أعمدة نستخدم الخاصية ____ .", a: ["colspan"], exp: "colspan للأعمدة، وrowspan للصفوف." },
    { type: "mcq", q: "أي وسم يُنشئ حقل إدخال في النموذج؟", options: ["<form>", "<input>", "<label>", "<field>"], a: 1, exp: "<input> حقل إدخال متعدد الأنواع عبر type." },
    { type: "mcq", q: "لجعل حقل النموذج إجباريًا نستخدم الخاصية:", options: ["needed", "must", "required", "important"], a: 2, exp: "required تمنع الإرسال ما لم يُملأ الحقل." },
    { type: "fill", q: "نص التلميح داخل الحقل يُضبط بالخاصية ____ .", a: ["placeholder"], exp: "placeholder يظهر كتلميح يختفي عند الكتابة." },
    { type: "mcq", q: "أيّ نوع input يُنشئ صندوق اختيار؟", options: ['type="text"', 'type="checkbox"', 'type="button"', 'type="email"'], a: 1, exp: 'type="checkbox" لصندوق اختيار متعدد.' },
    { type: "tf", q: "الوسم <label> يُحسّن الوصولية عبر ربطه بحقل بخاصية for.", a: true, exp: "for في label = id الحقل المرتبط." },
    { type: "mcq", q: "أي وسم دلالي يمثّل شريط التنقّل الرئيسي؟", options: ["<header>", "<nav>", "<aside>", "<section>"], a: 1, exp: "<nav> مخصص لروابط التنقّل." },
    { type: "mcq", q: "أي وسم يجب أن يظهر مرة واحدة للمحتوى الرئيسي؟", options: ["<section>", "<article>", "<main>", "<div>"], a: 2, exp: "<main> للمحتوى الرئيسي الفريد للصفحة." },
    { type: "fill", q: "تذييل الصفحة أو القسم يُكتب داخل الوسم الدلالي ____ .", a: ["<footer>", "footer"], exp: "<footer> يمثّل التذييل." },
    { type: "tf", q: "<article> يمثّل محتوى قائمًا بذاته مثل مقال أو تدوينة.", a: true, exp: "قابل لإعادة النشر باستقلالية." },
    { type: "mcq", q: "أين توضع الوسوم الوصفية مثل <meta> و<title>؟", options: ["داخل <body>", "داخل <head>", "داخل <footer>", "خارج <html>"], a: 1, exp: "<head> يحوي البيانات الوصفية غير المرئية." },
    { type: "mcq", q: "ما الوسم الذي يحدّد ترميز المحارف UTF-8؟", options: ["<meta charset>", "<encoding>", "<utf>", "<lang>"], a: 0, exp: '<meta charset="UTF-8"> يضمن عرض العربية سليمة.' },
    { type: "fill", q: "لربط ملف CSS خارجي نستخدم الوسم ____ .", a: ["<link>", "link"], exp: '<link rel="stylesheet" href="style.css">.' },
    { type: "tf", q: "الوسم <br> يُستخدم لعمل كسر سطر (سطر جديد).", a: true, exp: "<br> وسم فردي لكسر السطر." },
    { type: "mcq", q: "أي وسم يمثّل نصًا مهمًّا دلاليًا (يظهر عريضًا)؟", options: ["<b>", "<strong>", "<big>", "<mark>"], a: 1, exp: "<strong> أهمية دلالية، و<b> عريض بصري فقط." },
    { type: "mcq", q: "لتضمين فيديو خارجي أو صفحة داخل الصفحة نستخدم:", options: ["<video>", "<embed>", "<iframe>", "<frame>"], a: 2, exp: "<iframe> يضمّن مستندًا/فيديو خارجيًا." },
    { type: "fill", q: "أعلى مستوى للعناوين هو الوسم ____ .", a: ["<h1>", "h1"], exp: "h1 الأهم، وتتدرّج حتى h6." }
  ],
  css: [
    { type: "mcq", q: "أي محدّد يستهدف عنصرًا بحسب صنفه (class)؟", options: ["#name", ".name", "name", "*name"], a: 1, exp: "النقطة (.) للأصناف، والمربّع (#) للـ id." },
    { type: "mcq", q: "المحدّد # يُستخدم لاستهداف:", options: ["صنف", "معرّف id", "كل العناصر", "وسم"], a: 1, exp: "# للـ id الفريد الذي لا يتكرر." },
    { type: "fill", q: "لتغيير لون النص نستخدم الخاصية ____ .", a: ["color"], exp: "color تخص لون النص فقط." },
    { type: "mcq", q: "أي خاصية تحدّد لون خلفية العنصر؟", options: ["color", "background-color", "bgcolor", "fill"], a: 1, exp: "background-color للخلفية، وcolor للنص." },
    { type: "tf", q: "القيمة rgba() تسمح بتحديد الشفافية للّون.", a: true, exp: "المكوّن a (alpha) بين 0 و1 يضبط الشفافية." },
    { type: "mcq", q: "لتوسيط النص أفقيًا نستخدم:", options: ["align: center", "text-align: center", "text-center: 1", "center: text"], a: 1, exp: "text-align تتحكم بمحاذاة النص أفقيًا." },
    { type: "fill", q: "لإزالة الخط تحت الروابط نضبط text-decoration على القيمة ____ .", a: ["none"], exp: "text-decoration: none تزيل الخط السفلي." },
    { type: "mcq", q: "أي خاصية تحدّد سماكة الخط؟", options: ["font-style", "font-size", "font-weight", "text-weight"], a: 2, exp: "font-weight (bold أو 100–900)." },
    { type: "mcq", q: "أي خاصية تُدوّر زوايا العنصر؟", options: ["border-style", "border-radius", "round", "corner"], a: 1, exp: "border-radius، و50% تصنع دائرة." },
    { type: "fill", q: "الاختصار «1px solid #333» يُكتب في الخاصية ____ .", a: ["border"], exp: "border يجمع السماكة والنمط واللون." },
    { type: "tf", q: "margin هو المسافة الداخلية بين الحد والمحتوى.", a: false, exp: "margin مسافة خارجية، وpadding داخلية." },
    { type: "mcq", q: "لتوسيط حاوية أفقيًا (بعرض محدّد) نستخدم:", options: ["margin: 0 auto", "padding: auto", "text-align: center", "float: center"], a: 0, exp: "margin: 0 auto يوزّع الهامش الأفقي بالتساوي." },
    { type: "mcq", q: "أي قيمة display تُخفي العنصر ولا تترك له مساحة؟", options: ["hidden", "none", "invisible", "0"], a: 1, exp: "display: none يزيله من التدفق تمامًا." },
    { type: "fill", q: "لتفعيل تخطيط Flexbox على الحاوية نضبط display على ____ .", a: ["flex"], exp: "display: flex يحوّل الأب لحاوية مرنة." },
    { type: "mcq", q: "أي خاصية تحاذي عناصر الفلكس على المحور الرئيسي؟", options: ["align-items", "justify-content", "flex-wrap", "align-self"], a: 1, exp: "justify-content على المحور الرئيسي (الأفقي في row)." },
    { type: "mcq", q: "align-items في Flexbox تتحكم بالمحاذاة على:", options: ["المحور الرئيسي", "المحور المتقاطع", "الاتجاه", "الترتيب"], a: 1, exp: "المحور المتقاطع (الرأسي في row)." },
    { type: "mcq", q: "أي قيمة position تثبّت العنصر بالنسبة للنافذة أثناء التمرير؟", options: ["absolute", "relative", "fixed", "static"], a: 2, exp: "fixed يبقى ثابتًا بالنسبة للنافذة." },
    { type: "fill", q: "خاصية ترتيب التراكب (أيّهما فوق) هي ____ .", a: ["z-index", "zindex"], exp: "z-index الأكبر يظهر فوق." },
    { type: "tf", q: "position: absolute يتموضع بالنسبة لأقرب أب متموضع (غير static).", a: true, exp: "لذا يُجعل الأب relative عادةً." },
    { type: "mcq", q: "أي خاصية تتحكم بالمحتوى الزائد عن حدود العنصر؟", options: ["overflow", "resize", "clip", "scrollbar"], a: 0, exp: "overflow: hidden/scroll/auto." },
    { type: "fill", q: "لجعل عنصر نصف شفاف نضبط opacity على القيمة ____ .", a: ["0.5", ".5"], exp: "opacity من 0 (شفاف) إلى 1 (معتم)." },
    { type: "mcq", q: "لجعل المؤشر يظهر كيدٍ فوق الأزرار نستخدم:", options: ["cursor: hand", "cursor: pointer", "cursor: click", "pointer: on"], a: 1, exp: "cursor: pointer." },
    { type: "mcq", q: "أي خاصية تحرّك تغيّر الخصائص بسلاسة؟", options: ["animation", "transition", "transform", "move"], a: 1, exp: "transition مثل: all 0.3s ease." },
    { type: "fill", q: "لإزالة نقاط القائمة نضبط list-style-type على ____ .", a: ["none"], exp: "list-style-type: none." },
    { type: "mcq", q: "لدمج حدود خلايا الجدول في حد واحد نستخدم:", options: ["border-merge", "border-collapse: collapse", "table-border: 1", "collapse: true"], a: 1, exp: "border-collapse: collapse." },
    { type: "tf", q: "max-width: 100% تساعد على جعل التصميم متجاوبًا ومنع تجاوز العرض.", a: true, exp: "تمنع العنصر من تجاوز عرض حاويته." }
  ],
  js: [
    { type: "mcq", q: "أي كلمة تُعرّف ثابتًا لا يُعاد إسناده؟", options: ["var", "let", "const", "static"], a: 2, exp: "const للثوابت، وlet للمتغيرات القابلة للتغيير." },
    { type: "tf", q: "المتغيّر المعرّف بـ let يمكن إعادة إسناد قيمة جديدة له.", a: true, exp: "let قابل لإعادة الإسناد، بخلاف const." },
    { type: "fill", q: "لمعرفة نوع قيمة نستخدم العامل ____ .", a: ["typeof"], exp: 'typeof 5 يعيد "number".' },
    { type: "mcq", q: "أي عامل يقارن القيمة والنوع معًا؟", options: ["==", "===", "=", "!="], a: 1, exp: "=== يقارن دون تحويل النوع (الأدق)." },
    { type: "mcq", q: "ما ناتج 5 === \"5\" ؟", options: ["true", "false", "خطأ", "5"], a: 1, exp: "الأنواع مختلفة (رقم ونص) فالناتج false." },
    { type: "fill", q: "العامل ____ يمثّل «باقي القسمة» (modulo).", a: ["%"], exp: "% يعيد باقي القسمة، مثل 7 % 2 = 1." },
    { type: "mcq", q: "أي بنية تُنفّذ كودًا عند تحقّق شرط؟", options: ["for", "if", "function", "switch"], a: 1, exp: "if للشروط، وfor/while للتكرار." },
    { type: "mcq", q: "أي حلقة تُنفّذ مرة واحدة على الأقل قبل فحص الشرط؟", options: ["for", "while", "do…while", "for…of"], a: 2, exp: "do…while تفحص الشرط بعد التنفيذ." },
    { type: "fill", q: "للمرور على قيم مصفوفة نستخدم الحلقة for…____ .", a: ["of"], exp: "for…of للقيم، وfor…in للمفاتيح." },
    { type: "mcq", q: "ما الكلمة التي توقف الحلقة تمامًا؟", options: ["stop", "continue", "break", "return"], a: 2, exp: "break تخرج من الحلقة، وcontinue تتخطى دورة." },
    { type: "mcq", q: "أي صيغة تُمثّل دالة سهمية صحيحة؟", options: ["(a,b) => a+b", "function => a+b", "=> (a,b) a+b", "a,b -> a+b"], a: 0, exp: "الدالة السهمية: (params) => expression." },
    { type: "fill", q: "لإرجاع قيمة من دالة نستخدم الكلمة ____ .", a: ["return"], exp: "return تُرجع القيمة وتُنهي الدالة." },
    { type: "mcq", q: "أي دالة مصفوفة تُنشئ مصفوفة جديدة بتحويل كل عنصر؟", options: ["forEach", "filter", "map", "find"], a: 2, exp: "map تُعيد مصفوفة جديدة بنفس الطول." },
    { type: "mcq", q: "أي دالة تُرجع العناصر التي تحقّق شرطًا فقط؟", options: ["map", "filter", "reduce", "some"], a: 1, exp: "filter تُصفّي وتُعيد مصفوفة جديدة." },
    { type: "fill", q: "لإضافة عنصر إلى نهاية المصفوفة نستخدم الدالة ____ .", a: ["push"], exp: "arr.push(x) تضيف للنهاية، وpop تحذف منها." },
    { type: "tf", q: "arr.length تُعيد عدد عناصر المصفوفة.", a: true, exp: "length خاصية بعدد العناصر." },
    { type: "mcq", q: "كيف نصل إلى خاصية name في كائن u؟", options: ["u->name", "u.name", "u::name", "name(u)"], a: 1, exp: "بالنقطة u.name أو بالأقواس u[\"name\"]." },
    { type: "mcq", q: "أي دالة تختار عنصرًا عبر معرّفه id؟", options: ["querySelectorAll", "getElementById", "getElementsByClass", "selectId"], a: 1, exp: 'document.getElementById("app").' },
    { type: "fill", q: "لاختيار أول عنصر مطابق لمحدّد CSS نستخدم document.____ .", a: ["querySelector", "queryselector"], exp: 'querySelector(".box") تعيد أول تطابق.' },
    { type: "mcq", q: "أي خاصية تغيّر النص فقط دون تفسير وسوم HTML؟", options: ["innerHTML", "textContent", "value", "innerText only"], a: 1, exp: "textContent تتعامل مع النص فقط بأمان." },
    { type: "fill", q: "لإضافة صنف لعنصر نستخدم el.classList.____('active') .", a: ["add"], exp: "classList.add/remove/toggle للتحكم بالأصناف." },
    { type: "mcq", q: "أي دالة تربط حدثًا بعنصر؟", options: ["onEvent", "addEventListener", "attachEvent", "listen"], a: 1, exp: 'el.addEventListener("click", fn).' },
    { type: "fill", q: "لمنع السلوك الافتراضي لحدث (كإرسال النموذج) نستخدم e.____() .", a: ["preventDefault", "preventdefault"], exp: "e.preventDefault() يمنع السلوك الافتراضي." },
    { type: "mcq", q: "لقراءة ما كتبه المستخدم في حقل إدخال نستخدم:", options: ["input.text", "input.value", "input.content", "input.data"], a: 1, exp: "input.value يحمل القيمة المُدخلة." },
    { type: "mcq", q: "أي دالة تحوّل كائنًا إلى نص JSON؟", options: ["JSON.parse", "JSON.stringify", "JSON.toText", "toJSON"], a: 1, exp: "JSON.stringify(obj) → نص، وJSON.parse عكسها." },
    { type: "fill", q: "لحفظ قيمة دائمة في المتصفح نستخدم localStorage.____('key','value') .", a: ["setItem", "setitem"], exp: "setItem للحفظ، وgetItem للقراءة." }
  ]
};

/* ============================================================
   أدوات عرض مشتركة
   ============================================================ */
// عرض جزء كود سطري بخط ثابت واتجاه LTR
function refCode(s) {
  return '<code class="ref-code" dir="ltr">' + esc(s) + "</code>";
}

function refCounts(kind) {
  return REF_DATA[kind].reduce((sum, c) => sum + c.items.length, 0);
}

/* ============================================================
   الصفحة الرئيسية للمرجع (#/reference)
   ============================================================ */
function renderReferenceHub() {
  const box = $("#view-reference");
  box.innerHTML = `
    <div class="hero glass">
      <h1>📘 المرجع السريع</h1>
      <p>مرجع مختصر ومنظّم لأهم وسوم HTML وخصائص CSS وأساسيات JavaScript — للمراجعة السريعة قبل الامتحان، مع اختبار شامل لكل قسم. قسم مستقل تمامًا عن بنك أسئلة المحاضرات.</p>
      <div class="hero-actions">
        <a class="btn btn-primary" href="#/reference/html">🌐 HTML</a>
        <a class="btn" href="#/reference/css">🎨 CSS</a>
        <a class="btn" href="#/reference/js">⚡ JavaScript</a>
      </div>
    </div>

    <h2 class="section-title">📚 اختر المرجع</h2>
    <div class="courses-grid">
      ${["html", "css", "js"].map(k => refHubCardHTML(k)).join("")}
    </div>

    <h2 class="section-title">📝 الاختبارات المرجعية</h2>
    <div class="exam-cards-grid">
      ${["html", "css", "js"].map(k => {
        const m = REF_META[k];
        return `
        <div class="card exam-launch-card">
          <div class="exam-launch-icon">${m.icon}</div>
          <h3>اختبار ${esc(m.short)} الشامل</h3>
          <p>${REF_QUIZZES[k].length} سؤالًا · اختيار من متعدد وصح/خطأ وأكمل الفراغ · تصحيح فوري</p>
          <a class="btn btn-primary btn-sm" href="#/reference/${k}/quiz">🚀 ابدأ الاختبار</a>
        </div>`;
      }).join("")}
    </div>
  `;
}

function refHubCardHTML(kind) {
  const m = REF_META[kind];
  const cats = REF_DATA[kind];
  return `
    <a class="course-card card" href="#/reference/${kind}" style="--course-color:${m.color}">
      <div class="course-head">
        <span class="course-icon">${m.icon}</span>
        <div>
          <h3>${esc(m.short)}</h3>
          <small>${cats.length} فئة · ${refCounts(kind)} عنصر</small>
        </div>
      </div>
      <p>${esc(m.subtitle)}</p>
      <div class="lec-meta" style="display:flex;gap:8px;flex-wrap:wrap">
        <span class="chip">📂 ${cats.length} فئة</span>
        <span class="chip success">📝 ${REF_QUIZZES[kind].length} سؤال اختبار</span>
      </div>
    </a>`;
}

/* ============================================================
   صفحة مرجع واحد (#/reference/html | css | js)
   ============================================================ */
function renderReferenceSection(kind) {
  const box = $("#view-reference");
  const m = REF_META[kind];
  if (!m) { location.hash = "#/reference"; return; }
  const cats = REF_DATA[kind];

  box.innerHTML = `
    <div class="card lec-hero" style="--course-color:${m.color}">
      <span class="lec-icon-big" style="background:${m.color}22;font-size:2.1rem">${m.icon}</span>
      <div>
        <div class="lec-sub">مرجع سريع · ${esc(m.subtitle)}</div>
        <h2>${esc(m.title)}</h2>
      </div>
      <div class="lec-actions">
        <a class="btn btn-primary btn-sm" href="#/reference/${kind}/quiz">📝 اختبار ${esc(m.short)}</a>
        <a class="btn btn-sm" href="#/reference">↩ كل المراجع</a>
      </div>
    </div>

    <div class="card ref-controls">
      <input type="search" id="ref-filter" placeholder="🔎 ابحث بسرعة في مرجع ${esc(m.short)}…" autocomplete="off" />
      <div class="ref-cat-nav">
        ${cats.map((c, i) => `<a href="#ref-cat-${i}" class="chip ref-cat-chip">${c.icon} ${esc(c.cat)}</a>`).join("")}
      </div>
    </div>

    <div id="ref-tables">
      ${cats.map((c, i) => refCategoryHTML(kind, c, i)).join("")}
    </div>

    <div id="ref-no-results" class="empty-state card" hidden>
      <div class="empty-icon">🤷</div><p>لا توجد نتائج مطابقة — جرّب كلمة أخرى.</p>
    </div>

    <div class="card playground-promo ref-quiz-cta">
      <div>
        <h3>📝 اختبر نفسك في ${esc(m.short)}</h3>
        <p>اختبار شامل بتصحيح فوري ودرجة نهائية وإجابات نموذجية — لتثبيت المعلومات.</p>
      </div>
      <a class="btn btn-primary" href="#/reference/${kind}/quiz">ابدأ الاختبار الشامل</a>
    </div>
  `;

  bindRefFilter();
}

// جدول فئة واحدة (يختلف حسب النوع)
function refCategoryHTML(kind, cat, i) {
  let head, rows;
  if (kind === "html") {
    head = "<tr><th>الوسم</th><th>الوظيفة</th><th>أهم الخصائص</th><th>مثال</th></tr>";
    rows = cat.items.map(it => `
      <tr class="ref-row" data-search="${esc((it.tag + " " + it.desc + " " + it.attrs).toLowerCase())}">
        <td>${refCode(it.tag)}</td>
        <td>${esc(it.desc)}</td>
        <td>${it.attrs === "—" ? "—" : `<span class="ref-attrs">${esc(it.attrs)}</span>`}</td>
        <td>${it.ex ? refCode(it.ex) : "—"}</td>
      </tr>`).join("");
  } else if (kind === "css") {
    head = "<tr><th>الخاصية</th><th>الوظيفة</th><th>أشهر القيم</th><th>ملاحظة</th></tr>";
    rows = cat.items.map(it => `
      <tr class="ref-row" data-search="${esc((it.prop + " " + it.desc + " " + it.vals).toLowerCase())}">
        <td>${refCode(it.prop)}</td>
        <td>${esc(it.desc)}</td>
        <td><span class="ref-attrs">${esc(it.vals)}</span></td>
        <td>${it.note === "—" ? "—" : esc(it.note)}</td>
      </tr>`).join("");
  } else {
    head = "<tr><th>العنصر</th><th>الوظيفة</th><th>مثال</th></tr>";
    rows = cat.items.map(it => `
      <tr class="ref-row" data-search="${esc((it.name + " " + it.desc + " " + it.ex).toLowerCase())}">
        <td>${refCode(it.name)}</td>
        <td>${esc(it.desc)}</td>
        <td>${it.ex ? refCode(it.ex) : "—"}</td>
      </tr>`).join("");
  }

  return `
    <section class="ref-cat card" id="ref-cat-${i}">
      <h3 class="ref-cat-title">${cat.icon} ${esc(cat.cat)} <span class="chip">${cat.items.length}</span></h3>
      <div class="table-scroll">
        <table class="lesson-table ref-table">
          <thead>${head}</thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </section>`;
}

// بحث/تصفية فوري داخل جداول المرجع
function bindRefFilter() {
  const input = $("#ref-filter");
  if (!input) return;
  input.addEventListener("input", () => {
    const term = input.value.trim().toLowerCase();
    let anyVisible = false;
    $$(".ref-cat").forEach(cat => {
      let catVisible = false;
      $$(".ref-row", cat).forEach(row => {
        const match = !term || (row.dataset.search || "").includes(term);
        row.hidden = !match;
        if (match) catVisible = true;
      });
      cat.hidden = !catVisible;
      if (catVisible) anyVisible = true;
    });
    const empty = $("#ref-no-results");
    if (empty) empty.hidden = anyVisible;
  });
}

/* ============================================================
   صفحة اختبار المرجع (#/reference/html/quiz)
   ============================================================ */
function renderRefQuizPage(kind) {
  const box = $("#view-reference");
  const m = REF_META[kind];
  const questions = REF_QUIZZES[kind];
  if (!m || !questions) { location.hash = "#/reference"; return; }

  box.innerHTML = `
    <div class="card lec-hero" style="--course-color:${m.color}">
      <span class="lec-icon-big" style="background:${m.color}22;font-size:2.1rem">${m.icon}</span>
      <div>
        <div class="lec-sub">اختبار مرجعي شامل · تثبيت المعلومات</div>
        <h2>اختبار ${esc(m.short)} الشامل</h2>
      </div>
      <div class="lec-actions">
        <a class="btn btn-sm" href="#/reference/${kind}">📘 مرجع ${esc(m.short)}</a>
        <a class="btn btn-sm" href="#/reference">↩ كل المراجع</a>
      </div>
    </div>
    <div id="ref-quiz-area"></div>
  `;

  startRefQuiz($("#ref-quiz-area"), questions, m);
}

function startRefQuiz(area, sourceQuestions, meta) {
  const questions = shuffle(sourceQuestions);

  area.innerHTML = `
    <div id="ref-quiz-result"></div>
    <div class="card ref-quiz-intro">
      <p style="margin:0;color:var(--text-soft)">أجب عن الأسئلة الـ<strong>${questions.length}</strong>، ثم اضغط «تصحيح الاختبار» لعرض درجتك والإجابات النموذجية. يمكنك إعادة الاختبار بترتيب جديد في أي وقت.</p>
    </div>
    <form id="ref-quiz-form" autocomplete="off">
      ${questions.map((q, i) => refQuestionHTML(q, i)).join("")}
    </form>
    <div class="ref-quiz-actions">
      <button type="button" class="btn btn-primary" id="ref-quiz-submit">✅ تصحيح الاختبار</button>
      <button type="button" class="btn" id="ref-quiz-reset">🔄 إعادة بترتيب جديد</button>
    </div>
  `;

  $("#ref-quiz-submit").addEventListener("click", () => gradeRefQuiz(area, questions, meta));
  $("#ref-quiz-reset").addEventListener("click", () => startRefQuiz(area, sourceQuestions, meta));
}

function refQuestionHTML(q, i) {
  let body = "";
  if (q.type === "mcq") {
    body = `<div class="options-list">${q.options.map((o, k) => `
      <label class="option-btn ref-opt">
        <input type="radio" name="q${i}" value="${k}">
        <span>${["أ", "ب", "ج", "د"][k] || (k + 1)}) ${esc(o)}</span>
      </label>`).join("")}</div>`;
  } else if (q.type === "tf") {
    body = `<div class="tf-row">
      <label class="option-btn ref-opt"><input type="radio" name="q${i}" value="true"><span>✔ صح</span></label>
      <label class="option-btn ref-opt"><input type="radio" name="q${i}" value="false"><span>✘ خطأ</span></label>
    </div>`;
  } else { // fill
    body = `<div class="fill-row">
      <input type="text" name="q${i}" placeholder="اكتب إجابتك هنا…" autocomplete="off">
    </div>`;
  }

  return `
    <div class="q-card card ref-q" data-qi="${i}" data-type="${q.type}">
      <div class="q-head">
        <span class="q-num">س${i + 1}</span>
        <span class="chip">${TYPE_LABELS[q.type]}</span>
      </div>
      <div class="q-text">${blanks(esc(q.q))}</div>
      <div class="ref-q-body">${body}</div>
      <div class="ref-q-feedback"></div>
    </div>`;
}

function gradeRefQuiz(area, questions, meta) {
  let correct = 0, answered = 0;

  questions.forEach((q, i) => {
    const card = area.querySelector(`.ref-q[data-qi="${i}"]`);
    const fb = card.querySelector(".ref-q-feedback");
    let ok = false, didAnswer = false, correctText = "";

    if (q.type === "mcq") {
      const sel = area.querySelector(`input[name="q${i}"]:checked`);
      didAnswer = !!sel;
      const chosen = sel ? parseInt(sel.value, 10) : -1;
      ok = chosen === q.a;
      correctText = q.options[q.a];
      card.querySelectorAll(".ref-opt").forEach((lab, k) => {
        lab.querySelector("input").disabled = true;
        if (k === q.a) lab.classList.add("correct");
        else if (k === chosen) lab.classList.add("wrong");
      });
    } else if (q.type === "tf") {
      const sel = area.querySelector(`input[name="q${i}"]:checked`);
      didAnswer = !!sel;
      const chosen = sel ? (sel.value === "true") : null;
      ok = chosen === q.a;
      correctText = q.a ? "صح" : "خطأ";
      card.querySelectorAll(".ref-opt").forEach(lab => {
        const input = lab.querySelector("input");
        input.disabled = true;
        const v = input.value === "true";
        if (v === q.a) lab.classList.add("correct");
        else if (chosen !== null && v === chosen) lab.classList.add("wrong");
      });
    } else { // fill
      const inp = area.querySelector(`input[name="q${i}"]`);
      const val = inp.value;
      didAnswer = !!val.trim();
      ok = fillMatches(val, q.a);
      correctText = q.a[0];
      inp.disabled = true;
      inp.classList.add(ok ? "ref-fill-ok" : "ref-fill-no");
    }

    if (ok) correct++;
    if (didAnswer) answered++;
    card.classList.add(ok ? "ref-correct" : "ref-wrong");

    const head = ok ? "✅ إجابة صحيحة" : (didAnswer ? "❌ إجابة خاطئة" : "⏭ لم تُجب");
    fb.innerHTML = `<div class="feedback ${ok ? "ok" : "no"}">${head}
      <div class="fb-detail">الإجابة الصحيحة: <strong>${esc(String(correctText))}</strong>${q.exp ? ` — ${esc(q.exp)}` : ""}</div>
    </div>`;
  });

  const total = questions.length;
  const pct = Math.round((correct / total) * 100);
  const grade =
    pct >= 90 ? "🏆 ممتاز — إتقان رائع!" :
    pct >= 75 ? "🥇 جيد جدًا — اقتربت من الإتقان" :
    pct >= 60 ? "🥈 جيد — راجع ما فاتك" :
    pct >= 50 ? "🥉 مقبول — راجع المرجع جيدًا" :
    "📖 تحتاج مراجعة أعمق — عُد إلى المرجع وأعد المحاولة";

  const submitBtn = $("#ref-quiz-submit");
  if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "✅ تم التصحيح"; }

  const res = $("#ref-quiz-result");
  res.innerHTML = `
    <div class="card result-hero ref-result">
      <div class="score-ring" style="--pct:${pct}"><div class="score-inner">${pct}%</div></div>
      <h2 style="margin-bottom:6px">نتيجة اختبار ${esc(meta.short)}</h2>
      <p style="color:var(--text-soft)">${grade}</p>
      <div class="result-stats">
        <span class="chip success">✔ صحيحة: ${correct}</span>
        <span class="chip danger">✘ خاطئة: ${total - correct}</span>
        <span class="chip warn">⏭ متروكة: ${total - answered}</span>
        <span class="chip">📊 ${correct} / ${total}</span>
      </div>
      <div class="hero-actions">
        <button type="button" class="btn btn-primary" id="ref-result-retry">🔄 إعادة الاختبار</button>
        <a class="btn" href="#/reference/${quizKindFromMeta(meta)}">📘 العودة للمرجع</a>
      </div>
    </div>
  `;

  $("#ref-result-retry").addEventListener("click", () => {
    const kind = quizKindFromMeta(meta);
    startRefQuiz(area, REF_QUIZZES[kind], meta);
    $("#view-reference").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  res.scrollIntoView({ behavior: "smooth", block: "start" });
}

// إيجاد مفتاح النوع من كائن الميتا
function quizKindFromMeta(meta) {
  return Object.keys(REF_META).find(k => REF_META[k] === meta) || "html";
}

/* ============================================================
   نقطة الدخول من الموجّه (router) في script.js
   ============================================================ */
function renderReference(kind, sub) {
  if (!kind) { renderReferenceHub(); return; }
  if (!REF_META[kind]) { location.hash = "#/reference"; return; }
  if (sub === "quiz") renderRefQuizPage(kind);
  else renderReferenceSection(kind);
}
