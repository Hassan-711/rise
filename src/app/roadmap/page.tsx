'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Map, CheckCircle2, Circle, Clock, ChevronDown, ChevronUp,
  Target, Zap, Trophy, TrendingUp, Calendar, Code2, Brain,
  Server, GitBranch, Briefcase, GraduationCap, Star
} from 'lucide-react'
import { cn, formatDate, getCategoryColor, getStatusColor } from '@/lib/utils'
import { CAREER_ROADMAP_SEED } from '@/lib/utils/seedData'
import type { CareerGoal, CareerMilestone } from '@/lib/types'

// Hydrate seed data into CareerGoal type
const GOALS: CareerGoal[] = CAREER_ROADMAP_SEED.map((g, i) => ({
  id: String(i + 1),
  user_id: '',
  title: g.title,
  description: g.description,
  category: g.category as CareerGoal['category'],
  target_date: g.target_date,
  status: g.status as CareerGoal['status'],
  priority: g.priority,
  created_at: '',
  milestones: g.milestones.map((m, j) => ({
    id: `${i}-${j}`,
    goal_id: String(i + 1),
    user_id: '',
    title: m.title,
    description: null,
    target_date: m.target_date,
    completed_at: m.status === 'completed' ? m.target_date : null,
    status: m.status as CareerMilestone['status'],
    resources: [],
    created_at: '',
  })),
}))

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  dsa: <Code2 className="h-4 w-4" />,
  backend: <Server className="h-4 w-4" />,
  ai_ml: <Brain className="h-4 w-4" />,
  project: <GitBranch className="h-4 w-4" />,
  internship: <Briefcase className="h-4 w-4" />,
  placement: <Trophy className="h-4 w-4" />,
  system_design: <Zap className="h-4 w-4" />,
}

const CATEGORY_LABELS: Record<string, string> = {
  dsa: 'DSA', backend: 'Backend', ai_ml: 'AI/ML',
  project: 'Projects', internship: 'Internship',
  placement: 'Placement', system_design: 'System Design',
}

// Skill gaps to show
const SKILL_GAPS = [
  { skill: 'Python', current: 35, target: 85, priority: 'urgent' },
  { skill: 'FastAPI', current: 20, target: 80, priority: 'high' },
  { skill: 'PostgreSQL', current: 40, target: 75, priority: 'high' },
  { skill: 'Docker', current: 20, target: 65, priority: 'medium' },
  { skill: 'Redis', current: 15, target: 60, priority: 'medium' },
  { skill: 'System Design', current: 10, target: 70, priority: 'medium' },
]

export default function RoadmapPage() {
  const [expanded, setExpanded] = useState<string | null>('1')
  const [activeTab, setActiveTab] = useState<'roadmap' | 'skills' | 'placement'>('roadmap')

  const totalMilestones = GOALS.flatMap(g => g.milestones || []).length
  const completedMilestones = GOALS.flatMap(g => g.milestones || []).filter(m => m.status === 'completed').length
  const overallProgress = Math.round((completedMilestones / totalMilestones) * 100)
  const activeGoals = GOALS.filter(g => g.status === 'active').length

  // Placement readiness score (weighted)
  const placementScore = Math.round(
    (35 / 100) * 0.3 +  // Python
    (72 / 100) * 0.2 +  // C++ / DSA
    (completedMilestones / totalMilestones) * 0.3 +
    0.2 * 0.4           // Projects (20% done)
  ) * 100

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Career Roadmap</h1>
          <p className="text-muted-foreground text-sm mt-1">
            AI-Powered Backend Engineer · Target: Placement by 3rd Year
          </p>
        </div>
        <Badge variant="info" className="gap-1.5 text-xs px-3 py-1.5">
          <Star className="h-3 w-3 text-amber-400" />
          ₹12–25 LPA Target
        </Badge>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold gradient-text">{overallProgress}%</p>
          <p className="text-xs text-muted-foreground mt-1">Overall Progress</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-emerald-400">{completedMilestones}</p>
          <p className="text-xs text-muted-foreground mt-1">Milestones Done</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-amber-400">{activeGoals}</p>
          <p className="text-xs text-muted-foreground mt-1">Active Goals</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-violet-400">{placementScore}%</p>
          <p className="text-xs text-muted-foreground mt-1">Placement Ready</p>
        </Card>
      </div>

      {/* Overall progress bar */}
      <Card className="gradient-border">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Map className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">Roadmap Progress</span>
            </div>
            <span className="text-sm font-mono text-muted-foreground">{completedMilestones}/{totalMilestones} milestones</span>
          </div>
          <Progress value={overallProgress} className="h-2.5" />
          <p className="text-xs text-muted-foreground mt-2">
            Keep going! Consistent daily effort compounds into career breakthroughs. 🚀
          </p>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-secondary/50 rounded-lg w-fit">
        {([['roadmap', 'Roadmap'], ['skills', 'Skill Gaps'], ['placement', 'Placement Tracker']] as const).map(([tab, label]) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 py-1.5 rounded-md text-xs font-medium transition-all',
              activeTab === tab ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── ROADMAP TAB ── */}
      {activeTab === 'roadmap' && (
        <div className="space-y-3">
          {GOALS.map((goal, idx) => {
            const isExpanded = expanded === goal.id
            const milestones = goal.milestones || []
            const done = milestones.filter(m => m.status === 'completed').length
            const progress = milestones.length ? Math.round((done / milestones.length) * 100) : 0

            return (
              <Card
                key={goal.id}
                className={cn(
                  'transition-all duration-200',
                  goal.status === 'active' && 'border-primary/30',
                  goal.status === 'completed' && 'border-emerald-500/20'
                )}
              >
                <CardHeader
                  className="pb-3 cursor-pointer"
                  onClick={() => setExpanded(isExpanded ? null : goal.id)}
                >
                  <div className="flex items-start gap-3">
                    {/* Number + status indicator */}
                    <div className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold',
                      goal.status === 'active' ? 'bg-primary/20 text-primary border border-primary/30' :
                      goal.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                      'bg-secondary text-muted-foreground'
                    )}>
                      {idx + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-sm">{goal.title}</h3>
                        <Badge className={cn('text-[10px]', getCategoryColor(goal.category))}>
                          {CATEGORY_LABELS[goal.category]}
                        </Badge>
                        <Badge
                          variant={goal.status === 'active' ? 'success' : goal.status === 'completed' ? 'default' : 'secondary'}
                          className="text-[10px]"
                        >
                          {goal.status}
                        </Badge>
                      </div>
                      {goal.description && (
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-1">
                          {goal.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        <Progress value={progress} className="flex-1 h-1.5" />
                        <span className="text-xs font-mono text-muted-foreground shrink-0">{progress}%</span>
                        {goal.target_date && (
                          <span className="flex items-center gap-1 text-[10px] text-muted-foreground shrink-0">
                            <Calendar className="h-3 w-3" />
                            {formatDate(goal.target_date, 'MMM yyyy')}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-muted-foreground shrink-0">
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </div>
                </CardHeader>

                {/* Milestones */}
                {isExpanded && (
                  <CardContent className="pt-0 border-t border-border/50 animate-fade-in">
                    <div className="mt-4 relative">
                      {/* Timeline line */}
                      <div className="absolute left-3.5 top-0 bottom-0 w-px bg-border/50" />

                      <div className="space-y-3 pl-8">
                        {milestones.map((milestone, mi) => (
                          <div key={milestone.id} className="relative">
                            {/* Dot */}
                            <div className={cn(
                              'absolute -left-[22px] mt-0.5 h-4 w-4 rounded-full border-2 flex items-center justify-center',
                              milestone.status === 'completed'
                                ? 'bg-emerald-400/20 border-emerald-400'
                                : milestone.status === 'active'
                                ? 'bg-primary/20 border-primary animate-pulse-slow'
                                : 'bg-background border-border'
                            )}>
                              {milestone.status === 'completed' && (
                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                              )}
                              {milestone.status === 'active' && (
                                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                              )}
                            </div>

                            <div className={cn(
                              'p-2.5 rounded-lg border transition-colors',
                              milestone.status === 'completed'
                                ? 'bg-emerald-500/5 border-emerald-500/10'
                                : milestone.status === 'active'
                                ? 'bg-primary/5 border-primary/20'
                                : 'bg-secondary/30 border-border/30'
                            )}>
                              <div className="flex items-start justify-between gap-2">
                                <p className={cn(
                                  'text-xs font-medium',
                                  milestone.status === 'completed' && 'line-through text-muted-foreground'
                                )}>
                                  {milestone.title}
                                </p>
                                {milestone.target_date && (
                                  <span className="text-[10px] text-muted-foreground shrink-0">
                                    {formatDate(milestone.target_date, 'MMM yyyy')}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>
      )}

      {/* ── SKILL GAPS TAB ── */}
      {activeTab === 'skills' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Skill Gap Analysis
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Skills you need to level up for your AI Backend Engineer target role.
              </p>
            </CardHeader>
            <CardContent className="space-y-5">
              {SKILL_GAPS.map(({ skill, current, target, priority }) => (
                <div key={skill} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{skill}</span>
                      <Badge className={cn('text-[10px]', priority === 'urgent' ? 'bg-rose-400/10 text-rose-400' : priority === 'high' ? 'bg-amber-400/10 text-amber-400' : 'bg-blue-400/10 text-blue-400')}>
                        {priority}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-mono">{current}%</span>
                      <span>→</span>
                      <span className="font-mono text-primary">{target}%</span>
                    </div>
                  </div>
                  <div className="relative h-2 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="absolute h-full rounded-full bg-secondary border-r-2 border-muted-foreground/20"
                      style={{ width: `${target}%` }}
                    />
                    <div
                      className="absolute h-full rounded-full bg-primary transition-all duration-700"
                      style={{ width: `${current}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Gap: <span className="text-foreground font-medium">{target - current}%</span> to close
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── PLACEMENT TRACKER TAB ── */}
      {activeTab === 'placement' && (
        <div className="space-y-4">
          <Card className="gradient-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
                  <Trophy className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Placement Readiness Score</p>
                  <p className="text-4xl font-bold gradient-text">{placementScore}%</p>
                  <p className="text-xs text-muted-foreground mt-1">Target: ₹12–25 LPA · Timeline: 3rd year</p>
                </div>
              </div>
              <Progress value={placementScore} className="h-3" />
              <p className="text-xs text-muted-foreground mt-2">
                You need 70%+ readiness score to confidently target top companies.
              </p>
            </CardContent>
          </Card>

          {/* Readiness checklist */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Placement Checklist</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { item: 'DSA: 150+ LeetCode problems', done: false, progress: 45 },
                { item: 'Python proficiency (Backend)', done: false, progress: 35 },
                { item: 'FastAPI project deployed', done: false, progress: 20 },
                { item: 'GitHub profile polished', done: false, progress: 40 },
                { item: 'ATS Resume ready', done: false, progress: 10 },
                { item: 'CGPA 8.5+', done: true, progress: 100 },
                { item: 'Internship experience', done: false, progress: 0 },
                { item: 'System Design basics', done: false, progress: 15 },
              ].map(({ item, done, progress }) => (
                <div key={item} className="flex items-center gap-3 py-2">
                  {done
                    ? <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    : <Circle className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                  }
                  <span className={cn('text-sm flex-1', done && 'text-muted-foreground line-through')}>{item}</span>
                  <div className="flex items-center gap-2 w-24">
                    <Progress value={progress} className="h-1" />
                    <span className="text-[10px] text-muted-foreground font-mono w-8 text-right">{progress}%</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Target companies */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-4 w-4 text-amber-400" />
                Target Companies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {['Google', 'Microsoft', 'Amazon', 'Flipkart', 'Swiggy', 'Zepto', 'PhonePe', 'Razorpay', 'CRED', 'Groww', 'DE Shaw', 'Goldman Sachs'].map(co => (
                  <Badge key={co} variant="outline" className="text-xs">{co}</Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Focus on product companies with strong backend/AI teams for highest package potential.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
