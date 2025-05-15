# Stage 1: Builder
# Use an official Node.js LTS image as a parent image
FROM node:20-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock, pnpm-lock.yaml)
COPY package*.json ./

# Install dependencies
# If you use npm:
RUN npm install
# If you use yarn:
# COPY yarn.lock ./
# RUN yarn install --frozen-lockfile
# If you use pnpm:
# COPY pnpm-lock.yaml ./
# RUN npm install -g pnpm
# RUN pnpm install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Set build-time environment variables if needed (e.g., for public env vars)
# ARG NEXT_PUBLIC_MY_VAR
# ENV NEXT_PUBLIC_MY_VAR=$NEXT_PUBLIC_MY_VAR

# Build the Next.js application
RUN npm run build
# If you use yarn:
# RUN yarn build
# If you use pnpm:
# RUN pnpm build

# Stage 2: Runner
# Use a lighter Node.js image for the production environment
FROM node:20-alpine AS runner

WORKDIR /app

# Set environment to production
ENV NODE_ENV production

# Create a non-root user and group
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Copy built assets from the builder stage
# Important: Copy only necessary files for production to keep image small
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts
# If you have a standalone output, you'd copy the .next/standalone folder instead
# COPY --from=builder /app/.next/standalone ./
# COPY --from=builder /app/.next/static ./.next/static

# Genkit flows are usually bundled with the Next.js app.
# If you have specific runtime Genkit files needed, copy them too.
# Example: COPY --from=builder /app/src/ai/genkit.js ./src/ai/genkit.js
# However, for most integrated Genkit setups, the build output in .next is sufficient.

# Install production dependencies if any are listed in package.json's "dependencies"
# (devDependencies are not installed in production by default with this setup)
# If you use npm and your package.json lists only "dependencies" not "devDependencies" for runtime
RUN npm prune --production
# If you used yarn:
# RUN yarn install --production --frozen-lockfile --ignore-scripts --prefer-offline
# If you used pnpm:
# RUN pnpm install --prod --frozen-lockfile

# Change ownership of the app directory to the non-root user
RUN chown -R nextjs:nodejs /app/.next

# Switch to the non-root user
USER nextjs

# Expose the port the app runs on (Next.js default is 3000)
EXPOSE 3000

# Set the default command to run the app
# This will typically be "next start"
# CMD ["node_modules/.bin/next", "start"]
# Or if using standalone output:
# CMD ["node", "server.js"]
CMD ["npm", "run", "start"]
# If using yarn:
# CMD ["yarn", "start"]
# If using pnpm:
# CMD ["pnpm", "start"]

# Note: Environment variables like GOOGLE_API_KEY for Genkit should be passed
# into the container at runtime, not hardcoded in the Dockerfile or .env file
# that gets copied into the image.
# Example: docker run -p 3000:3000 -e GOOGLE_API_KEY="your_key" my-next-app
