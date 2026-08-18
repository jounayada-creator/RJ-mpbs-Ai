const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(cors());
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;

app.post('/api/chat', async (req, res) => {
    const { message, model, apiKey } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'বার্তা খালি রাখা যাবে না।' });
    }

    try {
        let aiReply = "";
        const activeKey = apiKey || process.env.GEMINI_API_KEY;

        if (model === 'gemini') {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${activeKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: message }] }] })
            });
            const data = await response.json();
            if(data.candidates && data.candidates.length > 0) {
                aiReply = data.candidates[0].content.parts[0].text;
            } else {
                aiReply = "দুঃখিত, এআই থেকে কোনো উত্তর পাওয়া যায়নি।";
            }
        } else {
            aiReply = `নির্বাচিত মডেল (${model}) বর্তমানে পরীক্ষামূলক পর্যায়ে রয়েছে।`;
        }

        res.json({ reply: aiReply });

    } catch (error) {
        console.error("AI Error:", error);
        res.status(500).json({ error: 'সার্ভার কানেকশনে সমস্যা হয়েছে।' });
    }
});

app.listen(PORT, () => {
    console.log(`RJ MPBS AI Server running on port ${PORT}`);
});
