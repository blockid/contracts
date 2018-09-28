FROM node:latest

WORKDIR /usr/src/app

COPY *.json ./
COPY *.js ./
COPY ./contracts ./contracts
COPY ./migrations ./migrations
COPY ./shared ./shared

RUN npm install

EXPOSE 8545
CMD [ "npm", "run", "test:node" ]
