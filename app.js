require('dotenv').config()
const { Telegraf } = require('telegraf')
const { v4: uuidV4 } = require('uuid')
const { generateImage, randomUcapan, deleteImage } = require('./src/generator')
const writelog = require('@thesuhu/writelog')
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN)

bot.start((ctx) => {
    let message = ` Gunakan perintah berikut untuk generator:

/ucapan - hanya text ucapan selamat lebaran
/kartu - membuat kartu ucapan selamat lebaran
`
    ctx.reply(message)
})

bot.command('kartu', async (ctx) => {
    try {
        ctx.reply('Membuat kartu lebaran, mohon tunggu sejenak. Proses ini membutuhkan waktu beberapa detik.')
        writelog.info('Membuat kartu lebaran')
        let imagePath = `./temp/${uuidV4()}.jpg`
        let chat = ctx.update.message.chat
        let text = ctx.update.message.text.slice(7)

        //  cek apakah ada parameter pengirim
        let sender = ''
        if (text.length > 0) {
            sender = text
        } else {
            sender = chat.first_name + ' ' + chat.last_name
        }
    	
        await generateImage(imagePath, sender)

    	writelog.info('Mengirim kartu lebaran')
        ctx.replyWithPhoto({ source: imagePath})
        
        writelog.info('Menghapus image temp (' + imagePath + ')')    	
        await deleteImage(imagePath)
        
        writelog.info('Done!')
    } catch (err) {
        writelog.error(err.message)
        ctx.reply('Maaf terjadi kesalahan sistem')
    }
});

bot.command('ucapan', async (ctx) => {
    try {
        let ucapan = await randomUcapan()
        ctx.reply(ucapan)
    } catch (err) {
        writelog.error(err.message)
        ctx.reply('Maaf terjadi kesalahan sistem')
    }
});

bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));