# docker/Dockerfile
# -----------------
# Official Playwright image: browsers + OS deps already installed.
# Tag MUST match @playwright/test in package.json (currently 1.62.0).
FROM mcr.microsoft.com/playwright:v1.62.0-jammy

# Run as the non-root user provided by the Playwright image
USER pwuser
WORKDIR /work

# Install dependencies first (better layer caching)
COPY --chown=pwuser:pwuser package.json package-lock.json ./
RUN npm ci

# Framework source (see .dockerignore for excluded paths)
COPY --chown=pwuser:pwuser . .

# CI-like behaviour inside containers
ENV CI=true
ENV TEST_ENV=qa

# Default: Chromium smoke. Override at runtime as needed.
CMD ["npx", "playwright", "test", "--project=chromium", "--grep", "@smoke"]
