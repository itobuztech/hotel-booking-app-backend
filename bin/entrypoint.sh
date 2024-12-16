#!/bin/sh

#npm config set cache /tmp --global
npx prisma migrate deploy
yarn start:dev
