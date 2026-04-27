# 🌿 CivicSync  
### *Turn Data into Action. Turn People into Change.*

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)  ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)  ![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=for-the-badge&logo=supabase)  ![Tailwind](https://img.shields.io/badge/TailwindCSS-4-06B6D4?style=for-the-badge&logo=tailwindcss)  ![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?style=for-the-badge&logo=vercel)

<br/>

**A full-stack platform that transforms scattered NGO data into real-world impact — by connecting volunteers with urgent community needs.**

<br/>


<img width="1897" height="896" alt="Screenshot 2026-04-28 031711" src="https://github.com/user-attachments/assets/36d4ed6e-4702-4322-8b1f-e7c0273d1753" />

---

[🚀 Live Demo](https://civicsync-seven.vercel.app) • [🐞 Report Bug](https://github.com/Shubh2026/CivicSync/issues) • [✨ Request Feature](https://github.com/Shubh2026/CivicSync/issues)

</div>

---

## 🧭 The Problem

Across communities, there’s a clear gap:

- NGOs **collect valuable field data**  
- Volunteers **want to help**  
- But there’s **no intelligent bridge between them**

Result → missed opportunities, delayed action, and fragmented impact.

---

## 💡 The Solution

**CivicSync bridges this gap.**

It transforms raw community data into:
- structured needs  
- matched opportunities  
- real-time volunteer coordination  

All powered by a **smart matching system + real-time backend**.

---

## ✨ Core Highlights

### 🌐 Platform Experience
- 🎨 Modern, polished landing UI  
- 🔐 Role-based authentication (Volunteer / NGO)  
- 🔑 Google OAuth-first flow  
- 📱 Fully responsive design  

---

### 🟢 Volunteer Dashboard
- 🗺️ Smart opportunity feed (location + skills based)
- ✅ One-click participation
- 📊 Personal impact analytics (charts + stats)
- 🔔 Real-time updates & alerts  

---

### 🔵 NGO Dashboard
- 📤 Upload structured community needs  
- 📋 Create volunteer requests  
- 👥 Track volunteer participation  
- 📈 Visual analytics (pipeline, fulfillment, trends)  

---

### ⚙️ System & Backend
- ⚡ Real-time updates (Supabase Realtime)  
- 🧠 Intelligent matching engine  
- 🔒 Secure API with session validation  
- 🗄️ PostgreSQL + Prisma ORM  

---

## 🛠️ Tech Stack

| Layer | Stack |
|------|------|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI | shadcn/ui + Lucide |
| Backend | Supabase |
| Database | PostgreSQL |
| ORM | Prisma |
| Charts | Recharts |
| Deployment | Vercel |

---

## 🚀 Live Demo

| Environment | Link |
|------------|------|
| 🌐 Production | https://civicsync-seven.vercel.app |
| 📦 GitHub | https://github.com/Shubh2026/CivicSync |

---

## ⚡ Quick Start

```bash
git clone https://github.com/Shubh2026/CivicSync.git
cd CivicSync/civicsync
npm install
```
---

## 🔐 Setup Environment
```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key

DATABASE_URL=your_db_url
DIRECT_URL=your_direct_db_url

npx prisma generate
npx prisma db push
npm run dev
```
---

### 📖 How It Works

🟢 Volunteer Flow
```
Login → Browse Opportunities → Accept → Track Impact
```
🔵 NGO Flow
```
Upload Needs → Create Requests → Get Volunteers → Track Analytics
```
---

🌍 Impact Vision
| **Focus**        | **Outcome**                              |
|-----------------|------------------------------------------|
| 📍 Local-first   | Better relevance & faster response       |
| 📊 Data-driven   | Turn raw data into actionable insights   |
| ⚡ Real-time     | Instant coordination and updates         |
| 🤝 Trust         | Verified and reliable ecosystem          |
| 📈 Measurable    | Track real-world impact effectively      |

---

## 🏗️ Project Structure

```
CivicSync/
└── civicsync/                  # Next.js application root
    ├── prisma/
    │   └── schema.prisma       # Database models (User, CommunityNeed, VolunteerRequest, Acceptance)
    ├── src/
    │   ├── app/
    │   │   ├── api/            # REST API routes (NGO + Volunteer endpoints)
    │   │   ├── auth/callback/  # Supabase OAuth callback handler
    │   │   ├── dashboard/      # Role-based dashboards (volunteer / ngo)
    │   │   ├── login/          # Auth page (Google OAuth + email)
    │   │   └── role-select/    # Role assignment after first login
    │   ├── components/
    │   │   ├── dashboard/
    │   │   │   ├── ngo/        # NGO dashboard views (Analytics, MyRequests, etc.)
    │   │   │   └── volunteer/  # Volunteer views (Opportunities, History, etc.)
    │   │   ├── ui/
    │   │   │   └── NotificationBell.tsx  # Real-time in-app alerts
    │   │   └── HeroSection.tsx           # Landing page hero
    │   └── lib/
    │       ├── supabase/       # Client + server Supabase helpers
    │       ├── useRealtime.ts  # Reusable Supabase Postgres realtime hook
    │       ├── matching.ts     # Volunteer-opportunity matching engine
    │       └── prisma.ts       # Prisma client singleton
    └── vercel.json             # Vercel deployment configuration

```

---

## 🤝 Contributing

Contributions are what make open source beautiful. Any contribution you make is **greatly appreciated**.

1. Fork the repository
2. Create your feature branch: `git checkout -b feat/amazing-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to the branch: `git push origin feat/amazing-feature`
5. Open a Pull Request

### Ideas for Contribution

- 🗺️ Map view for nearby opportunities
- 📲 Mobile app (React Native / Expo)
- 🌐 Multi-language support (Hindi, Punjabi)
- 📧 Email digest for volunteers (weekly opportunity roundup)
- 🏆 Gamification — volunteer badges and leaderboards
- 🤖 AI-powered need description generation for NGOs

---

## 👨‍💻 Developer

<div align="center">

**Shubh Rawat**
*For the People.*

[![GitHub](https://img.shields.io/badge/GitHub-Shubh2026-181717?style=for-the-badge&logo=github)](https://github.com/Shubh2026)

*"Technology is most powerful when it serves those who need it most."*

</div>

---

## 🛠️ Built With

This project was built using cutting-edge tools:

- **[Next.js](https://nextjs.org/)** — The React framework for the web
- **[Supabase](https://supabase.com/)** — Open source Firebase alternative (Auth + Database + Realtime)
- **[Prisma](https://www.prisma.io/)** — Next-generation ORM for Node.js and TypeScript
- **[Recharts](https://recharts.org/)** — Composable charting library for React
- **[Tailwind CSS](https://tailwindcss.com/)** — Utility-first CSS framework
- **[shadcn/ui](https://ui.shadcn.com/)** — Beautifully designed, accessible components
- **[Antigravity](https://antigravity.dev/) + Gemini 2.5 Pro** — AI-powered development acceleration
- **[Vercel](https://vercel.com/)** — Deployment and hosting

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.

---

<div align="center">

**⭐ Star this repo if CivicSync inspires you to build for impact!**

*Made with 💚 for people in India*

</div>

