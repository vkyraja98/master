# Classroom Assessment Platform - Visual Preview Guide

## 🎨 Application Overview

This document provides a visual guide to the Classroom Assessment Platform interface and features.

---

## 🔐 Authentication Pages

### Login Page (`/login`)
- **Layout**: Centered card on gradient background (blue to indigo)
- **Features**:
  - Email and password input fields
  - "Sign In" button
  - OAuth buttons for Google and Microsoft
  - Link to registration page
  - Error message display area

### Registration Page (`/register`)
- **Layout**: Similar to login page
- **Features**:
  - Full name, email, password fields
  - Role selector (Student/Teacher)
  - Password confirmation
  - "Create Account" button
  - Link back to login

---

## 👨‍🏫 Teacher Dashboard (`/teacher/dashboard`)

### Header
- Navigation bar with:
  - "Classroom Platform" logo
  - Dashboard, Quizzes, Students links
  - User name and Sign Out button

### Main Content
**Overview Cards** (3 cards in a row):
1. **Total Students** - Blue icon, shows enrolled student count
2. **Active Quizzes** - Green icon, shows active quiz count
3. **Total Quizzes** - Purple icon, shows all quizzes

**Quick Actions Section**:
- 3 action cards:
  - "Create Quiz" - Blue border, plus icon
  - "Manage Students" - Blue border, users icon
  - "View All Quizzes" - Blue border, document icon

**Recent Quizzes Table**:
- Columns: Title, Class, Status, Attempts, Actions
- Status badges: Green (ACTIVE), Gray (COMPLETED), Yellow (DRAFT)
- "View" link for each quiz

---

## 📝 Quiz Creation Page (`/teacher/quizzes/create`)

### Input Method Selector
- 4 method cards in a grid:
  1. **Manual Input** - Edit icon, blue highlight when selected
  2. **Upload PDF** - Document icon
  3. **Upload Excel** - Chart icon
  4. **AI Generate** - Lightbulb icon

### Manual Input Form
- Quiz details:
  - Title input (required)
  - Description textarea
  - Duration (minutes) and Class ID inputs
  
- **Question Builder**:
  - Add/Remove question buttons
  - For each question:
    - LaTeX editor with live preview
    - 4 option fields (A, B, C, D) with LaTeX support
    - Correct answer dropdown (A/B/C/D)
    - Marks input
    - Explanation field with LaTeX support

### PDF Upload
- File upload area
- "Parse PDF" button
- Success message showing parsed question count
- Same quiz details form as manual input

### Excel Upload
- Template format instructions (blue info box)
- File upload area
- "Parse Excel" button
- Success message
- Quiz details form

### AI Quiz Generator
- **Generation Section**:
  - Topic input field
  - Difficulty selector (Easy/Medium/Hard)
  - Number of questions (1-20)
  - "Generate Questions" button
  
- **Preview Section** (after generation):
  - Scrollable list of generated questions
  - Each question shows:
    - Question text
    - Options with correct answer highlighted in green
    - Explanation (if provided)
  
- **Quiz Details Form** (appears after generation):
  - Title, description, duration, class fields
  - "Create Quiz" button

---

## 📊 Quiz List Pages

### Teacher Quizzes (`/teacher/quizzes`)
- Header with "My Quizzes" title and "Create New Quiz" button
- Grid layout of quiz cards:
  - Quiz title
  - Class name
  - Status badge
  - Question count
  - Duration
  - Attempt count
  - "View" and "Results" buttons

### Student Quizzes (`/student/quizzes`)
- Similar card layout
- Shows available quizzes from enrolled classes
- "Start Quiz" button for active quizzes
- "View Results" for completed quizzes

---

## 📖 NTA-Style Quiz Interface (`/student/quizzes/[id]`)

### Header Bar (Sticky, turns red when <5 min remaining)
- Left: Quiz title and question number (e.g., "Question 1 of 10")
- Right: **Timer** (large, red when <5 minutes)
  - Format: "MM:SS" or "H:MM:SS"

### Main Layout (2-column on desktop)

#### Left Panel (70% width) - Question Paper
- **Question Header**:
  - Question number
  - "Mark for Review" button (yellow when marked)
  - "Clear Response" button
  
- **Question Content**:
  - LaTeX-rendered question text
  - 4 radio button options (A, B, C, D)
  - Selected option highlighted in blue
  
- **Navigation Buttons**:
  - "Previous" (disabled on first question)
  - "Next" (disabled on last question)

#### Right Panel (30% width) - Question Palette (Sticky)
- **Summary Box** (4 stats in grid):
  - Total questions
  - Answered (green number)
  - Unanswered (gray number)
  - Marked (yellow number)

- **Question Grid** (5 columns):
  - Numbered buttons (1-10, etc.)
  - Color coding:
    - **Blue border + blue background**: Current question
    - **Green border + green background**: Answered
    - **Yellow border + yellow background**: Marked for review
    - **Yellow border + light yellow**: Marked but not answered
    - **Gray border + white**: Not answered

- **Legend**:
  - Green box: Answered
  - Yellow box: Marked for Review
  - White box: Not Answered

- **Submit Button** (green, full width)
  - Shows confirmation dialog on click

---

## 📈 Results Page (`/student/results/[id]`)

### Header
- Quiz title + "Results"
- Submission date
- **Print Results** button (blue, with printer icon)

### Score Summary (3 cards)
- **Score**: "X / Y" (e.g., "8.5 / 10")
- **Percentage**: Large blue number (e.g., "85.0%")
- **Questions Answered**: "X / Y"

### Question-wise Breakdown
Each question in a card with:
- **Left border color**:
  - Green: Correct answer
  - Red: Incorrect answer

- **Question Header**:
  - Question number
  - Status badge (Correct/Incorrect)
  - Marks obtained (e.g., "1 / 1" or "0 / 1")

- **Question Text**: LaTeX-rendered

- **Options**:
  - **Green border + green background**: Correct answer (with "✓ Correct Answer" label)
  - **Red border + red background**: Student's incorrect answer (with "Your Answer" label)
  - Gray border: Other options

- **Explanation Box** (blue background):
  - "Explanation:" label
  - LaTeX-rendered explanation text

---

## 👥 Student Management

### Students List (`/teacher/students`)
- Table with columns:
  - Name
  - Email
  - Class
  - Enrolled date
  - "View Progress" link

### Student Progress (`/teacher/students/[id]`)
- **Back to Students** link
- Student name and email header

- **Statistics Cards** (4 cards):
  - Total Quizzes
  - Average Score
  - Total Score (X / Y)
  - Overall Percentage

- **Performance Chart**:
  - Line chart showing percentage over time
  - X-axis: Quiz numbers
  - Y-axis: Percentage (0-100%)
  - Blue line with area fill

- **Quiz-wise Performance Table**:
  - Columns: Quiz, Class, Score, Percentage, Submitted, Actions
  - Percentage badges:
    - Green (≥70%)
    - Yellow (50-69%)
    - Red (<50%)

---

## 🎓 Student Dashboard (`/student/dashboard`)

### My Classes Section
- Grid of class cards:
  - Class name
  - Teacher name
  - Active quizzes count
  - "View Quizzes →" link

### Available Quizzes Table
- Columns: Quiz, Class, Duration, Status, Action
- Status: "Available" or "Completed"
- Actions: "Start Quiz" or "View Results"

### Recent Results Table
- Columns: Quiz, Score, Submitted, Action
- Score shows "X / Y" and percentage
- "View Details" link

---

## 🎨 Design System

### Color Palette
- **Primary Blue**: #3b82f6 (buttons, links, highlights)
- **Success Green**: #10b981 (correct answers, success states)
- **Error Red**: #ef4444 (incorrect answers, errors)
- **Warning Yellow**: #f59e0b (marked questions, warnings)
- **Neutral Gray**: Various shades for text and backgrounds

### Typography
- **Headings**: Bold, dark gray (#111827)
- **Body**: Regular, medium gray (#4b5563)
- **Labels**: Small, light gray (#6b7280)

### Components
- **Cards**: White background, shadow, rounded corners
- **Buttons**: 
  - Primary: Blue background, white text
  - Secondary: Gray border, gray text
  - Success: Green background
- **Badges**: Rounded, colored backgrounds
- **Inputs**: Border, rounded, focus ring (blue)

### Responsive Design
- Mobile: Single column layout
- Tablet: 2-column grid
- Desktop: 3-column grid, side-by-side panels

---

## 🚀 Key Interactive Features

1. **LaTeX Editor**: 
   - Split view (input on left, preview on right)
   - Toggle preview button
   - Supports inline ($...$) and block ($$...$$) math

2. **Timer**:
   - Counts down in real-time
   - Changes to red when <5 minutes
   - Auto-submits when time runs out

3. **Question Navigation**:
   - Click question number in palette to jump
   - Previous/Next buttons
   - Visual indicators for status

4. **Print Preview**:
   - Clean, printable layout
   - All questions with answers
   - Score summary at top
   - No navigation elements

---

## 📱 Mobile View

- Navigation collapses to hamburger menu
- Single column layout
- Question palette moves below question on mobile
- Timer remains visible at top
- Touch-friendly button sizes

---

This application provides a complete classroom assessment solution with a modern, intuitive interface designed for both teachers and students!


