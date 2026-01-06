import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import ResultView from '@/components/quiz/ResultView'

export default async function StudentResultsPage({
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
    },
  })

  if (!quiz) {
    redirect('/student/dashboard')
  }

  const attempt = await prisma.quizAttempt.findUnique({
    where: {
      quizId_studentId: {
        quizId: params.id,
        studentId: session.user.id,
      },
    },
    include: {
      answers: {
        include: {
          question: true,
        },
        orderBy: {
          question: {
            order: 'asc',
          },
        },
      },
    },
  })

  if (!attempt || attempt.status !== 'SUBMITTED') {
    redirect(`/student/quizzes/${params.id}`)
  }

  // Parse options for SQLite
  if (quiz) {
    quiz.questions = quiz.questions.map((q: any) => ({
      ...q,
      options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
    }))
  }

  if (attempt) {
    attempt.answers = attempt.answers.map((a: any) => ({
      ...a,
      question: {
        ...a.question,
        options: typeof a.question.options === 'string' ? JSON.parse(a.question.options) : a.question.options,
      }
    }))
  }

  return <ResultView quiz={quiz} attempt={attempt} />
}


