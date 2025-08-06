"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { User, LinkIcon, Calendar } from "lucide-react"

import { useEffect, useState } from "react"


interface LanguageData {
  bytes: number;
  percentage: number;
}

interface Profile {
  name: string;
  description: string;
  website: string;
  joined: string;
  avatar: string;
  stars: number;
  forks: number;
  issues: number;
  languages: Record<string, LanguageData>;
}

interface AnalysisData {
  owner: string;
  repo_name: string;
  description: string;
  stars: number;
  forks: number;
  html_url?: string;
  created_at: string;
  avatar_url?: string;
  size: number;
  open_issues: number;
  languages: Record<string, LanguageData>;
}

interface ProfileSectionProps {
  analysisData?: AnalysisData;
}

export function ProfileSection({ analysisData }: ProfileSectionProps) {
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    if (analysisData) {
      setProfile({
        name: analysisData.owner,
        description: analysisData.description || "No description available",
        website: analysisData.html_url || "N/A",
        joined: new Date(analysisData.created_at).toLocaleDateString(),
        avatar: analysisData.avatar_url || "/placeholder.svg?height=64&width=64",
        stars: analysisData.stars,
        forks: analysisData.forks,
        issues: analysisData.open_issues,
        languages: analysisData.languages || {}
      })
    }
  }, [analysisData])

  if (!profile) return null

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Repository Owner
        </CardTitle>
        <CardDescription>Profile information and statistics</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profile.avatar} alt="Repository Owner" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <div>
              <h3 className="font-semibold text-lg">{profile.name}</h3>
              <p className="text-sm text-muted-foreground">{profile.description}</p>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <LinkIcon className="h-3 w-3" />
                {profile.website}
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-3 w-3" />
              Joined {profile.joined}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold">{profile.stars}</div>
            <div className="text-xs text-muted-foreground">Stars</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{profile.forks}</div>
            <div className="text-xs text-muted-foreground">Forks</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{profile.issues}</div>
            <div className="text-xs text-muted-foreground">Open Issues</div>
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t">
          <h4 className="font-medium text-sm">Top Languages</h4>
          <div className="space-y-2">
            {Object.entries(profile.languages || {})
              .sort(([, a], [, b]) => b.percentage - a.percentage)
              .slice(0, 3)
              .map(([language, data]) => (
                <div key={language}>
                  <div className="flex items-center justify-between text-sm">
                    <span>{language}</span>
                    <span className="text-muted-foreground">{data.percentage.toFixed(1)}%</span>
                  </div>
                  <Progress value={data.percentage} className="h-2" />
                </div>
              ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
