# Ratevo by Xoiex

Turn real experiences into better reviews.

## Project Structure

```
ratevo/
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── layouts/        # Layout components
│   │   ├── services/       # API services
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Library configurations
│   │   └── utils/          # Utility functions
│   └── package.json
├── server/                 # Node.js + Express backend
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── controllers/    # Route controllers
│   │   ├── services/       # Business logic services
│   │   ├── middleware/     # Express middleware
│   │   ├── utils/          # Utility functions
│   │   └── config/         # Configuration files
│   └── package.json
├── database/
│   └── migrations/         # Supabase SQL migrations
└── README.md
```

## Tech Stack

- **Frontend**: React 18, Vite, React Router, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI**: Google Gemini API
- **QR Codes**: qrcode.react

## Setup Instructions

### Prerequisites

- Node.js 18+
- Supabase account
- Google Gemini API key

### 1. Supabase Setup

1. Create a new Supabase project
2. Go to SQL Editor and run the migration in `database/migrations/001_initial_schema.sql`
3. Get your project URL and keys from Settings > API:
   - Project URL → `SUPABASE_URL`
   - anon/public key → `SUPABASE_ANON_KEY` (client)
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY` (server)

### 2. Environment Variables

**Client** (`client/.env`):
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:4001
VITE_CLIENT_URL=http://localhost:5174
```

**Server** (`server/.env`):
```env
PORT=4001
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
GEMINI_API_KEY=your_gemini_api_key
CLIENT_URL=http://localhost:5174
```

### 3. Install Dependencies

```bash
# Client
cd client
npm install

# Server
cd server
npm install
```

### 4. Run Development Servers

```bash
# Terminal 1 - Client
cd client
npm run dev

# Terminal 2 - Server
cd server
npm run dev
```

Client runs on http://localhost:5174
Server runs on http://localhost:4001

## Features

### Business Owner Flow
1. Sign up / Log in
2. Create business with name, category, address, phone, Google Review URL
3. Get unique QR code for customer reviews
4. View dashboard with real analytics:
   - QR Scans
   - Ratings Submitted
   - Reviews Generated
   - Google Review Clicks
   - Average Rating
   - Conversion Rate

### Customer Flow
1. Scan QR code → opens `/r/{businessSlug}`
2. Select 1-5 star rating
3. Choose feedback options (optional)
4. Add custom text (optional)
5. AI generates natural review draft
6. Edit/regenerate review
7. Click "Review on Google" → opens Google Review URL

### Security
- Row Level Security on all tables
- Owners can only access their own data
- Public access limited to business info needed for review page
- Rate limiting on AI endpoints
- Input validation with Zod
- JWT-based authentication

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Sign in
- `POST /api/auth/logout` - Sign out
- `GET /api/auth/me` - Get current user

### Business (requires auth)
- `POST /api/business` - Create business
- `GET /api/business` - List owner's businesses
- `GET /api/business/:id` - Get business
- `PUT /api/business/:id` - Update business
- `GET /api/business/:id/qr` - Get QR code URL

### Review (public)
- `POST /api/review/start/:businessSlug` - Start review session
- `POST /api/review/generate/:sessionId` - Generate AI review
- `GET /api/review/session/:sessionId` - Get session
- `GET /api/review/public/business/:businessSlug` - Get public business info
- `POST /api/review/events` - Track analytics event

### Analytics (requires auth)
- `GET /api/analytics/:businessId` - Get analytics data

## Database Schema

- **profiles** - User profiles (extends auth.users)
- **businesses** - Business information with unique slugs
- **review_sessions** - Anonymous customer review sessions
- **review_events** - Analytics events

## Deployment

### Frontend (Vercel)
1. Connect GitHub repo to Vercel
2. Set environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_URL`, `VITE_CLIENT_URL`
3. Build command: `npm run build`
4. Output directory: `dist`

### Backend (Render/Railway)
1. Connect GitHub repo
2. Set environment variables
3. Build command: `npm install`
4. Start command: `npm start`

### Database (Supabase)
Already hosted - just run migrations.

## License

MIT