# Etsy Listing Optimizer

> AI-powered SEO tool that helps Etsy sellers optimize their listing titles, tags, and keywords for better search visibility.

[Live Demo →](#) | [Report Bug](https://github.com/zakasalaheddine/etsy-listing-optimizer/issues) | [Request Feature](https://github.com/zakasalaheddine/etsy-listing-optimizer/issues)

<div align="center">
  <img src="./public/demo-screenshot.png" alt="Etsy Listing Optimizer Demo" width="800">
</div>

## The Problem

As an Etsy seller myself, I spent countless hours trying to optimize my listings for search. The problem? **Existing SEO tools are expensive** - most charge $30-50/month for features small sellers can barely afford. Meanwhile, many of us are just starting out, trying to get those first few sales.

I needed something simple: paste a listing URL, get AI-optimized metadata. No subscriptions, no complexity, just results.

So I built it.

## The Solution

**Etsy Listing Optimizer** is a free AI-powered tool that analyzes your Etsy listings and generates SEO-optimized titles, tags, and keywords using the proven **Who, What, Where, When, Why SEO Method**.

### Key Features

- **Instant Analysis** - Paste any Etsy listing URL and get optimized metadata in seconds
- **AI-Powered** - Uses Google's Gemini AI to analyze and generate SEO-optimized content
- **Multiple Title Options** - Get 5 different title variations (each max 140 chars) with quality scores
- **30 Optimized Tags** - Each tag scored for quality (max 20 chars per tag)
- **Keyword Categories** - Keywords organized by Anchor, Descriptive, Who, What, Where, When, and Why
- **Free Tier** - 5 optimizations per day, per email address
- **No Registration** - Just provide your name and email to get started
- **SEO Best Practices** - Follows the proven methodology for Etsy listings with 0-3 sales

### Why It's Different

Unlike expensive tools that require subscriptions, this optimizer:
- **Free to use** with fair daily limits
- **No learning curve** - paste URL, get results
- **Focuses on eligibility** over ranking (appearing in searches vs. top position)
- **Cross-matching strategy** - keywords optimized across titles, tags, and attributes
- **Built by a seller, for sellers** - I understand the struggles because I've lived them

## Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS v4** - Modern utility-first styling
- **TanStack Query** - Server state management
- **shadcn/ui** - Accessible component library

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **PostgreSQL** - Reliable relational database
- **Drizzle ORM** - Type-safe database toolkit
- **Google Gemini AI** - Advanced AI for optimization
  - `gemini-2.5-flash` - Fast product detail extraction
  - `gemini-2.5-pro` - Deep SEO analysis and generation

### Infrastructure
- **Vercel** - Deployment and hosting (planned)
- **Rate Limiting** - Email-based daily optimization limits
- **SEO Optimized** - Comprehensive metadata, structured data, sitemap

### Code Quality
- **Biome** - Fast linter and formatter
- **TypeScript** - Full type safety
- **ESM** - Modern module system

## Getting Started

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/etsy-listing-optimizer.git
   cd etsy-listing-optimizer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:
   ```env
   # Database Configuration
   DATABASE_URL=postgresql://user:password@localhost:5432/dbname

   # Gemini AI API Key (required)
   GEMINI_API_KEY=your_gemini_api_key_here

   # Optional: Rate Limiting Configuration
   MAX_OPTIMIZATIONS_PER_DAY=5
   CONTACT_EMAIL=support@example.com
   ```

4. **Set up the database**
   ```bash
   npm run db:push
   ```

   This creates the required tables:
   - `emails` - User email collection
   - `optimizations` - Rate limiting tracking

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open the app**

   Navigate to [http://localhost:3000](http://localhost:3000)

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | - | PostgreSQL connection string |
| `GEMINI_API_KEY` | Yes | - | Google Gemini API key for AI optimization |
| `MAX_OPTIMIZATIONS_PER_DAY` | No | `5` | Daily optimization limit per email |
| `CONTACT_EMAIL` | No | `support@example.com` | Contact email shown on rate limit |

### Getting a Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy and paste it into your `.env.local` file

## How It Works

### The Who, What, Where, When, Why Method

This optimizer implements a proven SEO methodology specifically designed for Etsy:

1. **Extraction Phase**
   - User pastes Etsy listing URL
   - AI extracts product title, description, and existing tags
   - Fast processing with `gemini-2.5-flash`

2. **Analysis Phase**
   - AI analyzes product details using `gemini-2.5-pro`
   - Generates keyword categories:
     - **Anchor Keywords** - Primary product descriptors
     - **Descriptive Keywords** - Additional attributes
     - **Who** - Target audience (who it's for)
     - **What** - Product category and use
     - **Where** - Location/placement context
     - **When** - Occasion/timing context
     - **Why** - Benefits and purposes

3. **Optimization Phase**
   - Creates 5 title variations (max 140 characters)
   - Generates 30 optimized tags (max 20 characters each)
   - Each item scored for quality (1-100)
   - Comma-separated structure alternating descriptive/anchor keywords

4. **Results**
   - User gets categorized keywords
   - Multiple title options to choose from
   - Tag suggestions with quality indicators
   - Easy copy-to-clipboard functionality

### Rate Limiting

- **5 optimizations per email per day**
- Resets at midnight UTC
- Prevents abuse while keeping it free
- Email stored only for rate limiting (not verified)

## Testing

This project includes comprehensive test coverage:

### Unit Tests (Vitest)
- Located in `src/**/*.test.ts`
- Tests for utilities, hooks, and API services
- Run with `npm run test`

### E2E Tests (Playwright)
- Located in `e2e/`
- Complete user flow testing across multiple browsers
- Tests for:
  - First-time user flow
  - Returning user flow
  - Rate limiting scenarios
  - Error handling
  - Results display and copy functionality
  - Edge cases and boundary conditions
- Run with `npm run test:e2e`
- See [e2e/README.md](e2e/README.md) for detailed documentation

### Running Tests

```bash
# Unit tests
npm run test              # Run all unit tests
npm run test:ui           # Run with interactive UI
npm run test:coverage     # Generate coverage report

# E2E tests
npm run test:e2e          # Run all e2e tests (headless)
npm run test:e2e:ui       # Run with Playwright UI
npm run test:e2e:headed   # Run in headed mode (see browser)
npm run test:e2e:debug    # Debug mode
```

### CI/CD Testing
- E2E tests run automatically on every push to `main` or `develop`
- GitHub Actions workflow: `.github/workflows/e2e-tests.yml`
- PostgreSQL service container for database tests
- Test reports and artifacts uploaded on failure

## Project Structure

```
etsy-listing-optimizer/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── api/                # API routes
│   │   │   └── optimizer/      # Main optimization endpoint
│   │   ├── layout.tsx          # Root layout with SEO
│   │   ├── page.tsx            # Home page
│   │   ├── robots.ts           # Robots.txt generator
│   │   ├── sitemap.ts          # Sitemap generator
│   │   └── opengraph-image.tsx # OG image generator
│   ├── components/             # React components
│   │   ├── optimizer-tool.tsx  # Main container
│   │   ├── optimizer-form.tsx  # URL input form
│   │   ├── email-form.tsx      # Email collection
│   │   └── results-display.tsx # Results view
│   ├── lib/                    # Utilities
│   │   ├── db/                 # Database schema & connection
│   │   ├── seo-config.ts       # SEO metadata utilities
│   │   └── structured-data.ts  # JSON-LD generators
│   ├── hooks/                  # Custom React hooks
│   │   └── use-optimize.ts     # Optimization mutation hook
│   ├── types.ts                # TypeScript interfaces
│   └── __tests__/              # Unit test setup
├── e2e/                        # E2E tests (Playwright)
│   ├── first-time-user.spec.ts
│   ├── returning-user.spec.ts
│   ├── rate-limiting.spec.ts
│   ├── error-handling.spec.ts
│   ├── results-display.spec.ts
│   ├── edge-cases.spec.ts
│   ├── fixtures.ts             # Test fixtures and helpers
│   ├── global-setup.ts         # Global test setup
│   └── README.md               # E2E testing documentation
├── .github/
│   └── workflows/
│       └── e2e-tests.yml       # CI/CD workflow for e2e tests
├── public/                     # Static assets
├── playwright.config.ts        # Playwright configuration
├── vitest.config.ts            # Vitest configuration
├── metadata.json               # Centralized SEO config
├── SEO.md                      # SEO implementation guide
├── SEO-CHECKLIST.md            # Pre-launch SEO checklist
└── CLAUDE.md                   # AI assistant instructions

```

## Features in Detail

### Email Collection & Rate Limiting

- First-time users provide name and email
- Information stored in localStorage for convenience
- Rate limiting enforced server-side via database
- No email verification required
- Privacy-focused: email used only for rate limiting

### AI-Powered Optimization

- **Dual Model Strategy**
  - Fast extraction with `gemini-2.5-flash`
  - Deep optimization with `gemini-2.5-pro`
- **Structured JSON Schemas** - Type-safe AI responses
- **Error Handling** - Graceful fallbacks for API failures
- **Response Cleanup** - Handles markdown code blocks in JSON

### SEO Implementation

- Comprehensive metadata configuration
- Structured data (JSON-LD) for rich results:
  - WebSite schema with search action
  - WebApplication schema
  - Organization schema
  - FAQPage schema
- Dynamic OpenGraph images
- XML sitemap
- Robots.txt
- PWA manifest

## Development Commands

```bash
# Development
npm run dev              # Start dev server (localhost:3000)
npm run build            # Production build
npm start                # Start production server

# Database
npm run db:push          # Push schema changes (dev)
npm run db:generate      # Generate migrations

# Code Quality
npm run lint             # Run Biome linter
npm run format           # Format code with Biome

# Testing
npm run test             # Run unit tests (Vitest)
npm run test:ui          # Run unit tests with UI
npm run test:coverage    # Generate coverage report
npm run test:e2e         # Run e2e tests (Playwright)
npm run test:e2e:ui      # Run e2e tests with UI
npm run test:e2e:headed  # Run e2e tests in headed mode
npm run test:e2e:debug   # Debug e2e tests
```

## Deployment

### Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Deploy to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Import your repository
   - Add environment variables
   - Deploy!

3. **Update Metadata**
   - Edit `metadata.json`
   - Change `siteUrl` to your production domain
   - Update social media handles

4. **Set up Database**
   - Use Vercel Postgres or external provider
   - Add `DATABASE_URL` to Vercel environment variables
   - Run migrations (Vercel will auto-run db:push if configured)

### Environment Variables in Production

Ensure these are set in your hosting platform:
- `DATABASE_URL` - Your production PostgreSQL database
- `GEMINI_API_KEY` - Your Google Gemini API key
- `MAX_OPTIMIZATIONS_PER_DAY` - (optional) Default: 5
- `CONTACT_EMAIL` - (optional) Your support email

## Contributing

Contributions are welcome! This project is built to help the Etsy seller community.

### How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style (enforced by Biome)
- Add TypeScript types for new features
- Test thoroughly before submitting
- Update documentation as needed

## Roadmap

### Planned Features

- [ ] Bulk optimization (multiple listings at once)
- [ ] Historical optimization tracking
- [ ] A/B testing title variations
- [ ] Export results to CSV
- [ ] Chrome extension for one-click optimization
- [ ] Competitor analysis
- [ ] Keyword trends and insights
- [ ] Premium tier with higher limits
- [ ] API access for third-party integrations

### Long-term Vision

Help every Etsy seller succeed by making professional SEO optimization accessible and affordable. No small seller should struggle because they can't afford expensive tools.

## Lessons Learned

Building this project taught me:
- **AI Integration** - Working with Google Gemini's structured outputs
- **Web Scraping** - Extracting data from Etsy listings reliably
- **Rate Limiting** - Implementing fair usage without authentication
- **SEO Best Practices** - Comprehensive metadata and structured data
- **Next.js 16** - App Router, Server Components, and API routes
- **Database Design** - Simple but effective schema for tracking

## FAQ

**Q: Is this really free?**
A: Yes! 5 optimizations per day, per email address. No credit card required.

**Q: Do you store my Etsy listings?**
A: No. We only extract data temporarily to generate optimizations. We store your email for rate limiting only.

**Q: Why the daily limit?**
A: To keep the service free and sustainable while preventing abuse.

**Q: Can I use this for my client's listings?**
A: Absolutely! Each email gets 5 optimizations per day.

**Q: Will this guarantee more sales?**
A: SEO optimization improves visibility, but sales depend on many factors (product quality, pricing, photos, etc.).

**Q: Can I use this for platforms other than Etsy?**
A: Currently Etsy-only, but the methodology works for similar platforms.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by the Etsy seller community and their SEO struggles
- SEO methodology based on proven strategies from successful Etsy sellers
- Built with modern tools that make development a joy

## Contact

**ZAKA Salah Eddine** - [@ZakaSalahEddine](https://x.com/ZakaSalahEddine)

Project Link: [https://github.com/zakasalaheddine/etsy-listing-optimizer](https://github.com/zakasalaheddine/etsy-listing-optimizer)

---

<div align="center">
  <p>Built with ❤️ by an Etsy seller, for Etsy sellers</p>
  <p>If this tool helps your shop, consider ⭐️ starring the repo!</p>
</div>
