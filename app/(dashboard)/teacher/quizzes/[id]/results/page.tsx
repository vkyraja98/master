import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function TeacherQuizResultsPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'TEACHER') {
    redirect('/login')
  }

  const quiz = await prisma.quiz.findUnique({
    where: { id: params.id },
    include: {
      questions: true,
    },
  })

  if (!quiz || quiz.teacherId !== session.user.id) {
    redirect('/teacher/quizzes')
  }

  const attempts = await prisma.quizAttempt.findMany({
    where: {
      quizId: params.id,
      status: 'SUBMITTED',
    },
    include: {
      student: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      answers: {
        include: {
          question: true,
        },
      },
    },
    orderBy: {
      submittedAt: 'desc',
    },
  })

  const totalMarks = quiz.questions.reduce((sum, q) => sum + q.marks, 0)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link
          href={`/teacher/quizzes/${params.id}`}
          className="text-blue-600 hover:text-blue-700 mb-4 inline-block"
        >
          ← Back to Quiz
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">
          Results: {quiz.title}
        </h1>
      </div>

      {attempts.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500">No submissions yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Percentage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attempts.map((attempt) => {
                const percentage =
                  totalMarks > 0 ? ((attempt.score || 0) / totalMarks) * 100 : 0

                return (
                  <tr key={attempt.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {attempt.student.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {attempt.student.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {attempt.score?.toFixed(1) || 0} / {totalMarks}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          percentage >= 70
                            ? 'bg-green-100 text-green-800'
                            : percentage >= 50
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {percentage.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {attempt.submittedAt
                        ? new Date(attempt.submittedAt).toLocaleString()
                        : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        href={`/teacher/students/${attempt.studentId}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View Progress
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}


