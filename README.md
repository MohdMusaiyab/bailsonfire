# 🔥 Bails on Fire

<img width="1904" height="989" alt="Bails on Fire Broadsheet Preview" src="https://github.com/user-attachments/assets/6d9a4f93-5412-4e42-ada3-09ac2a327ff8" />

<br />

**Bails on Fire** is a satirical sports journalism platform designed to deliver brutal, AI-powered roasts of IPL matches. Styled as a classic vintage broadsheet newspaper, it couples automated cricket data ingestion with deep franchise lore, dynamic high-resolution share cards, and community reactions for when a team inevitably bottles a run chase.

---

## 🏛️ System Architecture

```mermaid
flowchart TD
    subgraph Schedulers["Scheduled Automation & Ingestion"]
        CRON1["GitHub Actions (2:00 AM IST)<br/>scripts/ingest-live.ts"]
        CRON2["GitHub Actions (3x Daily Healer)<br/>scripts/addroast.ts"]
        CRON3["Daily Keep-Alive Ping<br/>.github/workflows/health-check.yml"]
    end

    subgraph Sources["Cricket Data Sources"]
        CRICAPI["CricAPI (Live Scorecards)"]
        CRICSHEET["Cricsheet JSON (Historical Archives)"]
    end

    subgraph AI["Google Gemini Intelligence Layer"]
        FETCH_AI["Gemini 2.5 Flash<br/>(Google Search Grounding)"]
        ROAST_AI["Gemini 2.5 Flash-Lite<br/>(Satirical Commentary Engine)"]
        LORE["IPL Franchise Lore<br/>(Era-Filtered Baggage 2008-2026)"]
    end

    subgraph DB["Persistence Layer (PostgreSQL + Prisma)"]
        PG[("Aiven PostgreSQL<br/>(@prisma/adapter-pg Connection Pool)")]
    end

    subgraph App["Next.js 16 (React 19 App Router)"]
        PAGES["Server Components (SSR / ISR)<br/>• Broadsheet Hero<br/>• Seasonal Archives<br/>• Match Chronicles"]
        ACTIONS["Server Actions<br/>• toggleReaction()<br/>• postComment()<br/>• auth-actions.ts"]
        RATELIMIT["In-Memory Rate Limiter<br/>(Sliding Window Token Bucket)"]
        SATORI["Edge Satori Image Engine<br/>(2400x1260 Retina Share Cards)"]
        FONTS["Local Font Cache<br/>(Playfair Display & Space Mono)"]
    end

    CRON1 --> CRICAPI
    CRICAPI -->|Scorecard Present| PG
    CRICAPI -.->|Scorecard Missing| FETCH_AI
    FETCH_AI --> PG
    CRON2 --> ROAST_AI
    LORE --> ROAST_AI
    ROAST_AI --> PG

    CRON3 -->|Active Table Query| PG

    PG --> PAGES
    ACTIONS --> RATELIMIT
    RATELIMIT --> PG
    PAGES --> SATORI
    FONTS --> SATORI
```

---

## ⚙️ Core Technical Highlights

* **Dual-Model AI Engine:** Uses `gemini-2.5-flash` with Google Search Grounding to fetch live match results when scorecards are missing, and `gemini-2.5-flash-lite` to generate punchy Hinglish roasts without running up token bills.
* **Era-Filtered Team Lore:** The prompt engine maps 18 years of IPL history (from RCB's 49 all-out to CSK's bans) and matches lore to the game's actual year so 2011 matches never leak 2024 memes.
* **Retina Share Cards on Edge:** Renders 2400x1260 broadsheet cards via `@vercel/og` (Satori) with local TrueType fonts and a 7-day CDN edge cache, responding in ~15ms when shared on WhatsApp or Twitter.
* **Smart Tag-Based Invalidation:** Caches static match reports for 24 hours via Next.js `unstable_cache`, while busting interaction counts on-demand whenever someone reacts or comments.
* **Deterministic Deduplication:** Keys matches by alphabetical slugs (`YYYY-MM-DD_CSK_v_RCB`) to prevent duplicate entries when APIs swap home and away teams.
* **In-Memory Rate Limiting:** A lightweight sliding-window limiter guards auth and OTP routes in server RAM with zero database overhead.

---

## 🗄️ Database Model

```mermaid
erDiagram
    User ||--o{ Account : "has"
    User ||--o{ Comment : "writes"
    User ||--o{ Reaction : "reacts"

    Match ||--o{ Summary : "generates"
    Match ||--o{ Comment : "contains"
    Match ||--o{ Reaction : "receives"

    User {
        string id PK
        string email UK
        string name
        datetime emailVerified
        string password
        datetime createdAt
    }

    Match {
        string id PK
        string externalId UK "Format: YYYY-MM-DD_TeamA_v_TeamB"
        string homeTeam
        string awayTeam
        string scoreSummary
        datetime matchDate
        string venue
        string winner
        string loser
        json scorecard "Innings, Batting, Bowling stats"
    }

    Summary {
        string id PK
        string matchId FK
        string headline
        string content "AI Roast Text"
        string aiModel
        datetime createdAt
    }

    Comment {
        string id PK
        string userId FK
        string matchId FK
        string content
        datetime createdAt
    }

    Reaction {
        string id PK
        string userId FK
        string matchId FK
        ReactionType type "FIRE | LOVE | AVERAGE | TRASH"
    }

    VerificationOTP {
        string id PK
        string email
        string otp
        OTPType type "EMAIL_VERIFICATION | PASSWORD_RESET"
        datetime expiresAt
    }
```

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [Next.js 16.2](https://nextjs.org/) (App Router, Server Actions, React 19) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) + Playfair Display |
| **Database** | [PostgreSQL (Aiven)](https://aiven.io/) + [Prisma 7](https://www.prisma.io/) with `@prisma/adapter-pg` |
| **Authentication** | [NextAuth.js v5 (Auth.js)](https://authjs.dev/) with Credentials & Google OAuth |
| **AI Intelligence** | [Google Gemini 2.5](https://ai.google.dev/) (Flash + Flash-Lite via `@google/genai`) |
| **Dynamic Media** | Next.js `ImageResponse` / Satori (High-Res 2400x1260 OG Cards) |
| **Email Delivery** | [Resend](https://resend.com/) for 6-digit OTP verification |
| **Automation** | GitHub Actions (Daily ingestion + self-healing roaster crons) |

---

## 💻 Getting Started

Follow these steps to run **Bails on Fire** on your local machine:

### 1. Clone the Repository

```bash
git clone https://github.com/MohdMusaiyab/bailsonfire.git
cd bailsonfire
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Create a `.env` file in the root directory (see `.env.sample` for details):

```env
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

DATABASE_URL="postgresql://postgres:postgres@localhost:5432/bailsonfire?schema=public"

AUTH_SECRET="your_custom_secret_key"
AUTH_GOOGLE_ID="your_google_client_id"
AUTH_GOOGLE_SECRET="your_google_client_secret"

GEMINI_API_KEY="your_google_gemini_api_key"
CRICEKT_DATA_API="your_cricapi_key"
RESEND_API_KEY="your_resend_api_key"
```

### 4. Setup Local Fonts (for Dynamic Share Cards)

Download the TrueType font assets into `public/fonts/` so share cards generate locally without external network dependencies:

```bash
mkdir -p public/fonts && \
curl -L -o public/fonts/PlayfairDisplay-Bold.ttf "https://raw.githubusercontent.com/stonith404/gradely2/master/assets/fonts/PlayfairDisplay-Bold.ttf" && \
curl -L -o public/fonts/PlayfairDisplay-Regular.ttf "https://raw.githubusercontent.com/stonith404/gradely2/master/assets/fonts/PlayfairDisplay-Regular.ttf" && \
curl -L -o public/fonts/SpaceMono-Regular.ttf "https://raw.githubusercontent.com/google/fonts/main/ofl/spacemono/SpaceMono-Regular.ttf"
```

### 5. Setup Database

Push the schema to your PostgreSQL database:

```bash
npx prisma db push
```

*(Optional)* Ingest recent matches and generate initial AI roasts:
```bash
npx tsx scripts/ingest-live.ts
npx tsx scripts/addroast.ts
```

### 6. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the newspaper in action.

---

## 💬 Feedback & Community

Built this to add some humor to heart-breaking cricket losses. We'd love for you to explore the site, test the roasts, and share your experience:
* 🌐 **Live Website:** [bailsonfire.vercel.app](https://bailsonfire.vercel.app/)
* 💡 **Got Feedback or Roast Ideas?** Open an [issue](https://github.com/MohdMusaiyab/bailsonfire/issues) or submit a pull request — community contributions and cricket banter are always welcome!

---

## 📄 License

This project is open-source under the [MIT License](LICENSE).
