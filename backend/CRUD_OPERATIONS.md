# CRUD Operations Implementation

## Overview
This backend now implements complete CRUD (Create, Read, Update, Delete) operations for storing and managing GitHub repository analysis data using Supabase as the database.

## Database Setup

### 1. Create the Table
Run this SQL in your Supabase dashboard:

```sql
-- Create analysis_history table in Supabase
CREATE TABLE IF NOT EXISTS analysis_history (
    id SERIAL PRIMARY KEY,
    repo_name VARCHAR(255) NOT NULL,
    repo_url VARCHAR(500) NOT NULL,
    owner VARCHAR(100) NOT NULL,
    stars INTEGER DEFAULT 0,
    forks INTEGER DEFAULT 0,
    total_commits INTEGER DEFAULT 0,
    total_contributors INTEGER DEFAULT 0,
    primary_language VARCHAR(50),
    analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_analysis_history_analyzed_at ON analysis_history(analyzed_at DESC);
CREATE INDEX IF NOT EXISTS idx_analysis_history_repo_url ON analysis_history(repo_url);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE analysis_history ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations (you can make this more restrictive later)
CREATE POLICY "Allow all operations on analysis_history" ON analysis_history
    FOR ALL 
    TO anon 
    USING (true) 
    WITH CHECK (true);
```

## API Endpoints

### 1. CREATE - Analyze Repository (with automatic save)
**POST** `/api/analyze`

**Request Body:**
```json
{
    "repo_url": "https://github.com/owner/repo-name"
}
```

**Response:**
```json
{
    "id": 1,
    "repo_name": "repo-name",
    "repo_url": "https://github.com/owner/repo-name",
    "owner": "owner",
    "stars": 1234,
    "forks": 567,
    "total_commits": 890,
    "total_contributors": 12,
    "primary_language": "Python",
    "analyzed_at": "2025-01-05T16:30:00Z"
}
```

### 2. READ - Get Past Analyses
**GET** `/api/past-analyses`

**Response:**
```json
{
    "analyses": [
        {
            "id": 1,
            "repo_name": "repo-name",
            "repo_url": "https://github.com/owner/repo-name",
            "owner": "owner",
            "stars": 1234,
            "forks": 567,
            "total_commits": 890,
            "total_contributors": 12,
            "primary_language": "Python",
            "analyzed_at": "2025-01-05T16:30:00Z"
        }
    ]
}
```

### 3. READ - Get Specific Analysis
**GET** `/api/analyses/{id}`

**Response:**
```json
{
    "id": 1,
    "repo_name": "repo-name",
    "repo_url": "https://github.com/owner/repo-name",
    "owner": "owner",
    "stars": 1234,
    "forks": 567,
    "total_commits": 890,
    "total_contributors": 12,
    "primary_language": "Python",
    "analyzed_at": "2025-01-05T16:30:00Z"
}
```

### 4. DELETE - Remove Analysis
**DELETE** `/api/analyses/{id}`

**Response:**
```json
{
    "detail": "Analysis deleted"
}
```

## Data Models

### Analysis (Base Model)
```python
class Analysis(BaseModel):
    repo_name: str
    repo_url: str
    owner: str
    stars: int
    forks: int
    total_commits: int
    total_contributors: int
    primary_language: Optional[str] = None
    analyzed_at: Optional[datetime] = None
```

### AnalysisResponse (Includes ID)
```python
class AnalysisResponse(Analysis):
    id: int
```

### PastAnalysesResponse (List Response)
```python
class PastAnalysesResponse(BaseModel):
    analyses: List[AnalysisResponse]
```

## Error Handling

The API includes comprehensive error handling:

- **500 Internal Server Error**: Database not configured or connection issues
- **404 Not Found**: Analysis with specified ID doesn't exist
- **400 Bad Request**: Invalid repository URL format
- **404 Not Found**: Repository not found on GitHub

## Frontend Integration

For your frontend, you can now:

1. **Analyze a new repository**: Call `POST /api/analyze` with the repo URL
2. **Show past analyses**: Call `GET /api/past-analyses` to display history
3. **View specific analysis**: Call `GET /api/analyses/{id}` for details
4. **Delete old analyses**: Call `DELETE /api/analyses/{id}` to remove entries

## Example Frontend Usage

```javascript
// Analyze a new repository
const analyzeRepo = async (repoUrl) => {
    const response = await fetch('http://localhost:8000/api/analyze', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ repo_url: repoUrl })
    });
    return response.json();
};

// Get past analyses for display
const getPastAnalyses = async () => {
    const response = await fetch('http://localhost:8000/api/past-analyses');
    return response.json();
};

// Delete an analysis
const deleteAnalysis = async (id) => {
    const response = await fetch(`http://localhost:8000/api/analyses/${id}`, {
        method: 'DELETE'
    });
    return response.json();
};
```

## Database Schema
The `analysis_history` table stores:
- **id**: Auto-incrementing primary key
- **repo_name**: Name of the repository
- **repo_url**: Full GitHub URL
- **owner**: Repository owner/organization
- **stars**: Number of GitHub stars
- **forks**: Number of forks
- **total_commits**: Total commit count
- **total_contributors**: Number of contributors
- **primary_language**: Most used programming language
- **analyzed_at**: Timestamp of when analysis was performed

This implementation provides a complete CRUD system for managing repository analysis data with proper error handling and database persistence.
