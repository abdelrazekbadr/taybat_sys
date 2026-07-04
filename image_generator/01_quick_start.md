# ⚡ البدء السريع - Pollinations MCP

**5 دقائق فقط للبدء**

---

## 🎯 الخيار الأول: HTML في المتصفح (الأسهل)

```bash
1. حمّل الملف: pollinations_meal_generator.html
2. افتحه في المتصفح (Chrome, Firefox, Safari)
3. اكتب وصف الوجبة أو استخدم preset
4. اضغط "توليد الصورة"
5. انتظر 5-30 ثانية
6. ستظهر الصورة تحتًا
```

✅ **لا يتطلب تثبيت شيء**
✅ **يعمل من أي جهاز**

---

## 🎯 الخيار الثاني: Python للـ 86 وجبة

```bash
1. pip install requests
2. python3 generate_meal_images.py
3. سيحمّل الصور في مجلد meal_images/
```

⏱️ **يستغرق ~10 دقائق**
📊 **ينتج 86 صورة احترافية**

---

## 🎯 الخيار الثالث: MCP في Claude Desktop

```bash
# على macOS:
1. mkdir ~/pollinations-mcp && cd ~/pollinations-mcp
2. npm install @anthropic-sdk/sdk node-fetch
3. انسخ pollinations_mcp_server.js
4. افتح nano ~/.claude/config.json
5. أضف (غيّر المسار):
   {
     "mcpServers": {
       "pollinations": {
         "command": "node",
         "args": ["/Users/YOUR_NAME/pollinations-mcp/server.js"]
       }
     }
   }
6. أعد تشغيل Claude Desktop
```

🔧 **يتطلب Node.js**
⚡ **توليد مباشر في Claude**

---

## 📋 الملفات المتاحة

| الملف                           | الاستخدام | الوقت                   |
| ------------------------------------ | ------------------ | ---------------------------- |
| `pollinations_meal_generator.html` | ☁️ متصفح    | ⚡ فوري                  |
| `generate_meal_images.py`          | 🐍 Python          | 📊 10 دقائق             |
| `pollinations_mcp_server.js`       | 🤖 Claude          | ⏱️ إعداد 5 دقائق |
| `test_pollinations.js`             | ✅ اختبار    | 🔍 دقيقة واحدة     |

---

## 🔑 API Key (مثبت بالفعل)

```
sk_jnjLVXy6zidl1mBNHn0qLqPfApJ0KNY3
```

---

## 📚 الوثائق الإضافية

* **POLLINATIONS_MCP_SETUP.md** — شرح مفصل للـ MCP
* **ALTERNATIVE_METHODS.md** — 6 طرق بديلة
* **README_POLLINATIONS_MCP.md** — مرجع شامل

---

## ✨ نصيحتي الشخصية

**جرّب هكذا:**

1. **أولًا (5 دقائق):** افتح HTML في المتصفح واختبر بـ 3 وجبات
2. **ثم (10 دقائق):** شغّل Python للـ 86 وجبة دفعة واحدة
3. **أخيرًا (إذا أردت):** أضف MCP إلى Claude للتوليد المباشر

---

## 🚀 ابدأ الآن

```bash
# الطريقة 1 - الأسهل:
open pollinations_meal_generator.html

# أو الطريقة 2 - الأسرع للكثير من الصور:
python3 generate_meal_images.py

# أو اختبر الاتصال أولًا:
node test_pollinations.js
```

---

**أسئلة؟ راجع الملفات الأخرى!** 📖
