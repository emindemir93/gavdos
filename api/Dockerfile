# syntax=docker/dockerfile:1

FROM node:lts-alpine
WORKDIR /bookcars/api
COPY ./api ./
COPY ./packages /bookcars/packages
WORKDIR /bookcars/packages/bookcars-types
RUN npm install
RUN npm run build
WORKDIR /bookcars/api
RUN mkdir -p /bookcarsdoc/bookcars/users
RUN mkdir -p /bookcarsdoc/bookcars/temp/users
RUN mkdir -p /bookcarsdoc/bookcars/cars
RUN mkdir -p /bookcarsdoc/bookcars/temp/cars
RUN npm install
CMD [ "npm", "start"]
EXPOSE 4002
