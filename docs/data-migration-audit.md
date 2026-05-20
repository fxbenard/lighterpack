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

The current library document is represented by `client/dataTypes.js`.

Top-level fields:

- `version`
- `idMap`
- `items`
- `categories`
- `lists`
- `sequence`
- `defaultListId`
- `totalUnit`
- `itemUnit`
- `showSidebar`
- `showImages`
- `optionalFields`
- `currencySymbol`

Relationships:

- `lists[].categoryIds[]` points to `categories[].id`.
- `categories[].categoryItems[].itemId` points to `items[].id`.
- `defaultListId` points to `lists[].id`.

## Data Safety Risks

- Missing item references can cause category items to be pruned during load.
- IDs can be strings or numbers in older data.
- Optional fields may be absent in older library versions.
- Totals are derived and can be recalculated, but persisted values still exist in documents.
- Auth metadata and user library data currently live in the same Mongo user document.

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

## Required Non-Regression Checks Before Migration

- Export every Mongo user library before migration.
- Load every exported library through `Library.load()`.
- Save every loaded library through `Library.save()`.
- Verify every `defaultListId`, `categoryIds`, and `itemId` reference.
- Compare item count, category count, list count, and optional field keys before and after migration.
- Run auth, save/reload, share, CSV import/export, and fixture verification tests.

## Out Of Scope For Phase 1

- Performing the migration.
- Replacing MongoDB in runtime code.
- Changing the library data model.
- Changing authentication schema.
