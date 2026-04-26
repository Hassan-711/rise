'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import {
  FileText, User, Code2, Award, Briefcase, GraduationCap,
  GitBranch, ExternalLink, Plus, Edit3, Download, Eye,
  Linkedin, Github, Globe, Mail, Phone, MapPin, Star
} from 'lucide-react'
import { cn, generateInitials } from '@/lib/utils'
import { toast } from '@/components/ui/toaster'
import { SKILLS_SEED } from '@/lib/utils/seedData'
import type { Skill, Project, Certification, WorkExperience } from '@/lib/types'

// ── Pre-seeded profile data ────────────────────────────────────────────────────
const PROFILE = {
  full_name: 'Hassan',
  email: 'hassan@example.com',
  phone: '+91 9876543210',
  location: 'Lucknow, India',
  university: 'Amity University Lucknow',
  degree: 'B.Tech Computer Science & Engineering',
  enrollment_no: 'A7605224098',
  current_semester: 4,
  cgpa: 8.86,
  career_goal: 'AI-Powered Backend Engineer',
  bio: 'Passionate CS student at Amity University Lucknow building toward becoming an AI-Powered Backend Engineer. Strong in DSA with C++, exploring Python + FastAPI for production backend systems. Aiming for high-impact engineering roles at product companies.',
  linkedin_url: 'linkedin.com/in/hassan',
  github_url: 'github.com/hassan',
  portfolio_url: 'hassan.dev',
}

const SKILLS_DATA: Skill[] = SKILLS_SEED.map((s, i) => ({
  id: String(i + 1), user_id: '', ...s,
  category: s.category as Skill['category'],
  created_at: '',
}))

const PROJECTS_DATA: Project[] = [
  {
    id: '1', user_id: '',
    title: 'URL Shortener with Analytics',
    description: 'Production-grade URL shortener with real-time click analytics, caching layer, and detailed statistics dashboard. Built as NTCC Year 2 research project.',
    tech_stack: ['FastAPI', 'PostgreSQL', 'Redis', 'Docker', 'Next.js'],
    github_url: 'github.com/hassan/url-shortener',
    live_url: '',
    start_date: '2024-11-01',
    end_date: null,
    status: 'in_progress',
    highlights: [
      'Handles 10K+ requests/day with Redis caching (95% cache hit rate)',
      'Real-time analytics with PostgreSQL time-series queries',
      'Dockerized microservice architecture with CI/CD pipeline',
    ],
    created_at: '',
  },
  {
    id: '2', user_id: '',
    title: 'RiseOS — Personal Productivity Dashboard',
    description: 'Full-stack personal OS for tracking career roadmap, study progress, daily tasks, and analytics. Built with Next.js 14 + Supabase.',
    tech_stack: ['Next.js', 'TypeScript', 'Supabase', 'Tailwind CSS', 'Recharts'],
    github_url: 'github.com/hassan/riseos',
    live_url: 'riseos.vercel.app',
    start_date: '2025-01-01',
    end_date: null,
    status: 'in_progress',
    highlights: [
      'Auth, CRUD, and real-time data with Supabase PostgreSQL',
      'Pomodoro timer, streak tracking, and analytics charts',
      'Mobile-responsive with dark/light mode',
    ],
    created_at: '',
  },
  {
    id: '3', user_id: '',
    title: 'RNN Sentiment Analysis',
    description: 'Implemented LSTM-based sentiment analysis model for text classification as part of DNN coursework.',
    tech_stack: ['Python', 'TensorFlow', 'Keras', 'NumPy', 'Matplotlib'],
    github_url: 'github.com/hassan/sentiment-rnn',
    live_url: '',
    start_date: '2024-09-01',
    end_date: '2024-11-30',
    status: 'completed',
    highlights: [
      'Achieved 87% accuracy on IMDB sentiment dataset',
      'Fixed vanishing gradient issues with proper LSTM hyperparameter tuning',
      'Visualized training curves and confusion matrix',
    ],
    created_at: '',
  },
]

const CERTS_DATA: Certification[] = [
  {
    id: '1', user_id: '', name: 'NPTEL: Introduction to Machine Learning',
    issuer: 'IIT Kharagpur (NPTEL)', issue_date: '2024-12-01', expiry_date: null,
    credential_id: 'NPTEL24CS123', file_url: null, cert_url: 'nptel.ac.in/verify/NPTEL24CS123', created_at: '',
  },
  {
    id: '2', user_id: '', name: 'Python for Everybody',
    issuer: 'Coursera / University of Michigan', issue_date: '2024-08-15', expiry_date: null,
    credential_id: 'CRS-PY4E-2024', file_url: null, cert_url: 'coursera.org/verify/CRS-PY4E-2024', created_at: '',
  },
]

const EXPERIENCE_DATA: WorkExperience[] = []

const SKILL_CATEGORIES = ['language', 'framework', 'database', 'tool', 'soft', 'cloud'] as const
const CATEGORY_LABELS: Record<string, string> = {
  language: 'Languages', framework: 'Frameworks', database: 'Databases',
  tool: 'Tools & DevOps', soft: 'Soft Skills', cloud: 'Cloud',
}
const CATEGORY_COLORS: Record<string, string> = {
  language: 'text-blue-400 bg-blue-400/10',
  framework: 'text-violet-400 bg-violet-400/10',
  database: 'text-emerald-400 bg-emerald-400/10',
  tool: 'text-amber-400 bg-amber-400/10',
  soft: 'text-rose-400 bg-rose-400/10',
  cloud: 'text-cyan-400 bg-cyan-400/10',
}

type Tab = 'overview' | 'skills' | 'projects' | 'certifications' | 'experience' | 'preview'

export default function ResumePage() {
  const [tab, setTab] = useState<Tab>('overview')
  const [skills] = useState<Skill[]>(SKILLS_DATA)
  const [projects] = useState<Project[]>(PROJECTS_DATA)
  const [certs] = useState<Certification[]>(CERTS_DATA)
  const [editBio, setEditBio] = useState(false)
  const [bio, setBio] = useState(PROFILE.bio)

  function handleExportPDF() {
    toast({ title: '📄 Generating ATS Resume...', description: 'This would trigger PDF generation in production.' })
  }

  const groupedSkills = SKILL_CATEGORIES.reduce((acc, cat) => {
    acc[cat] = skills.filter(s => s.category === cat)
    return acc
  }, {} as Record<string, Skill[]>)

  const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'overview', label: 'Overview', icon: <User className="h-3.5 w-3.5" /> },
    { key: 'skills', label: 'Skills', icon: <Code2 className="h-3.5 w-3.5" /> },
    { key: 'projects', label: 'Projects', icon: <GitBranch className="h-3.5 w-3.5" /> },
    { key: 'certifications', label: 'Certs', icon: <Award className="h-3.5 w-3.5" /> },
    { key: 'experience', label: 'Experience', icon: <Briefcase className="h-3.5 w-3.5" /> },
    { key: 'preview', label: 'ATS Preview', icon: <Eye className="h-3.5 w-3.5" /> },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Resume Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Build your ATS-optimized resume</p>
        </div>
        <Button onClick={handleExportPDF} className="gap-2">
          <Download className="h-4 w-4" /> Export PDF
        </Button>
      </div>

      {/* Profile header card */}
      <Card className="gradient-border overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-violet-500/5 pointer-events-none" />
        <CardContent className="p-6 relative">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/20 border-2 border-primary/30 text-2xl font-bold text-primary">
              {generateInitials(PROFILE.full_name)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-xl font-bold">{PROFILE.full_name}</h2>
                  <p className="text-sm text-primary font-medium">{PROFILE.career_goal}</p>
                </div>
                <Badge variant="success" className="shrink-0">{PROFILE.cgpa} CGPA</Badge>
              </div>
              <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{PROFILE.email}</span>
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{PROFILE.location}</span>
                <span className="flex items-center gap-1"><GraduationCap className="h-3 w-3" />{PROFILE.university}</span>
                <span className="flex items-center gap-1"><Github className="h-3 w-3" />{PROFILE.github_url}</span>
                <span className="flex items-center gap-1"><Linkedin className="h-3 w-3" />{PROFILE.linkedin_url}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tab nav */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {TABS.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all',
              tab === key
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
            )}
          >
            {icon}{label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {tab === 'overview' && (
        <div className="grid lg:grid-cols-2 gap-6 animate-fade-in">
          {/* Bio */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" /> Professional Summary
                </CardTitle>
                <Button variant="ghost" size="icon-sm" onClick={() => setEditBio(!editBio)}>
                  <Edit3 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {editBio ? (
                <div className="space-y-3">
                  <textarea
                    className="w-full min-h-[100px] rounded-lg border border-input bg-background/50 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring/50"
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => { setEditBio(false); toast({ title: 'Bio saved!' }) }}>Save</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditBio(false)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground leading-relaxed">{bio}</p>
              )}
            </CardContent>
          </Card>

          {/* Academic info */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-emerald-400" /> Education
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 rounded-lg bg-secondary/40 border border-border/30">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold">{PROFILE.degree}</p>
                    <p className="text-xs text-muted-foreground">{PROFILE.university}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Enrollment: {PROFILE.enrollment_no}</p>
                  </div>
                  <Badge variant="success">{PROFILE.cgpa} CGPA</Badge>
                </div>
                <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                  <span>2023 – 2027</span>
                  <span>·</span>
                  <span>Semester {PROFILE.current_semester}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick stats */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-400" /> Resume Strength
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: 'Profile Completeness', value: 72 },
                { label: 'Skills Listed', value: skills.length > 0 ? Math.min(100, skills.length * 6) : 0 },
                { label: 'Projects Added', value: projects.length * 33 },
                { label: 'ATS Score (estimated)', value: 68 },
              ].map(({ label, value }) => (
                <div key={label} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-mono">{Math.min(100, value)}%</span>
                  </div>
                  <Progress value={Math.min(100, value)} className="h-1.5" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── SKILLS TAB ── */}
      {tab === 'skills' && (
        <div className="space-y-5 animate-fade-in">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{skills.length} skills across {Object.keys(groupedSkills).filter(k => groupedSkills[k].length > 0).length} categories</p>
            <Button size="sm" variant="outline" className="gap-2">
              <Plus className="h-3.5 w-3.5" /> Add Skill
            </Button>
          </div>
          {SKILL_CATEGORIES.filter(cat => groupedSkills[cat]?.length > 0).map(cat => (
            <Card key={cat}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Badge className={cn('text-[10px]', CATEGORY_COLORS[cat])}>{CATEGORY_LABELS[cat]}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {groupedSkills[cat].map(skill => (
                  <div key={skill.id} className="flex items-center gap-3">
                    <span className="text-sm w-28 shrink-0">{skill.name}</span>
                    <div className="flex-1">
                      <Progress value={skill.proficiency} className="h-2" />
                    </div>
                    <span className="text-xs font-mono text-muted-foreground w-8 text-right">{skill.proficiency}%</span>
                    <Badge
                      variant={skill.proficiency >= 70 ? 'success' : skill.proficiency >= 40 ? 'warning' : 'secondary'}
                      className="text-[10px] shrink-0"
                    >
                      {skill.proficiency >= 70 ? 'Strong' : skill.proficiency >= 40 ? 'Mid' : 'Learning'}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ── PROJECTS TAB ── */}
      {tab === 'projects' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{projects.length} projects</p>
            <Button size="sm" variant="outline" className="gap-2">
              <Plus className="h-3.5 w-3.5" /> Add Project
            </Button>
          </div>
          {projects.map(project => (
            <Card key={project.id} className="hover:border-primary/20 transition-colors">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-sm">{project.title}</h3>
                      <Badge
                        variant={project.status === 'completed' ? 'success' : project.status === 'in_progress' ? 'info' : 'secondary'}
                        className="text-[10px]"
                      >
                        {project.status === 'in_progress' ? 'In Progress' : project.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{project.description}</p>

                    {/* Tech stack */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {project.tech_stack.map(tech => (
                        <Badge key={tech} variant="outline" className="text-[10px]">{tech}</Badge>
                      ))}
                    </div>

                    {/* Highlights */}
                    {project.highlights.length > 0 && (
                      <ul className="mt-3 space-y-1">
                        {project.highlights.map((h, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                            <span className="text-primary mt-0.5">▸</span>
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Links */}
                    <div className="flex gap-3 mt-3">
                      {project.github_url && (
                        <a href={`https://${project.github_url}`} target="_blank" rel="noreferrer"
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                          <Github className="h-3 w-3" /> GitHub
                        </a>
                      )}
                      {project.live_url && (
                        <a href={`https://${project.live_url}`} target="_blank" rel="noreferrer"
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                          <ExternalLink className="h-3 w-3" /> Live
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ── CERTIFICATIONS TAB ── */}
      {tab === 'certifications' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{certs.length} certifications</p>
            <Button size="sm" variant="outline" className="gap-2">
              <Plus className="h-3.5 w-3.5" /> Add Certificate
            </Button>
          </div>
          {certs.map(cert => (
            <Card key={cert.id}>
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400/10 border border-amber-400/20">
                    <Award className="h-5 w-5 text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{cert.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{cert.issuer}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      {cert.issue_date && <span>Issued: {cert.issue_date}</span>}
                      {cert.credential_id && <span>ID: {cert.credential_id}</span>}
                    </div>
                    {cert.cert_url && (
                      <a href={`https://${cert.cert_url}`} target="_blank" rel="noreferrer"
                        className="mt-2 flex items-center gap-1 text-xs text-primary hover:underline">
                        <ExternalLink className="h-3 w-3" /> Verify
                      </a>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {certs.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Award className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm">No certificates yet. Add your first one!</p>
            </div>
          )}
        </div>
      )}

      {/* ── EXPERIENCE TAB ── */}
      {tab === 'experience' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{EXPERIENCE_DATA.length} experiences</p>
            <Button size="sm" variant="outline" className="gap-2">
              <Plus className="h-3.5 w-3.5" /> Add Experience
            </Button>
          </div>
          {EXPERIENCE_DATA.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p className="text-sm font-medium">No experience added yet</p>
              <p className="text-xs mt-1">Add internships, jobs, or freelance work</p>
              <Button size="sm" variant="outline" className="mt-4 gap-2">
                <Plus className="h-3.5 w-3.5" /> Add First Experience
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ── ATS PREVIEW TAB ── */}
      {tab === 'preview' && (
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">ATS-optimized resume preview</p>
            <Button onClick={handleExportPDF} className="gap-2">
              <Download className="h-4 w-4" /> Export PDF
            </Button>
          </div>
          <Card className="border-border/50">
            <CardContent className="p-0">
              {/* Resume preview — clean, ATS-friendly layout */}
              <div className="p-8 font-sans text-gray-900 dark:text-gray-100 max-w-3xl mx-auto">
                {/* Header */}
                <div className="text-center border-b border-border pb-4 mb-4">
                  <h1 className="text-2xl font-bold tracking-tight">{PROFILE.full_name}</h1>
                  <p className="text-sm text-primary font-medium mt-0.5">{PROFILE.career_goal}</p>
                  <div className="flex justify-center flex-wrap gap-4 mt-2 text-xs text-muted-foreground">
                    <span>{PROFILE.email}</span>
                    <span>{PROFILE.phone}</span>
                    <span>{PROFILE.location}</span>
                    <span>{PROFILE.github_url}</span>
                    <span>{PROFILE.linkedin_url}</span>
                  </div>
                </div>

                {/* Summary */}
                <div className="mb-4">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground border-b border-border pb-1 mb-2">Summary</h2>
                  <p className="text-sm leading-relaxed">{bio}</p>
                </div>

                {/* Education */}
                <div className="mb-4">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground border-b border-border pb-1 mb-2">Education</h2>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-semibold">{PROFILE.degree}</p>
                      <p className="text-xs text-muted-foreground">{PROFILE.university}</p>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <p>2023 – 2027</p>
                      <p className="font-semibold text-foreground">CGPA: {PROFILE.cgpa}</p>
                    </div>
                  </div>
                </div>

                {/* Skills */}
                <div className="mb-4">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground border-b border-border pb-1 mb-2">Technical Skills</h2>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <p><strong>Languages:</strong> C++, Python, Java, SQL</p>
                    <p><strong>Frameworks:</strong> FastAPI, Next.js, React</p>
                    <p><strong>Databases:</strong> PostgreSQL, Redis</p>
                    <p><strong>Tools:</strong> Git, Docker, Linux</p>
                  </div>
                </div>

                {/* Projects */}
                <div className="mb-4">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground border-b border-border pb-1 mb-2">Projects</h2>
                  {projects.map(p => (
                    <div key={p.id} className="mb-3">
                      <div className="flex justify-between items-baseline">
                        <p className="text-sm font-semibold">{p.title}</p>
                        <p className="text-xs text-muted-foreground">{p.tech_stack.join(', ')}</p>
                      </div>
                      <ul className="mt-1 space-y-0.5">
                        {p.highlights.map((h, i) => (
                          <li key={i} className="text-xs text-muted-foreground">• {h}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* Certifications */}
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground border-b border-border pb-1 mb-2">Certifications</h2>
                  {certs.map(c => (
                    <div key={c.id} className="flex justify-between text-xs mb-1">
                      <span className="font-medium">{c.name}</span>
                      <span className="text-muted-foreground">{c.issuer} · {c.issue_date}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
