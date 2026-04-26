'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { StatCard } from '@/components/dashboard/StatCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  CheckSquare, Flame, Clock, BookOpen, Map, Calendar,
  Plus, TrendingUp, AlertCircle, ChevronRight, Zap, Target
} from 'lucide-react'
import { cn, formatDate, daysUntil, getPriorityColor } from '@/lib/utils'
import type { Task, Subject, CareerGoal } from '@/lib/types'

// ── Dummy / sample data (shown when DB tables are empty) ──────────────────────
const SAMPLE_TASKS: Task[] = [
  { id: '1', user_id: '', title: 'Solve 5 LeetCode problems (Trees)', priority: 'urgent', status: 'pending', due_date: new Date().toISOString(), completed_at: null, tags: ['DSA', 'C++'], related_subject_id: null, description: null, created_at: '' },
  { id: '2', user_id: '', title: 'Complete Python basics — Chapter 3', priority: 'high', status: 'pending', due_date: new Date().toISOString(), completed_at: null, tags: ['Python'], related_subject_id: null, description: null, created_at: '' },
  { id: '3', user_id: '', title: 'Push NTCC project code to GitHub', priority: 'medium', status: 'in_progress', due_date: new Date().toISOString(), completed_at: null, tags: ['Project'], related_subject_id: null, description: null, created_at: '' },
]

const SAMPLE_SUBJECTS: Subject[] = [
  { id: '1', semester_id: '', user_id: '', name: 'Deep Neural Networks', code: 'AIML203', credits: 3, progress: 88, priority: 'high', exam_date: '2025-05-20', syllabus_topics: [], color: '#10b981', created_at: '' },
  { id: '2', semester_id: '', user_id: '', name: 'Operating Systems', code: 'CSE202', credits: 3, progress: 82, priority: 'high', exam_date: '2025-05-22', syllabus_topics: [], color: '#8b5cf6', created_at: '' },
  { id: '3', semester_id: '', user_id: '', name: 'Theory of Computation', code: 'CSE204', credits: 3, progress: 80, priority: 'medium', exam_date: '2025-05-25', syllabus_topics: [], color: '#f43f5e', created_at: '' },
]

const SAMPLE_GOALS: CareerGoal[] = [
  { id: '1', user_id: '', title: 'DSA Mastery (C++)', category: 'dsa', status: 'active', priority: 10, target_date: '2025-12-31', description: null, created_at: '' },
  { id: '2', user_id: '', title: 'Python Mastery for Backend', category: 'backend', status: 'active', priority: 9, target_date: '2025-08-31', description: null, created_at: '' },
  { id: '3', user_id: '', title: 'FastAPI + Backend Engineering', category: 'backend', status: 'pending', priority: 9, target_date: '2026-01-31', description: null, created_at: '' },
]

const RECENT_ACTIVITY = [
  { id: '1', icon: '✅', text: 'Completed: Java Multithreading notes', time: '2h ago' },
  { id: '2', icon: '🔥', text: '25-min Pomodoro session completed', time: '4h ago' },
  { id: '3', icon: '📚', text: 'Updated DNN progress to 88%', time: 'Yesterday' },
  { id: '4', icon: '🎯', text: 'DSA goal marked active', time: '2 days ago' },
]

export default function DashboardPage() {
  const supabase = createClient()
  const [tasks, setTasks] = useState<Task[]>(SAMPLE_TASKS)
  const [subjects, setSubjects] = useState<Subject[]>(SAMPLE_SUBJECTS)
  const [streak] = useState(7) // would come from analytics_logs
  const [studyHours] = useState(18.5)
  const [careerProgress] = useState(22)

  const semesterProgress = Math.round(
    subjects.reduce((sum, s) => sum + s.progress, 0) / (subjects.length || 1)
  )

  const upcomingExams = subjects
    .filter(s => s.exam_date && (daysUntil(s.exam_date) ?? 999) >= 0)
    .sort((a, b) => new Date(a.exam_date!).getTime() - new Date(b.exam_date!).getTime())
    .slice(0, 3)

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Good morning, Hassan 👋
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            You&apos;re on a <span className="text-amber-400 font-semibold">{streak}-day streak</span>. Keep the momentum going!
          </p>
        </div>
        <Link href="/tasks">
          <Button size="sm" className="hidden sm:flex gap-2">
            <Plus className="h-4 w-4" /> Quick Task
          </Button>
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <StatCard
          title="Day Streak"
          value={`${streak} 🔥`}
          subtitle="Keep it going!"
          icon={Flame}
          iconColor="text-amber-400"
          iconBg="bg-amber-400/10"
          trend={{ value: 12, label: 'vs last week' }}
        />
        <StatCard
          title="Study Hours"
          value={`${studyHours}h`}
          subtitle="This week"
          icon={Clock}
          iconColor="text-blue-400"
          iconBg="bg-blue-400/10"
          trend={{ value: 8, label: 'vs last week' }}
        />
        <StatCard
          title="Semester Progress"
          value={`${semesterProgress}%`}
          subtitle="Sem 4 average"
          icon={BookOpen}
          iconColor="text-emerald-400"
          iconBg="bg-emerald-400/10"
        />
        <StatCard
          title="Career Progress"
          value={`${careerProgress}%`}
          subtitle="Roadmap complete"
          icon={Map}
          iconColor="text-violet-400"
          iconBg="bg-violet-400/10"
          trend={{ value: 5, label: 'this month' }}
        />
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Today's top tasks */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  Today&apos;s Top 3
                </CardTitle>
                <Link href="/tasks">
                  <Button variant="ghost" size="sm" className="text-xs gap-1 text-muted-foreground">
                    View all <ChevronRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {tasks.slice(0, 3).map((task, i) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-secondary/40 hover:bg-secondary/60 transition-colors group"
                >
                  <div className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                    i === 0 ? 'bg-amber-400/20 text-amber-400' :
                    i === 1 ? 'bg-primary/20 text-primary' :
                    'bg-muted text-muted-foreground'
                  )}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{task.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge className={cn('text-[10px] px-1.5 py-0', getPriorityColor(task.priority))}>
                        {task.priority}
                      </Badge>
                      {task.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="text-[10px] text-muted-foreground">{tag}</span>
                      ))}
                    </div>
                  </div>
                  <CheckSquare className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary transition-colors cursor-pointer" />
                </div>
              ))}
              {tasks.length === 0 && (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  <CheckSquare className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p>No tasks yet. Add your first task!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Subject Progress */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-emerald-400" />
                  Semester 4 Subjects
                </CardTitle>
                <Link href="/studies">
                  <Button variant="ghost" size="sm" className="text-xs gap-1 text-muted-foreground">
                    Manage <ChevronRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {subjects.map(subject => (
                <div key={subject.id} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full" style={{ background: subject.color }} />
                      <span className="text-sm font-medium">{subject.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground font-mono">{subject.progress}%</span>
                  </div>
                  <Progress
                    value={subject.progress}
                    className="h-1.5"
                    indicatorClassName=""
                    style={{ '--tw-bg-opacity': '1' } as React.CSSProperties}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Upcoming Exams */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-rose-400" />
                Upcoming Exams
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingExams.map(subject => {
                const days = daysUntil(subject.exam_date)
                return (
                  <div key={subject.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary/40">
                    <div className={cn(
                      'flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-lg text-center',
                      (days ?? 999) <= 3 ? 'bg-rose-400/10 border border-rose-400/20' : 'bg-secondary'
                    )}>
                      <span className="text-sm font-bold leading-none">{days}</span>
                      <span className="text-[9px] text-muted-foreground">days</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate">{subject.name}</p>
                      <p className="text-[10px] text-muted-foreground">{formatDate(subject.exam_date)}</p>
                    </div>
                  </div>
                )
              })}
              {upcomingExams.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-2">No exams scheduled</p>
              )}
            </CardContent>
          </Card>

          {/* Career Goals Quick View */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-violet-400" />
                  Career Goals
                </CardTitle>
                <Link href="/roadmap">
                  <Button variant="ghost" size="sm" className="text-xs gap-1 text-muted-foreground">
                    Full view <ChevronRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {SAMPLE_GOALS.map(goal => (
                <div key={goal.id} className="flex items-center gap-2.5 py-1.5">
                  <div className={cn(
                    'h-2 w-2 rounded-full shrink-0',
                    goal.status === 'active' ? 'bg-emerald-400 animate-pulse-slow' :
                    goal.status === 'completed' ? 'bg-primary' : 'bg-muted-foreground/30'
                  )} />
                  <span className="text-xs flex-1 truncate">{goal.title}</span>
                  <Badge variant={goal.status === 'active' ? 'success' : goal.status === 'completed' ? 'default' : 'secondary'} className="text-[10px]">
                    {goal.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-400" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {RECENT_ACTIVITY.map(item => (
                <div key={item.id} className="flex items-start gap-2.5 py-1">
                  <span className="text-sm">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs leading-snug">{item.text}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{item.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
