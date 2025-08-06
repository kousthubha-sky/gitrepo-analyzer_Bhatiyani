"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, Activity, AlertCircle, CheckCircle, Clock } from "lucide-react"

interface AnalysisData {
  total_commits: number;
  total_contributors: number;
  open_issues: number;
  last_commit_date: string;
  commit_activity: Array<{
    month: string;
    commits: number;
    issues: number;
    prs: number;
  }>;
}

interface AnalysisOverviewProps {
  analysisData?: AnalysisData;
}

export function AnalysisOverview({ analysisData }: AnalysisOverviewProps) {
  if (!analysisData) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Analysis Overview
          </CardTitle>
          <CardDescription>Waiting for repository analysis...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-6">
            <p className="text-muted-foreground">Enter a repository URL to begin analysis</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const lastAnalysisTime = "Just now";
  
  // Calculate commit frequency trend
  const recentMonths = analysisData.commit_activity?.slice(-2) || [];
  const commitTrend = recentMonths.length === 2 && recentMonths[0].commits > 0
    ? ((recentMonths[1].commits - recentMonths[0].commits) / recentMonths[0].commits * 100).toFixed(0)
    : "0";

  // Calculate health score based on various metrics
  const healthScore = Math.min(100, Math.round(
    (analysisData.total_commits > 0 ? 25 : 0) +
    (analysisData.total_contributors > 1 ? 25 : 0) +
    (analysisData.last_commit_date && new Date().getTime() - new Date(analysisData.last_commit_date).getTime() < 30 * 24 * 60 * 60 * 1000 ? 25 : 0) + // Active in last 30 days
    (analysisData.commit_activity?.some(m => m.commits > 0) ? 25 : 0) // Has recent activity
  ));

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Analysis Overview
        </CardTitle>
        <CardDescription>Current repository analysis status and insights</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Analysis Status */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Analysis Status</h4>
            <Badge variant="default" className="bg-green-500">
              <CheckCircle className="h-3 w-3 mr-1" />
              Complete
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground">Last analyzed: {lastAnalysisTime}</div>
        </div>

        {/* Health Score */}
        <div className="space-y-3 pt-4 border-t">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Repository Health</h4>
            <span className={`text-2xl font-bold ${healthScore >= 75 ? 'text-green-600' : healthScore >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
              {healthScore}%
            </span>
          </div>
          <Progress value={healthScore} className="h-3" />
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              {(analysisData.total_commits || 0) > 0 ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
              <span>Active commits</span>
            </div>
            <div className="flex items-center gap-2">
              {(analysisData.total_contributors || 0) > 1 ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-yellow-500" />
              )}
              <span>Multiple contributors</span>
            </div>
            <div className="flex items-center gap-2">
              {analysisData.last_commit_date && 
               new Date().getTime() - new Date(analysisData.last_commit_date).getTime() < 30 * 24 * 60 * 60 * 1000 ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-yellow-500" />
              )}
              <span>Recent activity</span>
            </div>
            <div className="flex items-center gap-2">
              {analysisData.commit_activity?.some(m => (m.commits || 0) > 0) ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
              <span>Ongoing development</span>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="space-y-3 pt-4 border-t">
          <h4 className="font-medium text-sm">Key Insights</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                {Number(commitTrend) > 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm">Commit Frequency</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">{commitTrend}%</div>
                <div className="text-xs text-muted-foreground">vs last month</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm">Contributors</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">{analysisData.total_contributors || 0}</div>
                <div className="text-xs text-muted-foreground">total contributors</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">Open Issues</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">{analysisData.open_issues || 0}</div>
                <div className="text-xs text-muted-foreground">issues to resolve</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-3 pt-4 border-t">
          <h4 className="font-medium text-sm">Recent Activity</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-sm">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span>Last commit</span>
              <span className="text-muted-foreground ml-auto">
                {analysisData.last_commit_date 
                  ? new Date(analysisData.last_commit_date).toLocaleDateString()
                  : 'N/A'}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span>Total commits</span>
              <span className="text-muted-foreground ml-auto">{analysisData.total_commits || 0}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span>Recent activity</span>
              <span className="text-muted-foreground ml-auto">
                {analysisData.commit_activity?.[analysisData.commit_activity.length - 1]?.commits || 0} commits this month
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
