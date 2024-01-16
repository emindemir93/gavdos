FROM node:lts-alpine
WORKDIR /bookcars/api
COPY ./api ./
COPY ./api/package.json  ./
COPY ./packages /bookcars/packages
RUN mkdir -p /var/www/cdn/bookcars/users
RUN mkdir -p /var/www/cdn/bookcars/temp/users
RUN mkdir -p /var/www/cdn/bookcars/cars
RUN mkdir -p /var/www/cdn/bookcars/temp/cars
RUN npm install
RUN npm install -g typescript
RUN npm i dotenv
RUN npm run start
# CMD [ "npm", "dev"]
EXPOSE 4002
