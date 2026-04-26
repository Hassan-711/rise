'use client'

import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, RadarChart,
  Radar, PolarGrid, PolarAngleAxis, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, Clock, CheckSquare, BookOpen, Map, Calendar } from 'lucide-react'

// ── Sample analytics data ──────────────────────────────────────────────────────
const DAILY_STUDY = [
  { day: 'Mon', hours: 4.5, tasks: 6 },
  { day: 'Tue', hours: 3.0, tasks: 4 },
  { day: 'Wed', hours: 5.5, tasks: 7 },
  { day: 'Thu', hours: 2.5, tasks: 3 },
  { day: 'Fri', hours: 6.0, tasks: 8 },
  { day: 'Sat', hours: 4.0, tasks: 5 },
  { day: 'Sun', hours: 1.5, tasks: 2 },
]

const WEEKLY_PRODUCTIVITY = [
  { week: 'W1', score: 62, study: 18, tasks: 24 },
  { week: 'W2', score: 71, study: 22, tasks: 31 },
  { week: 'W3', score: 58, study: 15, tasks: 19 },
  { week: 'W4', score: 80, study: 28, tasks: 38 },
  { week: 'W5', score: 75, study: 24, tasks: 35 },
  { week: 'W6', score: 88, study: 30, tasks: 42 },
]

const SUBJECT_PROGRESS = [
  { subject: 'Applied Math IV', progress: 85, color: '#6366f1' },
  { subject: 'Java', progress: 90, color: '#f59e0b' },
  { subject: 'DNN', progress: 88, color: '#10b981' },
  { subject: 'TOC', progress: 80, color: '#f43f5e' },
  { subject: 'OS', progress: 82, color: '#8b5cf6' },
]

const SKILL_RADAR = [
  { skill: 'DSA', current: 72, target: 90 },
  { skill: 'Python', current: 35, target: 85 },
  { skill: 'Backend', current: 30, target: 80 },
  { skill: 'AI/ML', current: 55, target: 75 },
  { skill: 'System Design', current: 10, target: 70 },
  { skill: 'Projects', current: 25, target: 80 },
]

const MONTHLY_CONSISTENCY = [
  { month: 'Oct', rate: 55 },
  { month: 'Nov', rate: 62 },
  { month: 'Dec', rate: 48 },
  { month: 'Jan', rate: 70 },
  { month: 'Feb', rate: 75 },
  { month: 'Mar', rate: 68 },
  { month: 'Apr', rate: 82 },
]

// ── Custom Tooltip ─────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-lg p-3 border border-border/50 text-xs shadow-xl">
      <p className="font-semibold text-foreground mb-2">{label}</p>
      {payload.map(({ name, value, color }) => (
        <div key={name} className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full" style={{ background: color }} />
          <span className="text-muted-foreground capitalize">{name}:</span>
          <span className="font-medium text-foreground">{value}</span>
        </div>
      ))}
    </div>
  )
}

export default function AnalyticsPage() {
  const totalHours = DAILY_STUDY.reduce((s, d) => s + d.hours, 0)
  const totalTasks = DAILY_STUDY.reduce((s, d) => s + d.tasks, 0)
  const avgScore = Math.round(WEEKLY_PRODUCTIVITY.reduce((s, w) => s + w.score, 0) / WEEKLY_PRODUCTIVITY.length)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">Your productivity insights at a glance</p>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Clock, label: 'Study Hours (Week)', value: `${totalHours}h`, color: 'text-blue-400', bg: 'bg-blue-400/10' },
          { icon: CheckSquare, label: 'Tasks Completed', value: totalTasks, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
          { icon: TrendingUp, label: 'Avg Productivity', value: `${avgScore}%`, color: 'text-violet-400', bg: 'bg-violet-400/10' },
          { icon: Calendar, label: 'Current Streak', value: '7 days 🔥', color: 'text-amber-400', bg: 'bg-amber-400/10' },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <Card key={label} className="p-4">
            <div className="flex items-center gap-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${bg}`}>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className={`text-lg font-bold ${color}`}>{value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Daily study hours */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-400" />
              Daily Study Hours (This Week)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={DAILY_STUDY} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="studyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="hours" name="Hours" stroke="#6366f1" fill="url(#studyGrad)" strokeWidth={2} dot={{ fill: '#6366f1', r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Weekly productivity */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-violet-400" />
              Weekly Productivity Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={WEEKLY_PRODUCTIVITY} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="score" name="Score" stroke="#8b5cf6" strokeWidth={2.5} dot={{ fill: '#8b5cf6', r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Subject progress bar chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-emerald-400" />
              Subject Progress Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={SUBJECT_PROGRESS} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                <XAxis dataKey="subject" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="progress" name="Progress" radius={[4, 4, 0, 0]}>
                  {SUBJECT_PROGRESS.map((entry, index) => (
                    <rect key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Skill Radar */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Map className="h-4 w-4 text-amber-400" />
              Skill Assessment Radar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={SKILL_RADAR} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="skill" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <Radar name="Current" dataKey="current" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} strokeWidth={2} />
                <Radar name="Target" dataKey="target" stroke="#10b981" fill="#10b981" fillOpacity={0.08} strokeWidth={1.5} strokeDasharray="4 2" />
                <Legend wrapperStyle={{ fontSize: 11, color: 'hsl(var(--muted-foreground))' }} />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly consistency */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Calendar className="h-4 w-4 text-rose-400" />
              Monthly Consistency Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={MONTHLY_CONSISTENCY} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="consistencyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="rate" name="Consistency" stroke="#f43f5e" fill="url(#consistencyGrad)" strokeWidth={2.5} dot={{ fill: '#f43f5e', r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
