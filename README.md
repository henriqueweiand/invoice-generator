# Invoice Generator

A fast, browser-based invoice builder. Fill in your details, preview the result, and use the browser's built-in Print → Save as PDF to generate a clean, professional invoice — no backend, no accounts, no data ever leaves your machine.

**Live URL:** https://invoice-generator.pages.dev

---

## What it does

You fill out a form with all the invoice data and the app renders a print-ready layout that matches a standard professional invoice format. When you're happy with it, clicking **Print / Save as PDF** opens the browser's print dialog where you can save it directly as a PDF.

The form covers everything a typical invoice needs:

- **Invoice details** — number, status (pending / paid / overdue / draft), date, and currency (USD, EUR, GBP, BRL, CAD, AUD)
- **Bill From** — your company name and address.
- **Bill To** — client name and address
- **Tax details** — optional field for VAT number or tax ID
- **Line items** — add as many rows as needed, each with description, quantity, unit, and rate; totals are calculated live
- **VAT** — enter a percentage and the amount is computed automatically
- **Footer** — contact number, notes, and a reference ID

A **Preview Invoice** button lets you see a scaled-down version of the final document before printing, with a Print button right inside the modal.

---

## Print layout

The printed output (and PDF) follows a clean, structured format:

```
Company Name                          I N V O I C E

Bill To:                              # EINV-2026-10
  Client Name                         Status   pending
  Address                             Date     March 24, 2026
  City / ZIP / Country                Total    USD 7,650.00

Bill From:                Tax Details:
  Your Company              (optional tax info)
  Address

┌─────────────────────────┬────────────┬───────────┬───────────┐
│ DESCRIPTION             │ QTY (UNIT) │    RATE   │   TOTAL   │
├─────────────────────────┼────────────┼───────────┼───────────┤
│ Software development    │  1 (items) │ USD 7,650 │ USD 7,650 │
│                         │            │       VAT │  USD 0.00 │
│                         │            │ Total Due │ USD 7,650 │
└─────────────────────────┴────────────┴───────────┴───────────┘

Contact: +55 47 99240 2547        Your Company Name (cursive)

Note  - Contract value
      - English lessons

REF: a2bbb9c8-...                            PAGE 1 OUT OF 1
```

---

## Tech stack

| Layer          | Choice                                            |
| -------------- | ------------------------------------------------- |
| Framework      | Next.js 15 (static export)                        |
| Styling        | Tailwind CSS v3 with dark mode (`media` strategy) |
| Fonts          | Inter (UI), Dancing Script (invoice signature)    |
| Deployment     | Cloudflare Pages via Wrangler                     |
| PDF generation | Browser native Print → Save as PDF                |

No external PDF libraries. No server. No database.

---

## Running locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Building & deploying

```bash
npm run deploy
```

This runs `next build` and then `wrangler pages deploy` to push to Cloudflare Pages.
