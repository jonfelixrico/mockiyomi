# From Next.js' Docker examples

# Step 1. Rebuild the source code only when needed
FROM node:18 AS builder
# We need to use a "full" Node image for building because some of our dependencies need node-gyp.
# We can't use alpine here since it doesn't ship with the stuff needed for node-gyp.
# See https://github.com/nodejs/docker-node/issues/1706 and
# https://github.com/nodejs/docker-node/issues/384#issuecomment-1097082551 for more details.

WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json pnpm-lock.yaml* ./

RUN yarn global add pnpm
RUN pnpm i

COPY src ./src
COPY public ./public
COPY next.config.js .
COPY tsconfig.json .

# Without this, ts will throw an error since we defined some modules
# in declarations.d.ts
COPY declarations.d.ts .

# This is needed to make tailwind work
# See https://github.com/vercel/next.js/discussions/48156
COPY postcss.config.js .
COPY tailwind.config.js .

# Environment variables must be present at build time
# https://github.com/vercel/next.js/discussions/14030
ARG ENV_VARIABLE
ENV ENV_VARIABLE=${ENV_VARIABLE}
ARG NEXT_PUBLIC_ENV_VARIABLE
ENV NEXT_PUBLIC_ENV_VARIABLE=${NEXT_PUBLIC_ENV_VARIABLE}

# Next.js collects completely anonymous telemetry data about general usage. Learn more here: https://nextjs.org/telemetry
# Uncomment the following line to disable telemetry at build time
ENV NEXT_TELEMETRY_DISABLED 1

# Build Next.js based on the preferred package manager
RUN pnpm build

# Note: It is not necessary to add an intermediate step that does a full copy of `node_modules` here

# Step 2. Production image, copy all the files and run next
FROM node:18-alpine AS runner
# Unlike the build stage, we can use the alpine image of Node here since we won't be executing commands that involves node-gyp.
# Using alpine keps our image small.

WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Environment variables must be redefined at run time
ARG ENV_VARIABLE
ENV ENV_VARIABLE=${ENV_VARIABLE}
ARG NEXT_PUBLIC_ENV_VARIABLE
ENV NEXT_PUBLIC_ENV_VARIABLE=${NEXT_PUBLIC_ENV_VARIABLE}

# Uncomment the following line to disable telemetry at run time
ENV NEXT_TELEMETRY_DISABLED 1

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME localhost

CMD ["node", "server.js"]