require('dotenv').config()

module.exports = {
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    TAHUN_HIJRIAH: process.env.TAHUN_HIJRIAH,
    AI_PROVIDER: process.env.AI_PROVIDER, // Pilihan: openai, claude
    OPENAI_API_KEY: process.env.OPENAI_API_KEY, // API key untuk OpenAI
    CLAUDE_API_KEY: process.env.CLAUDE_API_KEY, // API key untuk Claude
    AI_MODEL: process.env.AI_MODEL // Model AI yang digunakan, misalnya: gpt-3.5-turbo, claude-v1
}