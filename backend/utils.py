"""
Utility functions for GitHub data processing and analysis
"""
import requests
import logging
import os
from typing import Dict

# GitHub API configuration
GITHUB_API_BASE_URL = os.getenv("GITHUB_API_BASE_URL")
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")

logger = logging.getLogger(__name__)

# Headers for GitHub API requests
def get_headers() -> Dict[str, str]:
    """Get headers for GitHub API requests"""
    return {
        "Authorization": f"token {GITHUB_TOKEN}",
        "Accept": "application/vnd.github.v3+json",
    }

# Function to fetch repository data
def fetch_repo_metadata(owner: str, repo: str) -> Dict:
    """Fetch metadata for a GitHub repository"""
    url = f"{GITHUB_API_BASE_URL}/repos/{owner}/{repo}"
    response = requests.get(url, headers=get_headers())
    response.raise_for_status()
    return response.json()

# Function to fetch contributor data
def fetch_contributors(owner: str, repo: str) -> Dict:
    """Fetch contributors for a GitHub repository"""
    url = f"{GITHUB_API_BASE_URL}/repos/{owner}/{repo}/contributors?per_page=100"
    response = requests.get(url, headers=get_headers())
    response.raise_for_status()
    return response.json()

# Additional functions for fetching commits, languages, branches, etc. can be added here

# Function to log GitHub API errors
def log_github_error(e: requests.exceptions.HTTPError, url: str):
    """Log errors encountered during GitHub API calls"""
    logger.error("GitHub API request failed: %s", url)
    logger.error("Status code: %s, Response: %s", e.response.status_code, e.response.text)
