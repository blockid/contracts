FROM node:latest

WORKDIR /usr/src/app

COPY package.json .

RUN npm install

COPY contracts ./contracts
COPY migrations ./migrations
COPY shared ./shared
COPY truffle.js .

EXPOSE 8545
CMD [ "npm", "run", "test:node" ]
