'use client'

import { useState, useEffect } from 'react'
import { AreaChart, Area, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, Clock, CheckSquare, BookOpen, Calendar, BarChart3, Target } from 'lucide-react'
import { getAnalyticsLogs, getFocusSessions, getTasks, getSubjects } from '@/lib/db'
import { format, subDays } from 'date-fns'
import { StatCard } from '@/components/dashboard/StatCard'

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-card rounded-xl p-4 border border-slate-200/50 dark:border-white/10 text-xs shadow-[0_8px_30px_rgba(0,0,0,0.12)] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
      <p className="font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest mb-3">{label}</p>
      {payload.map(({ name, value, color }) => (
        <div key={name} className="flex items-center gap-3 mb-1.5 last:mb-0">
          <div className="h-2.5 w-2.5 rounded-full shadow-sm" style={{ background: color }} />
          <span className="text-slate-500 font-bold uppercase tracking-wider">{name}:</span>
          <span className="font-black text-slate-700 dark:text-slate-200 text-sm">{value}</span>
        </div>
      ))}
    </div>
  )
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [tasks, setTasks] = useState<{ completed: number; total: number }>({ completed: 0, total: 0 })
  const [allTasks, setAllTasks] = useState<Array<{ status: string; updated_at?: string; created_at?: string }>>([])
  const [subjects, setSubjects] = useState<{ name: string; progress: number }[]>([])
  const [focusToday, setFocusToday] = useState(0)
  const [analyticsLogs, setAnalyticsLogs] = useState<Array<{ date: string; study_minutes: number; tasks_completed: number }>>([])

  useEffect(() => {
    Promise.all([getTasks(), getSubjects(), getFocusSessions(), getAnalyticsLogs()]).then(([t, s, f, logs]) => {
      const taskArr = t as Array<{ status: string; updated_at?: string; created_at?: string }>
      
      setAllTasks(taskArr) // Storing raw tasks for chart calculation
      setTasks({ completed: taskArr.filter(t => t.status === 'completed').length, total: taskArr.length })
      
      setSubjects((s as Array<{ name: string; progress: number }>).map(sub => ({ name: sub.name.length > 12 ? sub.name.slice(0, 12) + '…' : sub.name, progress: sub.progress })))
      setFocusToday((f as unknown[]).length)
      setAnalyticsLogs((logs as Array<{ date: string; study_minutes: number; tasks_completed: number }>).slice(0, 14).reverse())
      setLoading(false)
    })
  }, [])

  // ── FIX: Building last 7 days data directly from Tasks table ──
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i)
    const dateStr = format(date, 'yyyy-MM-dd')
    const log = analyticsLogs.find(l => l.date === dateStr)

    // Check how many tasks were completed on this specific date
    const realTasksCompleted = allTasks.filter(t => {
      if (t.status !== 'completed') return false;
      const taskDate = t.updated_at || t.created_at || ''; // Fallback to created_at if updated_at is missing
      return taskDate.startsWith(dateStr);
    }).length;

    // Use direct task count if available, otherwise fallback to logs
    const tasksCount = realTasksCompleted > 0 ? realTasksCompleted : (log?.tasks_completed || 0);

    return { 
      day: format(date, 'EEE'), 
      hours: log ? +(log.study_minutes / 60).toFixed(1) : 0, 
      tasks: tasksCount 
    }
  })

  const completionRate = tasks.total ? Math.round((tasks.completed / tasks.total) * 100) : 0

  if (loading) {
    return (
      <div className="space-y-8 w-full max-w-[1800px] mx-auto">
        <div className="h-9 w-72 shimmer rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-32 rounded-2xl shimmer" />)}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          {[1,2].map(i => <div key={i} className="h-[300px] rounded-3xl shimmer" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 w-full max-w-[1800px] mx-auto animate-slide-in">
      
      {/* ── Header ── */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">Analytics 📈</h1>
        <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mt-2">Your real productivity and study data</p>
      </div>

      {/* ── 4 STAT CARDS ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Tasks Completed" value={tasks.completed} color="emerald" icon={CheckSquare} />
        <StatCard title="Focus Sessions Today" value={focusToday} color="blue" icon={Clock} />
        <StatCard title="Completion Rate" value={`${completionRate}%`} color="violet" icon={TrendingUp} />
        <StatCard title="Subjects Tracked" value={subjects.length} color="amber" icon={BookOpen} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        
        {/* Study Hours Chart */}
        <div className="glass-card p-6 md:p-8 flex flex-col hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group border border-slate-200/60 dark:border-white/10">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-white/5">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform">
              <Clock className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-black tracking-tight text-slate-800 dark:text-slate-100">Study Hours <span className="text-sm font-bold text-slate-400 ml-2">(Last 7 Days)</span></h3>
          </div>
          
          {last7Days.every(d => d.hours === 0) ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-10 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl">
              <BarChart3 className="h-10 w-10 opacity-20 mb-3" />
              <p className="text-[15px] font-bold">No study sessions logged yet</p>
              <p className="text-xs font-semibold mt-1 opacity-70">Complete Pomodoro sessions to see data here</p>
            </div>
          ) : (
            <div className="flex-1 min-h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={last7Days} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="studyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-slate-800" opacity={0.5} />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} dx={-10} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }} />
                  <Area type="monotone" dataKey="hours" name="Hours" stroke="#6366f1" fill="url(#studyGrad)" strokeWidth={3} activeDot={{ r: 6, fill: '#6366f1', strokeWidth: 0, stroke: '#fff' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Tasks Completed Chart */}
        <div className="glass-card p-6 md:p-8 flex flex-col hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group border border-slate-200/60 dark:border-white/10">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-white/5">
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 group-hover:scale-110 transition-transform">
              <CheckSquare className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-black tracking-tight text-slate-800 dark:text-slate-100">Tasks Completed <span className="text-sm font-bold text-slate-400 ml-2">(Last 7 Days)</span></h3>
          </div>
          
          {last7Days.every(d => d.tasks === 0) ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-10 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl">
              <CheckSquare className="h-10 w-10 opacity-20 mb-3" />
              <p className="text-[15px] font-bold">No tasks completed yet</p>
              <p className="text-xs font-semibold mt-1 opacity-70">Complete tasks to see your progress here</p>
            </div>
          ) : (
            <div className="flex-1 min-h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={last7Days} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-slate-800" opacity={0.5} />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} dx={-10} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148, 163, 184, 0.05)' }} />
                  <Bar dataKey="tasks" name="Tasks" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Subject Progress Chart */}
        <div className="glass-card lg:col-span-2 p-6 md:p-8 flex flex-col hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group border border-slate-200/60 dark:border-white/10">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-white/5">
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-500 group-hover:scale-110 transition-transform">
              <BookOpen className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-black tracking-tight text-slate-800 dark:text-slate-100">Subject Progress <span className="text-sm font-bold text-slate-400 ml-2">(Current Sem)</span></h3>
          </div>
          
          {subjects.length === 0 ? (
             <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-16 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl">
              <BookOpen className="h-10 w-10 opacity-20 mb-3" />
              <p className="text-[15px] font-bold">No subjects tracked yet</p>
              <p className="text-xs font-semibold mt-1 opacity-70">Add subjects in the Studies section</p>
            </div>
          ) : (
            <div className="flex-1 min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjects} layout="vertical" margin={{ top: 5, right: 40, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="4 4" horizontal={false} stroke="currentColor" className="text-slate-200 dark:text-slate-800" opacity={0.5} />
                  <XAxis type="number" domain={[0,100]} axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} dx={10} />
                  <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }} width={90} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148, 163, 184, 0.05)' }} />
                  <Bar dataKey="progress" name="Progress %" fill="#8b5cf6" radius={[0, 6, 6, 0]} maxBarSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {tasks.total === 0 && subjects.length === 0 && focusToday === 0 && (
        <div className="glass-card p-10 border-indigo-200/50 dark:border-indigo-500/20 text-center animate-fade-in relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none"><Target className="w-64 h-64" /></div>
          <BarChart3 className="h-16 w-16 mx-auto mb-4 text-indigo-500 opacity-60" />
          <h3 className="text-2xl font-black tracking-tight text-slate-800 dark:text-slate-100">Start using RiseOS to build data!</h3>
          <p className="text-sm font-bold text-slate-500 mt-2 max-w-md mx-auto">Add tasks, complete Pomodoro sessions, and track subjects. Your real productivity data will visualize here.</p>
        </div>
      )}
    </div>
  )
}