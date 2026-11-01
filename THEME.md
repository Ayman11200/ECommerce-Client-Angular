# THEME.md — Fit Plus

مرجع التصميم الوحيد لمتجر Fit Plus. يُقرأ مع ملف `AGENTS.md` قبل أي تعديل بصري.

## 0. بروتوكول بداية الجلسة

لا تبدأ بمراجعة شاملة أو مرحلة تدقيق مستقلة. في بداية كل جلسة:

1. اقرأ `AGENTS.md` في الجذر وأي `AGENTS.md` داخل نطاق ملفات المرحلة.
2. اقرأ هذا الملف ومرحلة العمل المحددة فقط من `FITPLUS_PLAN.md`.
3. افحص ملفات المرحلة المذكورة في جدولها، والـ templates أو الخدمات المباشرة اللازمة لها فقط.
4. لا تعمل `grep` شاملًا للمشروع، ولا تعدّ الألوان أو الـ classes في كل الكود، ولا تقرأ صفحات خارج المرحلة إلا إذا كانت dependency مباشرة تمنع التنفيذ.

يُجرى فحص محدود بعد كل مرحلة للملفات التي تغيرت فقط. المراجعة الشاملة الوحيدة هي المرحلة النهائية في الخطة.

## 1. اتجاه العلامة

- الاسم: **Fit Plus**.
- الواجهة فاتحة ونظيفة ورياضية؛ صور المنتجات ذات الخلفية البيضاء تندمج طبيعيًا فيها.
- الجزر الداكنة: navbar وfooter وHero الصفحة الرئيسية وبانر الدعوة الختامي فقط.
- اللون الحاد الوحيد برتقالي محروق، ويُستخدم باعتدال للأزرار الأساسية والحالات النشطة والأسعار والشارات وحلقة التركيز.
- لا تستخدم أزرقًا أو بنفسجيًا أو تركوازيًا من الثيم القديم. لا تضع خلفية داكنة خلف صورة منتج.

## 2. التوكنز

المكان الوحيد المسموح فيه بقيم ألوان literal هو `src/styles/_tokens.scss`:

```scss
:root {
  color-scheme: light;

  --fp-bg: #f5f6f8;
  --fp-surface: #ffffff;
  --fp-surface-2: #eef0f3;
  --fp-border: #dfe3e8;
  --fp-image-stage: #ffffff;

  --fp-dark-bg: #14161a;
  --fp-dark-surface: #1c1f25;
  --fp-dark-border: #2e333d;
  --fp-on-dark: #f1f2f4;
  --fp-on-dark-muted: #9aa1ad;

  --fp-text: #1c1f25;
  --fp-text-muted: #5f6773;
  --fp-on-primary: #ffffff;

  --fp-primary: #e8590c;
  --fp-primary-hover: #d9480f;
  --fp-primary-active: #bf3f0a;
  --fp-primary-text: #c2410c;
  --fp-primary-soft: rgba(232, 89, 12, 0.12);
  --fp-primary-rgb: 232, 89, 12;

  --fp-success: #15803d;
  --fp-success-soft: rgba(21, 128, 61, 0.12);
  --fp-danger: #dc2626;
  --fp-danger-soft: rgba(220, 38, 38, 0.1);
  --fp-warning: #b45309;
  --fp-warning-soft: rgba(180, 83, 9, 0.12);
  --fp-info: #0369a1;
  --fp-info-soft: rgba(3, 105, 161, 0.1);
  --fp-star: #f2b01e;
  --fp-overlay: rgba(20, 22, 26, 0.72);

  --fp-radius-sm: 0.375rem;
  --fp-radius: 0.5rem;
  --fp-radius-lg: 0.75rem;
  --fp-shadow: 0 6px 20px rgba(20, 22, 26, 0.1);
  --fp-focus-ring: 0 0 0 0.2rem rgba(232, 89, 12, 0.35);
  --fp-transition: 0.25s ease;

  --fp-font-body: 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif;
  --fp-font-heading: 'Barlow Condensed', 'Inter', sans-serif;
}
```

استخدم خلفية soft ولون الحالة نفسه لشارات الحالة والتنبيهات. تظل حالة الطلب محايدة في التنفيذ الحالي؛ ربط Pending وPaymentReceived وPaymentFaild ديناميكيًا مؤجل.

## 3. الخطوط

- العناوين والأسعار واسم العلامة: Barlow Condensed بوزن 600 أو 700، والعناوين الرئيسية uppercase مع `letter-spacing: .02em`.
- النصوص والنماذج والجداول والأزرار: Inter بوزن 400 أو 500 أو 600.
- حمّل Inter (400/500/600) وBarlow Condensed (600/700) من Google Fonts مع `display=swap`.
- يجب أن تستخدم Angular Material العائلتين نفسيهما، وأن ينتهي كل `font-family` بعائلة generic.

## 4. الغلاف العام

يجب أن يكون `src/styles.scss` آخر عنصر في `angular.json` ضمن `styles`. يبقى `html { height: 100%; @include mat.theme(...) }`، لكن الثيم يضبط في مرحلة الأساس إلى `theme-type: light` وorange palette مع Inter وBarlow Condensed.

يُمنع على `body` استخدام `background-color` أو `color` أو `font:` من `--mat-sys-*`. يجب أن يكون block الجسم:

```scss
body {
  margin: 0;
  height: 100%;
  color-scheme: light;
  background-color: var(--fp-bg);
  color: var(--fp-text);
  font-family: var(--fp-font-body);
  font-size: 1rem;
  line-height: 1.5;
}
```

ضع `data-bs-theme="light"` على `<html>`، وضع `data-bs-theme="dark"` على كل جزيرة داكنة فقط.

## 5. قواعد صارمة

1. لا توجد ألوان hex أو rgb أو rgba داخل component SCSS أو HTML أو inline style؛ استخدم `var(--fp-*)` فقط، باستثناءات القسم 10.
2. احذف متغيرات ألوان SCSS ودوال مثل `darken()`؛ استخدم التوكن المناسب.
3. لا تنقل أو تدمج classes محلية مثل `.custom-table` أو `.status-badge` أو `.form-container`؛ غيّر ألوانها وشكلها داخل component نفسه.
4. انتبه لأن component styles أعلى specificity من global overrides؛ عدّل اللون محليًا عند وجوده.
5. الكروت والمودالات `--fp-radius-lg`، والأزرار والحقول `--fp-radius`، ولا أزرار pill.
6. الظلال للعناصر المرتفعة أو الكروت عند hover فقط. hover للكارت: `translateY(-4px)` وحد primary، ولا `scale(1.05)`.
7. نص الزر البرتقالي أبيض بوزن 600 فأعلى، وحلقة التركيز مرئية بـ `var(--fp-focus-ring)`.
8. لا تضف packages جديدة، ولا تغيّر منطقًا أو endpoints أو contracts.

## 6. صور المنتجات

كل حاوية لصورة منتج تستخدم `--fp-image-stage` و`object-fit: contain`. أزل `mix-blend-mode` وأي خلفية literal خلف الصورة. شريط الصور المصغرة سطح فاتح بحد علوي؛ كل thumbnail بحد `--fp-border`، والنشط أو hover بحد `--fp-primary`. إذا كانت صورة مرفوعة بخلفية ملونة أو داكنة، بلّغ عنها ولا تغيّر stage لإخفائها.

## 7. Bootstrap وAngular Material

- أنشئ `_bootstrap-overrides.scss` لضبط CSS variables في Bootstrap، بما فيها `--bs-btn-*` للأزرار، والحقول والجداول والكروت والمودالات والقوائم والـ pagination والتنبيهات والشارات.
- أنشئ `_material-overrides.scss` لربط `--mat-sys-*` بتوكنز Fit Plus. راجع محليًا stepper وform-field وradio وbadge عند المرحلة التي تستخدمها.
- على `[data-bs-theme='dark']` تُستخدم متغيرات الجزر الداكنة فقط.

## 8. تعيين الـ classes القديمة

- `btn-info` و`text-info` و`bg-info`: إلى primary أو بدون background حسب العنصر.
- `btn-dark`: primary للـ CTA، وoutline-secondary للإجراء الثانوي.
- `btn-danger`: يبقى للخطر؛ وSearch يتحول primary.
- `btn-success`: outline-secondary للـ Details.
- `btn-light` في بحث navbar: primary.
- `bg-light` في صندوق الأسئلة: class محلي بـ surface-2.
- `navbar-dark`: يزال ويستبدل بـ `data-bs-theme="dark"`.

تنفّذ هذه التغييرات المعتمدة في مراحلها بدون إعادة طلب موافقة، مع ذكر الملفات التي تغيّرت في النتيجة.

## 9. المكوّنات الجديدة المعتمدة

- navbar: wordmark نصي `FIT` بلون `--fp-on-dark` و`PLUS` بلون `--fp-primary`؛ أزل صورة `favicon.ico` من الـ navbar. الخلفية صلبة داكنة بلا gradient.
- Home: يُبنى من Hero داكن وزر Shop Now، وقسم categories، وثلاث فوائد ثابتة، وبانر CTA ختامي داكن. لا تغيّر query params أو منطق shop؛ cards تقود إلى `/shop` فقط.
- Footer: يُنشأ ويُركّب في app shell كجزيرة داكنة بسيطة.
- Orders: الشارة المعروضة تبقى محايدة؛ لا تضف class binding لحالات الدفع حاليًا.

## 10. الواجهات الخارجية والاستثناءات

- Toastr: ألوان حالات صلبة مع نص أبيض عبر global overrides؛ ويُحمّل قبل `styles.scss`.
- ngx-spinner: الاستثناء المسموح في `app.html`: `rgba(20, 22, 26, 0.72)` و`#e8590c`.
- Stripe Payment Element خارج النطاق الحالي تمامًا؛ لا تلمس `payment.ts` ولا تضف `appearance`.

## 11. التحقق

- بعد كل مرحلة: شغّل build وفحصًا بصريًا للصفحات والملفات المتأثرة فقط، عند 360px و768px و1200px قدر الإمكان.
- في المرحلة الأخيرة فقط: نفّذ فحصًا شاملًا لبقايا literals والـ classes القديمة وحاويات صور المنتجات، ثم `npm run build`.
- اذكر أي global أو higher-specificity rule أثّر على الملفات المعدّلة وكيف عولج.
