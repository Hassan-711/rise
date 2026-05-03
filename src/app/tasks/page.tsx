'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { CheckSquare, Plus, Timer, Flame, Trash2, Circle, CheckCircle2, Clock, RotateCcw, Play, Pause, Square, Target } from 'lucide-react'
import { cn, formatDate, getPriorityColor } from '@/lib/utils'
import { toast } from '@/components/ui/toaster'
import { getTasks, addTask, updateTask, deleteTask, addFocusSession } from '@/lib/db'
import type { Task } from '@/lib/types'
import { StatCard } from '@/components/dashboard/StatCard'

const POMODORO_SECS = 25 * 60
const SHORT_BREAK = 5 * 60
const LONG_BREAK = 15 * 60

function PomodoroTimer() {
  const [mode, setMode] = useState<'work' | 'short' | 'long'>('work')
  const [seconds, setSeconds] = useState(POMODORO_SECS)
  const [running, setRunning] = useState(false)
  const [sessions, setSessions] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const totalSecs = mode === 'work' ? POMODORO_SECS : mode === 'short' ? SHORT_BREAK : LONG_BREAK
  const progress = ((totalSecs - seconds) / totalSecs) * 100
  const circumference = 2 * Math.PI * 54

  const reset = useCallback(() => { setRunning(false); setSeconds(totalSecs) }, [totalSecs])
  useEffect(() => { reset() }, [mode, reset])

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) {
            setRunning(false)
            if (mode === 'work') {
              const newCount = sessions + 1
              setSessions(newCount)
              addFocusSession({ duration_minutes: 25, session_type: 'pomodoro' })
              toast({ title: '🍅 Pomodoro done! Great focus session.' })
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
  }, [running, mode, sessions])

  const mins = String(Math.floor(seconds / 60)).padStart(2, '0')
  const secs = String(seconds % 60).padStart(2, '0')

  return (
    <div className="glass-card flex flex-col p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl icon-rose shadow-sm">
          <Timer className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Pomodoro Timer</h2>
        </div>
      </div>
      
      <div className="flex gap-1.5 mb-6 p-1 rounded-xl bg-slate-50/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 w-full">
        {(['work', 'short', 'long'] as const).map(m => (
          <button key={m} onClick={() => setMode(m)}
            className={cn('flex-1 rounded-lg py-1.5 text-[11px] font-extrabold uppercase tracking-wider transition-all shadow-sm',
              mode === m ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-md border border-slate-200/50 dark:border-white/10' : 'text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-white/5 border border-transparent')}>
            {m === 'work' ? 'Focus' : m === 'short' ? 'Short' : 'Long'}
          </button>
        ))}
      </div>

      <div className="flex flex-col items-center gap-6">
        <div className="relative flex items-center justify-center scale-110">
          <svg width="140" height="140" viewBox="0 0 140 140">
            <circle cx="70" cy="70" r="54" fill="none" className="stroke-slate-100 dark:stroke-white/5" strokeWidth="8" />
            <circle cx="70" cy="70" r="54" fill="none" className="stroke-rose-400 dark:stroke-rose-500" strokeWidth="8"
              strokeLinecap="round" strokeDasharray={circumference}
              strokeDashoffset={circumference - (circumference * progress) / 100}
              style={{ transition: 'stroke-dashoffset 1s linear' }} />
          </svg>
          <div className="absolute text-center flex flex-col items-center">
            <p className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tighter">{mins}:{secs}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" onClick={reset} className="rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-500"><RotateCcw className="h-4 w-4" /></Button>
          <Button onClick={() => setRunning(!running)} className="gap-2 px-8 py-5 rounded-xl bg-rose-500 hover:bg-rose-600 shadow-[0_8px_20px_rgba(244,63,94,0.3)] hover:shadow-[0_12px_25px_rgba(244,63,94,0.4)] hover:-translate-y-0.5 transition-all text-white font-bold">
            {running ? <><Pause className="h-4 w-4" />Pause</> : <><Play className="h-4 w-4" />Start</>}
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={() => { setRunning(false); setSeconds(0) }} className="rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-500"><Square className="h-4 w-4" /></Button>
        </div>
        
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100/50 dark:border-amber-500/20 text-[11px] font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-400">
          <Flame className="h-3.5 w-3.5" /><span>{sessions} sessions today</span>
        </div>
      </div>
    </div>
  )
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all')
  const [newTitle, setNewTitle] = useState('')
  const [newPriority, setNewPriority] = useState<Task['priority']>('medium')
  const [newDueDate, setNewDueDate] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getTasks().then(data => { setTasks(data as Task[]); setLoading(false) })
  }, [])

  const completed = tasks.filter(t => t.status === 'completed').length
  const filtered = tasks.filter(t => filter === 'all' ? true : t.status === filter)

  async function handleAdd() {
    if (!newTitle.trim() || saving) return
    setSaving(true)
    const { data, error } = await addTask({
      title: newTitle.trim(),
      priority: newPriority,
      status: 'pending',
      due_date: newDueDate || null,
      tags: [],
    })
    if (error) {
      toast({ title: 'Failed to add task', description: error, variant: 'destructive' })
    } else {
      setTasks(prev => [data as Task, ...prev])
      setNewTitle('')
      setNewDueDate('')
      setShowAdd(false)
      toast({ title: 'Task added ✅' })
    }
    setSaving(false)
  }

  async function handleToggle(task: Task) {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed'
    const updates = { status: newStatus, completed_at: newStatus === 'completed' ? new Date().toISOString() : null }
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, ...updates } as Task : t))
    const { error } = await updateTask(task.id, updates as Partial<Task>)
    if (error) {
      setTasks(prev => prev.map(t => t.id === task.id ? task : t))
      toast({ title: 'Failed to update', variant: 'destructive' })
    } else if (newStatus === 'completed') {
      toast({ title: '🎉 Task completed!' })
    }
  }

  async function handleDelete(id: string) {
    setTasks(prev => prev.filter(t => t.id !== id))
    const { error } = await deleteTask(id)
    if (error) {
      toast({ title: 'Failed to delete', variant: 'destructive' })
      getTasks().then(data => setTasks(data as Task[]))
    } else {
      toast({ title: 'Task deleted' })
    }
  }

  return (
    <div className="space-y-8 w-full max-w-[1800px] mx-auto animate-slide-in">
      
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 relative">
        <div className="relative">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">
            Daily Targets 🎯
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
              Manage your tasks and focus
            </p>
          </div>
        </div>
        <Button onClick={() => setShowAdd(!showAdd)} className="relative gap-2 shadow-[0_8px_20px_rgba(79,70,229,0.3)] hover:shadow-[0_12px_25px_rgba(79,70,229,0.4)] hover:-translate-y-0.5 transition-all bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-5 px-6 font-bold">
          <Plus className="h-4 w-4" strokeWidth={3} /> Add Task
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Col (Tasks list) */}
        <div className="lg:col-span-2 space-y-8 flex flex-col">
          
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-6">
            <StatCard title="Completed" value={completed} color="emerald" icon={CheckCircle2} />
            <StatCard title="Remaining" value={tasks.length - completed} color="amber" icon={Clock} />
            <StatCard title="Hit Rate" value={`${tasks.length ? Math.round((completed / tasks.length) * 100) : 0}%`} color="violet" icon={Target} />
          </div>

          {/* Add Task Glass Card */}
          {showAdd && (
            <div className="glass-card flex flex-col animate-fade-in p-5 border-indigo-200/50 dark:border-indigo-500/20">
               <Input placeholder="What needs to be done?" value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAdd()} 
                  className="bg-white/50 dark:bg-white/5 border-slate-200 dark:border-white/10 shadow-sm focus-visible:ring-indigo-500 rounded-xl font-bold text-lg px-4 py-6 mb-4"
                  autoFocus />
               
               <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    {(['urgent', 'high', 'medium', 'low'] as const).map(p => (
                      <button key={p} onClick={() => setNewPriority(p)}
                        className={cn('px-4 py-1.5 rounded-lg text-[10px] font-extrabold tracking-widest uppercase transition-all shadow-sm border',
                          newPriority === p ? getPriorityColor(p) : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300 dark:hover:border-slate-600')}>
                        {p}
                      </button>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Input type="datetime-local" value={newDueDate} onChange={e => setNewDueDate(e.target.value)} className="flex-1 sm:w-auto bg-white/50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-xl font-bold text-xs" />
                    <Button onClick={handleAdd} disabled={saving} className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6">{saving ? 'Saving…' : 'Save Task'}</Button>
                    <Button variant="ghost" onClick={() => setShowAdd(false)} className="rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 font-bold">Cancel</Button>
                  </div>
               </div>
            </div>
          )}

          {/* Task List Area */}
          <div className="glass-card flex flex-col flex-1">
             <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-200/60 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl icon-violet shadow-sm">
                  <CheckSquare className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Your Tasks</h2>
              </div>
              
              <div className="flex gap-1.5 p-1 rounded-xl bg-slate-50/50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                {(['all', 'pending', 'completed'] as const).map(f => (
                  <button key={f} onClick={() => setFilter(f)}
                    className={cn('px-4 py-1.5 rounded-lg text-[11px] font-extrabold uppercase tracking-wider transition-all shadow-sm',
                      filter === f ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-md border border-slate-200/50 dark:border-white/10' : 'text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-white/5 border border-transparent')}>
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 flex flex-col flex-1">
               {loading ? (
                <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-16 rounded-xl shimmer border border-slate-200/50 dark:border-white/5" />)}</div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center flex-1 py-16 px-6 rounded-[1.5rem] bg-slate-50/50 dark:bg-indigo-950/10 border-2 border-dashed border-slate-200 dark:border-indigo-500/20 text-slate-500 dark:text-slate-400">
                  <div className="flex h-20 w-20 mb-4 items-center justify-center rounded-[1.5rem] bg-white dark:bg-indigo-950/30 shadow-sm border border-slate-100 dark:border-indigo-500/20 text-indigo-400 dark:text-indigo-300">
                    <CheckSquare className="h-10 w-10" />
                  </div>
                  <p className="text-lg font-extrabold text-slate-700 dark:text-slate-200">No tasks here</p>
                  <p className="text-sm font-semibold mt-1 opacity-70">You're all caught up!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filtered.map(task => (
                    <div key={task.id} className={cn('group flex items-center gap-4 p-4 rounded-xl border border-slate-200/60 dark:border-white/5 bg-white/40 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-500/40 hover:-translate-y-1 transition-all duration-200', task.status === 'completed' && 'opacity-60 grayscale-[50%]')}>
                      <button onClick={() => handleToggle(task)} className="shrink-0 transition-transform hover:scale-110">
                        {task.status === 'completed' ? <CheckCircle2 className="h-6 w-6 text-emerald-500 dark:text-emerald-400 drop-shadow-sm" /> : <Circle className="h-6 w-6 text-slate-300 dark:text-slate-600 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors" />}
                      </button>
                      
                      <div className="flex-1 min-w-0">
                        <p className={cn('text-[15px] font-bold', task.status === 'completed' ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-200')}>{task.title}</p>
                        <div className="flex items-center gap-3 flex-wrap mt-1.5">
                          <Badge className={cn('text-[9px] px-2 py-0.5 font-extrabold uppercase tracking-widest rounded-md shadow-sm', getPriorityColor(task.priority))}>{task.priority}</Badge>
                          {task.due_date && <span className="flex items-center gap-1 text-[11px] font-bold text-slate-400 dark:text-slate-500"><Clock className="h-3 w-3" />{formatDate(task.due_date, 'MMM d, h:mm a')}</span>}
                        </div>
                      </div>
                      
                      <button onClick={() => handleDelete(task.id)} className="opacity-0 group-hover:opacity-100 transition-all p-2 rounded-xl bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-500 dark:text-rose-400 shrink-0 border border-transparent hover:border-rose-200 dark:hover:border-rose-500/30">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Col */}
        <div className="space-y-8">
          <PomodoroTimer />
        </div>
        
      </div>
    </div>
  )
}