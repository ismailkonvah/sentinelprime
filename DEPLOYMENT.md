# Sentinel deployment note

## Repository

The checkpointed project is exported to [GitHub](https://github.com/ismailkonvah/sentinel-orion) on the `main` branch.

## Recommendation

**Manus hosting is the compatibility-first recommendation** for the current Sentinel build because it already supplies the project’s full-stack runtime, Manus OAuth, database connection, storage proxy, built-in API credentials, and managed environment configuration.

**Vercel is possible, but it should be treated as a runtime adaptation rather than a drop-in rehost.** Vercel can deploy Express applications as a single Vercel Function and can detect Node.js server entrypoints, while Vite can be deployed as a frontend build. However, this repository currently starts its server from `server/_core/index.ts`, serves the production frontend through the project’s Express static-serving path, and depends on Manus-specific auth and service environment variables. Vercel’s Express runtime does not serve static assets through `express.static()`; static files must be exposed through Vercel’s `public/**` handling.[^1] Vercel’s Vite guidance also requires an SPA rewrite for deep links when deploying a Vite single-page application.[^2]

## Vercel environment contract

The following values must be configured in Vercel Project Settings for **Preview** and **Production** as appropriate. Secrets must never be committed to GitHub.

| Variable | Purpose | Exposure |
|---|---|---|
| `DATABASE_URL` | MySQL/TiDB connection string used by Drizzle and server procedures | Server-only secret |
| `JWT_SECRET` | Session-cookie signing secret | Server-only secret |
| `OAUTH_SERVER_URL` | Manus OAuth backend base URL | Server-side configuration |
| `VITE_OAUTH_PORTAL_URL` | Frontend Manus login portal URL | Client-visible build variable |
| `VITE_APP_ID` | Manus OAuth application ID | Client-visible build variable |
| `OWNER_OPEN_ID` | Project owner identity used by server context | Server-only configuration |
| `OWNER_NAME` | Project owner display name | Server-side configuration |
| `BUILT_IN_FORGE_API_URL` | Manus built-in API endpoint for supported services | Server-only configuration |
| `BUILT_IN_FORGE_API_KEY` | Server credential for Manus built-in APIs | Server-only secret |
| `VITE_FRONTEND_FORGE_API_URL` | Frontend-safe Manus built-in API endpoint | Client-visible build variable |
| `VITE_FRONTEND_FORGE_API_KEY` | Frontend-safe Manus API credential supplied by the project environment | Client-visible configuration; confirm scope before reuse |
| `VITE_ANALYTICS_ENDPOINT` | Analytics endpoint, if analytics is enabled | Client-visible configuration |
| `VITE_ANALYTICS_WEBSITE_ID` | Analytics site identifier | Client-visible configuration |
| `VITE_APP_TITLE` | Website title | Client-visible build variable |
| `VITE_APP_LOGO` | Website logo configuration | Client-visible build variable |

Vercel encrypts environment variables at rest and applies changes only to new deployments. Variables should be scoped separately to Development, Preview, and Production where values or callback URLs differ.[^3]

## Required Vercel adaptation before production use

The current project should not be assumed to be production-ready on Vercel without a deployment rehearsal. The server entrypoint should be adapted or explicitly configured so Vercel detects the Express/Node server, and the frontend build output must be served according to Vercel’s static-asset rules. A `vercel.json` SPA rewrite may be required for deep links such as `#workspace`-style navigation if routing changes to path-based URLs. OAuth callback URLs must be updated to the Vercel domain, and the database must allow connections from the deployed runtime.

Vercel Functions impose function-runtime limitations, including bundle-size and serverless lifecycle considerations. Express error handling should be verified carefully because errors that leave a function in an undefined state can affect subsequent requests.[^1] The current Manus OAuth, storage proxy, and built-in API integrations should be tested end to end after environment variables are configured; a successful frontend build alone does not validate those server integrations.

## Safe deployment sequence

First import the GitHub repository into Vercel without enabling Production deployment. Configure Preview environment variables, deploy a preview, and test OAuth, `/api/trpc`, the audit report export, simulation handoff, and all deep links. Only after those checks pass should the Vercel project receive Production variables and a production domain. For the hackathon deadline, using the existing Manus deployment for the live demo while keeping GitHub as the source repository is the lower-risk option.

## References

[^1]: [Vercel — Express on Vercel](https://vercel.com/docs/frameworks/backend/express)
[^2]: [Vercel — Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite)
[^3]: [Vercel — Environment variables](https://vercel.com/docs/environment-variables)
