// Utils để xử lý generative AI từ 10 providers free khác nhau.
// Fallback: Nếu provider 1 error (rate limit, hết free), tự động dùng provider tiếp theo.
// Mỗi provider dùng endpoint/model khác để đa dạng (generative text cho chatbot).
// Ghi chú: Thêm keys vào .env. Sử dụng axios để call API.

const axios = require('axios');
require('dotenv').config();

const providers = [
    // 1. Google Gemini 1.5 Flash (free tier)
    { name: 'gemini', url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent', key: process.env.GEMINI_API_KEY, method: (prompt) => ({ contents: [{ parts: [{ text: prompt }] }] }) },

    // 2. Hugging Face - GPT2 (free inference)
    { name: 'hf_gpt2', url: 'https://api-inference.huggingface.co/models/gpt2', key: process.env.HF_API_KEY, method: (prompt) => ({ inputs: prompt }) },

    // 3. Hugging Face - Phi-2 (Microsoft model free)
    { name: 'hf_phi2', url: 'https://api-inference.huggingface.co/models/microsoft/phi-2', key: process.env.HF_API_KEY, method: (prompt) => ({ inputs: prompt }) },

    // 4. Hugging Face - Mistral-7B (free)
    { name: 'hf_mistral', url: 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-v0.1', key: process.env.HF_API_KEY, method: (prompt) => ({ inputs: prompt }) },

    // 5. Replicate - Llama2 (free tier)
    { name: 'replicate_llama', url: 'https://api.replicate.com/v1/predictions', key: process.env.REPLICATE_API_KEY, method: (prompt) => ({ version: 'llama2', input: { prompt } }) },

    // 6. Groq - Mixtral (free tier)
    { name: 'groq_mixtral', url: 'https://api.groq.com/openai/v1/chat/completions', key: process.env.GROQ_API_KEY, method: (prompt) => ({ model: 'mixtral-8x7b-32768', messages: [{ role: 'user', content: prompt }] }) },

    // 7. Together AI - Llama (free)
    { name: 'together_llama', url: 'https://api.together.xyz/inference', key: process.env.TOGETHER_API_KEY, method: (prompt) => ({ model: 'llama', prompt }) },

    // 8. Perplexity AI (free endpoint giả định 2026)
    { name: 'perplexity', url: 'https://api.perplexity.ai/chat/completions', key: process.env.PERPLEXITY_API_KEY, method: (prompt) => ({ model: 'perplexity-free', messages: [{ role: 'user', content: prompt }] }) },

    // 9. Cohere (free tier)
    { name: 'cohere', url: 'https://api.cohere.ai/generate', key: process.env.COHERE_API_KEY, method: (prompt) => ({ model: 'command-xlarge', prompt }) },

    // 10. Mistral AI free tier (separate)
    { name: 'mistral', url: 'https://api.mistral.ai/v1/chat/completions', key: process.env.MISTRAL_API_KEY, method: (prompt) => ({ model: 'mistral-tiny', messages: [{ role: 'user', content: prompt }] }) }
];

async function generateWithAI(prompt) {
    // Prompt mặc định để chatbot thân thiện, tiếng Việt
    const fullPrompt = `Bạn là chatbot AI của 160store - cửa hàng thời trang nam. Trả lời thân thiện, ngắn gọn bằng tiếng Việt, thêm emoji. Câu hỏi: ${prompt}`;

    for (const provider of providers) {
        try {
            const response = await axios.post(provider.url, provider.method(fullPrompt), {
                headers: { Authorization: `Bearer ${provider.key}` }
            });
            // Extract text từ response (tùy provider)
            return response.data.choices?.[0]?.message?.content || response.data.generated_text || response.data.output || 'Response from ' + provider.name;
        } catch (error) {
            console.log(`${provider.name} failed: ${error.message}. Falling back...`);
        }
    }
    return 'Tất cả AI đang bận. Vui lòng thử lại! 😅';
}

module.exports = { generateWithAI };