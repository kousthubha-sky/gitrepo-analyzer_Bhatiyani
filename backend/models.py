"""
Pydantic models for API request/response validation
"""
from pydantic import BaseModel, HttpUrl, validator
from typing import List, Dict, Any, Optional
from datetime import datetime

class AnalyzeRequest(BaseModel):
    """Request model for repository analysis"""
    repo_url: str
    
    @validator('repo_url')
    def validate_github_url(cls, v):
        """Validate that the URL is a valid GitHub repository URL"""
        if not v.startswith(('https://github.com/', 'http://github.com/', 'github.com/')):
            raise ValueError('URL must be a valid GitHub repository URL')
        return v

class ContributorData(BaseModel):
    """Model for contributor statistics"""
    name: str
    commits: int
    additions: int
    deletions: int
    avatar_url: Optional[str] = None

class CommitActivityData(BaseModel):
    """Model for commit activity over time"""
    month: str
    commits: int
    issues: int
    prs: int

class LanguageData(BaseModel):
    """Model for programming language statistics"""
    name: str
    value: float  # percentage
    color: str
    lines: int

class FileTypeData(BaseModel):
    """Model for file type distribution"""
    name: str
    value: float  # percentage
    color: str
    count: int

class ModifiedFileData(BaseModel):
    """Model for most modified files"""
    path: str
    changes: int
    additions: int
    deletions: int

class AnalysisResponse(BaseModel):
    """Response model for repository analysis"""
    id: int
    repo_url: str
    owner: str
    repo_name: str
    
    # Repository overview
    total_commits: int
    total_contributors: int
    total_branches: int
    last_commit_date: Optional[datetime]
    
    # Repository metadata
    description: Optional[str]
    stars: int
    forks: int
    open_issues: int
    
    # Detailed analysis data
    language_distribution: List[LanguageData]
    contributor_data: List[ContributorData]
    commit_activity_data: List[CommitActivityData]
    file_type_distribution: List[FileTypeData]
    most_modified_files: List[ModifiedFileData]
    
    # Timestamps
    created_at: datetime
    updated_at: datetime

class AnalysisListItem(BaseModel):
    """Model for analysis list items"""
    id: int
    repo_url: str
    owner: str
    repo_name: str
    stars: int
    total_commits: int
    total_contributors: int
    created_at: datetime

class AnalysisListResponse(BaseModel):
    """Response model for list of analyses"""
    analyses: List[AnalysisListItem]
    total: int

class ErrorResponse(BaseModel):
    """Error response model"""
    detail: str
    error_code: Optional[str] = None

class SuccessResponse(BaseModel):
    """Success response model"""
    message: str
    data: Optional[Dict[str, Any]] = None
