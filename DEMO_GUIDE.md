# How to View the Demo

## Option 1: Static HTML Preview (No Installation Required) ⚡

The easiest way to see the UI design:

1. **Open the preview file**:
   - Navigate to the project folder
   - Double-click `preview.html`
   - Or right-click → Open with → Your web browser (Chrome, Firefox, Edge, etc.)

2. **What you'll see**:
   - Login page design
   - Teacher dashboard with statistics
   - Quiz creation interface (3 methods: Manual, PDF, Excel)
   - NTA-style quiz interface with timer
   - Results page with score breakdown
   - Student dashboard

**Note**: This is a static preview showing the UI design. It's not interactive but gives you a complete visual overview.

---

## Option 2: Run the Full Application (Requires Node.js) 🚀

To see the fully functional application:

### Step 1: Install Node.js
1. Download Node.js from [https://nodejs.org/](https://nodejs.org/)
2. Install the LTS version (recommended)
3. Verify installation:
   ```bash
   node --version
   npm --version
   ```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Set Up Environment Variables
Create a `.env` file in the project root:

```env
# Database (use a local PostgreSQL or a free service like Supabase)
DATABASE_URL="postgresql://user:password@localhost:5432/classroom_db?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-random-secret-key-here-minimum-32-characters"

# Optional: OAuth (can skip for basic demo)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
MICROSOFT_CLIENT_ID=""
MICROSOFT_CLIENT_SECRET=""
```

**Quick Setup Options**:
- **Local PostgreSQL**: Install PostgreSQL locally
- **Supabase** (Free): Sign up at [supabase.com](https://supabase.com) and get a free database URL
- **Neon** (Free): Sign up at [neon.tech](https://neon.tech) for a free PostgreSQL database

### Step 4: Set Up Database
```bash
# Generate Prisma client
npx prisma generate

# Run migrations (creates database tables)
npx prisma migrate dev --name init
```

### Step 5: Run the Development Server
```bash
npm run dev
```

### Step 6: Open in Browser
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Step 7: Create Test Accounts
1. Click "Sign up" on the login page
2. Create a **Teacher** account:
   - Name: "Test Teacher"
   - Email: "teacher@test.com"
   - Role: Teacher
   - Password: (your choice)

3. Create a **Student** account:
   - Name: "Test Student"
   - Email: "student@test.com"
   - Role: Student
   - Password: (your choice)

### Step 8: Test the Features

**As Teacher**:
1. Login with teacher account
2. Go to "Quizzes" → "Create New Quiz"
3. Try creating a quiz using:
   - Manual input (add a few questions)
   - PDF upload (if you have a PDF with questions)
   - Excel upload (download the template format from the Excel upload section)
4. Activate the quiz (change status from DRAFT to ACTIVE)
5. View students and their progress

**As Student**:
1. Login with student account
2. View available quizzes
3. Start a quiz (if teacher has created and activated one)
4. Experience the NTA-style interface:
   - Timer countdown
   - Question navigation
   - Mark for review
   - Submit quiz
5. View results with detailed breakdown

---

## Option 3: Quick Demo with Sample Data

If you want to quickly see the application with sample data:

1. After setting up the database, you can manually add sample data using Prisma Studio:
   ```bash
   npx prisma studio
   ```
   This opens a web interface where you can add:
   - Classes
   - Quizzes
   - Questions
   - Enrollments

2. Or create a seed script (optional) to populate initial data.

---

## Troubleshooting

### "npm is not recognized"
- Install Node.js from [nodejs.org](https://nodejs.org/)
- Restart your terminal/command prompt after installation

### Database Connection Error
- Make sure PostgreSQL is running (if using local)
- Check your DATABASE_URL in `.env` file
- For cloud databases (Supabase/Neon), ensure the connection string is correct

### Port 3000 Already in Use
- Change the port: `npm run dev -- -p 3001`
- Or stop the process using port 3000

### Prisma Errors
- Run `npx prisma generate` again
- Make sure DATABASE_URL is correct
- Check if database exists and is accessible

---

## Recommended: Start with Option 1

If you just want to see the design and UI:
1. **Open `preview.html`** in your browser - it's instant and requires no setup!

If you want to test the full functionality:
2. **Follow Option 2** to set up and run the complete application.

---

## Need Help?

- Check the `README.md` for detailed setup instructions
- Review the `PREVIEW.md` for UI/UX documentation
- All code is ready - just needs Node.js and a database to run!

