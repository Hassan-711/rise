# 🚀 RiseOS — Personal Productivity & Career OS

> A premium full-stack dashboard for tracking your career roadmap, study progress, daily tasks, and analytics.

Built for **Hassan** · B.Tech CSE @ Amity University Lucknow · AI Backend Engineer Track

---

## ✨ Features

| Module | Description |
|--------|-------------|
| 🏠 **Dashboard** | Summary cards, today's top tasks, streak, exam countdown, career progress |
| 📄 **Resume** | Skills, projects, certifications, experience, ATS PDF export |
| 📚 **Studies** | Semester & subject tracking, syllabus topics, exam dates, material upload |
| ✅ **Tasks** | Daily targets, Pomodoro timer, streak tracking, priority tags |
| 🗺️ **Roadmap** | Auto-seeded career path, milestone timeline, skill gaps, placement tracker |
| 📊 **Analytics** | Study hours, productivity score, subject comparison, skill radar chart |
| ⚙️ **Settings** | Profile, appearance (dark/light), notifications, data export |

---

## 🛠 Tech Stack

- **Framework:** Next.js 14 (App Router, TypeScript)
- **Database & Auth:** Supabase (PostgreSQL + Row Level Security)
- **Styling:** Tailwind CSS + shadcn/ui components
- **Charts:** Recharts
- **Animations:** CSS keyframes + Tailwind animate
- **Deploy:** Vercel

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/hassan/riseos.git
cd riseos
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run `supabase/migrations/001_initial_schema.sql`
3. Enable **Email Auth** in Authentication → Providers

### 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in your Supabase URL and keys:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
riseos/
├── src/
│   ├── app/
│   │   ├── auth/           # Login, Signup, Forgot Password
│   │   ├── dashboard/      # Home dashboard
│   │   ├── resume/         # Resume module
│   │   ├── studies/        # Study tracking
│   │   ├── tasks/          # Daily tasks + Pomodoro
│   │   ├── roadmap/        # Career roadmap
│   │   ├── analytics/      # Charts & analytics
│   │   └── settings/       # App settings
│   ├── components/
│   │   ├── ui/             # shadcn base components
│   │   ├── layout/         # Sidebar, Navbar, AppShell
│   │   ├── dashboard/      # StatCard, etc.
│   │   └── shared/         # ThemeProvider, Skeleton, EmptyState
│   ├── lib/
│   │   ├── supabase/       # Client, Server, Middleware
│   │   ├── hooks/          # useUser, etc.
│   │   ├── types/          # All TypeScript types
│   │   └── utils/          # Helpers + seed data
│   └── styles/
│       └── globals.css     # Design tokens & utilities
├── supabase/
│   └── migrations/         # Database schema SQL
├── public/
│   └── favicon.svg
├── vercel.json             # Vercel deploy config
└── .env.local.example      # Env template
```

---

## 🗄️ Database Schema

Tables: `profiles` · `skills` · `certifications` · `projects` · `academics` · `work_experience` · `semesters` · `subjects` · `study_materials` · `tasks` · `focus_sessions` · `career_goals` · `career_milestones` · `analytics_logs`

All tables have **Row Level Security (RLS)** — users can only access their own data.

---

## 🚢 Deploy to Vercel

```bash
npm install -g vercel
vercel --prod
```

Add environment variables in Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

---

## 🎯 Hassan's Career Roadmap (Pre-seeded)

The Career Roadmap module comes pre-seeded with your complete AI Backend Engineer path:

1. **DSA Mastery (C++)** — LeetCode + competitive programming
2. **Python Mastery** — Backend-focused Python learning
3. **FastAPI + Backend Engineering** — Production APIs, PostgreSQL, Redis, Docker
4. **AI/ML Integration** — ML pipelines + AI API integration
5. **Portfolio Projects** — URL Shortener, AI Task Scheduler, Chat API
6. **System Design** — Scalable architecture fundamentals
7. **Internship (Summer 2026)** — Target funded startups + MNCs
8. **Placement (3rd Year)** — Target ₹12–25 LPA

---

## 📈 Roadmap (Future Features)

- [ ] AI-powered daily priority suggestions
- [ ] Study material upload to Supabase Storage
- [ ] Actual PDF export with Puppeteer/html2canvas
- [ ] Mobile app (React Native)
- [ ] Calendar integration
- [ ] LeetCode progress sync via API
- [ ] GitHub activity integration
- [ ] Weekly review email digest

---

Built with ❤️ for the grind. Rise every day. 🚀
