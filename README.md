# fuck a Dress code

Hand-painted DIY punk shirts. Dark, minimal, fully functional static storefront.

## Quick Start

1. Open `index.html` in a browser to preview locally.
2. Or drag the whole folder into Netlify Drop / Vercel / GitHub Pages for free hosting.

## Admin

- Go to `/admin.html`
- Default password: **fadadmin** (change it in `js/admin.js`)
- Add new shirts, edit prices, mark sold out, delete, etc.
- Changes are saved in the browser’s localStorage (persist per device/browser).

## Promotions (automatic)

- **$40+** → Free patch appears in cart
- **$75+** → Free shipping + free Mystery Shirt

## Discount codes (edit in `js/products.js`)

- `PUNK10` → 10% off
- `DRESSCODE` → $15 off

## Mailing list

Emails are stored in localStorage for now.  
To make it real, connect the form to:

- **Netlify Forms** (easiest if hosting on Netlify)
- **Formspree**
- **Mailchimp** / **ConvertKit** embed

## Making it fully functional (payments + hosting)

### 1. Host for free
- **Netlify Drop**: go to https://app.netlify.com/drop and drag the folder
- **Vercel**: `npx vercel`
- **GitHub Pages**: push the folder to a repo and enable Pages

### 2. Real payments (pick one)
- **Stripe Payment Links** or Stripe Checkout (best for custom sites)
- **PayPal buttons**
- **Shopify Buy Button** / headless Shopify
- Keep the current “Email Order” flow for now (Venmo / Cash App / Zelle) — perfect for small DIY runs

### 3. Images
Replace the placeholder image URLs in Admin (or in `js/products.js`) with real photos of your shirts.  
Upload images to Imgur, Cloudinary, or your own host and paste the direct URL.

### 4. Domain
Buy `fuckadresscode.com` (or whatever) and point the DNS to Netlify/Vercel.

## File structure

```
fuck-a-dress-code/
├── index.html          ← shop + home
├── cart.html           ← cart + promos
├── admin.html          ← product management
├── css/style.css
├── js/
│   ├── products.js     ← product data + discount codes
│   ├── app.js          ← cart logic
│   ├── cart-page.js
│   └── admin.js
└── README.md
```

Everything is plain HTML/CSS/JS. No build step required.

Stay punk.  
— FAD
