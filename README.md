# SafeByte - Waze for Food Allergies

SafeByte is a production-ready web application that helps people with food allergies and dietary restrictions discover safe dishes at nearby restaurants, powered by community feedback and comprehensive filtering.

## Features

- **User Profiles**: Manage allergies and dietary preferences with persistent storage
- **Smart Filtering**: Automatic filtering of dishes based on your allergy profile
- **Multiple Discovery Methods**:
  - **Trending**: Community-verified popular dishes
  - **Search**: Text search across dishes, ingredients, and restaurants
  - **Menus**: Browse restaurant-specific filtered menus
  - **Map**: Location-based restaurant discovery (coming soon: Mapbox integration)
  - **Saved**: Personal collection of safe dishes
  - **Chat**: AI-powered recommendations (coming soon)
- **Community Feedback**: Mark dishes as safe or report issues
- **Admin Panel**: JSON-based menu ingestion system for adding/updating restaurants
- **Authentication**: Secure Supabase email/password authentication
- **Responsive Design**: Mobile-first with semantic safety colors (green/yellow/red)

## Tech Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui
- **Backend**: Next.js API routes with Supabase
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Supabase account and project

### Environment Variables

This project requires the following environment variables (already configured in Vercel):

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Database (auto-configured by Supabase integration)
POSTGRES_URL=your_postgres_url
```

### Installation

1. Clone the repository or download the ZIP
2. Install dependencies:

```bash
npm install
```

3. Run the database scripts (they will execute automatically when deployed):
   - `scripts/001_create_tables.sql` - Creates all necessary tables with RLS
   - `scripts/002_create_triggers.sql` - Sets up automated triggers
   - `scripts/003_seed_data.sql` - Adds sample restaurants and dishes

4. Start the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Database Schema

### Core Tables

- **profiles**: User allergy and diet preferences
- **restaurants**: Restaurant information with location data
- **dishes**: Menu items with allergen and ingredient data
- **feedback**: Community safety reports (safe/issue)
- **saved_items**: User's saved dishes

All tables are protected with Row Level Security (RLS) policies.

## Usage

### For Users

1. **Sign up** or **Login** to create your profile
2. **Set your allergens and diet preferences** via the Filters button or Profile page
3. **Browse safe dishes** across all tabs - filtering happens automatically
4. **Save favorite dishes** and provide feedback to help the community
5. **Search or browse by restaurant** to find safe options

### For Admins

1. Navigate to `/admin/ingest`
2. Paste JSON menu data or use the example
3. Click "Ingest Menu" to add/update restaurant menus
4. Format:

```json
{
  "restaurant": {
    "name": "Restaurant Name",
    "cuisine": "American",
    "price_range": "$$",
    "address": "123 Main St",
    "latitude": 37.7749,
    "longitude": -122.4194
  },
  "menu_items": [
    {
      "name": "Dish Name",
      "description": "Dish description",
      "price": 12.99,
      "calories": 450,
      "allergens": ["gluten", "dairy"],
      "free_of": ["nuts", "soy"],
      "ingredients": ["ingredient1", "ingredient2"]
    }
  ]
}
```

## Deployment

### Deploy to Vercel

1. Connect your repository to Vercel
2. Add the Supabase integration from Vercel's integration marketplace
3. Run the SQL scripts in your Supabase project
4. Deploy!

The app is optimized for Vercel's Edge Network and includes proper caching strategies.

## Safety & Disclaimers

SafeByte displays a prominent disclaimer: **"Menu data is sourced from public information and community feedback. Always verify ingredients with restaurant staff before ordering if you have severe allergies."**

This app is a discovery tool and should not replace direct verification with restaurant staff.

## Future Enhancements

- Full Mapbox GL JS integration with color-coded pins
- AI-powered chat using RAG for personalized recommendations
- Vector search integration (Pinecone or pgvector)
- Push notifications for newly verified dishes
- CSV/Excel menu import
- Restaurant manager verification portal
- Mobile apps (React Native)

## Contributing

This is an MVP built with v0. Contributions are welcome!

## License

MIT License - feel free to use this project for your own purposes.

## Support

For issues or questions, please open an issue in the repository or contact support.

---

Built with ❤️ using v0, Next.js, Supabase, and shadcn/ui
