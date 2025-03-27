const fs = require('fs')
const Jimp = require('jimp')
const kumpulanUcapan = require('./kumpulan-ucapan')
const writelog = require('@thesuhu/writelog')

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
        imgDarkener = imgDarkener.opacity(0.5)
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

// hapus file temp
const deleteImage = (imagePath) => {
    fs.unlinkSync(imagePath)
}

module.exports = { generateImage, randomUcapan, deleteImage }