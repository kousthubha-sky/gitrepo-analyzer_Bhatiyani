"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { useTheme } from "next-themes"
import { X, Palette, Database,  Monitor, Sun, Moon } from "lucide-react"

interface SettingsPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const { theme, setTheme } = useTheme()
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    analysisAlerts: true,
    weeklyReports: true,
    autoSave: true,
    dataRetention: 30,
    exportFormat: "json",
    chartAnimations: true,
    compactMode: false,
    language: "en",
  })

  const updateSetting = (key: keyof typeof settings, value: boolean | number | string) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed right-0 top-0 h-full w-full max-w-md border-l bg-background shadow-lg">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="text-lg font-semibold">Settings</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Theme Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Appearance
                </CardTitle>
                <CardDescription>Customize the look and feel of your dashboard</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant={theme === "light" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTheme("light")}
                      className="flex items-center gap-2"
                    >
                      <Sun className="h-3 w-3" />
                      Light
                    </Button>
                    <Button
                      variant={theme === "dark" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTheme("dark")}
                      className="flex items-center gap-2"
                    >
                      <Moon className="h-3 w-3" />
                      Dark
                    </Button>
                    <Button
                      variant={theme === "system" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTheme("system")}
                      className="flex items-center gap-2"
                    >
                      <Monitor className="h-3 w-3" />
                      Auto
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Chart Animations</Label>
                    <p className="text-xs text-muted-foreground">Enable smooth transitions in charts</p>
                  </div>
                  <Switch
                    checked={settings.chartAnimations}
                    onCheckedChange={(checked) => updateSetting("chartAnimations", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Compact Mode</Label>
                    <p className="text-xs text-muted-foreground">Reduce spacing and padding</p>
                  </div>
                  <Switch
                    checked={settings.compactMode}
                    onCheckedChange={(checked) => updateSetting("compactMode", checked)}
                  />
                </div>
              </CardContent>
            </Card>

            

            {/* Data & Privacy */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Data & Privacy
                </CardTitle>
                <CardDescription>Control your data and privacy settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                

                <div className="space-y-2">
                  <Label>Data Retention (days)</Label>
                  <div className="px-2">
                    <Slider
                      value={[settings.dataRetention]}
                      onValueChange={(value) => updateSetting("dataRetention", value[0])}
                      max={365}
                      min={7}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>7 days</span>
                      <span>{settings.dataRetention} days</span>
                      <span>365 days</span>
                    </div>
                  </div>
                </div>

                
              </CardContent>
            </Card>

            
          </div>

          <div className="border-t p-4">
            <div className="flex gap-2">
              <Button onClick={onClose} className="flex-1">
                Save Changes
              </Button>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
