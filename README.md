# Lebaran Bot

![Last Commit](https://img.shields.io/github/last-commit/thesuhu/my-lebaran-bot)

Telegram bot tentang serba-serbi lebaran. Just for fun!.

## Usage

Jika kamu ingin deploy sendiri, silahkan clone atau fork project ini:

```sh
git clone https://github.com/thesuhu/my-lebaran-bot.git
```

Install dependensi:

```sh
cd my-lebaran-bot
npm install
```

create file `.env` dan isi environment berikut:

```
TELEGRAM_BOT_TOKEN=<telegram bot kamu>
TAHUN_HIJRIAH=1446 H
AI_PROVIDER=<pilihan penyedia AI, misalnya: openai, claude>
AI_MODEL=<model AI yang digunakan, misalnya: gpt-3.5-turbo, gpt-4, claude-v1>
OPENAI_API_KEY=<API key untuk OpenAI jika menggunakan OpenAI>
CLAUDE_API_KEY=<API key untuk Claude jika menggunakan Claude>
```

Setelah itu jalankan bot dengan perintah:

```sh
npm run dev
```

## Privacy Policy

Kami sangat menghargai privasi Anda. Berikut adalah beberapa hal yang perlu Anda ketahui:

- **Tidak Ada Penyimpanan Data Pribadi**: Bot ini tidak menyimpan username, chat, atau informasi pribadi lainnya dari pengguna.
- **Penghapusan File Otomatis**: Semua kartu ucapan yang dihasilkan akan dihapus secara otomatis dari server setelah dikirimkan kepada Anda.
- **Penggunaan Data Sementara**: Data seperti permintaan pengguna hanya disimpan sementara di memori selama bot berjalan dan tidak disimpan secara permanen.
- **Pencatatan Log Request**: Bot ini mencatat log request ke file `request.log`, tetapi log tersebut hanya mencatat waktu dan menu yang diakses (contoh: `/kartu`, `/kartuai`) tanpa menyimpan informasi pengguna seperti ID atau username.
- **Keamanan API Key**: API key yang digunakan untuk layanan AI hanya digunakan untuk memproses permintaan dan tidak disimpan atau dibagikan.

Dengan menggunakan bot ini, Anda dapat merasa aman bahwa privasi Anda tetap terjaga.

Jika Anda merasa bot ini bermanfaat, jangan lupa untuk memberikan ⭐ pada repository ini. Masukan dan saran Anda sangat kami hargai.

Anda juga dapat berkontribusi atau mendukung pengembangan bot ini dengan [**membelikan saya kopi :coffee:**](https://saweria.co/thesuhu).

## License

[MIT](https://github.com/thesuhu/my-lebaran-bot/blob/master/LICENSE)