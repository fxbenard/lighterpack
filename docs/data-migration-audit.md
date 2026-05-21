# Data Migration Audit

## Current Storage

LighterPack currently stores user libraries inside MongoDB user documents.

Important user document fields:

- `username`
- `email`
- `password`
- `token`
- `syncToken`
- `library`
- `externalIds`

The `library` object is the user data source of truth.

## Current Library Shape

The current library runtime object and persisted library document are represented by `client/dataTypes.js`.

Persisted `Library.save()` fields:

- `version`
- `items`
- `categories`
- `lists`
- `sequence`
- `defaultListId`
- `totalUnit`
- `itemUnit`
- `showSidebar`
- `optionalFields`
- `currencySymbol`

Runtime-only or legacy top-level fields:

- `idMap` is rebuilt at runtime by `Library.load()` and is not emitted by `Library.save()`.
- `showImages` is a legacy migration input used by `upgrade01to02()` to populate `optionalFields.images`; it is not emitted by `Library.save()`.

Relationships:

- `lists[].categoryIds[]` points to `categories[].id`.
- `categories[].categoryItems[].itemId` points to `items[].id`.
- `defaultListId` points to `lists[].id`.
- `lists[].externalId` is used as the public share, embed, and CSV lookup key.

## Data Safety Risks

- Missing item references can cause category items to be pruned during load.
- IDs can be strings or numbers in older data.
- Optional fields may be absent in older library versions.
- Totals are derived and can be recalculated, but persisted values still exist in documents.
- Auth metadata and user library data currently live in the same Mongo user document.
- `Library.load()` mutates upgrade input in place, including legacy field conversion and category item cleanup.
- Raw Mongo exports must remain immutable migration evidence; run `Library.load()` and `Library.save()` only on copies, then diff the raw export against normalized output.
- Block migration on unexpected deletion, count changes, or reference changes after normalization.

## PostgreSQL JSONB Target

Recommended future target:

```sql
CREATE TABLE users (
  id uuid PRIMARY KEY,
  username text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  token text,
  sync_token integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE libraries (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  data jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

This preserves the current `library` document model while separating account metadata from library data.

Migration caveat: current runtime behavior queries nested `library.lists.externalId` values for share pages, embeds, CSV export, and external ID collision detection. A PostgreSQL target must keep external list IDs globally searchable and collision-safe before migration, either with JSONB indexes/jsonpath queries that enforce the same lookup behavior or with a normalized side table that has uniqueness guarantees for external IDs.

## Required Non-Regression Checks Before Migration

- Export every Mongo user library before migration.
- Preserve raw Mongo exports unchanged.
- Load copies of exported libraries through `Library.load()`.
- Save loaded copies through `Library.save()`.
- Diff raw exports against normalized load/save output.
- Verify every `defaultListId`, `categoryIds`, and `itemId` reference.
- Compare item count, category count, list count, category item count, external ID values, and optional field keys before and after migration.
- Block migration on unexpected deletions, count changes, external ID changes, or reference changes.
- Run auth, save/reload, share, CSV import/export, and fixture verification tests.

## Out Of Scope For Phase 1

- Performing the migration.
- Replacing MongoDB in runtime code.
- Changing the library data model.
- Changing authentication schema.
