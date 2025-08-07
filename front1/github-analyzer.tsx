"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Code, GitCommit, Users, Calendar, GitBranch, Clock, Settings, Trash2, AlertTriangle, ArrowLeft } from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { SettingsPanel } from "./components/settings-panel"
import { ThemeToggle } from "./components/theme-toggle"
import {
  Line,
  LineChart,
  Bar,
  BarChart,
  Pie,
  PieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { ProfileSection } from "./components/profile-section"
import { AnalysisOverview } from "./components/analysis-overview"
import { RepositoryInfo } from "./components/repository-info"
import RippleGrid from './RippleGrid';
import { GitHubAiInput } from "./components/GitHubAiInput"

// Language colors mapping
const languageColors: { [key: string]: string } = {
  "JavaScript": "#f7df1e",
  "TypeScript": "#3178c6",
  "Python": "#3776ab",
  "Java": "#ed8b00",
  "C++": "#00599c",
  "C#": "#239120",
  "PHP": "#777bb4",
  "Ruby": "#cc342d",
  "Go": "#00add8",
  "Rust": "#dea584",
  "CSS": "#1572b6",
  "HTML": "#e34f26",
  "Shell": "#89e051",
  "Dockerfile": "#384d54",
  "Vue": "#4fc08d",
  "React": "#61dafb",
  "Svelte": "#ff3e00",
  "Dart": "#0175c2",
  "Kotlin": "#7f52ff",
  "Swift": "#fa7343",
}

// Mock data for charts that need commit history analysis (would require additional GitHub API calls)
const commitActivityData = [
  { month: "Jan", commits: 45, issues: 12, prs: 8 },
  { month: "Feb", commits: 52, issues: 15, prs: 11 },
  { month: "Mar", commits: 38, issues: 9, prs: 6 },
  { month: "Apr", commits: 61, issues: 18, prs: 14 },
  { month: "May", commits: 55, issues: 16, prs: 12 },
  { month: "Jun", commits: 67, issues: 21, prs: 16 },
  { month: "Jul", commits: 72, issues: 19, prs: 18 },
  { month: "Aug", commits: 58, issues: 14, prs: 13 },
]

const fileTypeData = [
  { name: ".js", value: 35, color: "#f7df1e", count: 145 },
  { name: ".ts", value: 25, color: "#3178c6", count: 98 },
  { name: ".css", value: 15, color: "#1572b6", count: 67 },
  { name: ".md", value: 12, color: "#083fa1", count: 23 },
  { name: ".json", value: 8, color: "#000000", count: 34 },
  { name: "Other", value: 5, color: "#6b7280", count: 28 },
]

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface ModifiedFile {
  path: string;
  changes?: number;
  additions?: number;
  deletions?: number;
}

interface AnalysisData {
  repo_name: string;
  description: string;
  owner: string;
  stars: number;
  forks: number;
  watchers: number;
  languages: Record<string, { bytes: number; percentage: number }>;
  topics?: string[];
  license?: string;
  size: number;
  created_at: string;
  total_commits: number;
  total_contributors: number;
  last_commit_date: string;
  branches_count: number;
  most_modified_files: Array<{
    path: string;
    changes: number;
    additions: number;
    deletions: number;
  }>;
  top_contributors: Array<{
    login: string;
    contributions: number;
  }>;
  commit_activity: Array<{
    month: string;
    commits: number;
    issues: number;
    prs: number;
  }>;
  file_structure: Record<string, {
    percentage: number;
    count: number;
  }>;
  html_url: string;
  avatar_url: string;
  open_issues: number;
}

interface PastAnalysis {
  id: number;
  repo_url: string;
  repo_name: string;
  owner: string;
  stars: number;
  forks: number;
  total_commits: number;
  total_contributors: number;
  primary_language?: string;
  analyzed_at: string;
}

export default function Component() {
  const [pastAnalyses, setPastAnalyses] = useState<PastAnalysis[]>([])

  // Fetch past analyses from Supabase when component mounts
  useEffect(() => {
    const fetchPastAnalyses = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/past-analyses`)
        if (!response.ok) throw new Error('Failed to fetch past analyses')
        const data = await response.json()
        setPastAnalyses(data.analyses || [])
      } catch (error) {
        console.error('Error fetching past analyses:', error)
        setPastAnalyses([])
      }
    }

    fetchPastAnalyses()
  }, [])
  const [repoUrl, setRepoUrl] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [hasAnalyzed, setHasAnalyzed] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleAnalyze = async () => {
    if (!repoUrl.trim()) return

    setIsAnalyzing(true)
    setError(null)
    
    try {
      // Make API call to backend - analysis is automatically saved to database
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ repo_url: repoUrl }),
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`)
      }

      const analysisResult = await response.json()
      
      // Backend now returns comprehensive data - use it directly
      setAnalysisData({
        repo_name: analysisResult.repo_name,
        owner: analysisResult.owner,
        description: analysisResult.description || "Repository analysis",
        stars: analysisResult.stars,
        forks: analysisResult.forks,
        watchers: analysisResult.watchers || 0,
        languages: analysisResult.languages || {},
        size: analysisResult.size || 0,
        created_at: analysisResult.created_at || new Date().toISOString(),
        total_commits: analysisResult.total_commits,
        total_contributors: analysisResult.total_contributors,
        last_commit_date: analysisResult.last_commit_date || analysisResult.analyzed_at,
        branches_count: analysisResult.branches_count || 0,
        most_modified_files: analysisResult.most_modified_files || [],
        top_contributors: analysisResult.top_contributors || [],
        commit_activity: analysisResult.commit_activity || [],
        file_structure: analysisResult.file_structure || {},
        html_url: analysisResult.html_url || analysisResult.repo_url,
        avatar_url: analysisResult.avatar_url || "",
        open_issues: analysisResult.open_issues || 0
      })
      setHasAnalyzed(true)

      // Refresh past analyses
      try {
        const pastAnalysesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/past-analyses`)
        if (pastAnalysesResponse.ok) {
          const pastData = await pastAnalysesResponse.json()
          setPastAnalyses(pastData.analyses || [])
        }
      } catch (refreshError) {
        console.error('Error refreshing past analyses:', refreshError)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setHasAnalyzed(false)
    } finally {
      setIsAnalyzing(false)
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const extractRepoName = (url: string) => {
    const match = url.match(/github\.com\/([^/]+\/[^/]+)/)
    return match ? match[1] : url
  }

  // Convert API language data to chart format
  const getLanguageChartData = () => {
    if (!analysisData?.languages) return []
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return Object.entries(analysisData.languages).map(([name, data]: [string, any]) => ({
      name,
      value: data.percentage,
      color: languageColors[name] || '#6b7280',
      bytes: data.bytes
    }))
  }

  // Convert API contributors data to chart format
  const getContributorsChartData = () => {
    if (!analysisData?.top_contributors) return []
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return analysisData.top_contributors.map((contributor: any) => ({
      name: contributor.login,
      contributions: contributor.contributions,
      commits: contributor.contributions // Using contributions as commits for chart
    }))
  }

  // Get commit activity data from API or use mock data
  const getCommitActivityData = () => {
    if (analysisData?.commit_activity && analysisData.commit_activity.length > 0) {
      return analysisData.commit_activity
    }
    // Fallback to mock data if API data not available
    return commitActivityData
  }

  // Convert API file structure to chart format
  const getFileTypeChartData = () => {
    if (!analysisData?.file_structure) return fileTypeData // Fallback to mock data
    
    const fileExtColors: { [key: string]: string } = {
      '.js': '#f7df1e',
      '.ts': '#3178c6', 
      '.jsx': '#61dafb',
      '.tsx': '#3178c6',
      '.css': '#1572b6',
      '.scss': '#cf649a',
      '.html': '#e34f26',
      '.md': '#083fa1',
      '.json': '#000000',
      '.py': '#3776ab',
      '.java': '#ed8b00',
      '.go': '#00add8',
      '.rs': '#dea584',
      '.php': '#777bb4',
      '.rb': '#cc342d',
      '.c': '#00599c',
      '.cpp': '#00599c',
      '.cs': '#239120',
      '.swift': '#fa7343',
      '.kt': '#7f52ff',
    }
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return Object.entries(analysisData.file_structure).map(([ext, data]: [string, any]) => ({
      name: ext,
      value: data.percentage,
      count: data.count,
      color: fileExtColors[ext] || '#6b7280'
    }))
  }

  // Handle delete analysis
  const handleDeleteAnalysis = async (analysisId: number) => {
    setIsDeleting(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analyses/${analysisId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error(`Failed to delete analysis: ${response.status} ${response.statusText}`)
      }

      // Remove the deleted analysis from the local state
      setPastAnalyses(prev => prev.filter(analysis => analysis.id !== analysisId))
      setDeleteConfirm(null)
      
      // Show success message (you could add a toast notification here)
      console.log('Analysis deleted successfully')
    } catch (error) {
      console.error('Error deleting analysis:', error)
      setError(error instanceof Error ? error.message : 'Failed to delete analysis')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <main className="min-h-screen bg-background relative">
      {/* RippleGrid Background */}
      <div className="fixed inset-0 z-0 h-full w-full">
        <RippleGrid
          enableRainbow={false}
          gridColor="#ffffff"
          rippleIntensity={0.05}
          gridSize={10}
          gridThickness={15}
          mouseInteraction={true}
          mouseInteractionRadius={1.2}
          opacity={0.8}
        />
      </div>
      
      {/* Content Overlay */}
      <div className="relative z-10">
        {/* Header */}
        <header className="w-full ">
          <div className="container mx-auto px-4 py-4 sm:py-6 max-w-5xl">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              {/* Logo and Title - Centered */}
              <div className="flex items-center gap-3 justify-center">
                <Code className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
                <div className="text-center">
                  <h1 className="text-2xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/50">
                    GitHub Repo Analyzer
                  </h1>
                  <p className="text-sm sm:text-base text-muted-foreground mt-1">
                    Gain insights into any public GitHub repository
                  </p>
                </div>
              </div>
              {/* Controls - Centered */}
              <div className="flex items-center gap-3 justify-center">
                {hasAnalyzed && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setHasAnalyzed(false)
                      setAnalysisData(null)
                      setRepoUrl("")
                      setError(null)
                    }}
                    className="flex items-center"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    <span>Back to Home</span>
                  </Button>
                )}
                <ThemeToggle />
                <Button variant="outline" onClick={() => setShowSettings(true)} className="flex items-center">
                  <Settings className="h-4 w-4 mr-2" />
                  <span>Settings</span>
                </Button>
              </div>
            </div>
          </div>
        </header>  

      <div className="container mx-auto px-4 py-8">
        {/* AI Input Section */}
        <div className="flex flex-col items-center justify-center">
          <GitHubAiInput 
            onAnalyze={(url) => {
              setRepoUrl(url)
              handleAnalyze()
            }}
            isAnalyzing={isAnalyzing}
            hasAnalyzed={hasAnalyzed}
            className="mb-4"
          />
        </div>

        {/* Past Analyses - Always visible */}
        {!hasAnalyzed && !isAnalyzing && (
          <Card className="hover:shadow-md transition-shadow max-w-2xl mx-auto mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Past Analyses
              </CardTitle>
              <CardDescription>Recently analyzed repositories</CardDescription>
            </CardHeader>
           <CardContent className="space-y-2">
                    {pastAnalyses.length === 0 ? (
                      <div className="text-center py-6 text-muted-foreground">
                        <p>No past analyses found</p>
                        <p className="text-sm">Analyze a repository to see it here</p>
                      </div>
                    ) : (
                      pastAnalyses.map((analysis) => (
                        <div key={analysis.id} className="group relative">
                          {deleteConfirm === analysis.id ? (
                            // Confirmation Dialog
                            <div className="border border-red-200  rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle className="h-4 w-4 text-red-600" />
                                <span className="text-sm font-medium text-red-800">Confirm Delete</span>
                              </div>
                              <p className="text-sm text-red-700 mb-3">
                                Are you sure you want to delete the analysis for <strong>{analysis.repo_name}</strong>?
                                This action cannot be undone.
                              </p>
                              <div className="flex gap-2 bg-transparent">
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDeleteAnalysis(analysis.id)}
                                  disabled={isDeleting}
                                >
                                  {isDeleting ? 'Deleting...' : 'Delete'}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setDeleteConfirm(null)}
                                  disabled={isDeleting}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            // Normal Analysis Item
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                className="flex-1 justify-start h-auto p-3 text-left hover:bg-muted/80"
                                onClick={async () => {
                                  setRepoUrl(analysis.repo_url)
                                  setIsAnalyzing(true)
                                  setError(null)
                                  
                                  try {
                                    // Re-analyze the repository to get comprehensive data
                                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analyze`, {
                                      method: 'POST',
                                      headers: {
                                        'Content-Type': 'application/json',
                                      },
                                      body: JSON.stringify({ repo_url: analysis.repo_url }),
                                    })

                                    if (!response.ok) {
                                      throw new Error(`Error: ${response.status} ${response.statusText}`)
                                    }

                                    const analysisResult = await response.json()
                                    
                                    // Use the comprehensive data from re-analysis
                                    setAnalysisData({
                                      repo_name: analysisResult.repo_name,
                                      owner: analysisResult.owner,
                                      description: analysisResult.description || "Repository analysis",
                                      stars: analysisResult.stars,
                                      forks: analysisResult.forks,
                                      watchers: analysisResult.watchers || 0,
                                      languages: analysisResult.languages || {},
                                      size: analysisResult.size || 0,
                                      created_at: analysisResult.created_at || new Date().toISOString(),
                                      total_commits: analysisResult.total_commits,
                                      total_contributors: analysisResult.total_contributors,
                                      last_commit_date: analysisResult.last_commit_date || analysisResult.analyzed_at,
                                      branches_count: analysisResult.branches_count || 0,
                                      most_modified_files: analysisResult.most_modified_files || [],
                                      top_contributors: analysisResult.top_contributors || [],
                                      commit_activity: analysisResult.commit_activity || [],
                                      file_structure: analysisResult.file_structure || {},
                                      html_url: analysisResult.html_url || analysisResult.repo_url,
                                      avatar_url: analysisResult.avatar_url || "",
                                      open_issues: analysisResult.open_issues || 0
                                    })
                                    setHasAnalyzed(true)
                                    
                                    // Refresh past analyses list
                                    const pastAnalysesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/past-analyses`)
                                    if (pastAnalysesResponse.ok) {
                                      const pastData = await pastAnalysesResponse.json()
                                      setPastAnalyses(pastData.analyses || [])
                                    }
                                  } catch (err) {
                                    setError(err instanceof Error ? err.message : 'An error occurred')
                                    // Fallback to basic data from database if re-analysis fails
                                    setAnalysisData({
                                      repo_name: analysis.repo_name,
                                      owner: analysis.owner,
                                      description: "Repository analysis",
                                      stars: analysis.stars,
                                      forks: analysis.forks,
                                      watchers: 0,
                                      languages: {},
                                      size: 0,
                                      created_at: analysis.analyzed_at,
                                      total_commits: analysis.total_commits,
                                      total_contributors: analysis.total_contributors,
                                      last_commit_date: analysis.analyzed_at,
                                      branches_count: 0,
                                      most_modified_files: [],
                                      top_contributors: [],
                                      commit_activity: [],
                                      file_structure: {},
                                      html_url: analysis.repo_url,
                                      avatar_url: "",
                                      open_issues: 0
                                    })
                                    setHasAnalyzed(true)
                                  } finally {
                                    setIsAnalyzing(false)
                                  }
                                }}
                              >
                                <div className="flex flex-col items-start gap-1 w-full">
                                  <div className="flex items-center justify-between w-full">
                                    <span className="font-medium text-sm truncate">{analysis.repo_name}</span>
                                    <span className="text-xs text-muted-foreground">⭐ {analysis.stars.toLocaleString()}</span>
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(analysis.analyzed_at).toLocaleDateString()}
                                  </span>
                                </div>
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 "
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  setDeleteConfirm(analysis.id)
                                }}
                                title="Delete analysis"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </CardContent>
          </Card>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-6 flex justify-center">
            <Card className="w-full max-w-2xl border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-red-800">
                  <div className="h-4 w-4 rounded-full bg-red-500" />
                  <span className="font-medium">Error</span>
                </div>
                <p className="mt-2 text-sm text-red-700">{error}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {(hasAnalyzed || isAnalyzing) && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Content Area */}
            <div className="lg:col-span-3 space-y-6">
              {isAnalyzing && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                      <CardHeader className="pb-2">
                        <Skeleton className="h-4 w-24" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-8 w-16 mb-2" />
                        <Skeleton className="h-4 w-20" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                      <CardHeader>
                        <Skeleton className="h-5 w-32" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-64 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {hasAnalyzed && !isAnalyzing && (
              <>
                {/* Overview Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Commits</CardTitle>
                      <GitCommit className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analysisData?.total_commits || 'N/A'}</div>
                      <p className="text-xs text-muted-foreground">Commits found</p>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Contributors</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analysisData?.total_contributors || 'N/A'}</div>
                      <p className="text-xs text-muted-foreground">Active contributors</p>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Last Commit</CardTitle>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {analysisData?.last_commit_date && analysisData.last_commit_date !== 'N/A' 
                          ? new Date(analysisData.last_commit_date).toLocaleDateString()
                          : 'N/A'
                        }
                      </div>
                      <p className="text-xs text-muted-foreground">Last commit date</p>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Branches</CardTitle>
                      <GitBranch className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analysisData?.branches_count || 'N/A'}</div>
                      <p className="text-xs text-muted-foreground">Active branches</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Enhanced Charts Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {/* Enhanced Commit Activity Chart */}
                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle>Repository Activity</CardTitle>
                      <CardDescription>Commits, Issues, and Pull Requests over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px] w-full">
                        <ChartContainer
                          config={{
                            commits: {
                              label: "Commits",
                              color: "hsl(var(--chart-1))",
                            },
                            issues: {
                              label: "Issues",
                              color: "hsl(var(--chart-2))",
                            },
                            prs: {
                              label: "Pull Requests",
                              color: "hsl(var(--chart-3))",
                            },
                          }}
                          className="h-full w-full"
                        >
                          <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={getCommitActivityData()} margin={{ top: 5, right: 40, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                            <XAxis
                              dataKey="month"
                              tick={{ fontSize: 12 }}
                              tickLine={{ stroke: "hsl(var(--border))" }}
                            />
                            <YAxis tick={{ fontSize: 12 }} tickLine={{ stroke: "hsl(var(--border))" }} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="commits"
                              stroke="hsl(var(--chart-1))"
                              strokeWidth={3}
                              dot={{ fill: "hsl(var(--chart-1))", strokeWidth: 2, r: 4 }}
                              activeDot={{ r: 6, stroke: "hsl(var(--chart-1))", strokeWidth: 2 }}
                            />
                            <Line
                              type="monotone"
                              dataKey="issues"
                              stroke="hsl(var(--chart-2))"
                              strokeWidth={2}
                              dot={{ fill: "hsl(var(--chart-2))", strokeWidth: 2, r: 3 }}
                            />
                            <Line
                              type="monotone"
                              dataKey="prs"
                              stroke="hsl(var(--chart-3))"
                              strokeWidth={2}
                              dot={{ fill: "hsl(var(--chart-3))", strokeWidth: 2, r: 3 }}
                            />
                          </LineChart>
                          </ResponsiveContainer>
                        </ChartContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Enhanced Top Contributors Chart */}
                  <Card className="hover:shadow-md transition-shadow bg-amber-50/10">
                    <CardHeader>
                      <CardTitle>Top Contributors</CardTitle>
                      <CardDescription>Most active contributors by commits and code changes</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px] w-full">
                        <ChartContainer
                          config={{
                            commits: {
                              label: "Commits",
                              color: "hsl(var(--chart-1))",
                            },
                            additions: {
                              label: "Lines Added",
                              color: "hsl(var(--chart-2))",
                            },
                          }}
                          className="h-full w-full"
                        >
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={getContributorsChartData()} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} tickLine={{ stroke: "hsl(var(--border))" }} />
                            <YAxis tick={{ fontSize: 12 }} tickLine={{ stroke: "hsl(var(--border))" }} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Legend />
                            <Bar dataKey="contributions" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                        </ChartContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Enhanced Language Distribution Chart */}
                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle>Language Distribution</CardTitle>
                      <CardDescription>Programming languages by percentage and lines of code</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px] w-full">
                        <ChartContainer
                          config={{
                            value: {
                              label: "Percentage",
                            },
                          }}
                          className="h-full w-full"
                        >
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={getLanguageChartData()}
                              cx="50%"
                              cy="50%"
                              outerRadius={100}
                              innerRadius={40}
                              dataKey="value"
                              label={({ name, value }) => `${name}: ${value}%`}
                              labelLine={false}
                            >
                              {getLanguageChartData().map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <ChartTooltip
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  const data = payload[0].payload
                                  return (
                                    <div className="bg-background border rounded-lg p-3 shadow-md">
                                      <p className="font-medium">{data.name}</p>
                                      <p className="text-sm text-muted-foreground">
                                        {data.value}% ({data.bytes?.toLocaleString()} bytes)
                                      </p>
                                    </div>
                                  )
                                }
                                return null
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                        </ChartContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Enhanced File Type Distribution Chart */}
                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle>File Type Distribution</CardTitle>
                      <CardDescription>Distribution of file extensions and counts</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px] w-full">
                        <ChartContainer
                          config={{
                            value: {
                              label: "Percentage",
                            },
                          }}
                          className="h-full w-full"
                        >
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={getFileTypeChartData()}
                              cx="50%"
                              cy="50%"
                              outerRadius={100}
                              innerRadius={40}
                              dataKey="value"
                              label={({ name, value }) => `${name}: ${value}%`}
                              labelLine={false}
                            >
                              {getFileTypeChartData().map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <ChartTooltip
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  const data = payload[0].payload
                                  return (
                                    <div className="bg-background border rounded-lg p-3 shadow-md">
                                      <p className="font-medium">{data.name}</p>
                                      <p className="text-sm text-muted-foreground">
                                        {data.value}% ({data.count} files)
                                      </p>
                                    </div>
                                  )
                                }
                                return null
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                        </ChartContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Most Modified Files Table */}
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle>Most Modified Files</CardTitle>
                    <CardDescription>
                      Files with the highest number of changes, additions, and deletions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="min-w-[200px]">File Path</TableHead>
                            <TableHead className="text-right">Changes</TableHead>
                            <TableHead className="text-right text-green-600">Additions</TableHead>
                            <TableHead className="text-right text-red-600">Deletions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {analysisData?.most_modified_files && analysisData.most_modified_files.length > 0 ? (
                            analysisData.most_modified_files
                              .slice(0, 5)
                              .map((file, index) => (
                                <TableRow key={index} className="hover:bg-muted/50">
                                  <TableCell className="font-mono text-sm">{file.path}</TableCell>
                                  <TableCell className="text-right font-semibold">
                                    {file.changes || (file.additions || 0) + (file.deletions || 0)}
                                  </TableCell>
                                  <TableCell className="text-right text-green-600">
                                    +{file.additions || 0}
                                  </TableCell>
                                  <TableCell className="text-right text-red-600">
                                    -{file.deletions || 0}
                                  </TableCell>
                                </TableRow>
                              ))
                          ) : (
                            // Mock data for demonstration since detailed file stats require additional API calls
                            [
                              { path: "src/components/main.tsx", changes: 245, additions: 180, deletions: 65 },
                              { path: "package.json", changes: 89, additions: 67, deletions: 22 },
                              { path: "README.md", changes: 156, additions: 120, deletions: 36 },
                              { path: "src/utils/helpers.ts", changes: 78, additions: 45, deletions: 33 },
                              { path: "src/styles/globals.css", changes: 34, additions: 28, deletions: 6 }
                            ].map((file, index) => (
                              <TableRow key={index} className="hover:bg-muted/50">
                                <TableCell className="font-mono text-sm">{file.path}</TableCell>
                                <TableCell className="text-right font-semibold">{file.changes}</TableCell>
                                <TableCell className="text-right text-green-600">+{file.additions}</TableCell>
                                <TableCell className="text-right text-red-600">-{file.deletions}</TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>

                {/* Past Analyses */}
                <Card className="hover:shadow-md transition-shadow bg-transparent">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Past Analyses
                    </CardTitle>
                    <CardDescription>Recently analyzed repositories</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {pastAnalyses.length === 0 ? (
                      <div className="text-center py-6 text-muted-foreground">
                        <p>No past analyses found</p>
                        <p className="text-sm">Analyze a repository to see it here</p>
                      </div>
                    ) : (
                      pastAnalyses.map((analysis) => (
                        <div key={analysis.id} className="group relative">
                          {deleteConfirm === analysis.id ? (
                            // Confirmation Dialog
                            <div className="border border-red-200 bg-red-50/10 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle className="h-4 w-4 text-red-600" />
                                <span className="text-sm font-medium text-red-800">Confirm Delete</span>
                              </div>
                              <p className="text-sm text-red-700 mb-3">
                                Are you sure you want to delete the analysis for <strong>{analysis.repo_name}</strong>?
                                This action cannot be undone.
                              </p>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDeleteAnalysis(analysis.id)}
                                  disabled={isDeleting}
                                >
                                  {isDeleting ? 'Deleting...' : 'Delete'}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setDeleteConfirm(null)}
                                  disabled={isDeleting}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            // Normal Analysis Item
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                className="flex-1 justify-start h-auto p-3 text-left hover:bg-muted/80"
                                onClick={async () => {
                                  setRepoUrl(analysis.repo_url)
                                  setIsAnalyzing(true)
                                  setError(null)
                                  
                                  try {
                                    // Re-analyze the repository to get comprehensive data
                                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analyze`, {
                                      method: 'POST',
                                      headers: {
                                        'Content-Type': 'application/json',
                                      },
                                      body: JSON.stringify({ repo_url: analysis.repo_url }),
                                    })

                                    if (!response.ok) {
                                      throw new Error(`Error: ${response.status} ${response.statusText}`)
                                    }

                                    const analysisResult = await response.json()
                                    
                                    // Use the comprehensive data from re-analysis
                                    setAnalysisData({
                                      repo_name: analysisResult.repo_name,
                                      owner: analysisResult.owner,
                                      description: analysisResult.description || "Repository analysis",
                                      stars: analysisResult.stars,
                                      forks: analysisResult.forks,
                                      watchers: analysisResult.watchers || 0,
                                      languages: analysisResult.languages || {},
                                      size: analysisResult.size || 0,
                                      created_at: analysisResult.created_at || new Date().toISOString(),
                                      total_commits: analysisResult.total_commits,
                                      total_contributors: analysisResult.total_contributors,
                                      last_commit_date: analysisResult.last_commit_date || analysisResult.analyzed_at,
                                      branches_count: analysisResult.branches_count || 0,
                                      most_modified_files: analysisResult.most_modified_files || [],
                                      top_contributors: analysisResult.top_contributors || [],
                                      commit_activity: analysisResult.commit_activity || [],
                                      file_structure: analysisResult.file_structure || {},
                                      html_url: analysisResult.html_url || analysisResult.repo_url,
                                      avatar_url: analysisResult.avatar_url || "",
                                      open_issues: analysisResult.open_issues || 0
                                    })
                                    setHasAnalyzed(true)
                                    
                                    // Refresh past analyses list
                                    const pastAnalysesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/past-analyses`)
                                    if (pastAnalysesResponse.ok) {
                                      const pastData = await pastAnalysesResponse.json()
                                      setPastAnalyses(pastData.analyses || [])
                                    }
                                  } catch (err) {
                                    setError(err instanceof Error ? err.message : 'An error occurred')
                                    // Fallback to basic data from database if re-analysis fails
                                    setAnalysisData({
                                      repo_name: analysis.repo_name,
                                      owner: analysis.owner,
                                      description: "Repository analysis",
                                      stars: analysis.stars,
                                      forks: analysis.forks,
                                      watchers: 0,
                                      languages: {},
                                      size: 0,
                                      created_at: analysis.analyzed_at,
                                      total_commits: analysis.total_commits,
                                      total_contributors: analysis.total_contributors,
                                      last_commit_date: analysis.analyzed_at,
                                      branches_count: 0,
                                      most_modified_files: [],
                                      top_contributors: [],
                                      commit_activity: [],
                                      file_structure: {},
                                      html_url: analysis.repo_url,
                                      avatar_url: "",
                                      open_issues: 0
                                    })
                                    setHasAnalyzed(true)
                                  } finally {
                                    setIsAnalyzing(false)
                                  }
                                }}
                              >
                                <div className="flex flex-col items-start gap-1 w-full">
                                  <div className="flex items-center justify-between w-full">
                                    <span className="font-medium text-sm truncate">{analysis.repo_name}</span>
                                    <span className="text-xs text-muted-foreground">⭐ {analysis.stars.toLocaleString()}</span>
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(analysis.analyzed_at).toLocaleDateString()}
                                  </span>
                                </div>
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  setDeleteConfirm(analysis.id)
                                }}
                                title="Delete analysis"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </>
            )}

          </div>

          {/* Enhanced Sidebar with Profile and Analysis */}
          <div className="lg:col-span-1 space-y-6">
            {/* Repository Information - Always visible */}
            {(hasAnalyzed || isAnalyzing) && (
              <RepositoryInfo 
                repoUrl={repoUrl}
                analysisData={analysisData || undefined}
              />
            )}

            {/* Profile Section - Always visible when analyzed */}
            {hasAnalyzed && !isAnalyzing && analysisData && <ProfileSection analysisData={analysisData} />}

            {/* Analysis Overview - Always visible when analyzed */}
            {hasAnalyzed && !isAnalyzing && analysisData && <AnalysisOverview analysisData={analysisData} />}
            </div>
          </div>
        )}

        {/* Settings Panel */}
        <SettingsPanel isOpen={showSettings} onClose={() => setShowSettings(false)} />
        </div>
      </div>
    </main>
  )
}
