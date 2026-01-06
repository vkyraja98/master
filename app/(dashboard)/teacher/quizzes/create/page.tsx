'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import ManualQuizForm from '@/components/quiz/ManualQuizForm'
import PDFUpload from '@/components/quiz/PDFUpload'
import ExcelUpload from '@/components/quiz/ExcelUpload'

type InputMethod = 'manual' | 'pdf' | 'excel'

export default function CreateQuizPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [inputMethod, setInputMethod] = useState<InputMethod>('manual')
  const [quizData, setQuizData] = useState<any>(null)

  if (!session || session.user.role !== 'TEACHER') {
    return null
  }

  const handleQuizCreated = (quizId: string) => {
    router.push(`/teacher/quizzes/${quizId}`)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Quiz</h1>
        <p className="mt-2 text-gray-600">Choose a method to create your quiz</p>
      </div>

      {/* Input Method Selector */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Input Method</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setInputMethod('manual')}
            className={`p-4 border-2 rounded-lg text-center transition-colors ${
              inputMethod === 'manual'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <svg className="h-8 w-8 mx-auto mb-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <p className="font-medium">Manual Input</p>
          </button>

          <button
            onClick={() => setInputMethod('pdf')}
            className={`p-4 border-2 rounded-lg text-center transition-colors ${
              inputMethod === 'pdf'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <svg className="h-8 w-8 mx-auto mb-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <p className="font-medium">Upload PDF</p>
          </button>

          <button
            onClick={() => setInputMethod('excel')}
            className={`p-4 border-2 rounded-lg text-center transition-colors ${
              inputMethod === 'excel'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <svg className="h-8 w-8 mx-auto mb-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="font-medium">Upload Excel</p>
          </button>
        </div>
      </div>

      {/* Input Method Content */}
      <div className="bg-white rounded-lg shadow p-6">
        {inputMethod === 'manual' && <ManualQuizForm onQuizCreated={handleQuizCreated} />}
        {inputMethod === 'pdf' && <PDFUpload onQuizCreated={handleQuizCreated} />}
        {inputMethod === 'excel' && <ExcelUpload onQuizCreated={handleQuizCreated} />}
      </div>
    </div>
  )
}


