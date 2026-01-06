'use client'

import { useRef } from 'react'
import { useReactToPrint } from 'react-to-print'
import { InlineMath, BlockMath } from 'react-katex'
import 'katex/dist/katex.min.css'
import PrintableResult from './PrintableResult'

interface Question {
  id: string
  questionText: string
  options: string[]
  correctAnswer: string
  explanation?: string
  marks: number
  order: number
}

interface Answer {
  id: string
  selectedAnswer: string | null
  isCorrect: boolean | null
  question: Question
}

interface ResultViewProps {
  quiz: {
    id: string
    title: string
    questions: Question[]
  }
  attempt: {
    id: string
    score: number | null
    submittedAt: Date | null
    answers: Answer[]
  }
}

export default function ResultView({ quiz, attempt }: ResultViewProps) {
  const printRef = useRef<HTMLDivElement>(null)
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `${quiz.title} - Results`,
  })

  const totalMarks = quiz.questions.reduce((sum, q) => sum + q.marks, 0)
  const percentage = totalMarks > 0 ? ((attempt.score || 0) / totalMarks) * 100 : 0

  const renderMath = (text: string) => {
    if (!text) return null
    return text.split(/(\$\$[\s\S]*?\$\$|\$[^\$]+\$)/).map((part, index) => {
      if (part.startsWith('$$') && part.endsWith('$$')) {
        const latex = part.slice(2, -2).trim()
        return <BlockMath key={index} math={latex} />
      } else if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
        const latex = part.slice(1, -1).trim()
        return <InlineMath key={index} math={latex} />
      } else {
        return <span key={index}>{part}</span>
      }
    })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{quiz.title} - Results</h1>
          <p className="mt-2 text-gray-600">
            Submitted on {attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleString() : 'N/A'}
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print Results
        </button>
      </div>

      {/* Score Summary */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-1">Score</p>
            <p className="text-3xl font-bold text-gray-900">
              {attempt.score?.toFixed(1) || 0} / {totalMarks}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-1">Percentage</p>
            <p className="text-3xl font-bold text-blue-600">
              {percentage.toFixed(1)}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-1">Questions Answered</p>
            <p className="text-3xl font-bold text-gray-900">
              {attempt.answers.filter(a => a.selectedAnswer).length} / {quiz.questions.length}
            </p>
          </div>
        </div>
      </div>

      {/* Question-wise Breakdown */}
      <div className="space-y-6">
        {quiz.questions.map((question, index) => {
          const answer = attempt.answers.find(a => a.questionId === question.id)
          const selectedAnswer = answer?.selectedAnswer || null
          const isCorrect = answer?.isCorrect || false

          return (
            <div
              key={question.id}
              className={`bg-white rounded-lg shadow p-6 border-l-4 ${
                isCorrect ? 'border-green-500' : 'border-red-500'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Question {question.order}
                </h3>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    isCorrect
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {isCorrect ? 'Correct' : 'Incorrect'}
                  </span>
                  <span className="text-sm text-gray-500">
                    Marks: {isCorrect ? question.marks : 0} / {question.marks}
                  </span>
                </div>
              </div>

              <div className="prose max-w-none mb-4">
                {renderMath(question.questionText)}
              </div>

              <div className="space-y-2 mb-4">
                {question.options.map((option, optIndex) => {
                  const optionLabel = String.fromCharCode(65 + optIndex)
                  const isSelected = selectedAnswer === optionLabel
                  const isCorrectAnswer = question.correctAnswer === optionLabel

                  return (
                    <div
                      key={optIndex}
                      className={`p-3 rounded-lg border-2 ${
                        isCorrectAnswer
                          ? 'border-green-500 bg-green-50'
                          : isSelected
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-start">
                        <span className="font-medium mr-2">{optionLabel}.</span>
                        <span>{renderMath(option)}</span>
                        {isCorrectAnswer && (
                          <span className="ml-auto text-green-600 font-semibold">✓ Correct Answer</span>
                        )}
                        {isSelected && !isCorrectAnswer && (
                          <span className="ml-auto text-red-600 font-semibold">Your Answer</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {question.explanation && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 mb-1">Explanation:</p>
                  <p className="text-sm text-blue-800">{renderMath(question.explanation)}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Printable Version (Hidden) */}
      <div className="hidden">
        <div ref={printRef}>
          <PrintableResult quiz={quiz} attempt={attempt} />
        </div>
      </div>
    </div>
  )
}


