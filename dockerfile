FROM node

RUN mkdir -p /home/app

COPY . /home/app

RUN pwd

CMD ["node", "/home/app/src/index.js"]