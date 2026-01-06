# Classroom Assessment Platform

A comprehensive web application similar to Google Classroom where teachers can manage assessments and track student progress. Features include quiz creation with multiple input methods (PDF, Excel, LaTeX), NTA-style quiz interface, and detailed progress tracking.

## Features

### For Teachers
- **Dashboard**: Overview of students, quizzes, and assessments
- **Quiz Creation**: Multiple methods to create quizzes:
  - Manual input with LaTeX support
  - PDF upload and parsing
  - Excel import
- **Student Management**: View and manage enrolled students
- **Progress Tracking**: Detailed analytics and performance charts for each student
- **Results View**: View all quiz submissions and scores

### For Students
- **Dashboard**: View enrolled classes and available quizzes
- **NTA-Style Quiz Interface**: 
  - Timer countdown
  - Question navigation
  - Mark for review
  - Status indicators
  - Question palette
- **Results View**: 
  - Detailed score breakdown
  - Question-wise analysis
  - Correct answers with explanations
  - Print functionality

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js (Email/Password + OAuth)
- **File Processing**: PDF parsing (pdf-parse), Excel parsing (xlsx)
- **LaTeX Rendering**: KaTeX
- **Charts**: Chart.js with react-chartjs-2
- **Print**: react-to-print

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL database
- OAuth credentials (optional, for Google/Microsoft login)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd classroom-assessment-platform
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add:
- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_URL`: Your application URL (e.g., http://localhost:3000)
- `NEXTAUTH_SECRET`: A random secret string
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`: (Optional, for OAuth)
- `MICROSOFT_CLIENT_ID` and `MICROSOFT_CLIENT_SECRET`: (Optional, for OAuth)

4. Set up the database:
```bash
npx prisma generate
npx prisma migrate dev
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/
│   ├── (auth)/              # Authentication pages
│   ├── (dashboard)/         # Protected dashboard routes
│   │   ├── teacher/         # Teacher-specific pages
│   │   └── student/         # Student-specific pages
│   ├── api/                 # API routes
│   └── layout.tsx           # Root layout
├── components/
│   ├── quiz/                # Quiz-related components
│   ├── editor/              # LaTeX editor
│   ├── dashboard/           # Dashboard components
│   └── shared/              # Shared components
├── lib/
│   ├── db.ts                # Prisma client
│   ├── auth.ts              # NextAuth configuration
│   ├── pdf-parser.ts        # PDF parsing logic
│   └── excel-parser.ts      # Excel parsing logic
└── prisma/
    └── schema.prisma        # Database schema
```

## Usage

### Creating a Quiz

1. Log in as a teacher
2. Navigate to "Quizzes" → "Create New Quiz"
3. Choose an input method:
   - **Manual**: Enter questions manually with LaTeX support
   - **PDF**: Upload a PDF file with questions
   - **Excel**: Upload an Excel file (see template format)
4. Fill in quiz details (title, duration, class)
5. Review and create the quiz

### Taking a Quiz

1. Log in as a student
2. Navigate to "My Quizzes"
3. Click "Start Quiz" on an available quiz
4. Answer questions using the NTA-style interface
5. Mark questions for review if needed
6. Submit when finished

### Viewing Results

- **Students**: Can view their own results with detailed breakdowns
- **Teachers**: Can view all student submissions and progress

## Excel Template Format

For Excel uploads, use the following format:

| Column A | Column B | Column C | Column D | Column E | Column F | Column G |
|----------|-----------|-----------|-----------|-----------|-----------|-----------|
| Question Text | Option A | Option B | Option C | Option D | Correct Answer (A/B/C/D) | Explanation (optional) |

## LaTeX Support

The platform supports LaTeX notation in questions and answers:
- Inline math: `$x^2 + y^2 = r^2$`
- Block math: `$$\int_0^\infty e^{-x} dx = 1$$`

## Security

- Role-based access control
- Session management with NextAuth.js
- SQL injection prevention (Prisma)
- XSS prevention (input sanitization)
- File upload validation

## License

This project is licensed under the MIT License.


