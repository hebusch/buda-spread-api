FROM node:18 AS builder

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install

COPY . .

RUN yarn build

FROM node:18 AS production

ENV NODE_ENV=production

WORKDIR /app

COPY --from=builder ./app/package.json ./app/yarn.lock ./
COPY --from=builder ./app/dist ./dist
COPY --from=builder ./app/public ./public

RUN yarn install --production

COPY --from=builder ./app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder ./app/node_modules/prisma ./node_modules/prisma
COPY --from=builder ./app/src/prisma ./src/prisma

RUN yarn prisma:migrate:deploy

EXPOSE 3000

CMD ["yarn",  "start"]

