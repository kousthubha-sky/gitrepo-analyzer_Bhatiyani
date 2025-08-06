from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import requests
import os
from dotenv import load_dotenv
from datetime import datetime
from supabase import create_client, Client

# Load environment variables
load_dotenv()

app = FastAPI(title="GitHub Repository Analyzer API")

# Create database tables on startup - temporarily disabled
# @app.on_event("startup")
# async def startup_event():
#     create_tables()

# CORS settings
origins = [
    os.getenv("FRONTEND_URL", "http://localhost:3000"),
    "*"  # Allow all origins for debugging
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for debugging
    allow_credentials=False,  # Set to False when using allow_origins=["*"]
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database models and connection setup skipped for brevity

# API Models
class AnalyzeRequest(BaseModel):
    repo_url: str


class Analysis(BaseModel):
    repo_name: str
    repo_url: str
    owner: str
    stars: int
    forks: int
    total_commits: int
    total_contributors: int
    primary_language: Optional[str] = None
    analyzed_at: Optional[str] = None
    # Enhanced data for frontend charts
    description: Optional[str] = None
    watchers: Optional[int] = 0
    size: Optional[int] = 0
    created_at: Optional[str] = None
    last_commit_date: Optional[str] = None
    branches_count: Optional[int] = 0
    open_issues: Optional[int] = 0
    html_url: Optional[str] = None
    avatar_url: Optional[str] = None
    # Complex data structures
    languages: Optional[dict] = None
    top_contributors: Optional[list] = None
    commit_activity: Optional[list] = None
    file_structure: Optional[dict] = None
    most_modified_files: Optional[list] = None

class AnalysisResponse(Analysis):
    id: int

class PastAnalysesResponse(BaseModel):
    analyses: List[AnalysisResponse]

# Supabase Client
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

supabase: Optional[Client] = None
if SUPABASE_URL and SUPABASE_ANON_KEY:
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
        print("✅ Supabase client initialized successfully")
    except Exception as e:
        print(f"❌ Failed to initialize Supabase client: {e}")
        supabase = None
else:
    print("⚠️ Supabase credentials not found in environment variables")


# GitHub API configuration
GITHUB_API_BASE_URL = os.getenv("GITHUB_API_BASE_URL", "https://api.github.com")
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")


# Debug logging
print(f"GitHub API Base URL: {GITHUB_API_BASE_URL}")
print(f"GitHub Token present: {'Yes' if GITHUB_TOKEN else 'No'}")

# Helper functions

def fetch_repo_data(repo_url: str):
    """
    Fetches basic repository information from the GitHub API.
    
    Args:
        repo_url (str): The URL of the GitHub repository or owner/repo format
        
    Returns:
        dict: Repository data including name, owner, stars, forks, etc.
        
    Raises:
        HTTPException: If repository is not found or URL format is invalid
    """
    headers = {'Authorization': f'token {GITHUB_TOKEN}'} if GITHUB_TOKEN else {}
    
    # Handle different GitHub URL formats
    if 'github.com' in repo_url:
        parts = repo_url.split('/')
        if len(parts) >= 2:
            owner, repo = parts[-2], parts[-1]
        else:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid GitHub URL format")
    else:
        # Assume it's in owner/repo format
        if '/' in repo_url:
            owner, repo = repo_url.split('/')[-2:]
        else:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid repository format. Use owner/repo or full GitHub URL")
    
    repo_api_url = f"{GITHUB_API_BASE_URL}/repos/{owner}/{repo}"

    response = requests.get(repo_api_url, headers=headers)

    if response.status_code != 200:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Repository not found")

    return response.json()

def fetch_commits_data(owner: str, repo: str):
    """
    Fetches recent commit history for a repository from the GitHub API.
    Limits to recent commits for better performance (first 500 commits).
    
    Args:
        owner (str): Repository owner's username
        repo (str): Repository name
        
    Returns:
        list: List of commit objects containing commit metadata
              Each commit has author, message, date, and changes
    """
    headers = {'Authorization': f'token {GITHUB_TOKEN}'} if GITHUB_TOKEN else {}
    commits_url = f"{GITHUB_API_BASE_URL}/repos/{owner}/{repo}/commits"

    all_commits = []
    page = 1
    max_pages = 5  # Limit to 500 commits (5 * 100)

    while page <= max_pages:
        response = requests.get(commits_url, headers=headers, params={'per_page': 100, 'page': page})
        if response.status_code != 200:
            print(f"Error fetching commits page {page}: {response.status_code}")
            break
        
        commits_page = response.json()
        if not commits_page:
            break
            
        all_commits.extend(commits_page)
        page += 1
        
        print(f"Fetched {len(commits_page)} commits from page {page-1}, total: {len(all_commits)}")

    return all_commits

def fetch_contributors_data(owner: str, repo: str):
    """
    Retrieves all contributors' information for a repository.
    Uses pagination to fetch all contributors, 100 per page.
    
    Args:
        owner (str): Repository owner's username
        repo (str): Repository name
        
    Returns:
        list: List of contributor objects with their contributions count,
              username, and profile information
    """
    headers = {'Authorization': f'token {GITHUB_TOKEN}'} if GITHUB_TOKEN else {}
    contributors_url = f"{GITHUB_API_BASE_URL}/repos/{owner}/{repo}/contributors"

    all_contributors = []
    page = 1

    while True:
        response = requests.get(contributors_url, headers=headers, params={'per_page': 100, 'page': page})
        if response.status_code != 200 or not response.json():
            break
        all_contributors.extend(response.json())
        page += 1

    return all_contributors

def fetch_languages_data(owner: str, repo: str):
    """
    Retrieves programming language statistics for a repository.
    
    Args:
        owner (str): Repository owner's username
        repo (str): Repository name
        
    Returns:
        dict: Dictionary mapping language names to number of bytes of code.
              Example: {"Python": 1000, "JavaScript": 500}
    """
    headers = {'Authorization': f'token {GITHUB_TOKEN}'} if GITHUB_TOKEN else {}
    languages_url = f"{GITHUB_API_BASE_URL}/repos/{owner}/{repo}/languages"
    
    response = requests.get(languages_url, headers=headers)
    
    if response.status_code == 200:
        return response.json()
    return {}

def fetch_branches_data(owner: str, repo: str):
    """
    Retrieves all branches in a repository.
    Uses pagination to fetch all branches, 100 per page.
    
    Args:
        owner (str): Repository owner's username
        repo (str): Repository name
        
    Returns:
        list: List of branch objects containing branch names and latest commits
    """
    headers = {'Authorization': f'token {GITHUB_TOKEN}'} if GITHUB_TOKEN else {}
    branches_url = f"{GITHUB_API_BASE_URL}/repos/{owner}/{repo}/branches"

    all_branches = []
    page = 1

    while True:
        response = requests.get(branches_url, headers=headers, params={'per_page': 100, 'page': page})
        if response.status_code != 200 or not response.json():
            break
        all_branches.extend(response.json())
        page += 1

    return all_branches

def fetch_repository_contents(owner: str, repo: str):
    """
    Retrieves the complete file structure of a repository using the Git Tree API.
    First gets the default branch, then fetches its complete tree recursively.
    
    Args:
        owner (str): Repository owner's username
        repo (str): Repository name
        
    Returns:
        list: List of file objects containing path and type information.
              Returns empty list if fetch fails
    """
    headers = {'Authorization': f'token {GITHUB_TOKEN}'} if GITHUB_TOKEN else {}
    
    try:
        # First get repo data to find default branch
        repo_url = f"{GITHUB_API_BASE_URL}/repos/{owner}/{repo}"
        repo_response = requests.get(repo_url, headers=headers)

        if repo_response.status_code == 200:
            repo_data = repo_response.json()
            default_branch = repo_data.get('default_branch', 'main')
            contents_url = f"{GITHUB_API_BASE_URL}/repos/{owner}/{repo}/git/trees/{default_branch}?recursive=1"
            
            response = requests.get(contents_url, headers=headers)
            if response.status_code == 200:
                return response.json().get('tree', [])
    except Exception:
        pass
    
    return []

def analyze_commit_activity(commits_data: list):
    """
    Analyzes commit patterns over time to generate activity statistics.
    Processes commit data to show trends for the last 12 months.
    
    Args:
        commits_data (list): List of commit objects from the GitHub API
        
    Returns:
        list: List of monthly activity data points containing:
              - month: Month abbreviation
              - commits: Number of commits
              - issues: Number of issues (currently 0, requires additional API calls)
              - prs: Number of pull requests (currently 0, requires additional API calls)
    """
    from datetime import datetime, timedelta, timezone
    from collections import defaultdict
    import calendar
    
    print(f"Analyzing {len(commits_data)} commits for activity")
    
    if not commits_data:
        # Return empty activity data if no commits
        return [{'month': calendar.month_abbr[i], 'commits': 0, 'issues': 0, 'prs': 0} for i in range(1, 9)]
    
    # Get current date and 12 months back (make timezone-aware)
    now = datetime.now(timezone.utc)
    twelve_months_ago = now - timedelta(days=365)
    
    monthly_commits = defaultdict(int)
    total_processed = 0
    
    # Filter commits from the last 12 months and count by month
    for commit in commits_data:
        try:
            commit_date = commit['commit']['committer']['date']
            # Parse GitHub's ISO format datetime (already UTC)
            dt = datetime.fromisoformat(commit_date.replace('Z', '+00:00'))
            
            # Count all commits for better visualization, not just last 12 months
            month_key = f"{calendar.month_abbr[dt.month]} {dt.year}"
            monthly_commits[month_key] += 1
            total_processed += 1
            
        except (KeyError, ValueError) as e:
            print(f"Error processing commit date: {e}")
            continue
    
    print(f"Processed {total_processed} commits, found {len(monthly_commits)} unique months")
    
    # Create activity data for the last 8 months (for display)
    activity_data = []
    current_date = now
    
    for i in range(8):
        month_year = current_date - timedelta(days=30 * i)
        month_key = f"{calendar.month_abbr[month_year.month]} {month_year.year}"
        display_month = calendar.month_abbr[month_year.month]
        commits_count = monthly_commits.get(month_key, 0)
        
        activity_data.insert(0, {
            'month': display_month,
            'commits': commits_count,
            'issues': 0,  # Would need separate API calls
            'prs': 0     # Would need separate API calls
        })
    
    # If no recent activity, show some recent commits anyway for better UX
    if all(item['commits'] == 0 for item in activity_data) and monthly_commits:
        print("No recent activity found, using most recent commit data")
        # Get the most recent months with activity
        sorted_months = sorted(monthly_commits.items(), key=lambda x: datetime.strptime(f"1 {x[0]}", "%d %b %Y"), reverse=True)[:8]
        activity_data = []
        for month_key, commits_count in reversed(sorted_months):
            month_name = month_key.split()[0]
            activity_data.append({
                'month': month_name,
                'commits': commits_count,
                'issues': 0,
                'prs': 0
            })
    
    print(f"Final activity data: {activity_data}")
    return activity_data

def analyze_file_structure(contents_data: list):
    """Analyze file structure and types"""
    from collections import defaultdict
    import os
    
    file_types = defaultdict(int)
    total_files = 0
    
    for item in contents_data:
        if item.get('type') == 'blob':  # It's a file
            total_files += 1
            file_path = item.get('path', '')
            _, ext = os.path.splitext(file_path)
            
            if ext:
                file_types[ext] += 1
            else:
                file_types['No extension'] += 1
    
    # Convert to percentage-based structure
    file_structure = {}
    for ext, count in file_types.items():
        percentage = round((count / total_files) * 100, 1) if total_files > 0 else 0
        file_structure[ext] = {
            'count': count,
            'percentage': percentage
        }
    
    return file_structure

def process_languages_data(languages_data: dict):
    """Process languages data for frontend charts"""
    if not languages_data:
        return {}
    
    total_bytes = sum(languages_data.values())
    processed_languages = {}
    
    for language, bytes_count in languages_data.items():
        percentage = round((bytes_count / total_bytes) * 100, 1) if total_bytes > 0 else 0
        processed_languages[language] = {
            'bytes': bytes_count,
            'percentage': percentage
        }
    
    return processed_languages

def process_contributors_data(contributors_data: list):
    """Process contributors data for frontend charts"""
    if not contributors_data:
        return []
    
    # Get top 10 contributors
    top_contributors = sorted(contributors_data, key=lambda x: x.get('contributions', 0), reverse=True)[:10]
    
    processed_contributors = []
    for contributor in top_contributors:
        processed_contributors.append({
            'login': contributor.get('login', ''),
            'contributions': contributor.get('contributions', 0),
            'avatar_url': contributor.get('avatar_url', '')
        })
    
    return processed_contributors

def analyze_most_modified_files(commits_data: list, owner: str, repo: str):
    """Analyze most frequently modified files (simplified version)"""
    # For now, return empty list as this would require additional API calls
    # to get file stats for each commit which would be rate-limit intensive
    return []


@app.post("/api/analyze", response_model=AnalysisResponse)
def analyze_repository(request: AnalyzeRequest):
    print(f"Received request: {request.repo_url}")
    # Fetch and process the repository data
    repo_data = fetch_repo_data(request.repo_url)

    # Extract owner and repo name from URL
    if 'github.com' in request.repo_url:
        parts = request.repo_url.split('/')
        owner, repo = parts[-2], parts[-1]
    else:
        owner, repo = request.repo_url.split('/')[-2:]
    
    print(f"Analyzing repository: {owner}/{repo}")
    
    # Fetch all required data
    commits_data = fetch_commits_data(owner, repo)
    contributors_data = fetch_contributors_data(owner, repo)
    languages_data = fetch_languages_data(owner, repo)

    # Calculate metrics
    total_commits = len(commits_data)
    total_contributors = len(contributors_data)
    last_commit_date = commits_data[0]["commit"]["committer"]["date"] if commits_data else "N/A"

    primary_language = max(languages_data, key=languages_data.get) if languages_data else ""
    processed_languages = process_languages_data(languages_data)
    processed_contributors = process_contributors_data(contributors_data)
    commit_activity = analyze_commit_activity(commits_data)
    file_structure = analyze_file_structure(fetch_repository_contents(owner, repo))
    branches_count = len(fetch_branches_data(owner, repo))

    # Create comprehensive analysis data for API response
    comprehensive_analysis_data = {
        "repo_name": repo_data.get("name", ""),
        "repo_url": request.repo_url,
        "owner": repo_data.get("owner", {}).get("login", ""),
        "stars": repo_data.get("stargazers_count", 0),
        "forks": repo_data.get("forks_count", 0),
        "total_commits": total_commits,
        "total_contributors": total_contributors,
        "primary_language": primary_language,
        "analyzed_at": datetime.now().isoformat(),
        "languages": processed_languages,
        "top_contributors": processed_contributors,
        "commit_activity": commit_activity,
        "file_structure": file_structure,
        "branches_count": branches_count,
        "description": repo_data.get("description", ""),
        "watchers": repo_data.get("subscribers_count", 0),
        "size": repo_data.get("size", 0),
        "created_at": repo_data.get("created_at", ""),
        "last_commit_date": last_commit_date,
        "open_issues": repo_data.get("open_issues_count", 0),
        "html_url": repo_data.get("html_url", ""),
        "avatar_url": repo_data.get("owner", {}).get("avatar_url", ""),
        "most_modified_files": analyze_most_modified_files(commits_data, owner, repo)
    }

    # Save only basic analysis data to Supabase (matching existing schema)
    basic_analysis_data = {
        "repo_name": repo_data.get("name", ""),
        "repo_url": request.repo_url,
        "owner": repo_data.get("owner", {}).get("login", ""),
        "stars": repo_data.get("stargazers_count", 0),
        "forks": repo_data.get("forks_count", 0),
        "total_commits": total_commits,
        "total_contributors": total_contributors,
        "primary_language": primary_language,
        "analyzed_at": datetime.now().isoformat()
    }

    if supabase:
        response = supabase.table("analysis_history").insert(basic_analysis_data).execute()
        comprehensive_analysis_data["id"] = response.data[0]["id"]

    return AnalysisResponse(**comprehensive_analysis_data)

@app.get("/api/past-analyses", response_model=PastAnalysesResponse)
def get_past_analyses():
    print("Fetching past analyses")
    
    if not supabase:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database not configured")

    try:
        response = supabase.table("analysis_history").select("*").order("analyzed_at", desc=True).execute()
        analyses = response.data if response.data else []
        return PastAnalysesResponse(analyses=analyses)
    except Exception as e:
        print(f"Error fetching past analyses: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to fetch analyses")

@app.get("/api/analyses/{id}", response_model=AnalysisResponse)
def get_analysis(id: int):
    print(f"Fetching analysis with ID: {id}")
    
    if not supabase:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database not configured")

    try:
        response = supabase.table("analysis_history").select("*").eq("id", id).execute()
        if response.data and len(response.data) == 1:
            return AnalysisResponse(**response.data[0])
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis not found")
    except Exception as e:
        print(f"Error fetching analysis {id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to fetch analysis")

@app.delete("/api/analyses/{id}")
def delete_analysis(id: int):
    print(f"Deleting analysis with ID: {id}")
    
    if not supabase:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database not configured")

    try:
        response = supabase.table("analysis_history").delete().eq("id", id).execute()
        if response.data:
            return {"detail": "Analysis deleted"}
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis not found")
    except Exception as e:
        print(f"Error deleting analysis {id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to delete analysis")

@app.get("/")
def read_root():
    return {"message": "GitHub Repository Analyzer API is running!", "version": "1.0.0"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "github-analyzer-backend"}

@app.get("/api/test")
def test_endpoint():
    return {"message": "API is working!", "endpoints": ["/api/analyze", "/api/analyses"]}
