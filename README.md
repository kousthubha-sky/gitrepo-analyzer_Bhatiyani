# GitHub Repository Analyzer - Bhatiyani

A modern web application built with Next.js and FastAPI that provides detailed analysis of GitHub repositories. This tool helps developers and teams understand repository metrics, code patterns, and collaboration dynamics through interactive visualizations and comprehensive data analysis.

### What it does:
- Analyzes any public GitHub repository
- Visualizes commit patterns and contributor activities
- Tracks language usage and code distribution
- Identifies most active files and contributors
- Maintains history of analyzed repositories

### Why use it:
- Get instant insights about any GitHub repository
- Track project evolution and team dynamics
- Make data-driven decisions about your codebase
- Beautiful, responsive UI with dark/light theme support

## 🌟 Features

- **Repository Analysis**
  - Commit history visualization
  - Language distribution charts
  - Contributor statistics
  - File type distribution
  - Most modified files tracking

- **Interactive UI**
  - Real-time repository search
  - Animated transitions and loading states
  - Dark/Light theme support
  - Responsive design for all devices

- **Technical Features**
  - Next.js 15.2.4 frontend
  - FastAPI Python backend
  - Recharts for data visualization
  - shadcn/ui components
  - Framer Motion animations

## 🚀 Live Demo

- Frontend: [Vercel Deployment](YOUR_VERCEL_URL)
- Backend: [Render Deployment](https://gitrepo-analyzer-bhatiyani.onrender.com)

## 🛠️ Tech Stack

### Frontend
- Next.js 15.2.4
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui
- Recharts
- Framer Motion

### Backend
- Python FastAPI
- PostgreSQL with Supabase
- GitHub API Integration
- Supabase Client SDK

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+
- Git
- GitHub Account (for API access)
- Supabase Account
- PostgreSQL client (optional, for local development)

### Frontend Setup
1. Clone the repository
```bash
git clone https://github.com/kousthubha-sky/gitrepo-analyzer_Bhatiyani.git
cd gitrepo-analyzer_Bhatiyani/front1
```

2. Install dependencies
```bash
npm install
```

3. Configure environment
Create a `.env` file in the frontend directory. Contact the project maintainer for the required environment variables.

4. Run development server
```bash
npm run dev
```

### Backend Setup
1. Navigate to backend directory
```bash
cd backend
```

2. Create virtual environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies
```bash
pip install -r requirements.txt
```

4. Set up environment variables
Create a `.env` file in the backend directory. Contact the project maintainer for the required environment variables.

5. Run development server
```bash
uvicorn main:app --reload --port 8000
```

## 🔧 Environment Configuration

### Frontend Environment (.env)
```bash
# Required environment variables (contact maintainer for values)
NEXT_PUBLIC_API_URL=<backend_api_url>
```

### Backend Environment (.env)
```bash
# Add these environment variables to your .env file
DATABASE_URL=<your_supabase_postgres_connection_string>
SUPABASE_URL=<your_supabase_project_url>
SUPABASE_KEY=<your_supabase_anon_key>
SUPABASE_SECRET_KEY=<your_supabase_service_role_key>
GITHUB_TOKEN=<your_github_token>
PORT=8000
```

### Supabase Setup

1. Create a Supabase Project:
   - Go to [Supabase Dashboard](https://app.supabase.com)
   - Create a new project
   - Get your project credentials

2. Database Setup:
   ```sql
   -- Create analysis table
   CREATE TABLE analyses (
     id SERIAL PRIMARY KEY,
     repo_url TEXT NOT NULL,
     repo_name TEXT NOT NULL,
     owner TEXT NOT NULL,
     stars INTEGER DEFAULT 0,
     analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
     total_commits INTEGER DEFAULT 0,
     total_contributors INTEGER DEFAULT 0
   );

   -- Create analysis history table
   CREATE TABLE analysis_history (
     id SERIAL PRIMARY KEY,
     analysis_id INTEGER REFERENCES analyses(id) ON DELETE CASCADE,
     commit_count INTEGER,
     contributor_count INTEGER,
     recorded_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
   );
   ```

3. Configure Backend:
   ```python
   # database.py
   from supabase import create_client

   supabase = create_client(
       supabase_url=os.environ.get("SUPABASE_URL"),
       supabase_key=os.environ.get("SUPABASE_KEY")
   )
   ```

4. Access Control:
   - Set up Row Level Security (RLS) policies
   - Configure appropriate user roles
   - Set up API access controls

5. Data Backups:
   - Automatic backups are handled by Supabase
   - Configure backup retention policy in Supabase dashboard

### Deployment
The application is deployed using:
- Frontend: Vercel
- Backend: Render
- Database: Supabase

Note: For security reasons, actual deployment URLs are not shared in the public repository.

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop screens
- Tablets
- Mobile devices

## 🎨 UI Components

- Custom GitHub repository input with animations
- Interactive charts and visualizations
- Dark/Light theme toggle
- Responsive navigation
- Loading states and error handling

## 🧪 API Endpoints

### Backend Routes
- `POST /api/analyze` - Analyze a GitHub repository
- `GET /api/past-analyses` - Get history of analyzed repositories
- `DELETE /api/analysis/{id}` - Delete an analysis

## 🤖 AI Integration & Development

This project was developed with significant assistance from AI tools:

### GitHub Copilot
- Assisted in writing efficient TypeScript/Python code
- Helped with type definitions and interfaces
- Suggested best practices for API implementations
- Automated repetitive code patterns
- Helped with error handling and edge cases

### ChatGPT
- Helped in architectural decisions
- Assisted with component design
- Provided debugging suggestions
- Helped optimize database queries
- Assisted in documentation generation

### Development Workflow
1. Initial project structure and setup assisted by AI
2. Core functionality implemented with Copilot's suggestions
3. UI/UX improvements guided by AI recommendations
4. Code optimization and refactoring with AI assistance
5. Documentation generated with AI help

For detailed documentation of AI usage, including prompts and examples, see [prompts.md](./prompts.md)

## 🔄 Future Improvements

- Add real-time repository updates
- Implement more detailed code analysis
- Add user authentication
- Expand visualization options
- Add repository comparison feature

## 👥 Contributors

- Kousthubha - Project Lead & Developer

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
