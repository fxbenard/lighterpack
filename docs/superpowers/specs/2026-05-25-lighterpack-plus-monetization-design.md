# LighterPack+ Monetization and Public Sharing - Design Spec
_2026-05-25_

## Context

LighterPack is a GPL v2, open-source gear planning app with a strong ultralight backpacking identity. The project is being modernized with a richer gear library, item detail pages, public sharing improvements, and creator-oriented publishing tools.

The monetization goal is modest and maintenance-driven: create a small, steady revenue stream that compensates ongoing project time and operating costs without turning LighterPack into a conventional SaaS or weakening the open-source spirit.

## Positioning

The public product name is **LighterPack+**.

Recommended positioning:

> LighterPack+ is a modern open-source continuation of LighterPack, built for better gear libraries, public sharing, and long-term maintenance.

Short line:

> Plan lighter. Share better. Stay open.

The project should be presented as an independent continuation, not as the official `lighterpack.com` service unless that relationship changes.

Suggested disclaimer:

> LighterPack+ is an independent open-source continuation built from LighterPack. It is not affiliated with lighterpack.com.

## Domain Strategy

Preferred canonical domain:

- `lighterpack.app`

Recommended defensive redirects if available:

- `lighterpackplus.com`
- `lighterpack.org`
- `lighterpack.community`

The domain should avoid implying control of `lighterpack.com`. If `lighterpack.app` is available, it is the cleanest option for the hosted LighterPack+ service.

## Open Source Boundary

The application remains open source and self-hostable.

Included in the public repo:

- Core LighterPack app.
- List and gear library management.
- Import/export.
- Public sharing basics.
- Public profile and list rendering.
- Plan/entitlement interfaces.
- Self-hosted configuration paths for manually enabling or disabling optional capabilities.

Not included in the public repo:

- Production Stripe integration.
- Stripe webhooks and billing jobs.
- Official subscription management.
- Official hosted backup jobs.
- Official image/storage service credentials and infrastructure.
- Transactional email infrastructure.
- Internal admin/support tooling.
- Production analytics infrastructure.

Principle:

> The open-source app remains complete and useful. The official hosted service monetizes managed infrastructure, billing, backups, storage, and creator publishing services.

Self-hosted instances may configure entitlements manually or leave optional features open. They should not need the official billing system to run the app.

## Plans

### Free

Free is the complete personal gear planning experience.

Included:

- Create and edit lists.
- Gear library.
- Item metadata.
- Import/export CSV.
- Basic public sharing.
- Self-hosting.
- Normal product URLs.

Do not paywall:

- Number of lists.
- Number of gear items.
- CSV import/export.
- Basic public sharing.
- Data export.
- Self-hosting.
- Access to source code.

### Supporter

Supporter is a lightweight way to help keep the project independent.

Initial pricing target:

- Around 3 EUR/month.
- Around 30 EUR/year.

Founding launch pricing can be lower, for example 25 EUR/year.

Benefits:

- Supporter badge.
- Improved public profile.
- Improved public list presentation.
- Managed backups on the official hosted service.
- Simple history and restore.
- Lightweight personalization, such as avatar, bio, external links, and accent color.

### Creator

Creator is for users who publish gear lists publicly and want to use their own affiliate links and promo codes.

Initial pricing target:

- Around 8 EUR/month.
- Around 80 EUR/year.

Founding launch pricing can be lower, for example 60 EUR/year.

Creator includes Supporter.

Benefits:

- Affiliate links per item.
- Promo codes per item.
- Rules by brand, shop, or product URL domain.
- Automatic affiliate disclosure.
- Public collections of lists.
- Lightweight creator insights.

V1 does not take a commission. Creators keep 100% of their affiliate revenue.

A future optional revenue-share model may be explored later, but it should be opt-in and not part of the V1 public promise.

## Affiliate Link Model

Creator affiliate tooling supports two levels.

### Item-Level Links

Each item may define:

- Original product URL.
- Creator affiliate URL.
- Optional promo code.
- Shop or brand label.
- Automatic disclosure.

Item-level configuration has the highest priority because it is the most explicit and accurate.

### Brand, Shop, and Domain Rules

Creators may define fallback rules:

- Brand rule: `Zpacks` -> configured affiliate link or promo code.
- Shop rule: `Garage Grown Gear` -> configured affiliate link or promo code.
- Domain rule: `rei.com` -> configured affiliate behavior.

Application priority:

1. Explicit item affiliate link.
2. Shop or domain rule.
3. Brand rule.
4. Normal product URL.
5. No link.

Rules must never alter item weight, price, sorting, recommendation ranking, or list totals.

## Public Profiles

The improved public profile is the main visible benefit of Supporter and Creator.

The profile should feel like a sober gear publishing page, not a social network.

Profile content:

- Avatar.
- Display name and optional trail name.
- Short bio.
- Optional location or preferred terrain.
- Badges.
- External links, such as website, YouTube, Instagram, blog, or newsletter.
- Gear philosophy tags, such as ultralight, budget, MYOG, family hiking, bikepacking, alpine, or thru-hiking.
- Featured public lists.
- Collections.
- Basic public stats where appropriate.
- Affiliate disclosure if Creator links are active.

The key differentiation is:

> Competitors share lists. LighterPack+ helps users publish a credible, portable, open gear identity.

## Public List Pages

Public list pages should preserve the familiar LighterPack utility while improving presentation.

Public list content:

- List title and summary.
- Base, worn, consumable, and total weight.
- Category breakdown.
- Items with brand, notes, image, weight, price, and tags where available.
- Product links.
- Creator affiliate links and promo codes when configured.
- Visible disclosure when affiliate links or promo codes are present.
- Copy-to-my-list or copy-to-my-library action.

The list page remains practical first. It should not become a marketing landing page.

## Visibility and SEO

Visibility has distinct levels:

- **Private**: visible only to the owner.
- **Shareable**: accessible by direct link, but not indexed.
- **Discoverable**: visible in LighterPack+ community surfaces.
- **Indexable**: allowed to be indexed by search engines.

Defaults:

- Profiles are private by default.
- Lists are private by default.
- Shareable pages use `noindex` unless the user explicitly opts into indexing.
- Discoverable and indexable states require explicit user action.
- Creator pages with affiliate links remain opt-in for indexing.

This protects privacy while allowing creators and public contributors to benefit from SEO.

## Creator Insights

Creator analytics must stay light.

Purpose:

> Help creators understand whether their lists are helping people, not optimize a sales funnel.

V1 includes:

- Profile views for 7 days, 30 days, and all time.
- Public list views by list.
- List copies.
- Gear link clicks.
- Promo code clicks.
- Top 5 viewed lists.
- Top 5 clicked items.

V1 excludes:

- Revenue tracking.
- Visitor identity tracking.
- Funnels.
- Cohorts.
- Geographic analytics.
- Third-party tracking pixels.
- Complex dashboard exports.
- Marketing automation.

UI principle:

> A compact Insights panel, not a SaaS analytics dashboard.

## Payments

Stripe is the recommended payment provider for the official hosted service.

Reasons:

- A single source of truth for Supporter and Creator status.
- Clean monthly and annual subscriptions.
- One-time contributions can be handled in the same system.
- Coupons and founding pricing are straightforward.
- Entitlements can be updated automatically through official hosted infrastructure.

GitHub Sponsors or Patreon may be offered later as community support channels, but they should not be the V1 entitlement source.

## Design Principles

Core principle:

> Light by default. Everything useful, nothing heavy.

Product rules:

- No aggressive freemium limits.
- No data lock-in.
- No paywall on core gear planning.
- No injected third-party sponsors on user pages.
- No hidden affiliate manipulation.
- No SaaS-style analytics overload.
- No public SEO without explicit consent.
- Open-source users should never feel punished for self-hosting.

## Out of Scope for V1

- Commission on creator affiliate revenue.
- Revenue attribution or sales reporting.
- Marketplace ranking.
- Sponsored recommendations.
- Full community feed.
- Creator monetization payouts.
- Native mobile app.
- Complex public discovery algorithms.

## Follow-Up Decisions

- Final domain availability and purchase.
- Final Supporter and Creator pricing after checking payment fees and expected infrastructure costs.
- Whether official managed image hosting ships in the first paid launch or follows backups.
- Exact legal wording for affiliate disclosures and independent-project disclaimer.
