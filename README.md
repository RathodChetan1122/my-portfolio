# Chetan Rathod — Portfolio

A production-grade personal portfolio website. Dark editorial theme with red accents,
top-tier animations, and a working Hire Me contact form.

## 📁 File Structure

```
portfolio/
├── index.html          ← Main HTML (all sections)
├── css/
│   ├── variables.css   ← Design tokens, reset, fonts
│   └── style.css       ← All components, layouts, animations
├── js/
│   └── main.js         ← Cursor, scroll reveal, typing, modal, EmailJS
└── README.md
```

## 🚀 How to Run Locally

Just open `index.html` in any browser. No build step needed.

```bash
# Option 1: Direct open
open index.html

# Option 2: Live server (VS Code extension)
# Right-click index.html → Open with Live Server
```

## 📧 Enable the Hire Me Email Form

The form uses **EmailJS** (free — 200 emails/month):

1. Sign up at https://www.emailjs.com/
2. Create a new **Email Service** (Gmail recommended)
3. Create an **Email Template** with these variables:
   - `{{from_name}}` — Sender's name
   - `{{from_email}}` — Sender's email
   - `{{phone}}` — Phone number
   - `{{company}}` — Company name
   - `{{role_type}}` — Role type selected
   - `{{duration}}` — Duration selected
   - `{{message}}` — Full message
4. In `js/main.js`, find and replace:
   ```js
   await emailjs.send('SERVICE_ID', 'TEMPLATE_ID', data, 'PUBLIC_KEY');
   ```
   With your actual IDs from the EmailJS dashboard.
5. In `index.html`, update the init line:
   ```html
   <script>emailjs.init('YOUR_PUBLIC_KEY');</script>
   ```

> **Fallback**: If EmailJS is not configured, clicking Submit will open
> the user's email client (mailto:) with all form details pre-filled.

## 🌐 Deploy Free in 60 Seconds

### Option A — Netlify Drop (Easiest)
1. Go to https://app.netlify.com/drop
2. Drag and drop the entire `portfolio/` folder
3. You get a live URL instantly (e.g. `amazing-chetan.netlify.app`)
4. Optional: Add a custom domain

### Option B — GitHub Pages
1. Push this folder to a GitHub repo
2. Go to Settings → Pages → Deploy from branch (main)
3. Your site goes live at `https://yourusername.github.io/portfolio/`

### Option C — Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` inside the portfolio folder
3. Done.

## ✏️ How to Customise

| What to change | Where |
|---|---|
| Name, email, links | `index.html` — header section |
| Colors / fonts | `css/variables.css` — `:root` variables |
| Section content | `index.html` — each `<section>` block |
| Animations timing | `css/style.css` — `transition` and `animation` values |
| Typing phrases | `js/main.js` — `phrases` array |
| Add new section | Copy a `<section>` block in HTML + add nav link |
| Add new project | Copy a `.project-card` div and update content |

## 🎨 Design System

- **Primary Font**: Syne (headings)
- **Body Font**: DM Sans
- **Mono Font**: DM Mono
- **Red Accent**: `#C8102E`
- **Navy**: `#0D1F4C`
- **Background**: `#060610`

## 📱 Responsive

Fully responsive — works on mobile, tablet, and desktop.

---
Built with pure HTML, CSS, and vanilla JS. No frameworks. No build tools. Fully modifiable.
