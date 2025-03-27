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
        url: `https://api.myquran.com/v2/sholat/jadwal/${idkota}/${tahun}/${bulan}/${tgl}`,
        method: 'GET'
    }
    try {
        const rsp = await axios(options);
        const { data } = rsp.data;
        const { lokasi, daerah, jadwal } = data;

        let randomNumber = Math.floor(Math.random() * 4); // Output bisa 1, 2, 3, atau 4 secara acak
        let arti = ayat[randomNumber].arti;
        // let ayatnya = ayat[randomNumber].arab;

        // membuat pesan jadwal sholat
        const jadwalSemua = `
🌅 Imsak   = ${jadwal.imsak} WIB
🌄 Subuh   = ${jadwal.subuh} WIB
☀️ Terbit  = ${jadwal.terbit} WIB
🌤️ Dhuha   = ${jadwal.dhuha} WIB
🌞 Dzuhur  = ${jadwal.dzuhur} WIB
🕒 Ashar   = ${jadwal.ashar} WIB
🌇 Maghrib = ${jadwal.maghrib} WIB
🌃 Isya    = ${jadwal.isya} WIB
`;

        const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=masjid+di+${encodeURIComponent(kota)}`;
        // final message 
        const message = `🕌 Jadwal sholat hari <b>${longDay(tanggal)}</b> tanggal <b>${formatDate(tanggal)}</b> untuk <a href="${googleMapsLink}">${lokasi}</a>, ${daerah} dan sekitarnya:        
<code>${jadwalSemua}</code>
"${arti}"
`;
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