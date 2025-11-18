const OpenAI = require('openai');
require('dotenv').config();

// OpenAI client oluşturma
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // .env dosyasından API key'i al
});

// İçerik denetimi için fonksiyon
async function moderateContent(content) {
  try {
    const response = await openai.moderations.create({
      input: content,
    });
    
    const results = response.results[0];
    return {
      flagged: results.flagged,
      categories: results.categories,
      category_scores: results.category_scores
    };
  } catch (error) {
    console.error('OpenAI Moderation hatası:', error);
    throw new Error('İçerik denetimi sırasında bir hata oluştu');
  }
}

// Metin oluşturma için fonksiyon (isim önerileri vb.)
async function generateText(prompt) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", prompt }],
      max_tokens: 100,
      temperature: 0.7
    });
    
    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('OpenAI Generation hatası:', error);
    throw new Error('Metin oluşturma sırasında bir hata oluştu');
  }
}

module.exports = {
  openai,
  moderateContent,
  generateText
};