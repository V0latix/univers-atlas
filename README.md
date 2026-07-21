# Univers Atlas

An interactive Solar System atlas built with Next.js.

## Requirements

Use the current Node.js LTS release and npm.

## Local development

```bash
npm install
npm run dev
```

Open the local URL printed by Next.js.

## Quality checks

```bash
npm run lint
npm run test
npx playwright test
npm run build
```

The Playwright suite starts the application on port 3100 so it does not reuse
another development server running on Next.js's default port.

## Data sources

Scientific profiles and orbital reference values are attributed to NASA Solar
System Exploration and NASA Science. Each celestial-body profile links to its
specific NASA source. The catalog is stored locally, so the application does
not call a third-party data API at runtime.

## Deployment

Import the GitHub repository in Vercel, keep the Framework Preset as **Next.js**,
and deploy. Vercel uses the standard Next.js build settings without additional
environment variables.
