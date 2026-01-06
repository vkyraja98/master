import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isTeacher = token?.role === 'TEACHER'
    const isStudent = token?.role === 'STUDENT'
    const path = req.nextUrl.pathname

    // Protect teacher routes
    if (path.startsWith('/teacher') && !isTeacher) {
      return NextResponse.redirect(new URL('/student/dashboard', req.url))
    }

    // Protect student routes
    if (path.startsWith('/student') && !isStudent && !isTeacher) {
      return NextResponse.redirect(new URL('/teacher/dashboard', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: [
    '/teacher/:path*',
    '/student/:path*',
    '/dashboard/:path*',
  ],
}


