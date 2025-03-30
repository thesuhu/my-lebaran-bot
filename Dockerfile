FROM node:22-alpine

#RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
RUN mkdir -p /home/node/app/node_modules

WORKDIR /home/node/app

COPY package*.json ./

#USER node

RUN npm install
RUN npm install -g pm2

#COPY --chown=node:node . .

CMD [ "pm2", "start app.js --name lebaran -i 1" ]