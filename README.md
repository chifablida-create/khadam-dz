# 🇩🇿 خدّام ديزاد (Khadam DZ)

المنصة الجزائرية الأولى لربط الحرفيين وأصحاب المهن مع الزبائن عبر 58 ولاية جزائرية.

## 🚀 تشغيل المشروع محلياً أو على السيرفر

```bash
# تثبيت الحزم
npm install

# تشغيل السيرفر الكامل (Express + Vite)
npm run dev

# بناء نسخة الإنتاج الحقيقية (تخرج في مجلد dist/)
npm run build

# تشغيل نسخة الإنتاج
npm start
```

## 🌐 النشر التلقائي على GitHub Pages / Vercel / Render

- **GitHub Pages**: يحتوي المشروع على ملف `.github/workflows/deploy.yml` الذي يقوم ببناء التطبيق الحقيقي (`npm run build`) ونشره تلقائياً على رابط `https://<username>.github.io/<repo>/` فور رفع الكود إلى فرع `main`.
- **Vercel**: يحتوي المشروع على ملف `vercel.json` جاهز للربط المباشر مع مستودع GitHub.
