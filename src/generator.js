const fs = require('fs')
const Jimp = require('jimp')
const kumpulanUcapan = require('./kumpulan-ucapan')
const writelog = require('@thesuhu/writelog')
const { AI_PROVIDER, AI_MODEL, OPENAI_API_KEY, CLAUDE_API_KEY } = require('../config/keys'); // Destructuring keys.js
const axios = require('axios');

// mengambil ucapan random
function randomUcapan() {
    let ucapan = kumpulanUcapan[randomInteger(0, (kumpulanUcapan.length - 1))]
    return ucapan
}

// get angka random
function randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// copy image random dari template kemudian edit
async function generateImage(imagePath, sender) {
    try {
        const dir = './src/images/';
        let files = fs.readdirSync(dir);

        let image = dir + randomInteger(0, (files.length - 1)) + '.jpg'
        fs.copyFileSync(image, imagePath)

        let ucapan = randomUcapan()

        let imageTemp = await Jimp.read(imagePath)

    	imageTemp.resize(500, Jimp.AUTO);

        let imageTempWidth = imageTemp.bitmap.width
        let imageTempHeight = imageTemp.bitmap.height
        let imgDarkener = new Jimp(imageTempWidth, imageTempHeight, '#000000')
        imgDarkener = imgDarkener.opacity(0.4)
        imageTemp = imageTemp.composite(imgDarkener, 0, 0);

        let posX = imageTempWidth / 15
        let posY = imageTempHeight / 15
        let maxWidth = imageTempWidth - (posX * 2)
        let maxHeight = imageTempHeight - posY

        // let font = await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE)
        let font = await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE)
        let text = `"${ucapan}"` 
        let text2 = `~ ${sender} ~`

        imageTemp.print(font, posX, posY - 20, {
            text: text,
            alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
            alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
        }, maxWidth, maxHeight)

        imageTemp.print(font, posX, posY + (imageTempHeight / 10), {
            text: text2,
            alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
            alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
        }, maxWidth, maxHeight)

        await imageTemp.writeAsync(imagePath)
        writelog.info("Image generated successfully")
    } catch (err) {
        writelog.error(err.message)
    }
}

async function generateImageWithAI(imagePath, sender, ucapanAI) {
    try {
        const dir = './src/images/';
        let files = fs.readdirSync(dir);

        let image = dir + randomInteger(0, (files.length - 1)) + '.jpg';
        fs.copyFileSync(image, imagePath);

        let imageTemp = await Jimp.read(imagePath);

        imageTemp.resize(500, Jimp.AUTO);

        let imageTempWidth = imageTemp.bitmap.width;
        let imageTempHeight = imageTemp.bitmap.height;
        let imgDarkener = new Jimp(imageTempWidth, imageTempHeight, '#000000');
        imgDarkener = imgDarkener.opacity(0.4);
        imageTemp = imageTemp.composite(imgDarkener, 0, 0);

        let posX = imageTempWidth / 15;
        let posY = imageTempHeight / 15;
        let maxWidth = imageTempWidth - posX * 2;
        let maxHeight = imageTempHeight - posY;

        let font = await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE);
        let text = `"${ucapanAI}"`;
        let text2 = `~ ${sender} ~`;

        imageTemp.print(
            font,
            posX,
            posY - 20,
            {
                text: text,
                alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
                alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
            },
            maxWidth,
            maxHeight
        );

        imageTemp.print(
            font,
            posX,
            posY + imageTempHeight / 10,
            {
                text: text2,
                alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
                alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
            },
            maxWidth,
            maxHeight
        );

        await imageTemp.writeAsync(imagePath);
        writelog.info('Image with AI generated successfully');
    } catch (err) {
        writelog.error(err.message);
    }
}

// Fungsi untuk menghasilkan ucapan menggunakan AI
async function generateAIUcapan(prompt) {
    if (AI_PROVIDER === 'openai') {
        try {
            const response = await axios.post(
                'https://api.openai.com/v1/completions',
                {
                    model: AI_MODEL || 'text-davinci-003', // Gunakan model dari env atau default
                    prompt: prompt,
                    max_tokens: 50, // Maksimal token untuk menghasilkan kalimat
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${OPENAI_API_KEY}`,
                    },
                }
            );

            const ucapanAI = response.data.choices[0].text.trim();

            // Batasi hasil ke maksimal 200 huruf
            // return ucapanAI.length > 250 ? ucapanAI.substring(0, 250) + '...' : ucapanAI;
            return ucapanAI
        } catch (err) {
            writelog.error('Error generating AI ucapan with OpenAI: ' + err.message);
            return null; // Kembalikan null jika terjadi error
        }
    } else if (AI_PROVIDER === 'claude') {
        try {
            const response = await axios.post(
                'https://api.anthropic.com/v1/messages',
                {
                    model: AI_MODEL || 'claude-3-7-sonnet-20250219', // Gunakan model dari env atau default
                    max_tokens: 200, // Maksimal token untuk menghasilkan kalimat
                    messages: [
                        { role: 'user', content: prompt } // Format pesan sesuai dokumentasi
                    ]
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': CLAUDE_API_KEY,
                        'anthropic-version': '2023-06-01', // Versi API sesuai dokumentasi
                    },
                }
            );

            const ucapanAI = response.data.content[0].text.trim(); // Ambil teks dari response

            // Batasi hasil ke maksimal 200 huruf
            // return ucapanAI.length > 200 ? ucapanAI.substring(0, 200) + '...' : ucapanAI;
            return ucapanAI
        } catch (err) {
            writelog.error('Error generating AI ucapan with Claude: ' + err.message);
            return null; // Kembalikan null jika terjadi error
        }
    } else {
        writelog.info('AI generation is disabled or unsupported provider. Using random ucapan.');
        return null; // Kembalikan null jika provider tidak valid
    }
}

// hapus file temp
const deleteImage = (imagePath) => {
    fs.unlinkSync(imagePath)
}

module.exports = { generateImage, generateImageWithAI, randomUcapan, deleteImage, generateAIUcapan }