# Lebaran Bot

[![Build Status](https://img.shields.io/github/workflow/status/thesuhu/my-lebaran-bot/Build%20Status?label=Build%20Status)](https://github.com/thesuhu/my-lebaran-bot/actions/workflows/deploy.yml)

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
TAHUN_HIJRIAH=1444
```

Setelah itu jalankan bot dengan perintah:

```sh
npm run dev
```
