const dotenv = require('dotenv');
const Groq = require('groq-sdk');

dotenv.config();

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

async function main() {
    console.log("Testing Groq API with Key:", process.env.GROQ_API_KEY ? "Present" : "Missing");
    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'user',
                    content: 'Say Hello',
                },
            ],
            model: 'llama-3.3-70b-versatile',
        });

        console.log("Success:", chatCompletion.choices[0]?.message?.content);
    } catch (error) {
        console.error("Error:", error);
    }
}

main();
