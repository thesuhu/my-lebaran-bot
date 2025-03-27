const { Telegraf, Markup, Extra } = require('telegraf')
const { v4: uuidV4 } = require('uuid')
const fs = require('fs')
const { generateImage, randomUcapan, deleteImage } = require('./src/generator')
const writelog = require('@thesuhu/writelog')
const { TELEGRAM_BOT_TOKEN } = require('./config/keys')
const bot = new Telegraf(TELEGRAM_BOT_TOKEN)
const jadwalsholat = require('./src/jadwalsholat')

// Map untuk menyimpan timestamp terakhir dari setiap pengguna
const userLastRequest = new Map();

bot.start((ctx) => {
    let message = ` Gunakan perintah berikut untuk generator:

/ucapan - 💬 hanya text ucapan selamat lebaran.
/kartu - 💌 membuat kartu ucapan selamat lebaran.

Fitur tambahan:

/jadwal - 🕌 lihat jadwal sholat berdasarkan kab/kota di Indonesia.
`
    ctx.reply(message)
})

bot.command('kartu', async (ctx) => {
    try {
        const userId = ctx.from.id;

        // Periksa apakah pengguna sudah membuat permintaan sebelumnya
        if (userLastRequest.has(userId)) {
            const lastRequestTime = userLastRequest.get(userId);
            const now = Date.now();
            const timeDiff = (now - lastRequestTime) / 1000; // dalam detik

            if (timeDiff < 15) { // Ubah dari 10 ke 15 detik
                return ctx.reply(`Tunggu ${Math.ceil(15 - timeDiff)} detik sebelum membuat kartu lagi.`);
            }
        }

        ctx.reply('⏳ Membuat kartu lebaran, mohon tunggu sejenak. Proses ini membutuhkan waktu beberapa detik.');
        writelog.info('Membuat kartu lebaran');
        let imagePath = `./temp/${uuidV4()}.jpg`;
        let chat = ctx.update.message.chat;
        let text = ctx.update.message.text.slice(7);
        let sender = (text.length > 0) ? text : (chat.first_name + ' ' + (chat.last_name == undefined ? '' : chat.last_name));

        // Generate image
        await generateImage(imagePath, sender);

        // Kirim kartu lebaran
        writelog.info('Mengirim kartu lebaran');
        await ctx.replyWithPhoto({ source: imagePath });

        // Reset timestamp pengguna setelah berhasil mengirim kartu
        userLastRequest.set(userId, Date.now());

        // Hapus file temp
        writelog.info('Menghapus image temp (' + imagePath + ')');
        deleteImage(imagePath);
        writelog.info('Done!');
    } catch (err) {
        writelog.error(err.message);
        ctx.reply('Maaf terjadi kesalahan.');
    }
});

bot.command('ucapan', async (ctx) => {
    try {
        let ucapan = randomUcapan()
        ctx.reply(ucapan)
    } catch (err) {
        writelog.error(err.message)
        ctx.reply('Maaf terjadi kesalahan.')
    }
});

bot.command('jadwal', async (ctx) => {
    try {
        const message = ctx.message.text;
        const words = message.split(' ');
        const text = words.slice(1).join(' ');
        if (text === '') {
            ctx.reply('Anda tidak menyebutkan nama lokasi.')
        } else {
            let kota = fs.readFileSync('./src/json/kota.json')
            let objKota = JSON.parse(kota)
            let exactMatch = null;
            // cari kota jika sama persis
            objKota.forEach((item) => {
                if (item.lokasi.toLowerCase() === text.trim().toLowerCase()) {
                    exactMatch = item;
                    return;
                }
            })
            // kota ketemu sama persis
            if (exactMatch !== null) {
                // lanjut get jadwal sholat
                let response = await jadwalsholat(exactMatch.lokasi, exactMatch.id)
                // ctx.reply(response, { parse_mode: 'HTML' })
                ctx.replyWithHTML(response, {
                    disable_web_page_preview: true
                })
            } else {
                // tidak ketemu yang sama persis, cari yang mengandung kata
                const filteredData = objKota.filter((item) => item.lokasi.toLowerCase().includes(text.trim().toLowerCase()));
                if (filteredData.length === 0) {
                    // Jika tidak ada kota yang ditemukan
                    ctx.reply("Maaf, tidak ada kota yang ditemukan");
                } else if (filteredData.length === 1) {
                    // Jika hanya ada satu kota yang ditemukan
                    // lanjut get jadwal sholat
                    let response = await jadwalsholat(filteredData[0].lokasi, filteredData[0].id)
                    // ctx.reply(response, { parse_mode: 'HTML' })
                    ctx.replyWithHTML(response)
                } else {
                    // Jika ada lebih dari satu kota yang ditemukan
                    const kota = filteredData.map((item) => item.lokasi);
                    const kotaText = kota.join("\n");
                    ctx.reply(`Kota yang Anda cari kurang spesifik, silahkan pilih salah satu kota berikut:\n\n${kotaText}`);
                }
            }
        }
    } catch (err) {
        writelog.error(err.message)
        ctx.reply('Maaf terjadi kesalahan.')
    }
})

bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));