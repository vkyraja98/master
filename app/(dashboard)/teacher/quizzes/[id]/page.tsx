import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function TeacherQuizDetailPage({
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
      class: true,
      questions: {
        orderBy: { order: 'asc' },
      },
      _count: {
        select: {
          attempts: true,
        },
      },
    },
  })

  if (!quiz || quiz.teacherId !== session.user.id) {
    redirect('/teacher/quizzes')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link
          href="/teacher/quizzes"
          className="text-blue-600 hover:text-blue-700 mb-4 inline-block"
        >
          ← Back to Quizzes
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">{quiz.title}</h1>
        <p className="mt-2 text-gray-600">{quiz.description || 'No description'}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500 mb-1">Status</p>
          <p className={`text-2xl font-semibold ${
            quiz.status === 'ACTIVE' ? 'text-green-600' :
            quiz.status === 'COMPLETED' ? 'text-gray-600' :
            'text-yellow-600'
          }`}>
            {quiz.status}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500 mb-1">Duration</p>
          <p className="text-2xl font-semibold text-gray-900">{quiz.duration} minutes</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500 mb-1">Total Attempts</p>
          <p className="text-2xl font-semibold text-gray-900">{quiz._count.attempts}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Questions</h2>
          <span className="text-sm text-gray-500">
            {quiz.questions.length} questions
          </span>
        </div>
        <div className="space-y-4">
          {quiz.questions.map((question, index) => (
            <div key={question.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-gray-900">
                  Question {question.order}
                </h3>
                <span className="text-sm text-gray-500">{question.marks} marks</span>
              </div>
              <p className="text-gray-700 mb-3">{question.questionText}</p>
              <div className="space-y-1">
                {Array.isArray(question.options) && question.options.map((option, optIndex) => (
                  <div key={optIndex} className="text-sm text-gray-600">
                    {String.fromCharCode(65 + optIndex)}. {option}
                    {question.correctAnswer === String.fromCharCode(65 + optIndex) && (
                      <span className="ml-2 text-green-600 font-semibold">✓ Correct</span>
                    )}
                  </div>
                ))}
              </div>
              {question.explanation && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-sm font-medium text-blue-900 mb-1">Explanation:</p>
                  <p className="text-sm text-blue-800">{question.explanation}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        <Link
          href={`/teacher/quizzes/${params.id}/results`}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          View Results
        </Link>
        {quiz.status === 'DRAFT' && (
          <form action={`/api/quizzes/${params.id}`} method="PATCH" className="inline">
            <input type="hidden" name="status" value="ACTIVE" />
            <button
              type="submit"
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
            >
              Activate Quiz
            </button>
          </form>
        )}
      </div>
    </div>
  )
}


