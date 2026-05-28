# LighterPack+

> The actively maintained fork of LighterPack — plan lighter, share better, stay open.

[![License: GPL v2](https://img.shields.io/badge/License-GPL_v2-blue.svg)](https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html)

## Why this fork

LighterPack hasn't seen active development in years. This fork picks up where it left off — same familiar tool, new features the community has been asking for, and a commitment to keeping it running long-term.

## What's new

- **Image upload** — attach photos to any gear item
- **Advanced gear library** — search, filter, and reuse items across lists
- **Gear room** — shared gear modal for quick item management
- **Public sharing controls** — private, link-only, or discoverable
- **Public profiles** — showcase your gear philosophy and featured lists
- **Improved CSV import/export** — full round-trip fidelity
- **Visual refresh** — cleaner UI, fixed popovers, consistent controls

## Coming soon

LighterPack+ will offer optional paid plans on the hosted service at **lighterpack.app** (coming soon):

- **Supporter** (~3 €/month) — managed backups, enhanced public profile, supporter badge
- **Creator** (~8 €/month) — affiliate links per item, public collections, lightweight insights

Self-hosting remains fully free and open-source. Paid plans are for the hosted service only.

## Migrating from lighterpack.com

1. On lighterpack.com, go to **Settings → Export CSV** and download your library.
2. Create an account on LighterPack+.
3. Go to **Settings → Import CSV** and upload the file.

Your lists, items, weights, and notes will carry over.

## Self-hosting

Requirements: Node.js, npm, MongoDB.

```bash
npm install
npm run dev
```

Open `http://localhost:8080`. The app expects MongoDB at `localhost/lighterpack` by default.

## License

LighterPack+ is an independent open-source fork built from [LighterPack](https://github.com/galenmaly/lighterpack) by Galen Maly. Licensed under [GPL v2](LICENSE). Not affiliated with lighterpack.com.
