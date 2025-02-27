# Restaurant Inventory Management System

A modern, responsive web application for managing restaurant inventory, tracking sales, and generating reports.

## Features

- **Dashboard**: Overview of inventory status, sales, and alerts
- **Inventory Management**: Add, edit, and track ingredients with reorder alerts
- **Sales Entry**: Record daily sales with automatic inventory deduction
- **Reports & Analytics**: View sales trends and inventory usage

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL database with RESTful API)
- **Charts**: Chart.js with React-Chartjs-2
- **Icons**: React Icons
- **Date Handling**: date-fns

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Supabase account and project

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/restaurant-inventory.git
cd restaurant-inventory
```

2. Install dependencies

```bash
npm install
# or
yarn install
```

3. Set up environment variables
   Copy the `.env.example` file to `.env.local` and update with your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Set up the database
   You have two options:

   a. Using the SQL Editor in Supabase:

   - Follow the instructions in `SETUP_DATABASE.md`

   b. Using the setup script:

   ```bash
   npm run setup-db
   # or
   yarn setup-db
   ```

5. Verify database setup

   ```bash
   npm run check-db
   # or
   yarn check-db
   ```

6. Run the development server

```bash
npm run dev
# or
yarn dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
restaurant-inventory/
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── dashboard/        # Dashboard page
│   │   ├── inventory/        # Inventory management page
│   │   ├── sales/            # Sales entry page
│   │   ├── reports/          # Reports and analytics page
│   │   ├── layout.tsx        # Root layout component
│   │   └── page.tsx          # Root page (redirects to dashboard)
│   ├── components/           # Reusable components
│   │   ├── AlertCard.tsx     # Alert card component
│   │   ├── Card.tsx          # Card component
│   │   ├── MobileNav.tsx     # Mobile navigation component
│   │   ├── Sidebar.tsx       # Sidebar navigation component
│   │   └── StatCard.tsx      # Statistics card component
│   └── lib/                  # Utilities and types
│       ├── supabase.ts       # Supabase client
│       ├── supabase-schema.sql # Database schema
│       └── types.ts          # TypeScript interfaces
├── public/                   # Static assets
├── check-database.js         # Script to verify database setup
├── setup-database.js         # Script to set up database tables
├── SETUP_DATABASE.md         # Manual database setup instructions
├── .env.example              # Example environment variables
├── .env.local                # Environment variables (create this file)
└── package.json              # Project dependencies
```

## Deployment

This application can be deployed on Vercel, Netlify, or any other platform that supports Next.js.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.io/)
- [Chart.js](https://www.chartjs.org/)
- [React Icons](https://react-icons.github.io/react-icons/)
