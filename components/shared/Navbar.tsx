'use client'

import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const { data: session } = useSession()
  const pathname = usePathname()

  const isTeacher = session?.user?.role === 'TEACHER'
  const isStudent = session?.user?.role === 'STUDENT'

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href={isTeacher ? '/teacher/dashboard' : '/student/dashboard'} className="text-xl font-bold text-blue-600">
                Classroom Platform
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {isTeacher && (
                <>
                  <Link
                    href="/teacher/dashboard"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      pathname === '/teacher/dashboard'
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/teacher/quizzes"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      pathname?.startsWith('/teacher/quizzes')
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Quizzes
                  </Link>
                  <Link
                    href="/teacher/students"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      pathname?.startsWith('/teacher/students')
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Students
                  </Link>
                </>
              )}
              {isStudent && (
                <>
                  <Link
                    href="/student/dashboard"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      pathname === '/student/dashboard'
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/student/quizzes"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      pathname?.startsWith('/student/quizzes')
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    My Quizzes
                  </Link>
                  <Link
                    href="/student/results"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      pathname?.startsWith('/student/results')
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Results
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center">
            <span className="text-gray-700 mr-4">{session?.user?.name}</span>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}


