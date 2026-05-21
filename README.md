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

Run the Playwright end-to-end tests:

```bash
npm run test:e2e
```

Verify library fixtures:

```bash
npm run verify:fixtures
```

Verify CSV import/export fixtures:

```bash
npm run verify:csv
npm run verify:csv:export
```

Run the CSV browser workflow:

```bash
npm run test:e2e:csv -- --project=chromium --reporter=line
```

Run the visual refresh browser workflow:

```bash
npm run test:e2e:visual -- --project=chromium --reporter=line
```

The CSV checks protect item name, category, description, quantity, weight, unit, URL, price, worn, and consumable fields.

Export a user's library for backup:

```bash
node scripts/export-user-library.js <username> <output-file>
```

The export script writes only the user's `library` document. It does not export password hashes, tokens, email addresses, or account metadata.
It fails if the output file already exists.

Example:

```bash
node scripts/export-user-library.js testuser ./backup-testuser-library.json
```
