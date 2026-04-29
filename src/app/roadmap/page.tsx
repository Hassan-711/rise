'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Map, ChevronDown, ChevronUp, Plus, Target, Trophy,
  Trash2, Calendar, Edit3, Check, X, Loader2, RefreshCw,
  CheckCircle2, Circle
} from 'lucide-react'
import { cn, formatDate, getCategoryColor } from '@/lib/utils'
import { toast } from '@/components/ui/toaster'
import {
  getCareerGoals, addCareerGoal, updateCareerGoal, deleteCareerGoal,
  addMilestone, updateMilestone, deleteMilestone,
} from '@/lib/db'
import type { CareerGoal, CareerMilestone } from '@/lib/types'

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
const CATEGORY_LABELS: Record<string, string> = {
  dsa: 'DSA', backend: 'Backend', ai_ml: 'AI/ML',
  project: 'Projects', internship: 'Internship',
  placement: 'Placement', system_design: 'System Design',
}
const CATEGORIES = Object.keys(CATEGORY_LABELS) as CareerGoal['category'][]

const STATUS_STYLES: Record<string, string> = {
  pending:   'border-border text-muted-foreground hover:border-primary/40',
  active:    'border-emerald-400/40 text-emerald-400 bg-emerald-400/10',
  completed: 'border-primary/40 text-primary bg-primary/10',
}

// ─────────────────────────────────────────────────────────────────────────────
// Inline confirm — compact, reusable
// ─────────────────────────────────────────────────────────────────────────────
function InlineConfirm({
  message, onConfirm, onCancel
}: { message: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-destructive/10 border border-destructive/20 animate-fade-in">
      <p className="text-xs text-destructive flex-1">{message}</p>
      <Button size="sm" variant="destructive" className="h-6 text-[10px] px-2.5" onClick={onConfirm}>Delete</Button>
      <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2" onClick={onCancel}>Cancel</Button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Default form states
// ─────────────────────────────────────────────────────────────────────────────
const BLANK_GOAL = {
  title: '', description: '', category: 'dsa' as CareerGoal['category'],
  target_date: '', priority: 5,
}
const BLANK_MILESTONE = { title: '', target_date: '' }

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
export default function RoadmapPage() {
  const [goals, setGoals] = useState<CareerGoal[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  // Add goal form
  const [showAddGoal, setShowAddGoal] = useState(false)
  const [newGoal, setNewGoal] = useState(BLANK_GOAL)
  const [addingGoal, setAddingGoal] = useState(false)

  // Edit goal — stores which goal is being edited + its draft values
  const [editGoalId, setEditGoalId] = useState<string | null>(null)
  const [editGoalForm, setEditGoalForm] = useState(BLANK_GOAL)
  const [savingGoal, setSavingGoal] = useState(false)

  // Delete goal confirm
  const [deleteGoalId, setDeleteGoalId] = useState<string | null>(null)
  const [deletingGoal, setDeletingGoal] = useState(false)

  // Add milestone — per goal
  const [newMilestoneTitle, setNewMilestoneTitle] = useState<Record<string, string>>({})
  const [addingMilestone, setAddingMilestone] = useState<string | null>(null)

  // Edit milestone — stores which milestone is being edited + its draft
  const [editMilestoneId, setEditMilestoneId] = useState<string | null>(null)
  const [editMilestoneForm, setEditMilestoneForm] = useState(BLANK_MILESTONE)
  const [savingMilestone, setSavingMilestone] = useState(false)

  // Delete milestone confirm
  const [deleteMilestoneId, setDeleteMilestoneId] = useState<string | null>(null)
  const [deletingMilestone, setDeletingMilestone] = useState(false)

  // ── Data loading ─────────────────────────────────────────────────────────────
  const loadGoals = useCallback(() => {
    setLoading(true)
    getCareerGoals()
      .then(d => { setGoals(d as CareerGoal[]); setLoading(false) })
      .catch(() => { toast({ title: 'Failed to load goals', variant: 'destructive' }); setLoading(false) })
  }, [])

  useEffect(() => { loadGoals() }, [loadGoals])

  // ── Derived stats ────────────────────────────────────────────────────────────
  const allMilestones   = goals.flatMap(g => g.milestones ?? [])
  const totalMilestones = allMilestones.length
  const doneMilestones  = allMilestones.filter(m => m.status === 'completed').length
  const overallProgress = totalMilestones ? Math.round((doneMilestones / totalMilestones) * 100) : 0

  // ─────────────────────────────────────────────────────────────────────────────
  // GOAL HANDLERS
  // ─────────────────────────────────────────────────────────────────────────────

  // ADD GOAL
  async function handleAddGoal() {
    if (!newGoal.title.trim() || addingGoal) return
    setAddingGoal(true)
    const { data, error } = await addCareerGoal({
      title: newGoal.title.trim(),
      description: newGoal.description.trim() || null,
      category: newGoal.category,
      target_date: newGoal.target_date || null,
      priority: newGoal.priority,
      status: 'pending',
    })
    if (error) {
      toast({ title: 'Failed to add goal', description: error, variant: 'destructive' })
    } else {
      setGoals(prev => [...prev, { ...(data as CareerGoal), milestones: [] }])
      setNewGoal(BLANK_GOAL)
      setShowAddGoal(false)
      toast({ title: 'Goal added 🎯' })
    }
    setAddingGoal(false)
  }

  // START EDIT GOAL
  function startEditGoal(goal: CareerGoal) {
    setEditGoalId(goal.id)
    setEditGoalForm({
      title: goal.title,
      description: goal.description ?? '',
      category: goal.category,
      target_date: goal.target_date ?? '',
      priority: goal.priority,
    })
    // Close add form if open
    setShowAddGoal(false)
  }

  // SAVE EDIT GOAL
  async function handleSaveGoal(id: string) {
    if (!editGoalForm.title.trim() || savingGoal) return
    setSavingGoal(true)
    const updates = {
      title: editGoalForm.title.trim(),
      description: editGoalForm.description.trim() || null,
      category: editGoalForm.category,
      target_date: editGoalForm.target_date || null,
      priority: editGoalForm.priority,
    }
    // Optimistic update
    setGoals(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g))
    setEditGoalId(null)

    const { error } = await updateCareerGoal(id, updates)
    if (error) {
      toast({ title: 'Failed to save changes', description: error, variant: 'destructive' })
      loadGoals() // rollback
    } else {
      toast({ title: 'Goal updated ✅' })
    }
    setSavingGoal(false)
  }

  // TOGGLE GOAL STATUS (click the status badge to cycle)
  async function handleToggleGoalStatus(goal: CareerGoal) {
    const next = goal.status === 'pending' ? 'active'
      : goal.status === 'active' ? 'completed' : 'pending'
    setGoals(prev => prev.map(g => g.id === goal.id ? { ...g, status: next } : g))
    const { error } = await updateCareerGoal(goal.id, { status: next })
    if (error) { toast({ title: 'Failed to update status', variant: 'destructive' }); loadGoals() }
    else toast({ title: `Marked as ${next}` })
  }

  // DELETE GOAL
  async function handleDeleteGoal(id: string) {
    if (deletingGoal) return
    setDeletingGoal(true)
    setDeleteGoalId(null)
    setGoals(prev => prev.filter(g => g.id !== id))
    if (expanded === id) setExpanded(null)

    const { error } = await deleteCareerGoal(id)
    if (error) {
      toast({ title: 'Failed to delete goal', description: error, variant: 'destructive' })
      loadGoals()
    } else {
      toast({ title: 'Goal deleted' })
    }
    setDeletingGoal(false)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // MILESTONE HANDLERS
  // ─────────────────────────────────────────────────────────────────────────────

  // ADD MILESTONE
  async function handleAddMilestone(goalId: string) {
    const text = newMilestoneTitle[goalId]?.trim()
    if (!text || addingMilestone) return
    setAddingMilestone(goalId)
    const { data, error } = await addMilestone({
      goal_id: goalId, title: text, status: 'pending', resources: [],
    })
    if (error) {
      toast({ title: 'Failed to add milestone', variant: 'destructive' })
    } else {
      setGoals(prev => prev.map(g =>
        g.id === goalId
          ? { ...g, milestones: [...(g.milestones ?? []), data as CareerMilestone] }
          : g
      ))
      setNewMilestoneTitle(prev => ({ ...prev, [goalId]: '' }))
    }
    setAddingMilestone(null)
  }

  // TOGGLE MILESTONE STATUS
  async function handleToggleMilestone(goalId: string, milestone: CareerMilestone) {
    const next = milestone.status === 'completed' ? 'pending' : 'completed'
    const updates = {
      status: next,
      completed_at: next === 'completed' ? new Date().toISOString().split('T')[0] : null,
    }
    setGoals(prev => prev.map(g =>
      g.id === goalId
        ? { ...g, milestones: (g.milestones ?? []).map(m => m.id === milestone.id ? { ...m, ...updates } as CareerMilestone : m) }
        : g
    ))
    const { error } = await updateMilestone(milestone.id, updates as Partial<CareerMilestone>)
    if (error) { toast({ title: 'Failed to update', variant: 'destructive' }); loadGoals() }
    else if (next === 'completed') toast({ title: '✅ Milestone completed!' })
  }

  // START EDIT MILESTONE
  function startEditMilestone(milestone: CareerMilestone) {
    setEditMilestoneId(milestone.id)
    setEditMilestoneForm({
      title: milestone.title,
      target_date: milestone.target_date ?? '',
    })
  }

  // SAVE EDIT MILESTONE
  async function handleSaveMilestone(goalId: string, milestoneId: string) {
    if (!editMilestoneForm.title.trim() || savingMilestone) return
    setSavingMilestone(true)
    const updates = {
      title: editMilestoneForm.title.trim(),
      target_date: editMilestoneForm.target_date || null,
    }
    // Optimistic
    setGoals(prev => prev.map(g =>
      g.id === goalId
        ? { ...g, milestones: (g.milestones ?? []).map(m => m.id === milestoneId ? { ...m, ...updates } as CareerMilestone : m) }
        : g
    ))
    setEditMilestoneId(null)

    const { error } = await updateMilestone(milestoneId, updates as Partial<CareerMilestone>)
    if (error) {
      toast({ title: 'Failed to save milestone', description: error, variant: 'destructive' })
      loadGoals()
    } else {
      toast({ title: 'Milestone updated ✅' })
    }
    setSavingMilestone(false)
  }

  // DELETE MILESTONE
  async function handleDeleteMilestone(goalId: string, milestoneId: string) {
    if (deletingMilestone) return
    setDeletingMilestone(true)
    setDeleteMilestoneId(null)
    setGoals(prev => prev.map(g =>
      g.id === goalId
        ? { ...g, milestones: (g.milestones ?? []).filter(m => m.id !== milestoneId) }
        : g
    ))
    const { error } = await deleteMilestone(milestoneId)
    if (error) {
      toast({ title: 'Failed to delete milestone', description: error, variant: 'destructive' })
      loadGoals()
    } else {
      toast({ title: 'Milestone deleted' })
    }
    setDeletingMilestone(false)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Career Roadmap</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {goals.filter(g => g.status === 'active').length} active ·{' '}
            {goals.filter(g => g.status === 'completed').length} completed ·{' '}
            {goals.length} total goals
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon-sm" onClick={loadGoals} title="Refresh">
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
          <Button size="sm" className="gap-2"
            onClick={() => { setShowAddGoal(s => !s); setEditGoalId(null) }}>
            <Plus className="h-4 w-4" /> Add Goal
          </Button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Overall Progress', value: `${overallProgress}%`, color: 'gradient-text' },
          { label: 'Milestones Done',  value: doneMilestones,        color: 'text-emerald-400' },
          { label: 'Active Goals',     value: goals.filter(g => g.status === 'active').length, color: 'text-amber-400' },
          { label: 'Total Goals',      value: goals.length,          color: 'text-violet-400' },
        ].map(({ label, value, color }) => (
          <Card key={label} className="p-4 text-center">
            <p className={cn('text-2xl font-bold', color)}>{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{label}</p>
          </Card>
        ))}
      </div>

      {/* ── Progress bar ── */}
      {totalMilestones > 0 && (
        <Card className="gradient-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold flex items-center gap-2">
                <Map className="h-4 w-4 text-primary" /> Roadmap Progress
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                {doneMilestones}/{totalMilestones} milestones
              </span>
            </div>
            <Progress value={overallProgress} className="h-2.5" />
          </CardContent>
        </Card>
      )}

      {/* ── Add Goal Form ── */}
      {showAddGoal && (
        <Card className="border-primary/30 animate-fade-in">
          <CardContent className="pt-5 pb-5 space-y-4">
            <p className="text-sm font-semibold">Add New Goal</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <Label className="text-xs">Goal Title *</Label>
                <Input placeholder="e.g. Master FastAPI + Backend Engineering"
                  value={newGoal.title} onChange={e => setNewGoal({ ...newGoal, title: e.target.value })}
                  onKeyDown={e => e.key === 'Enter' && handleAddGoal()} />
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <Label className="text-xs">Description</Label>
                <Input placeholder="What does completing this goal look like?"
                  value={newGoal.description} onChange={e => setNewGoal({ ...newGoal, description: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Category</Label>
                <select className="w-full h-10 rounded-lg border border-input bg-background/50 px-3 text-sm"
                  value={newGoal.category}
                  onChange={e => setNewGoal({ ...newGoal, category: e.target.value as CareerGoal['category'] })}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Target Date</Label>
                <Input type="date" value={newGoal.target_date}
                  onChange={e => setNewGoal({ ...newGoal, target_date: e.target.value })} />
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <Label className="text-xs">Priority: {newGoal.priority}/10</Label>
                <input type="range" min={1} max={10} value={newGoal.priority}
                  onChange={e => setNewGoal({ ...newGoal, priority: parseInt(e.target.value) })}
                  className="w-full accent-primary" />
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <Button size="sm" onClick={handleAddGoal} disabled={addingGoal} className="gap-1.5">
                {addingGoal ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                {addingGoal ? 'Saving…' : 'Add Goal'}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowAddGoal(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Goal list ── */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-24 rounded-xl bg-secondary/50 animate-pulse" />)}
        </div>
      ) : goals.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Target className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p className="font-medium">No goals yet</p>
          <p className="text-xs mt-1">Click "Add Goal" to start building your roadmap</p>
        </div>
      ) : (
        <div className="space-y-3">
          {goals.map((goal, idx) => {
            const isExpanded    = expanded === goal.id
            const isEditingGoal = editGoalId === goal.id
            const isDeletingGoal = deleteGoalId === goal.id
            const milestones    = goal.milestones ?? []
            const done          = milestones.filter(m => m.status === 'completed').length
            const progress      = milestones.length ? Math.round((done / milestones.length) * 100) : 0

            return (
              <Card key={goal.id} className={cn(
                'transition-all duration-200',
                goal.status === 'active'    && 'border-primary/30',
                goal.status === 'completed' && 'border-emerald-500/20',
              )}>
                <CardHeader className="pb-3">

                  {/* ── Goal: Edit mode ── */}
                  {isEditingGoal ? (
                    <div className="space-y-4 animate-fade-in">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Edit Goal</p>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div className="sm:col-span-2 space-y-1">
                          <Label className="text-xs">Title *</Label>
                          <Input value={editGoalForm.title}
                            onChange={e => setEditGoalForm({ ...editGoalForm, title: e.target.value })} />
                        </div>
                        <div className="sm:col-span-2 space-y-1">
                          <Label className="text-xs">Description</Label>
                          <Input placeholder="Optional description"
                            value={editGoalForm.description}
                            onChange={e => setEditGoalForm({ ...editGoalForm, description: e.target.value })} />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Category</Label>
                          <select className="w-full h-10 rounded-lg border border-input bg-background/50 px-3 text-sm"
                            value={editGoalForm.category}
                            onChange={e => setEditGoalForm({ ...editGoalForm, category: e.target.value as CareerGoal['category'] })}>
                            {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Target Date</Label>
                          <Input type="date" value={editGoalForm.target_date}
                            onChange={e => setEditGoalForm({ ...editGoalForm, target_date: e.target.value })} />
                        </div>
                        <div className="sm:col-span-2 space-y-1">
                          <Label className="text-xs">Priority: {editGoalForm.priority}/10</Label>
                          <input type="range" min={1} max={10} value={editGoalForm.priority}
                            onChange={e => setEditGoalForm({ ...editGoalForm, priority: parseInt(e.target.value) })}
                            className="w-full accent-primary" />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="gap-1.5"
                          onClick={() => handleSaveGoal(goal.id)} disabled={savingGoal}>
                          {savingGoal ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                          {savingGoal ? 'Saving…' : 'Save Changes'}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditGoalId(null)}>
                          <X className="h-3.5 w-3.5 mr-1" /> Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* ── Goal: View mode ── */
                    <div className="flex items-start gap-3">
                      {/* Number badge */}
                      <div className={cn(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold',
                        goal.status === 'active'    ? 'bg-primary/20 text-primary border border-primary/30' :
                        goal.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                                                      'bg-secondary text-muted-foreground'
                      )}>{idx + 1}</div>

                      {/* Main content — click to expand */}
                      <div className="flex-1 min-w-0 cursor-pointer"
                        onClick={() => setExpanded(isExpanded ? null : goal.id)}>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-sm">{goal.title}</h3>
                          <Badge className={cn('text-[10px]', getCategoryColor(goal.category))}>
                            {CATEGORY_LABELS[goal.category]}
                          </Badge>
                          {/* Status badge — click cycles status, doesn't expand */}
                          <button
                            onClick={e => { e.stopPropagation(); handleToggleGoalStatus(goal) }}
                            className={cn(
                              'text-[10px] px-2 py-0.5 rounded-full border font-medium transition-all capitalize',
                              STATUS_STYLES[goal.status]
                            )}>
                            {goal.status}
                          </button>
                        </div>
                        {goal.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{goal.description}</p>
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

                      {/* Action buttons */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          title="Edit goal"
                          onClick={e => { e.stopPropagation(); startEditGoal(goal) }}
                          className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          title="Delete goal"
                          onClick={e => { e.stopPropagation(); setDeleteGoalId(goal.id) }}
                          className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setExpanded(isExpanded ? null : goal.id)}
                          className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Delete goal confirm */}
                  {isDeletingGoal && (
                    <div className="mt-3">
                      <InlineConfirm
                        message="Delete this goal and all its milestones?"
                        onConfirm={() => handleDeleteGoal(goal.id)}
                        onCancel={() => setDeleteGoalId(null)}
                      />
                    </div>
                  )}
                </CardHeader>

                {/* ── Milestones (expanded) ── */}
                {isExpanded && !isEditingGoal && (
                  <CardContent className="pt-0 border-t border-border/50 animate-fade-in">
                    <div className="mt-4 relative">
                      {/* Vertical timeline line */}
                      <div className="absolute left-3.5 top-0 bottom-0 w-px bg-border/50" />

                      <div className="space-y-2 pl-8">
                        {milestones.length === 0 && (
                          <p className="text-xs text-muted-foreground py-2">
                            No milestones yet. Add one below to break this goal into steps.
                          </p>
                        )}

                        {milestones.map(milestone => {
                          const isEditingMs  = editMilestoneId === milestone.id
                          const isDeletingMs = deleteMilestoneId === milestone.id

                          return (
                            <div key={milestone.id} className="relative">
                              {/* Timeline dot */}
                              <div
                                className={cn(
                                  'absolute -left-[22px] mt-1 h-4 w-4 rounded-full border-2 flex items-center justify-center transition-all',
                                  milestone.status === 'completed'
                                    ? 'bg-emerald-400/20 border-emerald-400 cursor-pointer hover:bg-emerald-400/30'
                                    : 'bg-background border-border cursor-pointer hover:border-primary'
                                )}
                                onClick={() => !isEditingMs && handleToggleMilestone(goal.id, milestone)}
                              >
                                {milestone.status === 'completed' && (
                                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                )}
                              </div>

                              {/* ── Milestone: Edit mode ── */}
                              {isEditingMs ? (
                                <div className={cn(
                                  'p-3 rounded-lg border space-y-2 animate-fade-in',
                                  'bg-primary/5 border-primary/20'
                                )}>
                                  <Input
                                    className="h-8 text-xs"
                                    placeholder="Milestone title"
                                    value={editMilestoneForm.title}
                                    onChange={e => setEditMilestoneForm({ ...editMilestoneForm, title: e.target.value })}
                                    onKeyDown={e => e.key === 'Enter' && handleSaveMilestone(goal.id, milestone.id)}
                                    autoFocus
                                  />
                                  <div className="flex items-center gap-2">
                                    <Input
                                      type="date"
                                      className="h-8 text-xs flex-1"
                                      value={editMilestoneForm.target_date}
                                      onChange={e => setEditMilestoneForm({ ...editMilestoneForm, target_date: e.target.value })}
                                    />
                                    <Button size="sm" className="h-8 text-xs gap-1 shrink-0"
                                      onClick={() => handleSaveMilestone(goal.id, milestone.id)}
                                      disabled={savingMilestone}>
                                      {savingMilestone ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                                      Save
                                    </Button>
                                    <Button size="sm" variant="ghost" className="h-8 text-xs px-2 shrink-0"
                                      onClick={() => setEditMilestoneId(null)}>
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                /* ── Milestone: View mode ── */
                                <div className={cn(
                                  'p-2.5 rounded-lg border transition-colors group/ms',
                                  milestone.status === 'completed'
                                    ? 'bg-emerald-500/5 border-emerald-500/10'
                                    : 'bg-secondary/30 border-border/30 hover:bg-secondary/50'
                                )}>
                                  <div className="flex items-center gap-2">
                                    <div className="flex-1 min-w-0">
                                      <p className={cn(
                                        'text-xs font-medium',
                                        milestone.status === 'completed' && 'line-through text-muted-foreground'
                                      )}>
                                        {milestone.title}
                                      </p>
                                      {milestone.target_date && (
                                        <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                                          <Calendar className="h-2.5 w-2.5" />
                                          {formatDate(milestone.target_date, 'MMM d, yyyy')}
                                        </p>
                                      )}
                                    </div>
                                    {/* Milestone actions — visible on hover */}
                                    <div className="flex items-center gap-0.5 opacity-0 group-hover/ms:opacity-100 transition-opacity shrink-0">
                                      <button
                                        title="Toggle complete"
                                        onClick={() => handleToggleMilestone(goal.id, milestone)}
                                        className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-emerald-400 transition-colors">
                                        {milestone.status === 'completed'
                                          ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                                          : <Circle className="h-3.5 w-3.5" />}
                                      </button>
                                      <button
                                        title="Edit milestone"
                                        onClick={() => startEditMilestone(milestone)}
                                        className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                                        <Edit3 className="h-3 w-3" />
                                      </button>
                                      <button
                                        title="Delete milestone"
                                        onClick={() => setDeleteMilestoneId(milestone.id)}
                                        className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                                        <Trash2 className="h-3 w-3" />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Delete milestone confirm */}
                                  {isDeletingMs && (
                                    <div className="mt-2">
                                      <InlineConfirm
                                        message="Delete this milestone?"
                                        onConfirm={() => handleDeleteMilestone(goal.id, milestone.id)}
                                        onCancel={() => setDeleteMilestoneId(null)}
                                      />
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )
                        })}

                        {/* Add milestone row */}
                        <div className="relative">
                          <div className="absolute -left-[22px] mt-2 h-4 w-4 rounded-full border-2 border-dashed border-border/60" />
                          <div className="flex gap-2">
                            <Input
                              placeholder="Add a milestone… (press Enter)"
                              className="h-8 text-xs flex-1"
                              value={newMilestoneTitle[goal.id] ?? ''}
                              onChange={e => setNewMilestoneTitle(prev => ({ ...prev, [goal.id]: e.target.value }))}
                              onKeyDown={e => e.key === 'Enter' && handleAddMilestone(goal.id)}
                            />
                            <Button
                              size="sm" className="h-8 text-xs px-3 shrink-0"
                              onClick={() => handleAddMilestone(goal.id)}
                              disabled={addingMilestone === goal.id}>
                              {addingMilestone === goal.id
                                ? <Loader2 className="h-3 w-3 animate-spin" />
                                : 'Add'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
