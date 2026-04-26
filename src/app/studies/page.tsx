'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  BookOpen, Plus, Calendar, ChevronDown, ChevronUp,
  Clock, FileText, CheckCircle2, Circle, Trophy, AlertTriangle
} from 'lucide-react'
import { cn, formatDate, daysUntil, getPriorityColor } from '@/lib/utils'
import { toast } from '@/components/ui/toaster'
import type { Subject, SyllabusTopic } from '@/lib/types'
import { SEMESTER4_SUBJECTS } from '@/lib/utils/seedData'

// Hydrate with typed seed data
const SUBJECTS_DATA: Subject[] = SEMESTER4_SUBJECTS.map((s, i) => ({
  id: String(i + 1),
  semester_id: 'sem4',
  user_id: '',
  name: s.name,
  code: s.code,
  credits: s.credits,
  progress: s.progress,
  priority: s.priority as 'high' | 'medium' | 'low',
  exam_date: `2025-05-${18 + i * 2}`,
  syllabus_topics: [
    { id: '1', topic: 'Introduction & Basics', done: true },
    { id: '2', topic: 'Core Concepts', done: true },
    { id: '3', topic: 'Advanced Topics', done: i < 3 },
    { id: '4', topic: 'Applications', done: i < 2 },
    { id: '5', topic: 'Revision & PYQs', done: false },
  ],
  color: s.color,
  created_at: '',
}))

export default function StudiesPage() {
  const [subjects, setSubjects] = useState<Subject[]>(SUBJECTS_DATA)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [showAddSubject, setShowAddSubject] = useState(false)
  const [newSubject, setNewSubject] = useState({ name: '', code: '', credits: 3 })

  const overallProgress = Math.round(
    subjects.reduce((s, sub) => s + sub.progress, 0) / subjects.length
  )

  function toggleTopic(subjectId: string, topicId: string) {
    setSubjects(prev => prev.map(s => {
      if (s.id !== subjectId) return s
      return {
        ...s,
        syllabus_topics: s.syllabus_topics.map(t =>
          t.id === topicId ? { ...t, done: !t.done } : t
        ),
        progress: Math.round(
          s.syllabus_topics.map(t => t.id === topicId ? { ...t, done: !t.done } : t)
            .filter(t => t.done).length / s.syllabus_topics.length * 100
        ),
      }
    }))
  }

  function addSubject() {
    if (!newSubject.name.trim()) return
    const subject: Subject = {
      id: String(Date.now()),
      semester_id: 'sem4',
      user_id: '',
      name: newSubject.name,
      code: newSubject.code,
      credits: newSubject.credits,
      progress: 0,
      priority: 'medium',
      exam_date: null,
      syllabus_topics: [],
      color: ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6'][subjects.length % 5],
      created_at: '',
    }
    setSubjects(prev => [...prev, subject])
    setNewSubject({ name: '', code: '', credits: 3 })
    setShowAddSubject(false)
    toast({ title: `${subject.name} added! 📚` })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Study Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Semester 4 · Amity University Lucknow</p>
        </div>
        <Button onClick={() => setShowAddSubject(!showAddSubject)} size="sm" className="gap-2">
          <Plus className="h-4 w-4" /> Add Subject
        </Button>
      </div>

      {/* Overall progress */}
      <Card className="gradient-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Semester 4 Overall Progress</p>
              <p className="text-3xl font-bold mt-1">{overallProgress}%</p>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-400" />
              <div className="text-right">
                <p className="text-sm font-semibold">Target SGPA</p>
                <p className="text-lg font-bold gradient-text">9.0+</p>
              </div>
            </div>
          </div>
          <Progress value={overallProgress} className="h-2.5" />
          <div className="mt-3 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-lg font-bold text-emerald-400">{subjects.filter(s => s.progress >= 80).length}</p>
              <p className="text-[10px] text-muted-foreground">Strong</p>
            </div>
            <div>
              <p className="text-lg font-bold text-amber-400">{subjects.filter(s => s.progress >= 50 && s.progress < 80).length}</p>
              <p className="text-[10px] text-muted-foreground">In Progress</p>
            </div>
            <div>
              <p className="text-lg font-bold text-rose-400">{subjects.filter(s => s.progress < 50).length}</p>
              <p className="text-[10px] text-muted-foreground">Need Work</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add subject form */}
      {showAddSubject && (
        <Card className="border-primary/30 animate-fade-in">
          <CardHeader><CardTitle className="text-base">Add New Subject</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-2">
                <Label>Subject Name</Label>
                <Input placeholder="e.g. Computer Networks" value={newSubject.name}
                  onChange={e => setNewSubject({ ...newSubject, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Code</Label>
                <Input placeholder="CSE301" value={newSubject.code}
                  onChange={e => setNewSubject({ ...newSubject, code: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={addSubject} size="sm">Add Subject</Button>
              <Button variant="ghost" size="sm" onClick={() => setShowAddSubject(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subject cards */}
      <div className="space-y-3">
        {subjects.map(subject => {
          const isExpanded = expanded === subject.id
          const days = daysUntil(subject.exam_date)
          const doneTasks = subject.syllabus_topics.filter(t => t.done).length
          const isUrgent = (days ?? 999) <= 7

          return (
            <Card key={subject.id} className={cn('transition-all duration-200', isUrgent && 'border-rose-400/20')}>
              <CardHeader
                className="pb-3 cursor-pointer"
                onClick={() => setExpanded(isExpanded ? null : subject.id)}
              >
                <div className="flex items-center gap-3">
                  {/* Color indicator */}
                  <div className="h-10 w-1 rounded-full shrink-0" style={{ background: subject.color }} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-sm">{subject.name}</h3>
                      <span className="text-xs text-muted-foreground font-mono">{subject.code}</span>
                      <Badge className={cn('text-[10px]', getPriorityColor(subject.priority))}>
                        {subject.priority}
                      </Badge>
                      {isUrgent && (
                        <Badge variant="error" className="text-[10px] gap-1">
                          <AlertTriangle className="h-2.5 w-2.5" /> {days}d left
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <Progress value={subject.progress} className="flex-1 h-1.5"
                        indicatorClassName=""
                        style={{ '--indicator-color': subject.color } as React.CSSProperties}
                      />
                      <span className="text-xs font-mono text-muted-foreground shrink-0">{subject.progress}%</span>
                    </div>
                    <div className="flex items-center gap-4 mt-1.5 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        {doneTasks}/{subject.syllabus_topics.length} topics
                      </span>
                      {subject.exam_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Exam: {formatDate(subject.exam_date)}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {subject.credits} credits
                      </span>
                    </div>
                  </div>

                  <div className="text-muted-foreground shrink-0">
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </div>
              </CardHeader>

              {/* Expanded: syllabus topics */}
              {isExpanded && (
                <CardContent className="pt-0 border-t border-border/50 animate-fade-in">
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Syllabus Topics
                      </p>
                      <Button variant="ghost" size="sm" className="text-xs gap-1 h-7">
                        <Plus className="h-3 w-3" /> Add Topic
                      </Button>
                    </div>
                    {subject.syllabus_topics.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-4">
                        No topics added yet. Add topics to track your syllabus.
                      </p>
                    ) : (
                      subject.syllabus_topics.map(topic => (
                        <div
                          key={topic.id}
                          className={cn(
                            'flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors',
                            topic.done ? 'bg-emerald-500/5' : 'hover:bg-secondary/50'
                          )}
                          onClick={() => toggleTopic(subject.id, topic.id)}
                        >
                          {topic.done
                            ? <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                            : <Circle className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                          }
                          <span className={cn(
                            'text-sm',
                            topic.done && 'line-through text-muted-foreground'
                          )}>
                            {topic.topic}
                          </span>
                        </div>
                      ))
                    )}

                    {/* Materials section */}
                    <div className="mt-4 pt-3 border-t border-border/50">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Study Materials
                        </p>
                        <Button variant="ghost" size="sm" className="text-xs gap-1 h-7">
                          <FileText className="h-3 w-3" /> Upload
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground text-center py-2">
                        Upload PDFs, PPTs, or notes for this subject
                      </p>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
