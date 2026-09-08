FROM node:24-alpine AS base

WORKDIR /usr/app
COPY prisma prisma
COPY src src
COPY next.config.js \
     package.json \
     pnpm-lock.yaml \
     pnpm-workspace.yaml \
     postcss.config.js \
     reset.d.ts \
     tailwind.config.js \
     tsconfig.json ./
COPY scripts/build.env .env
ENV NEXT_TELEMETRY_DISABLED=1
RUN apk add --no-cache openssl && \
    npm i -g --allow-scripts=pnpm pnpm && \
    pnpm i --ignore-scripts && \
    pnpm prisma generate && \
    pnpm run build && rm -r .next/cache


FROM node:24-alpine AS runtime-deps

WORKDIR /usr/app
COPY prisma prisma
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN apk add --no-cache openssl && \
    npm i -g --allow-scripts=pnpm pnpm && \
    pnpm i --prod --no-optional --ignore-scripts && \
    pnpm --package="prisma@^6.19.3" dlx --allow-build @prisma/engines@6.19.3 prisma generate


FROM node:24-alpine

WORKDIR /usr/app
COPY prisma prisma
COPY public public
COPY next.config.js package.json ./
COPY --from=base /usr/app/.next .next
COPY --from=runtime-deps /usr/app/node_modules node_modules
COPY --chmod=755 <<EOF entrypoint.sh
#!/bin/sh
set -euxo pipefail
pnpm --package="prisma@^6.19.3" dlx --allow-build @prisma/engines@6.19.3 prisma migrate deploy
./node_modules/.bin/next start
EOF
RUN apk add --no-cache openssl && npm i -g --allow-scripts=pnpm pnpm

EXPOSE 3000/tcp
ENTRYPOINT ["/usr/app/entrypoint.sh"]
