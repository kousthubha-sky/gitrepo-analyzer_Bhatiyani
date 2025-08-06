"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, GitFork, Eye, ExternalLink } from "lucide-react"

interface RepositoryInfoProps {
  repoUrl: string;
  analysisData?: {
    repo_name: string;
    description: string;
    stars: number;
    forks: number;
    watchers: number;
    languages: Record<string, { bytes: number; percentage: number }>;
    topics?: string[];
    license?: string;
    size: number;
    created_at: string;
  };
}

export function RepositoryInfo({ repoUrl, analysisData }: RepositoryInfoProps) {
  const repoName = analysisData?.repo_name || (repoUrl.includes("github.com")
    ? repoUrl.split("github.com/")[1]?.replace(/\/$/, "") || "Unknown Repository"
    : repoUrl)

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="truncate">{repoName}</span>
          <Button variant="outline" size="sm" asChild>
            <a href={repoUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </CardTitle>
        <CardDescription>{analysisData?.description || 'No description available'}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Repository Stats */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-500" />
            <span className="font-medium">{analysisData?.stars.toLocaleString() || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-1">
            <GitFork className="h-4 w-4 text-blue-500" />
            <span className="font-medium">{analysisData?.forks.toLocaleString() || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4 text-green-500" />
            <span className="font-medium">{analysisData?.watchers?.toLocaleString() || 'N/A'}</span>
          </div>
        </div>

        {/* Topics/Tags */}
        {analysisData?.topics && analysisData.topics.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {analysisData.topics.map((topic) => (
              <Badge key={topic} variant="secondary">{topic}</Badge>
            ))}
          </div>
        )}

        {/* Repository Details */}
        <div className="space-y-3 pt-4 border-t">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Primary Language:</span>
              <span className="ml-2 font-medium">
                {Object.entries(analysisData?.languages || {})
                  .sort(([, a], [, b]) => b.percentage - a.percentage)[0]?.[0] || 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">License:</span>
              <span className="ml-2 font-medium">{analysisData?.license || 'Not specified'}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Size:</span>
              <span className="ml-2 font-medium">
                {analysisData ? `${(analysisData.size / 1024).toFixed(2)} MB` : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Created:</span>
              <span className="ml-2 font-medium">
                {analysisData?.created_at ? new Date(analysisData.created_at).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
