import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function StudentDashboard() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'STUDENT') {
    redirect('/login')
  }

  // Get enrolled classes
  const enrollments = await prisma.enrollment.findMany({
    where: {
      studentId: session.user.id,
    },
    include: {
      class: {
        include: {
          teacher: {
            select: {
              name: true,
              email: true,
            },
          },
          quizzes: {
            where: {
              status: 'ACTIVE',
            },
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

  // Get recent results
  const recentAttempts = await prisma.quizAttempt.findMany({
    where: {
      studentId: session.user.id,
      status: 'SUBMITTED',
    },
    include: {
      quiz: {
        include: {
          class: true,
          questions: true,
        },
      },
    },
    orderBy: {
      submittedAt: 'desc',
    },
    take: 5,
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome back, {session.user.name}!</p>
      </div>

      {/* Enrolled Classes */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">My Classes</h2>
        {enrollments.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500">You are not enrolled in any classes yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map((enrollment) => (
              <div key={enrollment.id} className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {enrollment.class.name}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Teacher: {enrollment.class.teacher.name}
                </p>
                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    Active Quizzes: {enrollment.class.quizzes.length}
                  </p>
                </div>
                <Link
                  href={`/student/quizzes?classId=${enrollment.class.id}`}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  View Quizzes →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Available Quizzes */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Quizzes</h2>
        {enrollments.every((e) => e.class.quizzes.length === 0) ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500">No available quizzes at the moment.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quiz
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Class
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {enrollments.flatMap((enrollment) =>
                  enrollment.class.quizzes.map((quiz) => {
                    const hasAttempt = quiz._count.attempts > 0
                    return (
                      <tr key={quiz.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {quiz.title}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {enrollment.class.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {quiz.duration} minutes
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {hasAttempt ? 'Completed' : 'Available'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {hasAttempt ? (
                            <Link
                              href={`/student/results/${quiz.id}`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              View Results
                            </Link>
                          ) : (
                            <Link
                              href={`/student/quizzes/${quiz.id}`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Start Quiz
                            </Link>
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Results */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Results</h2>
        {recentAttempts.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500">No quiz results yet.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quiz
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
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
                {recentAttempts.map((attempt) => {
                  const totalMarks = attempt.quiz.questions.reduce(
                    (sum, q) => sum + q.marks,
                    0
                  )
                  const percentage =
                    totalMarks > 0
                      ? ((attempt.score || 0) / totalMarks) * 100
                      : 0

                  return (
                    <tr key={attempt.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {attempt.quiz.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {attempt.quiz.class.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {attempt.score?.toFixed(1) || 0} / {totalMarks}
                        </div>
                        <div className="text-sm text-gray-500">
                          {percentage.toFixed(1)}%
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {attempt.submittedAt
                          ? new Date(attempt.submittedAt).toLocaleString()
                          : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          href={`/student/results/${attempt.quizId}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View Details
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
    </div>
  )
}


