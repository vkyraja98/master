import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function TeacherQuizzesPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'TEACHER') {
    redirect('/login')
  }

  const quizzes = await prisma.quiz.findMany({
    where: {
      teacherId: session.user.id,
    },
    include: {
      class: true,
      _count: {
        select: {
          attempts: true,
          questions: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">My Quizzes</h1>
        <Link
          href="/teacher/quizzes/create"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Create New Quiz
        </Link>
      </div>

      {quizzes.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 mb-4">No quizzes yet.</p>
          <Link
            href="/teacher/quizzes/create"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Create your first quiz →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{quiz.title}</h3>
              <p className="text-sm text-gray-500 mb-4">{quiz.class.name}</p>
              <div className="flex items-center justify-between mb-4">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  quiz.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                  quiz.status === 'COMPLETED' ? 'bg-gray-100 text-gray-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {quiz.status}
                </span>
                <span className="text-sm text-gray-500">
                  {quiz._count.questions} questions
                </span>
              </div>
              <div className="text-sm text-gray-600 mb-4">
                <p>Duration: {quiz.duration} minutes</p>
                <p>Attempts: {quiz._count.attempts}</p>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/teacher/quizzes/${quiz.id}`}
                  className="flex-1 text-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  View
                </Link>
                <Link
                  href={`/teacher/quizzes/${quiz.id}/results`}
                  className="flex-1 text-center bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                >
                  Results
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


