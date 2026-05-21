# 🔥 Bails on Fire

<div align="center">
  <p><strong>The ultimate satirical cricket verdict engine. We analyze IPL collapses so you don't have to.</strong></p>
  <a href="https://bailsonfire.vercel.app/"><strong>🔥 Visit Live Site: bailsonfire.vercel.app</strong></a>
</div>
<br>
<img width="1904" height="989" alt="image" src="https://github.com/user-attachments/assets/6d9a4f93-5412-4e42-ada3-09ac2a327ff8" />

<br />

**Bails on Fire** is a satirical sports journalism platform that generates brutal, AI-powered roasts of cricket matches (specifically IPL). Styled as a vintage broadsheet newspaper, it serves up match chronicles, dynamic high-resolution share cards, and user engagement features for when your favorite franchise inevitably bottles a run chase.

## 🚀 Features

- **AI-Powered Satire:** Generates witty, newspaper-style roasts of IPL matches using the Google Gemini API.
- **Dynamic Share Cards:** Generates Retina-quality (2400x1260) broadsheet images for sharing on WhatsApp, X (Twitter), and Instagram via Next.js `ImageResponse` (Satori).
- **Interactive Wall of Shame:** Community-driven reaction tracking and comment sections on match roasts.
- **Premium Broadsheet UI:** Vintage newspaper aesthetics featuring elegant serif typography (Playfair Display) and precise grid layouts.
- **Automated Data Ingestion:** Automated backend scripts to fetch live matches and historical scorecard data from APIs.

## 🛠️ Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router, Server Actions, Server Components)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Database:** [PostgreSQL](https://www.postgresql.org/) + [Prisma ORM](https://www.prisma.io/)
- **Authentication:** [NextAuth.js v5 (Auth.js)](https://authjs.dev/)
- **AI Integration:** [Google Gemini API](https://ai.google.dev/)
- **Image Generation:** Next.js OG Image / Satori

## 💻 Getting Started

Follow these technical steps to clone, setup, and run **Bails on Fire** on your local machine.

### 1. Clone the Repository

```bash
git clone https://github.com/MohdMusaiyab/bailsonfire.git
cd bailsonfire
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory and configure the following required environment variables (you can use `.env.sample` as a reference):

```env
# Application Environment (Development/Production)
NODE_ENV="development"

# The Public Base URL of your Next.js application
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Target PostgreSQL Database URL
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/bailsonfire?schema=public"

# The Secret key for NextAuth JWT Encryption
AUTH_SECRET="your_custom_random_secret_string"

# Google Gemini API token for our cron job
GEMINI_API_KEY="your_actual_api_key_from_google"

# Google OAuth Credentials
AUTH_GOOGLE_ID="Your google Id"
AUTH_GOOGLE_SECRET="google auth secret"

# Resend API Key (for email magic links/OTP)
RESEND_API_KEY="some resend key"

# Google Search Console Verification
NEXT_PUBLIC_GOOGLE_VERIFCATION=""
```
*(Note: If using an Aiven PostgreSQL database, ensure your `ca.pem` certificate is correctly configured in your database connection string if required).*

### 4. Database Setup

Push the Prisma schema to your database to generate the client and create all necessary tables:

```bash
npx prisma db push
```

*(Optional)* To populate your local database with match data and generate initial AI roasts, you can run the provided utility scripts:
```bash
npx tsx scripts/ingest-live.ts
npx tsx scripts/addroast.ts
```

### 5. Run the Development Server

Start the Next.js local development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to explore the broadsheet.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page if you want to contribute to the sarcasm.

## 📄 License

This project is licensed under the MIT License.
