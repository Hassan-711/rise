'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  CheckSquare, Plus, Timer, Flame, Trash2, Circle,
  CheckCircle2, Clock, AlertCircle, RotateCcw, Play, Pause, Square
} from 'lucide-react'
import { cn, formatDate, getPriorityColor, getStatusColor } from '@/lib/utils'
import { toast } from '@/components/ui/toaster'
import type { Task } from '@/lib/types'

const INITIAL_TASKS: Task[] = [
  { id: '1', user_id: '', title: 'Solve 5 LeetCode problems (Trees)', priority: 'urgent', status: 'pending', due_date: new Date().toISOString(), completed_at: null, tags: ['DSA', 'C++'], related_subject_id: null, description: 'Focus on BST and tree traversal', created_at: '' },
  { id: '2', user_id: '', title: 'Python basics Ch.3 — Functions', priority: 'high', status: 'pending', due_date: new Date().toISOString(), completed_at: null, tags: ['Python'], related_subject_id: null, description: null, created_at: '' },
  { id: '3', user_id: '', title: 'NTCC project: set up FastAPI + DB schema', priority: 'high', status: 'in_progress', due_date: new Date().toISOString(), completed_at: null, tags: ['Project', 'FastAPI'], related_subject_id: null, description: null, created_at: '' },
  { id: '4', user_id: '', title: 'Review OS Chapter 5 — Deadlocks', priority: 'medium', status: 'pending', due_date: new Date().toISOString(), completed_at: null, tags: ['OS', 'Exam Prep'], related_subject_id: null, description: null, created_at: '' },
  { id: '5', user_id: '', title: 'DNN assignment: LSTM implementation', priority: 'high', status: 'completed', due_date: new Date(Date.now() - 86400000).toISOString(), completed_at: new Date().toISOString(), tags: ['AIML203', 'Python'], related_subject_id: null, description: null, created_at: '' },
]

// ── Pomodoro Timer ────────────────────────────────────────────────────────────
const POMODORO_MINS = 25
const SHORT_BREAK = 5
const LONG_BREAK = 15

function PomodoroTimer() {
  const [mode, setMode] = useState<'work' | 'short' | 'long'>('work')
  const [seconds, setSeconds] = useState(POMODORO_MINS * 60)
  const [running, setRunning] = useState(false)
  const [sessions, setSessions] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const totalSeconds = mode === 'work' ? POMODORO_MINS * 60 : mode === 'short' ? SHORT_BREAK * 60 : LONG_BREAK * 60
  const progress = ((totalSeconds - seconds) / totalSeconds) * 100
  const circumference = 2 * Math.PI * 54

  const reset = useCallback(() => {
    setRunning(false)
    setSeconds(totalSeconds)
  }, [totalSeconds])

  useEffect(() => { reset() }, [mode, reset])

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) {
            setRunning(false)
            if (mode === 'work') {
              setSessions(n => n + 1)
              toast({ title: '🍅 Pomodoro complete!', description: 'Take a short break.' })
            }
            return 0
          }
          return s - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running, mode])

  const mins = String(Math.floor(seconds / 60)).padStart(2, '0')
  const secs = String(seconds % 60).padStart(2, '0')

  return (
    <Card className="gradient-border">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Timer className="h-4 w-4 text-primary" />
          Pomodoro Timer
        </CardTitle>
        {/* Mode selector */}
        <div className="flex gap-1 mt-2">
          {([['work', '🍅 Focus'], ['short', '☕ Short'], ['long', '🌿 Long']] as const).map(([m, label]) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                'flex-1 rounded-md py-1.5 text-[11px] font-medium transition-all',
                mode === m ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4 pt-2">
        {/* SVG ring timer */}
        <div className="relative flex items-center justify-center">
          <svg width="140" height="140" viewBox="0 0 140 140">
            <circle cx="70" cy="70" r="54" fill="none" stroke="hsl(var(--secondary))" strokeWidth="8" />
            <circle
              cx="70" cy="70" r="54"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - (circumference * progress) / 100}
              className="timer-ring transition-all duration-1000"
            />
          </svg>
          <div className="absolute text-center">
            <p className="text-3xl font-bold font-mono">{mins}:{secs}</p>
            <p className="text-[10px] text-muted-foreground capitalize">
              {mode === 'work' ? 'Focus' : mode === 'short' ? 'Break' : 'Long break'}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon-sm" onClick={reset}>
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
          <Button onClick={() => setRunning(!running)} className="gap-2 px-6">
            {running ? <><Pause className="h-4 w-4" /> Pause</> : <><Play className="h-4 w-4" /> Start</>}
          </Button>
          <Button variant="outline" size="icon-sm" onClick={() => { setRunning(false); setSeconds(0) }}>
            <Square className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Flame className="h-3.5 w-3.5 text-amber-400" />
          <span>{sessions} sessions today</span>
        </div>
      </CardContent>
    </Card>
  )
}

// ── Main Tasks Page ────────────────────────────────────────────────────────────
export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS)
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'missed'>('all')
  const [newTitle, setNewTitle] = useState('')
  const [newPriority, setNewPriority] = useState<Task['priority']>('medium')
  const [showAdd, setShowAdd] = useState(false)

  const streak = 7
  const completed = tasks.filter(t => t.status === 'completed').length
  const total = tasks.length
  const completionRate = Math.round((completed / total) * 100)

  const filtered = tasks.filter(t => {
    if (filter === 'all') return t.status !== 'missed'
    return t.status === filter
  })

  function addTask() {
    if (!newTitle.trim()) return
    const task: Task = {
      id: String(Date.now()), user_id: '', title: newTitle, priority: newPriority,
      status: 'pending', due_date: new Date().toISOString(), completed_at: null,
      tags: [], related_subject_id: null, description: null, created_at: '',
    }
    setTasks(prev => [task, ...prev])
    setNewTitle('')
    setShowAdd(false)
    toast({ title: 'Task added ✅' })
  }

  function toggleTask(id: string) {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t
      const newStatus = t.status === 'completed' ? 'pending' : 'completed'
      if (newStatus === 'completed') toast({ title: '🎉 Task completed!' })
      return { ...t, status: newStatus, completed_at: newStatus === 'completed' ? new Date().toISOString() : null }
    }))
  }

  function deleteTask(id: string) {
    setTasks(prev => prev.filter(t => t.id !== id))
    toast({ title: 'Task removed', variant: 'destructive' })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Daily Targets</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {completed}/{total} completed · <span className="text-amber-400">{streak} day streak 🔥</span>
          </p>
        </div>
        <Button onClick={() => setShowAdd(!showAdd)} size="sm" className="gap-2">
          <Plus className="h-4 w-4" /> Add Task
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="p-4 text-center">
              <p className="text-2xl font-bold text-emerald-400">{completed}</p>
              <p className="text-xs text-muted-foreground mt-1">Completed</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-2xl font-bold text-amber-400">{total - completed}</p>
              <p className="text-xs text-muted-foreground mt-1">Remaining</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-2xl font-bold gradient-text">{completionRate}%</p>
              <p className="text-xs text-muted-foreground mt-1">Rate</p>
            </Card>
          </div>

          {/* Add task */}
          {showAdd && (
            <Card className="border-primary/30 animate-fade-in">
              <CardContent className="pt-5 space-y-3">
                <Input
                  placeholder="What needs to be done?"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addTask()}
                  autoFocus
                />
                <div className="flex items-center gap-2">
                  {(['urgent', 'high', 'medium', 'low'] as const).map(p => (
                    <button
                      key={p}
                      onClick={() => setNewPriority(p)}
                      className={cn(
                        'px-3 py-1.5 rounded-md text-xs font-medium border transition-all capitalize',
                        newPriority === p ? getPriorityColor(p) : 'border-border text-muted-foreground hover:border-primary/30'
                      )}
                    >
                      {p}
                    </button>
                  ))}
                  <div className="flex-1" />
                  <Button size="sm" onClick={addTask}>Add</Button>
                  <Button size="sm" variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Filter tabs */}
          <div className="flex gap-1 p-1 bg-secondary/50 rounded-lg w-fit">
            {(['all', 'pending', 'completed', 'missed'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  'px-4 py-1.5 rounded-md text-xs font-medium transition-all capitalize',
                  filter === f ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Task list */}
          <div className="space-y-2">
            {filtered.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <CheckSquare className="h-10 w-10 mx-auto mb-3 opacity-20" />
                <p className="text-sm">No tasks here</p>
              </div>
            )}
            {filtered.map(task => (
              <div
                key={task.id}
                className={cn(
                  'flex items-start gap-3 p-3.5 rounded-xl border border-border/50 bg-card transition-all duration-200 group',
                  task.status === 'completed' && 'opacity-60'
                )}
              >
                <button
                  onClick={() => toggleTask(task.id)}
                  className="mt-0.5 shrink-0 transition-transform hover:scale-110"
                >
                  {task.status === 'completed'
                    ? <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    : <Circle className="h-5 w-5 text-muted-foreground/40 hover:text-primary" />
                  }
                </button>
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm font-medium', task.status === 'completed' && 'line-through text-muted-foreground')}>
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap mt-1.5">
                    <Badge className={cn('text-[10px] px-1.5', getPriorityColor(task.priority))}>
                      {task.priority}
                    </Badge>
                    {task.tags.map(tag => (
                      <span key={tag} className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                        {tag}
                      </span>
                    ))}
                    {task.due_date && (
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Clock className="h-2.5 w-2.5" />
                        {formatDate(task.due_date, 'MMM d')}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive shrink-0"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Pomodoro + streak */}
        <div className="space-y-4">
          <PomodoroTimer />

          {/* Streak card */}
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/10">
                  <Flame className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Current Streak</p>
                  <p className="text-2xl font-bold text-amber-400">{streak} days 🔥</p>
                </div>
              </div>
              {/* Week grid */}
              <div className="grid grid-cols-7 gap-1 mt-3">
                {['M','T','W','T','F','S','S'].map((day, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div className={cn(
                      'h-7 w-7 rounded-md flex items-center justify-center text-[10px] font-medium transition-all',
                      i < 5 ? 'bg-amber-400/20 text-amber-400 border border-amber-400/20' : 'bg-secondary text-muted-foreground'
                    )}>
                      {i < 5 ? '✓' : day}
                    </div>
                    <span className="text-[9px] text-muted-foreground">{day}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3 text-center">
                Consistency score: <span className="text-emerald-400 font-semibold">78%</span>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
