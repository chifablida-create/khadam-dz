// بوت النشر التلقائي لـ Khadam DZ
async function نشر_تلقائي(اسم_الحرفي, المهنة, المدينة) {
  const رسالة = `🛠️ انضم إلينا حرفي جديد!
  
👤 ${اسم_الحرفي}
🔧 المهنة: ${المهنة}
📍 المدينة: ${المدينة}

حمل تطبيق Khadam DZ واطلب خدمتك الآن!
https://chifablida-create.github.io/khadam-dz/

#خادم_دز #حرفيين_الجزائر #${المدينة}`;

  // 1. نشر في فيسبوك
  console.log("جاري النشر في فيسبوك...", رسالة);
  
  // هنا تحط الـ Token تاع صفحتك (نعلمك كيف تجيبو)
  // await fetch(`https://graph.facebook.com/YOUR_PAGE_ID/feed?message=${رسالة}&access_token=TOKEN`, {method: 'POST'});

  return رسالة;
}

// مثال للتجربة
نشر_تلقائي("محمد", "سباك", "البليدة");
