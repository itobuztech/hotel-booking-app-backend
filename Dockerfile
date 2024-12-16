FROM node:20-alpine
RUN apk add --update --no-cache postgresql-client nano sudo ffmpeg openssl
RUN mkdir /app 
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn
COPY . ./
RUN npx prisma generate
CMD bin/entrypoint.sh