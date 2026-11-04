# تقرير مراجعة قبل النشر (Pre-publication Review)

> مراجعة قراءة-فقط اتعملت قبل نشر المشروع على GitHub. التاريخ: 2026-11-04.

## ملخص تنفيذي

- المشروعان موجودان كـ **ريبوهين منفصلين** (`backend/` و `clientNg/`) والمجلد الأب مش git repo، فقرار "إيه اللي هينشر" هو أول حاجة تحددها.
- الكود نفسه بيبني: الـ Angular build بينجح، والـ .NET compile بينجح (فشل نسخ الـ DLL فقط لأن الـ API شغال في الخلفية).
- لكن فيه **4 مشاكل حرجة** لازم تتصلح قبل الرفع: مفتاح Stripe سري في الكود، باسورد Gmail في appsettings، `apiKey` حقيقي في `opencode.json` متتبَّع في git، وStack Trace بيتسرب للعميل.
- الإحصائيات: **4 حرج / 22 مهم / 12 تحسين**.
- **جاهز للنشر؟ لأ.** بعد إصلاح بنود "حرج" + إعادة كتابة README = أيوه.

---

## 1) أسرار ولازم تتغير قبل الرفع

**[الخطورة: حرج] [الجانب: Backend]**
الملف والسطر: `backend/Ecom.infrastructure/Repositires/Service/PaymentService.cs:52`
المشكلة: مفتاح Stripe سري (`sk_test_...`) مكتوب hard-coded جوه الدالة، وموجود في تاريخ git في commit `669b38a`.
ليه الريكروتر يهمه: أول حاجة أي مراجع بيعملها هي grep على `sk_` — ومفتاح سري في الكود = رفض فوري.
إزاي أصلحها:
1. اروح Stripe Dashboard واعمل **Roll** للمفتاح ده فورًا.
2. امسح السطر 52، وحط المفتاح في `appsettings.Development.json` أو `dotnet user-secrets`.
3. ضيف في `appsettings.json` بلوك فارغ: `"Stripe": { "SecretKey": "", "WebhookSecret": "" }`.
4. في `Program.cs` مرة واحدة: `StripeConfiguration.ApiKey = builder.Configuration["Stripe:SecretKey"];`
5. **مهم:** `VerifyPaymentSucceededAsync` (سطر 134) بيقرأ `Stripe:SecretKey` من الـ config وهو **غير موجود** حاليًا — يعني حاليًا شغال بالغلط لأن السطر 52 بيضبط الـ static key. لو مسحت 52 من غير الخطوة 4، الدفع هيكسر.

**[الخطورة: حرج] [الجانب: Backend]**
الملف والسطر: `backend/Ecom.API/appsettings.json:18`
المشكلة: باسورد Gmail (App Password) حقيقي `fomingkeajfrmcze` مع الإيميل `almohandis80@gmail.com`، متتبَّع من commit `e63467e`.
ليه الريكروتر يهمه: باسورد إيميل شغال في repo عام = ناس هتجرب تدخل عليه.
إزاي أصلحها: 1) الغي الـ App Password من حساب Google واعمل واحد جديد. 2) حطه في user-secrets. 3) في الريبو سيب `"Password": ""`.

**[الخطورة: حرج] [الجانب: Repo]**
الملف والسطر: `clientNg/opencode.json:17` (وكمان `Ecommerce app/opencode.json:20`)
المشكلة: `"apiKey": "sk-3efd3050d3e053eeed71629e48a272c6"` — مفتاح مزوّد LLM حقيقي، والملف **متتبَّع** في git من commit `c264833`.
ليه الريكروتر يهمه: مفتاح شغال في history = تسريب، وأسوأ من كده إنه بيقول إن فيه إعدادات AI داخلية في المشروع.
إزاي أصلحها: 1) اعمل revoke للمفتاح عند SovereignEG. 2) `git rm --cached opencode.json` وضيفه في `.gitignore`. 3) نظّف الـ history (تحت). 4) `backend/opencode.json` آمن لأنه مستخدم `"{env:SOVEREIGNEG_API_KEY}"` — سيب عليه أو امسحه.

**[الخطورة: حرج] [الجانب: Backend]**
الملف والسطر: `backend/Ecom.API/Middleware/ExceptionMiddleware.cs:61-64`
المشكلة: الـ middleware بيبعت `ex.Message` و `ex.ToString()` (Stack Trace كامل + مسارات الملفات + أسماء الجداول) للعميل، في كل البيئات.
ليه الريكروتر يهمه: ده أشهر خطأ أمني في ASP.NET Core، وأول حاجة بتتسأل عنها في إنترفيو Junior.
إزاي أصلحها: احتفظ بالـ log (`_logger.LogError` موجود بالفعل سطر 49)، وارجع رسالة عامة:
```csharp
var response = new ApiExceptions(context.Response.StatusCode, "An unexpected error occurred.");
```

### جدول التدوير (لازم تعمله كله)

| القيمة | المكان | الإجراء |
|---|---|---|
| `sk_test_51U31dp…ZX9q` | `PaymentService.cs:52` | Roll + شيل من الكود |
| `fomingkeajfrmcze` | `appsettings.json:18` | الغي App Password واعمل جديد |
| `sk-3efd3050…72c6` | `clientNg/opencode.json:17` + `opencode.json` بالأب | Revoke + شيل من التتبع |
| `admin@ecom.com / test1234` | `appsettings.json:32-35` | شيل/بدّل لباسورد قوي |
| JWT Secret = `YOUR_JWT_SECRET_KEY_HERE_MIN_32_CHARS` | `appsettings.json:23` | قيمة عشوائية 64 حرف في user-secrets |

**تنظيف تاريخ git:** الريبو لسه مش منشور، فأنضف حل هو تاريخ جديد بكوميت واحد:

```bash
# بعد ما تلف المفاتيح وتظبط .gitignore
git checkout --orphan clean-main
git add .
git commit -m "Initial commit: ASP.NET Core 8 + Angular e-commerce"
git branch -D main && git branch -m main
```

بديل لو عايز تحافظ على التاريخ: `git filter-repo --path opencode.json --invert-paths` (وبعدها `git reflog expire --expire=now --all && git gc --prune=now`).

---

## 2) أخطاء في المنطق (Business logic)

**[الخطورة: تحسين] [الجانب: Backend] — تصحيح مهم لشكّك (a): NOT CONFIRMED**
الملف والسطر: `OrderService.cs:99` و `:102` و `:107`
المشكلة: الكود **مش** بيحط `TEMP-<guid>`. بياخد `basket.PaymentIntentId` الحقيقي، وبيسأل Stripe نفسه `VerifyPaymentSucceededAsync` ويتأكد إن الحالة `succeeded` والمبلغ مطابق، وبعدها يخزن `Status.PaymentReceived`. يعني الشك القديم ده **متعالج**.
ليه الريكروتر يهمه: دي نقطة قوة حقيقية تحكي عنها في الإنترفيو (server-side verification)، مش عيب.

**[الخطورة: مهم] [الجانب: Backend]**
الملف والسطر: `CustomerBasketRepository.cs:46-53` + `OrderService.cs:87`
المشكلة: الريبو بيخزن payload العميل زي ما هو (تأكيدك (b) صحيح جزئيًا)، والـ README بيدّعي إن الأسعار بتتحدث من الداتابيز. الاستغلال الفعلي **مخفّف** لأن `PaymentService.cs:44-50` بيعيد جلب السعر من الداتابيز قبل إنشاء/تحديث الـ PaymentIntent، و`OrderService:102` بيرفض لو المبلغ مش مطابق. الفاضل: `Price` و`MainImage` بيتخزنوا من السلة من غير تحقق.
ليه الريكروتر يهمه: مراجعة الكود هتلاقي تعليق في الـ README غلط + اعتماد على بيانات العميل.
إزاي أصلحها: 1) في `OrderService:87` خليها `Price = product.NewPrice`. 2) خليها `MainImage = product.Photos.FirstOrDefault(...)?.ImageName`. 3) صحّح جملة الـ README بدل ما تعدّل الريبو.

**[الخطورة: مهم] [الجانب: Backend]**
الملف والسطر: `PaymentService.cs:81` و `:95`
المشكلة: `(long)basket.BasketItems.Sum(m => (m.Price * 100) * m.Quantity) + (long)shippingPrice * 100` — الـ cast لـ `long` بيقص (truncate) قبل الجمع، فالـ shipping ممكن يتحسب غلط، والـ `Currency = "USD"` ثابت في الكود.
ليه الريكروتر يهمه: كود فلوس بأخطاء تقريب = سؤال إنترفيو جاهز.
إزاي أصلحها:

```csharp
var amount = (long)Math.Round(basket.BasketItems.Sum(i => i.Price * i.Quantity) * 100m)
           + (long)Math.Round(shippingPrice * 100m);
```

وكمان خلي عملة Stripe من `Stripe:Currency`. (**غير مؤكد:** هل الواجهة بتعرض USD فعلاً؟ محتاج تتأكد من `payment.ts`).

**[الخطورة: مهم] [الجانب: Backend]**
الملف والسطر: `backend/Ecom.Core/Entities/BasketItem.cs` (الـ Quantity) + `OrderService.cs:89`
المشكلة: مفيش أي تحقق على `Quantity` (سالب، صفر، أو رقم ضخم) ولا على `Price`، لا في الـ DTO ولا في السيرفس.
ليه الريكروتر يهمه: input validation ناقصة بالكامل في مسار الدفع.
إزاي أصلحها: `[Range(1, 100)] public int Quantity { get; set; }` + نفس التحقق جوه `CreateOrderAsync` قبل الحساب.

**[الخطورة: مهم] [الجانب: Backend]**
الملف والسطر: `RatingReposiroty.cs:40-64` + `Ecom.Core/DTO/RatingToReturnDto.cs:22`
المشكلة: `AddRatingDto.Stars` من غير `[Range(1,5)]` (يقبل `-5` أو `30000`)، مفيش تحقق إن المستخدم اشترى المنتج فعلًا، ولو المنتج اتحذف بين السطور `product.Id` بيرمي NullReference.
ليه الريكروتر يهمه: تقييمات مزيفة + crash سهل = مراجعة سلبية.
إزاي أصلحها: 1) `[Range(1,5)]` على `AddRatingDto.Stars`. 2) تحقق من وجود order مكتمل لنفس المنتج. 3) `if (product is null) return false;`.

**[الخطورة: مهم] [الجانب: Backend]**
الملف والسطر: `backend/Ecom.API/Controllers/PaymentsController.cs:33-42`
المشكلة: `endpointSecret = "whsec_YOUR_STRIPE_WEBHOOK_SECRET"` placeholder، يعني `EventUtility.ConstructEvent` هيرفض كل webhook ويرجع `BadRequest` دايمًا → الـ webhook ميت فعليًا.
ليه الريكروتر يهمه: كود Stripe موجود بس مش شغال، وأي reviewer هيسأل "إزاي بتأكد الدفع؟".
إزاي أصلحها: اقرأ الـ secret من `configuration["Stripe:WebhookSecret"]`، وسجّل `StripeException` بالـ logger بدل `return BadRequest()` الصامت. (**ملاحظة:** الأوردر بيتسجل `PaymentReceived` وقت الإنشاء، فالـ webhook مش critical للمسار الأساسي بس لازم يشتغل أو يتشال).

**[الخطورة: تحسين] [الجانب: Frontend]**
الملف والسطر: `clientNg/src/app/Basket/basket-service.ts:22`
المشكلة: `count = computed(...) ?? 0` — الـ `??` بره الـ `computed`، فالنوع بيبقى `Signal<number|undefined>` والـ `?? 0` مالهاش أي أثر (الـ `computed` عمرها ما ترجع null).
ليه الريكروتر يهمه: باگ TypeScript واضح جدًا وأول حاجة هتتشاف في الـ review.
إزاي أصلحها: `count = computed(() => this.basket()?.basketItems.reduce((s,i) => s + i.quantity, 0) ?? 0);`

**[الخطورة: مهم] [الجانب: Frontend]**
الملف والسطر: `clientNg/src/app/Shop/shop-service.ts:29` + `shop.html:45`
المشكلة: `param.append('pageSize', 2)` — رقم ثابت مش من `productParams`، والنص بيعرض `pageNumber * pageSize` كأنه "of Y" بدل `totalCount()`.
ليه الريكروتر يهمه: الباجينيشن بايظ ظاهريًا (24 منتج بيظهروا 2 في الصفحة).
إزاي أصلحها: `pageSize` من `productParams.pageSize`، والعرض `products().length` من `totalCount()`.

**[الخطورة: تحسين] [الجانب: Backend]** — `OrderService.cs:51-63`
الشك (e) "أوردرات من غير تحقق دفع / تكرار": **NOT CONFIRMED**. فيه منع تكرار بالـ `PaymentIntentId` + فحص `BuyerEmail`. آمن كفاية.

---

## 3) أمان

**[الخطورة: مهم] [الجانب: Backend]**
الملف والسطر: `backend/Ecom.API/Authorization/BasketOwnerOrAdminHandler.cs:24-28` + `BasketController.cs` (مفيش `[Authorize]` خالص)
المشكلة: لو `resource.OwnerId is null` → التفويض **بينجح لأي حد**. يعني أي سلة ضيف (guest) معرّفها متاح للقراءة/التعديل/الحذف لأي شخص يعرف الـ Id.
ليه الريكروتر يهمه: IDOR كلاسيكي + `Empty` authorization = فلاج أحمر.
إزاي أصلحها: 1) لو `OwnerId is null` اسأل: هل الطلب فيه نفس الـ basket id في `localStorage` claim/header؟ أو ببساطة ارفض (`return Task.CompletedTask`) وخلي الـ guest basket يتعمل بس من الـ endpoint المخصص. 2) ضيف `[Authorize]` على الـ endpoints اللي مش محتاجة guest access.

**[الخطورة: مهم] [الجانب: Backend]**
الملف والسطر: `backend/Ecom.API/appsettings.json:23` + `infrastructureRegisteration.cs` (JWT setup)
المشكلة: JWT Secret قيمة placeholder معروفة، و`ValidateAudience = false`، و`RequireHttpsMetadata = false`.
ليه الريكروتر يهمه: أي حد يعرف الـ placeholder يزوّر توكن Admin.
إزاي أصلحها: secret عشوائي 64+ حرف في user-secrets، `ValidateAudience = true`، و`RequireHttpsMetadata = true` في Production.

**[الخطورة: مهم] [الجانب: Backend]**
الملف والسطر: `backend/Ecom.API/appsettings.json:32-35` + `IdentitySeedExtensions.cs:31-47`
المشكلة: سيد أدمن بيتعمل أوتوماتيك بـ `admin@ecom.com / test1234` من الـ config.
ليه الريكروتر يهمه: بيانات دخول معروفة في repo عام.
إزاي أصلحها: اقرأ الإيميل/الباسورد من env في Development بس، ومنع الـ seeding خالص في Production.

**[الخطورة: مهم] [الجانب: Backend]**
الملف والسطر: `backend/Ecom.infrastructure/Repositires/AuthRepository.cs:117-125, 223-260` + `AccountController.cs:145-146`
المشكلة: الـ refresh token مخزّن **خام** (مش hashed)، مش بيتعمله rotation، ومش بيتلغى عند `ResetPassword`. وكمان حذف الكوكي في logout مش بيحدد نفس `Domain/Path`.
ليه الريكروتر يهمه: session hijacking وتوكنز صالحة بعد تغيير الباسورد.
إزاي أصلحها: خزّن `SHA256(token)`، وامسح كل توكنز المستخدم في reset/logout، ووحّد الـ `CookieOptions` في الـ set/delete.

**[الخطورة: مهم] [الجانب: Backend]**
الملف والسطر: `backend/Ecom.API/Controllers/BugController.cs` + `AuthRepository.cs:135-146` + `AccountController.cs:78-84`
المشكلة: (1) `BugController` مفتوح من غير authorize وفيه endpoint `server-error` بيرمي NullReference عن قصد — لازم يتشال. (2) `forgot-password` بيرجع رد مختلف لو الإيميل مش موجود = user enumeration، ونفس الحكاية في Register.
ليه الريكروتر يهمه: test endpoints في production = علامة مشروع tutorial.
إزاي أصلحها: 1) احذف `BugController` بالكامل. 2) رد ثابت `Ok("If the email exists, a reset link was sent")` في كل الحالات.

**[الخطورة: مهم] [الجانب: Backend]**
الملف والسطر: `backend/Ecom.infrastructure/Repositires/Service/ImageManagementService.cs:21-49`
المشكلة: اسم الملف بيتبني من `image.FileName` و`ProductName` من غير sanitize → path traversal / overwrite.
ليه الريكروتر يهمه: file upload بدون تحقق = ثغرة معروفة.
إزاي أصلحها: `Path.GetRandomFileName()` + `Path.GetExtension(...)` مع whitelist للامتدادات، وامنع `..`.

**[الخطورة: مهم] [الجانب: Repo]**
الملف والسطر: `git ls-files` → `backend/Ecom.API/wwwroot/Images/**` (23 صورة متتبَّعة)
المشكلة: صور مرفوعة (بيانات تشغيل) متتبَّعة في git.
ليه الريكروتر يهمه: صعب يفهم إيه كود وإيه بيانات، وبيعمل noise في الـ diff.
إزاي أصلحها: `git rm -r --cached Ecom.API/wwwroot/Images` + `wwwroot/Images/` في `.gitignore` + سيب `wwwroot/Images/.gitkeep` بس.

**نقطة إيجابية لازم تتقال (نتيجة تحقق):** `OrderController` كله `[Authorize]` وفيه `OrderOwnerOrAdmin` check، والدفع بيتأكد server-side من Stripe. الشك (e) عن IDOR في الأوردرات **مش صحيح**.

---

## 4) نضافة الريبو والملفات

**البنية نفسها:** `C:\Users\Ayman\Desktop\Ecommerce app` مش git repo، و`backend/` و`clientNg/` ريبوهين منفصلين. الـ `node_modules` و`package.json` و`AGENTS.md` في الجذر بره أي repo — قرارك: تنشر ريبو واحد (monorepo) ولا اتنين. **ترشيحي:** ريبو واحد فيه `backend/` و`clientNg/`، وده بيخلي الريكروتر يشوف المشروع كامل بضغطة.

**[الخطورة: مهم] [الجانب: Repo]** — `.gitignore` ناقص
الملف والسطر: `clientNg/.gitignore` (كامل) + `backend/.gitignore:1-30`
المشكلة: `opencode.json` مش مستثنى، و`AGENTS.md`/`THEME.md`/`projectContext.md` متتبَّعين. (الـ node_modules/dist/.angular مستثنيين صح ✅).
إزاي أصلحها: ضيف لـ `clientNg/.gitignore`:

```gitignore
/opencode.json
/AGENTS.md
/THEME.md
/projectContext.md
*PLAN*.md
REVIEW_REPORT_AR.md
```

### جدول الملفات: احتفظ / شيل / انقل

| الملف | القرار | السبب |
|---|---|---|
| `README.md` | **أعد كتابته** | فيه معلومات غلط عن الباك إند والدفع (تحت) |
| `AGENTS.md` (الأب + الـ2) | شيل من التتبع | تعليمات AI داخلية، مش جزء من المنتج |
| `THEME.md` | انقله `docs/design.md` أو شيله | مرجع تصميم داخلي؛ لو هتنقله، حوّله لإنجليزي |
| `ANGULAR_CODING_CONVENTIONS.md` | انقله `docs/` | مفيد كـ "engineering conventions" لو اتظبط، بس ضوضاء في الجذر |
| `projectContext.md` | شيل / أعد كتابته | بيقول إن الباك إند JSON Server و"120+ spec" — كله غلط |
| `FITPLUS_PLAN.md` + `ABOUT_BESTSELLER_PLAN.md` | شيل | خطط شغل داخلية، بره الريبو أصلًا |
| `opencode.json` | شيل + revoke | فيه مفتاح |
| `.editorconfig` / `.prettierrc` | احتفظ | علامة نضافة |
| `.vscode/` | شيل من التتبع | إعدادات شخصية؛ سيب `extensions.json` بالكتير |

**ملفات ميتة في الباك إند (تحسين):** `Class1.cs`، `Product1Configurartion.cs` (فاضي)، migration فاضي `20260730103729_ProductUpdate.cs`، و`Ecom.API.http` لسه بيشاور على `/weatherforecast`، ومجلد `.github/workflows` فاضي.

**أخطاء إملائية ظاهرة (تحسين):** مجلد `Repositires`، ملف `RatingReposiroty.cs`، `PaymentFaild`/`UpdateOrderFaild`، وملفات باسم `OrderOwnerOrAdminRequirement .cs` و`BasketOwnerOrAdminRequirement .cs` (فيه **مسافة قبل `.cs`** — دي هتتكسر على Linux/CI). الأهم: المسافة في اسم الملف تتصلح، والـ typo الكبير ممكن تسيبه بس اذكره.

---

## 5) مطابقة الـ README للكود

**[الخطورة: مهم] [الجانب: Frontend]**
الملف والسطر: `clientNg/README.md:3, 7, 176-177, 196-200, 245, 246, 251, 261-263`
المشكلة: الـ README بيوصف مشروع تاني خالص:

- `:3` و`:176` "JSON Server" → الحقيقة ASP.NET Core 8 + SQL Server + Redis.
- `:196-200` `json-server db.json --port 7198` → الصح `dotnet run --project Ecom.API` + migrations + Redis.
- `:251` "No online payment gateway" → Stripe متكامل فعلاً (`@stripe/stripe-js` في package.json).
- `:245` "No wildcard route" → الموجود `app.routes.ts:66` فيه `**`.
- `:246` "About us و Best Seller بدون routes" → الاتنين موجودين `app.routes.ts:59-65`.
- `:261-263` "Your Name" و`github.com/your-username` → لازم تتغير.
- ناقص: Stripe في جدول الـ stack، و`POST /Payments` في جدول الـ endpoints.

ليه الريكروتر يهمه: ده أخطر بند توثيقي — الـ README بيقول عكس الكود، فبيوحي إنه مش متحدّث أو منسوخ.
إزاي أصلحها: أعد كتابة الـ README في 5 أقسام: وصف، Stack (Angular 22 + .NET 8 + SQL Server + Redis + Stripe)، خطوات التشغيل الحقيقية (الباك إند الأول، ports، HTTPS cert، CORS)، قرارات معمارية (Clean Architecture / Repository+UoW / JWT+Refresh)، و"Known limitations" صادقة.

**[الخطورة: تحسين] [الجانب: Frontend]** — `projectContext.md:8, 38-67, 125, 223`
المشكلة: مسار `/Users/Ayman/...` (macOS)، باك إند JSON Server، "120+ spec files" (الحقيقي 30)، وملف `IPayment.ts` غير موجود. الملف كله قديم — الأنضف تحذفه.

---

## 6) جودة الكود والاختبارات

**الـ Build الحقيقي (تشغيل فعلي):**

- `npm run build` → **نجح**، لكن `bundle initial exceeded maximum budget: 775.92 kB مقابل 500 kB` (تجاوز 275.92 kB: main 402 kB + styles 373 kB).
- `dotnet build Ecom.sln` → **68 Warning(s) و 4 Error(s)**؛ الأخطاء كلها `MSB3021/MSB3027` لأن `Ecom.API` و Visual Studio قافلين الـ DLLs — **مش أخطاء كود**. التجميع نفسه نجح. اقفل الـ API و VS وأعد البناء عشان تجيب العدد النهائي.
- تحذير أمني: `NU1903` — `AutoMapper 13.0.1` فيه ثغرة high severity (4 تحذيرات). رفع النسخة محتاج موافقتك (قاعدة الاعتماديات)، بس دي أهم upgrade.

**[الخطورة: مهم] [الجانب: Backend]**
الملف والسطر: `.NET` كله — **مفيش أي test project** (`xunit/nunit/MSTest` = صفر).
ليه الريكروتر يهمه: "مفيش tests" هي أول ملاحظة على أي مشروع Junior.
إزاي أصلحها — 3 اختبارات بأعلى قيمة:
1. `OrderService.CreateOrderAsync` — idempotency + رفض مبلغ غير مطابق + رفض buyer مختلف.
2. `PaymentService` حساب المبلغ (كميات/شحن/تقريب).
3. Auth — عدم كشف وجود الإيميل + lockout + إلغاء الـ refresh token.

**[الخطورة: مهم] [الجانب: Frontend]**
الملف والسطر: `basket.spec.ts:1` (`import { Basket }` والكلاس `BasketComponent`)، `stepper.spec.ts:1` (`Stepper` مقابل `StepperOverviewExample`)، `success.spec.ts:1` (`Success` مقابل `SuccessComponent`)، `app.spec.ts:22` (بيتوقع `Hello, clientNg`).
المشكلة: 4 ملفات بتكسر (3 compile + 1 runtime) من إجمالي 30 spec، والباقي 25 boilerplate ("should create") + واحد meaningful (`credential-interceptor.spec.ts`).
ليه الريكروتر يهمه: `ng test` هيفشل فورًا لو جربه.
إزاي أصلحها: احذف الـ 3 broken + سطر `Hello, clientNg`، وسيب `credential-interceptor.spec.ts`، واكتب 2-3 specs حقيقية للـ `BasketService` و`ShopService`.

**[الخطورة: مهم] [الجانب: Frontend]**
الملف والسطر: `app.routes.ts:34-52`، `payment.ts:112-113,161-162`، `complete.ts:39-40`
المشكلة: (1) `checkout`/`order`/`orderItem` مفتوحين بدون guard. (2) الدفع بيعتمد على `(window as any).checkoutDeliveryForm` — لو المستخدم عمل refresh أو رجع من 3DS ضاعت البيانات. (3) لو إنشاء الأوردر فشل **بعد** ما الفلوس اتسحبت، الحل الوحيد إن المستخدم يدوس "Complete order" تاني.
ليه الريكروتر يهمه: الأوردر بيتفشل بعد الدفع = أكبر سيناريو فشل في أي e-commerce.
إزاي أصلحها: 1) `canActivate` guard بيرجع `/login?returnUrl=...`. 2) خزّن بيانات الشيبنج في الـ `CheckoutService` بدل الـ window globals. 3) خلي الـ webhook هو مصدر الحقيقة للأوردر.

**[الخطورة: مهم] [الجانب: Frontend]** — `console.log` / `any` / imports ميتة
الملف والسطر: `basket-service.ts:38,95,116,118`، `address.ts:41,53,58`، `order-item.ts:42,46`، `order.ts:25`، `product-details.ts:39` (11 console.log)؛ imports غير مستخدمة: `checkout-service.ts:2` (`Service`)، `basket.ts:4` و`nav-bar-component.ts:3` (`toSignal`)، `delivery.ts:7` (`consumerPollProducersForChange`)، `basket-service.ts:2` (`BehaviorSubject`).
المشكلة: كود debug في مسارات production + متغيرات ميتة.
ليه الريكروتر يهمه: `console.log` في كل مكان = علامة كود متسرّب من التطوير.
إزاي أصلحها: امسح الـ console.log، شيل الـ imports، واستبدل `any` بـ interfaces في `checkout-service.ts:14` و`identity-service.ts:14,17`.

**[الخطورة: تحسين] [الجانب: Backend]** — `Console.WriteLine` في `PaymentsController.cs:61`، استجابات API غير موحّدة بين الكنترولرز، `IsUserAuth` بيرجع 400 بدل 401، `GetUserName` ممكن NRE (`AccountController.cs:155`)، و`ProductParams` بيقبل `pageSize` سالب.

**[الخطورة: تحسين] [الجانب: Frontend]** — Theme نضيف ✅ (مفيش hex/rgb بره `_tokens.scss` غير استثناء الـ spinner الموثّق)، بس لسه فيه كلاسات Bootstrap قديمة زي `text-muted`. ومحتاج: `alt` على صور المنتجات (`shop-item.html:5,10`)، و`aria-label` على input البحث (`nav-bar-component.html:48`) اللي **أصلًا مش متوصّل بأي submit** (فورم البحث ميت).

---

## 7) خطة التنفيذ

### قبل الرفع على GitHub (بالترتيب)

| # | المهمة | الجهد |
|---|---|---|
| 1 | تدوير كل المفاتيح في جدول القسم 1 | S |
| 2 | شيل السراير من الكود + `<UserSecretsId>` + `Stripe` config | M |
| 3 | `git rm --cached` للأسرار والصور + `.gitignore` + تاريخ git نضيف | M |
| 4 | إصلاح `ExceptionMiddleware` (مشكلة الأمان #1 اللي أي reviewer هيشوفها) | S |
| 5 | حذف `BugController` + ردود موحدة في forgot-password/register | S |
| 6 | `[Range]` للـ Quantity والـ Stars + `Price = product.NewPrice` في OrderService | S |
| 7 | إعادة كتابة `README.md` (أهم بند توثيقي) | M |
| 8 | Route guards + تثبيت `pageSize` + إصلاح `count` + `showing X of Y` | M |
| 9 | تنظيف: console.log / any / imports / arch spec files / الملفات الميتة | M |
| 10 | اقفل الـ API وVS و`dotnet build` نضيف + `npm run build` + `ng test` يتعدّى | S |

### ممكن بعد الرفع

| # | المهمة | الجهد |
|---|---|---|
| 11 | Refresh token hashing + rotation + إلغاء عند reset | M |
| 12 | Stripe webhook فعّال + إصلاح حساب المبلغ (decimal) | M |
| 13 | أول 3 اختبارات backend + 3 specs حقيقية frontend | L |
| 14 | استبدال `window` globals بحالة في `CheckoutService` | M |
| 15 | رفع `AutoMapper` ومراجعة حزمة الثغرة NU1903 | S |
| 16 | تصغير الـ bundle (lazy loading للـ Material/Bootstrap styles) | L |
| 17 | إصلاح الأسماء (`Repositires`/`PaymentFaild`) — breaking change، اعمله في branch لوحده | M |

**سؤال محتاج قرارك:** تنشر ريبو واحد (monorepo) ولا اتنين منفصلين؟ ده بيغيّر شكل خطوة 3 و7.

---

## حدود التحقق

راجعت بنفسي الملفات الحرجة دي: `PaymentService.cs`, `OrderService.cs`, `CustomerBasketRepository.cs`, `ExceptionMiddleware.cs`, `PaymentsController.cs`, `BasketOwnerOrAdminHandler.cs`, `BasketController.cs`, `OrderController.cs`, `Program.cs`, `appsettings.json`, `opencode.json`, `app.routes.ts`, `basket-service.ts`, `shop-service.ts`, `RatingReposiroty.cs`، و`git log`/`git ls-files`.

الباقي (تفاصيل الـ JWT setup، `AuthRepository`، `ImageManagementService`، README كامل) جاي من فحص الوكلاء بمسارات وسطور محددة، ولسه محتاج تأكيد وقت الإصلاح.
