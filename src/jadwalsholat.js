const writelog = require('@thesuhu/writelog')
const axios = require('axios')
const moment = require('moment-timezone');
const ayat = require('./json/ayat.json')

module.exports = async (kota, idkota, tanggal = new Date(moment().tz('Asia/Jakarta').format('YYYY-MM-DD'))) => {
    let tahun = tanggal.getFullYear()
    let bulan = (tanggal.getMonth() + 1).toString().padStart(2, '0')
    let tgl = tanggal.getDate().toString().padStart(2, '0')
    // get data jadwal sholat
    const options = {
        url: `https://api.myquran.com/v1/sholat/jadwal/${idkota}/${tahun}/${bulan}/${tgl}`,
        method: 'GET'
    }
    try {
        const rsp = await axios(options);
        let d = rsp.data.data
        // console.log(rsp.data)
        let randomNumber = Math.floor(Math.random() * 4) // Output bisa 1, 2, 3, atau 4 secara acak
        // let arab = ayat[randomNumber].arab
        // let latin = ayat[randomNumber].latin
        let arti = ayat[randomNumber].arti
        // membuat pesan jadwal sholat
        jadwalSemua = `
🌅 Imsak   = ${d.jadwal.imsak} WIB
🌄 Subuh   = ${d.jadwal.subuh} WIB
☀️ Terbit  = ${d.jadwal.terbit} WIB
🌤️ Dhuha   = ${d.jadwal.dhuha} WIB
🌞 Dzuhur  = ${d.jadwal.dzuhur} WIB
🕒 Ashar   = ${d.jadwal.ashar} WIB
🌇 Maghrib = ${d.jadwal.maghrib} WIB
🌃 Isya    = ${d.jadwal.isya} WIB
`
        let koordinat = d.koordinat;
        let googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${koordinat.lat},${koordinat.lon}`;
        // final message
        let message = `🕌 Jadwal sholat hari <b>${longDay(tanggal)}</b> tanggal <b>${formatDate(tanggal)}</b> untuk <a href="${googleMapsLink}">${d.lokasi}</a>, ${d.daerah} dan sekitarnya:        
<code>${jadwalSemua}</code>
"${arti}"
`
        return message;
    } catch (err) {
        writelog.error(err.message);
        return `Gagal mendapatkan jadwal sholat kota ${kota}.`;
    }
}

const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

// konversi tanggal ke long text
const formatDate = (dateString) => {
    const date = new Date(dateString)
    const day = date.getDate()
    const monthName = months[date.getMonth()]
    const year = date.getFullYear()
    return `${day} ${monthName} ${year}`
}

// konversi tanggal ke hari
const longDay = (dateString) => {
    const date = new Date(dateString)
    const dayName = days[date.getDay()]
    return `${dayName}`
}