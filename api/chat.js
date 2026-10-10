export default async function handler(req, res) {
  // السماح فقط بـ POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'الرسالة فارغة' });
    }

    // الاتصال بـ Claude - المفتاح يجي من Environment Variables
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        messages: [
          { role: "user", content: message }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Claude API Error:", data);
      return res.status(500).json({ error: 'خطأ من Claude API', details: data });
    }

    // نرجع الجواب للواجهة الأمامية
    return res.status(200).json({ 
      reply: data.content[0].text 
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'خطأ في السيرفر' });
  }
}
