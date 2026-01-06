import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import StudentProgressChart from '@/components/dashboard/StudentProgressChart'

export default async function StudentProgressPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'TEACHER') {
    redirect('/login')
  }

  const student = await prisma.user.findUnique({
    where: { id: params.id },
  })

  if (!student || student.role !== 'STUDENT') {
    redirect('/teacher/students')
  }

  // Calculate progress data directly
  const attempts = await prisma.quizAttempt.findMany({
    where: {
      studentId: params.id,
      status: 'SUBMITTED',
    },
    include: {
      quiz: {
        include: {
          class: true,
          questions: true,
        },
      },
      answers: true,
    },
    orderBy: {
      submittedAt: 'desc',
    },
  })

  const totalQuizzes = attempts.length
  const totalScore = attempts.reduce((sum, a) => sum + (a.score || 0), 0)
  const averageScore = totalQuizzes > 0 ? totalScore / totalQuizzes : 0
  const totalPossibleMarks = attempts.reduce((sum, attempt) => {
    return sum + attempt.quiz.questions.reduce((qSum, q) => qSum + q.marks, 0)
  }, 0)
  const percentage = totalPossibleMarks > 0 ? (totalScore / totalPossibleMarks) * 100 : 0

  const quizBreakdown = attempts.map((attempt) => {
    const quizTotalMarks = attempt.quiz.questions.reduce(
      (sum, q) => sum + q.marks,
      0
    )
    const quizPercentage =
      quizTotalMarks > 0 ? ((attempt.score || 0) / quizTotalMarks) * 100 : 0

    return {
      quizId: attempt.quiz.id,
      quizTitle: attempt.quiz.title,
      className: attempt.quiz.class.name,
      score: attempt.score || 0,
      totalMarks: quizTotalMarks,
      percentage: quizPercentage,
      submittedAt: attempt.submittedAt,
      timeSpent: attempt.answers.reduce((sum, a) => sum + (a.timeSpent || 0), 0),
    }
  })

  const progressData = {
    studentId: params.id,
    totalQuizzes,
    averageScore,
    totalScore,
    totalPossibleMarks,
    percentage,
    quizBreakdown,
  }


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link
          href="/teacher/students"
          className="text-blue-600 hover:text-blue-700 mb-4 inline-block"
        >
          ← Back to Students
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">
          Student Progress: {student.name}
        </h1>
        <p className="mt-2 text-gray-600">{student.email}</p>
      </div>

      {progressData ? (
        <>
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-500 mb-1">Total Quizzes</p>
              <p className="text-3xl font-bold text-gray-900">
                {progressData.totalQuizzes}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-500 mb-1">Average Score</p>
              <p className="text-3xl font-bold text-blue-600">
                {progressData.averageScore.toFixed(1)}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-500 mb-1">Total Score</p>
              <p className="text-3xl font-bold text-gray-900">
                {progressData.totalScore.toFixed(1)} / {progressData.totalPossibleMarks.toFixed(1)}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-500 mb-1">Overall Percentage</p>
              <p className="text-3xl font-bold text-green-600">
                {progressData.percentage.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Performance Chart */}
          {attempts.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Performance Over Time
              </h2>
              <StudentProgressChart attempts={attempts} />
            </div>
          )}

          {/* Quiz-wise Breakdown */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Quiz-wise Performance
            </h2>
            {progressData.quizBreakdown.length === 0 ? (
              <p className="text-gray-500">No quiz attempts yet.</p>
            ) : (
              <div className="overflow-x-auto">
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
                        Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Percentage
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Submitted
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {progressData.quizBreakdown.map((quiz: any) => (
                      <tr key={quiz.quizId}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {quiz.quizTitle}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{quiz.className}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {quiz.score.toFixed(1)} / {quiz.totalMarks}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              quiz.percentage >= 70
                                ? 'bg-green-100 text-green-800'
                                : quiz.percentage >= 50
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {quiz.percentage.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(quiz.submittedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link
                            href={`/teacher/quizzes/${quiz.quizId}/results`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500">No progress data available.</p>
        </div>
      )}
    </div>
  )
}

