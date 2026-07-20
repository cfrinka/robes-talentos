FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# NEXT_PUBLIC_* vars are inlined into the client bundle at build time, not
# read at runtime -- must be passed as --build-arg (EasyPanel: set these as
# build-time variables, not just runtime env vars) or Firebase Auth on
# /admin/login will silently break in production.
ARG NEXT_PUBLIC_FIREBASE_API_KEY
ARG NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ARG NEXT_PUBLIC_FIREBASE_PROJECT_ID
ENV NEXT_PUBLIC_FIREBASE_API_KEY=$NEXT_PUBLIC_FIREBASE_API_KEY \
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN \
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=$NEXT_PUBLIC_FIREBASE_PROJECT_ID
# The public pages (home/about/talent listing) read Firestore through
# lib/content/repository.ts, which Next.js prerenders during `next build` --
# so the Admin SDK needs its credentials at build time too, not just at
# container runtime (EasyPanel: set these as build-time variables as well).
ARG FIREBASE_PROJECT_ID
ARG FIREBASE_CLIENT_EMAIL
ARG FIREBASE_PRIVATE_KEY
ARG FIREBASE_STORAGE_BUCKET
ENV FIREBASE_PROJECT_ID=$FIREBASE_PROJECT_ID \
    FIREBASE_CLIENT_EMAIL=$FIREBASE_CLIENT_EMAIL \
    FIREBASE_PRIVATE_KEY=$FIREBASE_PRIVATE_KEY \
    FIREBASE_STORAGE_BUCKET=$FIREBASE_STORAGE_BUCKET
RUN npm run build

# Single-stage runtime: Next.js standalone output already contains everything
# needed to run the server, including its own package.json's production
# dependencies -- no `npm ci` in this final image.
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
