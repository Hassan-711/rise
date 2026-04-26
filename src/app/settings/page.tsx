'use client'

import { useState } from 'react'
import { useTheme } from 'next-themes'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  User, Palette, Bell, Shield, Database, Trash2,
  Sun, Moon, Monitor, Save, ExternalLink, Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from '@/components/ui/toaster'

type Section = 'profile' | 'appearance' | 'notifications' | 'data' | 'account'

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [activeSection, setActiveSection] = useState<Section>('profile')
  const [saving, setSaving] = useState(false)

  const [profile, setProfile] = useState({
    full_name: 'Hassan',
    email: 'hassan@example.com',
    phone: '+91 9876543210',
    university: 'Amity University Lucknow',
    degree: 'B.Tech CSE',
    enrollment_no: 'A7605224098',
    cgpa: '8.86',
    linkedin_url: 'linkedin.com/in/hassan',
    github_url: 'github.com/hassan',
    portfolio_url: 'hassan.dev',
  })

  const [notifications, setNotifications] = useState({
    dailyReminder: true,
    streakAlert: true,
    examCountdown: true,
    weeklyReview: false,
    taskDue: true,
  })

  async function handleSave() {
    setSaving(true)
    await new Promise(r => setTimeout(r, 800))
    setSaving(false)
    toast({ title: '✅ Settings saved!', description: 'Your profile has been updated.' })
  }

  const SECTIONS = [
    { key: 'profile' as Section, label: 'Profile', icon: User },
    { key: 'appearance' as Section, label: 'Appearance', icon: Palette },
    { key: 'notifications' as Section, label: 'Notifications', icon: Bell },
    { key: 'data' as Section, label: 'Data & Export', icon: Database },
    { key: 'account' as Section, label: 'Account', icon: Shield },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your account and preferences</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar nav */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {SECTIONS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveSection(key)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                  activeSection === key
                    ? 'bg-primary/10 text-foreground border border-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                )}
              >
                <Icon className={cn('h-4 w-4', activeSection === key && 'text-primary')} />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-4">

          {/* ── PROFILE ── */}
          {activeSection === 'profile' && (
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal and academic details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input value={profile.full_name} onChange={e => setProfile({ ...profile, full_name: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>CGPA</Label>
                    <Input value={profile.cgpa} onChange={e => setProfile({ ...profile, cgpa: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>University</Label>
                    <Input value={profile.university} onChange={e => setProfile({ ...profile, university: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Enrollment No.</Label>
                    <Input value={profile.enrollment_no} onChange={e => setProfile({ ...profile, enrollment_no: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>LinkedIn URL</Label>
                    <Input value={profile.linkedin_url} onChange={e => setProfile({ ...profile, linkedin_url: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>GitHub URL</Label>
                    <Input value={profile.github_url} onChange={e => setProfile({ ...profile, github_url: e.target.value })} />
                  </div>
                  <div className="sm:col-span-2 space-y-2">
                    <Label>Portfolio URL</Label>
                    <Input value={profile.portfolio_url} onChange={e => setProfile({ ...profile, portfolio_url: e.target.value })} />
                  </div>
                </div>
                <Button onClick={handleSave} className="gap-2" disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          )}

          {/* ── APPEARANCE ── */}
          {activeSection === 'appearance' && (
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize how RiseOS looks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Theme</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'dark', label: 'Dark', icon: Moon },
                      { value: 'light', label: 'Light', icon: Sun },
                      { value: 'system', label: 'System', icon: Monitor },
                    ].map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        onClick={() => setTheme(value)}
                        className={cn(
                          'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                          theme === value
                            ? 'border-primary bg-primary/5 text-foreground'
                            : 'border-border text-muted-foreground hover:border-primary/30 hover:text-foreground'
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="text-xs font-medium">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Accent Color</Label>
                  <div className="flex gap-3">
                    {[
                      '#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e'
                    ].map(color => (
                      <button
                        key={color}
                        className="h-8 w-8 rounded-full border-2 border-transparent hover:border-foreground transition-all"
                        style={{ background: color }}
                        onClick={() => toast({ title: 'Color theming coming soon!' })}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">Custom accent colors coming in v2</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── NOTIFICATIONS ── */}
          {activeSection === 'notifications' && (
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Choose what you want to be reminded about</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: 'dailyReminder', label: 'Daily Study Reminder', desc: 'Get a reminder to study every day at 8 AM' },
                  { key: 'streakAlert', label: 'Streak Alerts', desc: 'Notify when your streak is at risk' },
                  { key: 'examCountdown', label: 'Exam Countdown', desc: 'Alerts 7 days, 3 days, and 1 day before exams' },
                  { key: 'taskDue', label: 'Task Due Reminders', desc: 'Remind when tasks are due soon' },
                  { key: 'weeklyReview', label: 'Weekly Review', desc: 'Sunday summary of your week\'s progress' },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-start justify-between gap-4 py-2">
                    <div>
                      <p className="text-sm font-medium">{label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                    </div>
                    <button
                      onClick={() => setNotifications(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))}
                      className={cn(
                        'relative h-6 w-11 rounded-full border-2 transition-colors shrink-0 mt-0.5',
                        notifications[key as keyof typeof notifications]
                          ? 'bg-primary border-primary'
                          : 'bg-secondary border-border'
                      )}
                    >
                      <div className={cn(
                        'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform',
                        notifications[key as keyof typeof notifications] ? 'translate-x-5' : 'translate-x-0.5'
                      )} />
                    </button>
                  </div>
                ))}
                <Button onClick={() => toast({ title: 'Notification prefs saved!' })} className="gap-2 mt-2">
                  <Save className="h-4 w-4" /> Save Preferences
                </Button>
              </CardContent>
            </Card>
          )}

          {/* ── DATA ── */}
          {activeSection === 'data' && (
            <div className="space-y-4 animate-fade-in">
              <Card>
                <CardHeader>
                  <CardTitle>Export Data</CardTitle>
                  <CardDescription>Download your data in various formats</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { label: 'Export Resume as PDF', desc: 'ATS-optimized PDF resume' },
                    { label: 'Export Tasks (CSV)', desc: 'All tasks and their status' },
                    { label: 'Export Analytics (JSON)', desc: 'Study logs and analytics data' },
                    { label: 'Export Full Profile', desc: 'Complete profile backup as JSON' },
                  ].map(({ label, desc }) => (
                    <div key={label} className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-sm font-medium">{label}</p>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => toast({ title: 'Export started!' })}>
                        Export
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Connected Services</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center text-sm">☁️</div>
                      <div>
                        <p className="text-sm font-medium">Supabase</p>
                        <p className="text-xs text-muted-foreground">Database & Auth</p>
                      </div>
                    </div>
                    <Badge variant="success">Connected</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ── ACCOUNT ── */}
          {activeSection === 'account' && (
            <div className="space-y-4 animate-fade-in">
              <Card>
                <CardHeader>
                  <CardTitle>Account Security</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Current Password</Label>
                    <Input type="password" placeholder="••••••••" />
                  </div>
                  <div className="space-y-2">
                    <Label>New Password</Label>
                    <Input type="password" placeholder="••••••••" />
                  </div>
                  <div className="space-y-2">
                    <Label>Confirm New Password</Label>
                    <Input type="password" placeholder="••••••••" />
                  </div>
                  <Button onClick={() => toast({ title: 'Password updated!' })}>Update Password</Button>
                </CardContent>
              </Card>

              <Card className="border-destructive/20">
                <CardHeader>
                  <CardTitle className="text-destructive flex items-center gap-2">
                    <Trash2 className="h-4 w-4" /> Danger Zone
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Delete Account</p>
                      <p className="text-xs text-muted-foreground">This action is irreversible. All data will be lost.</p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => toast({ title: 'Are you sure?', description: 'This would delete your account in production.', variant: 'destructive' })}
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
