import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Navbar from '@/components/shared/Navbar'
import { SessionProvider } from '@/components/shared/SessionProvider'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  return (
    <SessionProvider session={session}>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main>{children}</main>
      </div>
    </SessionProvider>
  )
}


