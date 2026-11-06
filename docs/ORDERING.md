# Online ordering integration plan

NEFRA hasn't chosen between Toast, Clover and SpotOn yet, so the website doesn't depend on any of them. Every Order button gets its destination from one place, `lib/ordering.mjs`, which reads `content/ordering.json` and each location's `orderUrl`. Choosing or switching provider is a content change, not a rebuild of the site.

## Recommendation: link to the provider's hosted ordering page, don't embed it

You asked whether ordering can be embedded without hurting mobile usability, or whether a direct link to the POS-hosted ordering page is cleaner. **Link directly.** That is the site's default (`"mode": "link"`), for these reasons:

- **Mobile usability.** Hosted ordering pages from Toast, Clover and SpotOn are built and tested for phones. Inside an iframe they become a page within a page: two scroll areas, a cramped checkout, and keyboard and zoom problems on iOS.
- **Payments.** Apple Pay, Google Pay and saved cards are often limited or blocked inside iframes, and browsers like Safari restrict the third-party cookies an embedded checkout needs to stay signed in. Some providers refuse to be framed at all.
- **Security and compliance.** With a link, card data is only ever entered on the provider's PCI-compliant checkout. The NEFRA website never touches payment information.
- **Reliability.** When the provider changes its checkout, a link keeps working. An embed can break silently.
- **Tap count.** With one location, every Order button goes straight to the provider: **one tap**. With several locations, buttons go to `/order/`, where the guest picks a location: **two taps**.

Embed mode (`"mode": "embed"`) is still available. It shows the provider inside `/order/` with a fallback link. Before using it, confirm with the provider that framing is supported, and test checkout, including Apple Pay, on a real iPhone and Android phone.

## What the provider handles, and what the website handles

| The ordering platform / POS | The NEFRA website |
| --- | --- |
| Live prices, availability and item 86-ing | Brand, photography, menu presentation and descriptions |
| Pickup times and order throttling | Order buttons in the header, mobile bottom bar, menu items and location pages |
| Modifiers: proteins, sauces, sides, customizations | Per-location ordering links |
| Payment, receipts, refunds | Click tracking (`order_click`, `order_item_click`) plus UTM parameters |
| Catering orders, gift cards, family meals (if the provider offers them) | Links to those flows (`cateringUrl`, `giftCardsUrl`, `familyMealsUrl`) |
| Loyalty programs | A future link or integration |

## Keeping the menu consistent with the POS

The POS is the source of truth for prices and availability **at checkout**. The website menu is a presentation layer. Two options, in order of effort:

1. **Manual (launch).** When prices change in the POS, update `content/menu.json` in the CMS. Prices can also be left empty ("Price coming soon") so the site never shows a wrong price.
2. **Automatic sync (later).** Once the provider is chosen, a small script can pull menu data from its API into `content/menu.json` on a schedule (for example a nightly GitHub Action), keeping NEFRA's descriptions and photos. Toast, Clover and SpotOn all have menu APIs, but access rules and approval differ, so confirm what's included with your plan before committing to this.

## Setting it up once a provider is chosen

1. In the CMS, go to **Site settings → Online ordering** and set **Provider**. Keep **Mode** on *Link*.
2. In **Locations**, paste the location's ordering URL from the provider into **Online ordering link**.
3. When ready to take orders, set the location's **Status** to *Open* and confirm its hours.
4. Optionally add catering, gift card and family meal links.
5. Use `/order/` as the permanent ordering link for the Instagram bio, QR codes, printed materials and the Google Business Profile *Order online* link. If NEFRA ever switches provider, those links keep working.

## Questions to ask each provider

- Is there a hosted online ordering page per location, and can it be framed (embedded)?
- Can items be deep-linked (a URL that opens a specific item)?
- Does it support Apple Pay and Google Pay on the hosted page?
- Are catering, scheduled orders, gift cards and loyalty included or extra-cost add-ons?
- Is there a menu API, and does website menu sync require partner approval or extra fees?
- What are the per-order fees for online orders versus in-store?
