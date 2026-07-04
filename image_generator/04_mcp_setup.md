# 🖼️ Pollinations MCP Server for Claude

**توليد صور احترافية للوجبات مباشرة في Claude**

---

## 📦 الملفات المضمنة

```
✅ pollinations_mcp_server.js      → MCP Server الرئيسي
✅ package.json                    → المكتبات المطلوبة
✅ test_pollinations.js            → اختبار سريع للاتصال
✅ POLLINATIONS_MCP_SETUP.md       → شرح مفصل للإضافة
✅ generate_meal_images.py         → Python script لتوليد 86 صورة
✅ pollinations_meal_generator.html → واجهة تفاعلية للمتصفح
```

---

## 🚀 البدء السريع

### **على macOS:**

```bash
# 1. إنشاء مجلد
mkdir ~/pollinations-mcp && cd ~/pollinations-mcp

# 2. نسخ الملفات
cp /path/to/pollinations_mcp_server.js .
cp /path/to/package.json .

# 3. تثبيت المكتبات
npm install

# 4. اختبار الاتصال
node test_pollinations.js
```

### **تفعيل في Claude Desktop:**

**macOS:**

```bash
nano ~/.claude/config.json
```

**Windows:**

```
%APPDATA%\Claude\config.json
```

**أضف هذا:**

```json
{
  "mcpServers": {
    "pollinations": {
      "command": "node",
      "args": ["/Users/YOUR_USERNAME/pollinations-mcp/server.js"],
      "env": {
        "POLLINATIONS_API_KEY": "sk_jnjLVXy6zidl1mBNHn0qLqPfApJ0KNY3"
      }
    }
  }
}
```

---

## 🛠️ الأدوات المتاحة

### 1. `generate_meal_image` 📸

توليد صورة احترافية من وصف

```
استخدم generate_meal_image مع:
- prompt: "Professional food photography: white rice, boiled goat meat, fried potatoes..."
- model: "turbo" (أو "flux" أو "dall-e")
- width: 768
- height: 768
```

### 2. `generate_from_preset` 🍽️

توليد صورة من وجبة مسبقة

**الوجبات المتاحة:**

* `goat_meal` - لحم ماعز
* `fish_meal` - سمك سردين
* `pigeon_meal` - حمام محشي
* `vegetarian_meal` - وجبة نباتية

### 3. `build_meal_prompt` 📝

بناء وصف احترافي من رموز العناصر

```
استخدم build_meal_prompt مع:
- item_codes: "CB01,MT10,CB08"  (أرز+لحم+بطاطس)
- meal_name: "وجبة غداء"
```

### 4. `list_meal_presets` 📋

عرض قائمة الوجبات المعدة

---

## ⚙️ رموز العناصر الشائعة

| الكود | الصنف            | الكود | الصنف                 |
| ---------- | --------------------- | ---------- | -------------------------- |
| CB01       | أرز أبيض       | MT10       | لحم ماعز مسلوق |
| CB04       | أرز بسمتي     | MT11       | لحم ماعز مشوي   |
| CB08       | بطاطس مقلية | FS02       | سمك سردين          |
| CB10       | توست              | BD02       | حمام مشوي          |
| DF01       | زبدة              | OI01       | زيت زيتون          |
| FR03       | تمر                | SW04       | عسل                     |

---

## 🧪 الاختبار

```bash
# اختبار الاتصال بـ API
node test_pollinations.js

# تشغيل Server مباشرة
node pollinations_mcp_server.js
```

---

## 📊 توليد الصور بالدفعة (86 وجبة)

استخدم Python script لتوليد جميع الصور:

```bash
pip install requests
python3 generate_meal_images.py
```

سيحفظ الصور في مجلد `meal_images/`

---

## 🌐 الواجهة التفاعلية

افتح `pollinations_meal_generator.html` في المتصفح:

```bash
open pollinations_meal_generator.html
```

أو انسخ الملف إلى جهازك واضغط عليه بزر الماوس الأيمن → Open With Browser

---

## 🔑 API Key

```
sk_jnjLVXy6zidl1mBNHn0qLqPfApJ0KNY3
```

⚠️ **لا تشارك هذا المفتاح علنًا**

---

## 🎨 نصائح للجودة الأفضل

### وصف احترافي:

```
Professional overhead food photography: 
fluffy white Egyptian rice mound on left side,
tender boiled goat meat pieces with light natural sheen,
golden crispy fried potato wedges on right,
cream ceramic plate perfectly centered,
warm soft natural window light from 45 degrees,
shallow depth of field with blurred wooden table background,
appetizing warm color palette,
editorial gourmet magazine quality,
4k ultra-realistic, sharp focus on food
```

### النموذج الأفضل:

* `turbo` - سريع (10 ثوان)
* `flux` - جودة عالية (30 ثانية)
* `dall-e` - احترافي جدًا (60 ثانية)

### الحجم:

* صغير: 512x512 (سريع)
* وسط: 768x768 (متوازن)
* كبير: 1024x1024 (أفضل جودة)

---

## 🐛 استكشاف الأخطاء

| المشكلة         | الحل                                              |
| ---------------------- | ----------------------------------------------------- |
| "MCP Server not found" | تحقق من مسار الملف صحيح            |
| "HTTP 403 Forbidden"   | تحقق من API key صحيح                        |
| "Module not found"     | شغّل `npm install`                              |
| صورة مقطوعة  | زد عرض/ارتفاع أو غيّر النموذج |

---

## 📞 للمزيد من المساعدة

راجع **POLLINATIONS_MCP_SETUP.md** للشرح المفصل

---

## ✨ الحالات الاستخدام

✅ توليد صور احترافية للكتاب الإلكتروني عن الطيبات

✅ إنشاء محتوى بصري لتطبيق Tayabat

✅ توثيق الوصفات بصور احترافية

✅ تحسين عروض الوجبات على الويب

---

**جاهز؟ ابدأ الآن! 🚀**
