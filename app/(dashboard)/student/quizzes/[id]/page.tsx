import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import QuizInterface from '@/components/quiz/QuizInterface'

export default async function StudentQuizPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'STUDENT') {
    redirect('/login')
  }

  const quiz = await prisma.quiz.findUnique({
    where: { id: params.id },
    include: {
      questions: {
        orderBy: { order: 'asc' },
      },
      class: true,
    },
  })

  // Parse options for SQLite compatibility
  if (quiz) {
    quiz.questions = quiz.questions.map((q: any) => ({
      ...q,
      options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
    }))
  }

  if (!quiz) {
    redirect('/student/dashboard')
  }

  // Check enrollment
  const enrollment = await prisma.enrollment.findFirst({
    where: {
      classId: quiz.classId,
      studentId: session.user.id,
    },
  })

  if (!enrollment) {
    redirect('/student/dashboard')
  }

  // Check if quiz is active
  if (quiz.status !== 'ACTIVE') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-yellow-800">This quiz is not available yet.</p>
        </div>
      </div>
    )
  }

  // Check for existing attempt
  let attempt = await prisma.quizAttempt.findUnique({
    where: {
      quizId_studentId: {
        quizId: params.id,
        studentId: session.user.id,
      },
    },
  })

  if (!attempt) {
    // Start new attempt
    attempt = await prisma.quizAttempt.create({
      data: {
        quizId: params.id,
        studentId: session.user.id,
        status: 'IN_PROGRESS',
      },
    })
  }

  if (attempt?.status === 'SUBMITTED') {
    redirect(`/student/results/${params.id}`)
  }

  return <QuizInterface quiz={quiz} attemptId={attempt.id} />
}

