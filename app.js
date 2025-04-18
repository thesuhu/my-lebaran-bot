const { Telegraf, Markup, Extra } = require('telegraf')
const { v4: uuidV4 } = require('uuid')
const fs = require('fs')
const path = require('path')
const { generateImage, generateImageWithAI, randomUcapan, deleteImage, generateAIUcapan } = require('./src/generator')
const writelog = require('@thesuhu/writelog')
const { TELEGRAM_BOT_TOKEN, TAHUN_HIJRIAH } = require('./config/keys')
const bot = new Telegraf(TELEGRAM_BOT_TOKEN)
const jadwalsholat = require('./src/jadwalsholat')

// Map untuk menyimpan timestamp terakhir dari setiap pengguna
const userLastRequest = new Map();

// Tambahkan map untuk melacak jumlah permintaan berturut-turut
const userRequestCount = new Map();

// Fungsi untuk mencatat log request
function logRequest(requestPath) {
    const logFilePath = path.join(__dirname, 'logs/request.log');
    const now = new Date();
    const logEntry = `${now.toISOString()} ${requestPath}\n`;

    // Tambahkan log ke file tanpa menimpa data sebelumnya
    fs.appendFile(logFilePath, logEntry, (err) => {
        if (err) {
            writelog.error('Gagal mencatat log request: ' + err.message);
        }
    });
}

bot.start((ctx) => {
    let message = ` Gunakan perintah berikut untuk generator:

/ucapan - 💬 hanya text ucapan selamat lebaran.
/kartu - 💌 membuat kartu ucapan selamat lebaran.
/kartuai - 💌 membuat kartu ucapan selamat lebaran dari AI.

Fitur tambahan:

/jadwal - 🕌 lihat jadwal sholat berdasarkan kab/kota di Indonesia.
`
    ctx.reply(message)
})

// Perintah untuk membuat kartu lebaran biasa
bot.command('kartu', async (ctx) => {
    try {
        const userId = ctx.from.id;

        // Log request
        logRequest('/kartu');

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

// Perintah untuk membuat kartu lebaran dengan AI
bot.command('kartuai', async (ctx) => {
    try {
        const userId = ctx.from.id;

        // Log request
        logRequest('/kartuai');

        // Periksa apakah pengguna sudah mencapai batas permintaan
        if (userRequestCount.has(userId)) {
            const { count, lastRequestTime } = userRequestCount.get(userId);
            const now = Date.now();
            const timeDiff = (now - lastRequestTime) / (1000 * 60 * 60); // dalam jam

            if (count >= 5 && timeDiff < 1) {
                return ctx.reply(`Anda telah mencapai batas 5 permintaan dalam 1 jam. Silakan tunggu ${Math.ceil(60 - timeDiff * 60)} menit sebelum mencoba lagi.`);
            } else if (timeDiff >= 1) {
                // Reset hitungan jika sudah melewati 1 jam
                userRequestCount.set(userId, { count: 1, lastRequestTime: now });
            } else {
                // Tambah hitungan permintaan
                userRequestCount.set(userId, { count: count + 1, lastRequestTime: now });
            }
        } else {
            // Inisialisasi hitungan permintaan
            userRequestCount.set(userId, { count: 1, lastRequestTime: Date.now() });
        }

        ctx.reply('⏳ Membuat kartu lebaran dengan ucapan dari AI, mohon tunggu sejenak. Proses ini membutuhkan waktu beberapa detik.');
        writelog.info('Membuat kartu lebaran dengan ucapan dari AI');
        let imagePath = `./temp/${uuidV4()}.jpg`;
        let chat = ctx.update.message.chat;
        let sender = chat.first_name + ' ' + (chat.last_name == undefined ? '' : chat.last_name);

        // Dapatkan ucapan dari AI
        const prompt = `Buat ucapan Idul Fitri ${TAHUN_HIJRIAH} yang singkat tapi lucu, maksimal 250 karakter jangan gunakan tagar, jangan ada enter/ganti baris, jangan ada karakter "`; // Prompt untuk AI
        const aiUcapan = await generateAIUcapan(prompt);

        // Periksa apakah ucapan dari AI valid
        if (!aiUcapan) {
            writelog.error('Gagal mendapatkan ucapan dari AI.');
            return ctx.reply('Maaf, terjadi masalah saat menghasilkan ucapan menggunakan AI. Silakan coba lagi nanti.');
        }

        // Generate kartu dengan ucapan dari AI
        await generateImageWithAI(imagePath, sender, aiUcapan);

        // Kirim kartu lebaran
        writelog.info('Mengirim kartu lebaran dengan ucapan dari AI');
        await ctx.replyWithPhoto({ source: imagePath });

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
        // Log request
        logRequest('/ucapan');

        const userId = ctx.from.id;

        // Periksa apakah pengguna sudah mencapai batas permintaan
        if (userRequestCount.has(userId)) {
            const { count, lastRequestTime } = userRequestCount.get(userId);
            const now = Date.now();
            const timeDiff = (now - lastRequestTime) / 1000; // dalam detik

            if (count >= 5 && timeDiff < 30) {
                return ctx.reply(`Anda telah mencapai batas 5 permintaan berturut-turut. Silakan tunggu ${Math.ceil(30 - timeDiff)} detik sebelum mencoba lagi.`);
            } else if (timeDiff >= 30) {
                // Reset hitungan jika sudah melewati 30 detik
                userRequestCount.set(userId, { count: 1, lastRequestTime: now });
            } else {
                // Tambah hitungan permintaan
                userRequestCount.set(userId, { count: count + 1, lastRequestTime: now });
            }
        } else {
            // Inisialisasi hitungan permintaan
            userRequestCount.set(userId, { count: 1, lastRequestTime: Date.now() });
        }

        let ucapan = randomUcapan();
        ctx.reply(ucapan);
    } catch (err) {
        writelog.error(err.message);
        ctx.reply('Maaf terjadi kesalahan.');
    }
});

bot.command('jadwal', async (ctx) => {
    try {
        // Log request
        logRequest('/jadwal');

        const userId = ctx.from.id;

        // Periksa apakah pengguna sudah mencapai batas permintaan
        if (userRequestCount.has(userId)) {
            const { count, lastRequestTime } = userRequestCount.get(userId);
            const now = Date.now();
            const timeDiff = (now - lastRequestTime) / 1000; // dalam detik

            if (count >= 5 && timeDiff < 30) {
                return ctx.reply(`Anda telah mencapai batas 5 permintaan berturut-turut. Silakan tunggu ${Math.ceil(30 - timeDiff)} detik sebelum mencoba lagi.`);
            } else if (timeDiff >= 30) {
                // Reset hitungan jika sudah melewati 30 detik
                userRequestCount.set(userId, { count: 1, lastRequestTime: now });
            } else {
                // Tambah hitungan permintaan
                userRequestCount.set(userId, { count: count + 1, lastRequestTime: now });
            }
        } else {
            // Inisialisasi hitungan permintaan
            userRequestCount.set(userId, { count: 1, lastRequestTime: Date.now() });
        }

        const message = ctx.message.text;
        const words = message.split(' ');
        const text = words.slice(1).join(' ');
        if (text === '') {
            ctx.reply('Anda tidak menyebutkan nama lokasi.');
        } else {
            let kota = fs.readFileSync('./src/json/kota.json');
            let objKota = JSON.parse(kota);
            let exactMatch = null;
            // cari kota jika sama persis
            objKota.forEach((item) => {
                if (item.lokasi.toLowerCase() === text.trim().toLowerCase()) {
                    exactMatch = item;
                    return;
                }
            });
            // kota ketemu sama persis
            if (exactMatch !== null) {
                let response = await jadwalsholat(exactMatch.lokasi, exactMatch.id);
                ctx.replyWithHTML(response, {
                    disable_web_page_preview: true,
                });
            } else {
                const filteredData = objKota.filter((item) =>
                    item.lokasi.toLowerCase().includes(text.trim().toLowerCase())
                );
                if (filteredData.length === 0) {
                    ctx.reply('Maaf, tidak ada kota yang ditemukan');
                } else if (filteredData.length === 1) {
                    let response = await jadwalsholat(filteredData[0].lokasi, filteredData[0].id);
                    ctx.replyWithHTML(response);
                } else {
                    const kota = filteredData.map((item) => item.lokasi);
                    const kotaText = kota.join('\n');
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