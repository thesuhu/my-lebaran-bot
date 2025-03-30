FROM node:22-alpine

WORKDIR /home/node/app

COPY package*.json ./
RUN npm install --production

RUN npm install -g pm2

COPY . .

CMD ["pm2-runtime", "start", "app.js", "--name", "lebaran", "-i", "1"]
