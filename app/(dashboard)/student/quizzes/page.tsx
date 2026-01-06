import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function StudentQuizzesPage({
  searchParams,
}: {
  searchParams: { classId?: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'STUDENT') {
    redirect('/login')
  }

  const enrollments = await prisma.enrollment.findMany({
    where: {
      studentId: session.user.id,
      ...(searchParams.classId && { classId: searchParams.classId }),
    },
    include: {
      class: {
        include: {
          quizzes: {
            include: {
              _count: {
                select: {
                  attempts: true,
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      },
    },
  })

  const allQuizzes = enrollments.flatMap((enrollment) =>
    enrollment.class.quizzes.map((quiz) => ({
      ...quiz,
      className: enrollment.class.name,
    }))
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Quizzes</h1>
        <p className="mt-2 text-gray-600">Available quizzes from your enrolled classes</p>
      </div>

      {allQuizzes.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500">No quizzes available at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allQuizzes.map((quiz) => {
            const hasAttempt = quiz._count.attempts > 0

            return (
              <div key={quiz.id} className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {quiz.title}
                </h3>
                <p className="text-sm text-gray-500 mb-4">{quiz.className}</p>
                <div className="mb-4 space-y-2">
                  <p className="text-sm text-gray-600">
                    Duration: {quiz.duration} minutes
                  </p>
                  <p className="text-sm text-gray-600">
                    Status: {quiz.status}
                  </p>
                </div>
                <div className="flex gap-2">
                  {hasAttempt ? (
                    <Link
                      href={`/student/results/${quiz.id}`}
                      className="flex-1 text-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      View Results
                    </Link>
                  ) : quiz.status === 'ACTIVE' ? (
                    <Link
                      href={`/student/quizzes/${quiz.id}`}
                      className="flex-1 text-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    >
                      Start Quiz
                    </Link>
                  ) : (
                    <button
                      disabled
                      className="flex-1 text-center bg-gray-300 text-gray-500 px-4 py-2 rounded-lg cursor-not-allowed"
                    >
                      Not Available
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}


