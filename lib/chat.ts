// /lib/askGemini.ts
export const askGemini = async (userMessage: string) => {
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'mistralai/mistral-small-3.2-24b-instruct:free',
      messages: [
        {
          role: 'system',
          content: `You are CampusKart AI Assistant — a chatbot built exclusively for the CampusKart platform, which is a student-to-student marketplace.

Your job is to help users with **anything related to CampusKart**, including:
- How to buy, sell, or trade items.
- What items are allowed or banned.
- Creating listings (books, electronics, clothes, etc.).
- Managing their account.
- Tips to write better product descriptions or negotiate deals.
- How CampusKart ensures safety and trust.
- Delivery or meeting tips for buyers/sellers.
- Any FAQs about using the platform.

You ONLY answer CampusKart-related questions. If someone asks anything else (like “Who is Elon Musk” or “Tell me a joke”), politely say:  
_"Sorry! I can only help with CampusKart stuff. Ask me anything about using the platform."_

Be friendly, casual, and talk like a smart college student. No robotic tone. Keep answers short, helpful, and fun.

Assume the user is a student trying to use CampusKart.`,
        },
        {
          role: 'user',
          content: userMessage,
        },
      ],
    }),
  });

  const data = await response.json();
//   console.log(data);

  return data?.choices?.[0]?.message?.content || "Sorry, I didn't get that.";
};
