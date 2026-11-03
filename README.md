# Executive Resume Builder & AI Job Application Copilot

A modern, high-precision executive resume builder and job application copilot built with **React**, **TypeScript**, **Tailwind CSS**, and **Express**.

Designed for senior directors, VPs, and technical executives who require ATS-compliant resumes, precision formatting, and strategic job-specific tailoring with anti-hallucination claim verification.

---

## 🌟 Key Features

### 1. Executive Master Resume Builder
- **Zero-Data Privacy Startup**: Initializes in a pristine empty state. Personal data is only loaded when you upload your resume file or add fields.
- **Twin-Executive & ATS Formats**:
  - *Executive Two-Column (33% Navy / 67% Pure White)*: Optimized for senior leadership profiles with high-DPI photo avatars.
  - *ATS Corporate Clean*: Minimalist, single-column design engineered to score 95%+ on enterprise Applicant Tracking Systems (Workday, Taleo, Greenhouse, Lever).
- **Exact Vector Print & Dual-Page Pagination**: Automatic page-balancing engine that prevents trailing single bullets and neatly sections Experience across Page 1 and Page 2.
- **Multi-Format Export**:
  - Native print-ready **Vector PDF** (A4 high-DPI).
  - True formatted **Microsoft Word (.docx)** with styled tables and borders.
  - Portable **JSON backup** for easy offline import/export.

### 2. AI Job Application Copilot
- **Job Description Ingestion**: Paste job requisitions to extract strategic competencies, required executive signals, and role responsibilities.
- **Candidate Positioning Engine**: Computes candidate match scores across core competencies, leadership scope, and technical governance.
- **Tailored Resume Generation**: Generates targeted variations of your master resume highlighting relevant achievements for specific roles.
- **Anti-Hallucination Claim Verification**: Flags every claim made in tailored resumes against your Master Profile to prevent embellishments or fabricated metrics.
- **Three-Pillar Executive Cover Letters**:
  1. *Relevant Experience & Proven Achievements*
  2. *Right Fit & Role Alignment*
  3. *Business Impact & Value Delivery*

### 3. Smart Document Parser
- Upload existing resumes in **PDF**, **Word (.docx)**, or **Plain Text (.txt)**.
- Automatically extracts and populates work experience in chronological order, skills, education, and career milestones.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, html2canvas, jspdf, docx
- **Backend / Dev Proxy**: Express, tsx, Vite
- **AI Engine**: `@google/genai` (Gemini 2.5 Flash)
- **Styling**: Tailwind CSS with custom print media stylesheets

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or higher)
- [npm](https://www.npmjs.com/) or [bun](https://bun.sh/)
- A Gemini API key from [Google AI Studio](https://aistudio.google.com/)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
   cd YOUR_REPOSITORY
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env` and provide your Gemini API key:
   ```bash
   cp .env.example .env
   ```
   Edit `.env`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   PORT=3000
   ```

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:3000`.

5. **Build for Production**:
   ```bash
   npm run build
   npm start
   ```

---

## 🔒 Privacy & Security

- **Client-Authoritative State**: Your master resume data is stored locally in your browser session (`localStorage`).
- **No Unsolicited Storage**: No personal contact numbers, passport IDs, or work histories are persisted on external database servers.
- **Synthetic Mode**: Built-in fictitious dataset (*Alex Morgan*) is available for live demonstrations and testing without exposing personal information.

---

## 📄 License

MIT License — Feel free to use and customize for your career needs.
