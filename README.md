LighterPack
===========
LighterPack helps you track the gear you bring on adventures.

How to run LighterPack locally
-----------

1. Install Node.js, npm, and MongoDB.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Start MongoDB locally. The default config expects MongoDB at `localhost/lighterpack`.

   ```bash
   mongod
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open the app at:

   ```text
   http://localhost:8080
   ```

Local ports
-----------

- `8080`: webpack development server and browser entrypoint.
- `3001`: Express API server when `config/local.json` is present.
- `3000`: Express API default from `config/default.json`.

If login shows `NetworkError when attempting to fetch resource`, verify that both the webpack dev server and the Express API are running.

Critical checks
-----------

Run the production build:

```bash
npm run build
```

Planned later in Phase 1: run the Playwright end-to-end tests:

```bash
npm run test:e2e
```

Planned later in Phase 1: verify library fixtures:

```bash
npm run verify:fixtures
```

Planned later in Phase 1: export a user's library for backup:

```bash
node scripts/export-user-library.js <username> <output-file>
```

Example:

```bash
node scripts/export-user-library.js testuser ./backup-testuser-library.json
```
