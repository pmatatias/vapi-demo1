# Use Node.js 18 as the base image
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json* pnpm-lock.yaml* ./

# Install dependencies
RUN \
  if [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables
ARG NEXT_PUBLIC_VAPI_API_KEY
ARG NEXT_PUBLIC_VAPI_ASSISTANT_ID
ENV NEXT_PUBLIC_VAPI_API_KEY=$NEXT_PUBLIC_VAPI_API_KEY
ENV NEXT_PUBLIC_VAPI_ASSISTANT_ID=$NEXT_PUBLIC_VAPI_ASSISTANT_ID

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the necessary files from the builder stage
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Set the correct permissions
RUN chown -R nextjs:nodejs /app

# Switch to the non-root user
USER nextjs

# Expose the port that the application will run on
EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Start the application
CMD ["node", "server.js"]
