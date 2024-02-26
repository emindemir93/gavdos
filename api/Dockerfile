# syntax=docker/dockerfile:1

FROM node:lts-alpine
WORKDIR /bookcars/api
COPY ./api ./
COPY ./packages /bookcars/packages
RUN mkdir -p /bookcarsdoc/bookcars/users
RUN mkdir -p /bookcarsdoc/bookcars/temp/users
RUN mkdir -p /bookcarsdoc/bookcars/cars
RUN mkdir -p /bookcarsdoc/bookcars/temp/cars
RUN npm install mongodb
RUN npm install
CMD [ "npm", "start"]
EXPOSE 4002
