#!/bin/sh

npm run build

cd dist
cp ../package.json ../package-lock.json .
npm i --production

zip -u -r calculator.zip *
