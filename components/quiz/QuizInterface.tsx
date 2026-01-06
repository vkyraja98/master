'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { InlineMath, BlockMath } from 'react-katex'
import 'katex/dist/katex.min.css'

interface Question {
  id: string
  questionText: string
  questionType: string
  options: string[]
  correctAnswer: string
  marks: number
  order: number
}

interface QuizInterfaceProps {
  quiz: {
    id: string
    title: string
    duration: number
    questions: Question[]
  }
  attemptId: string
}

export default function QuizInterface({ quiz, attemptId }: QuizInterfaceProps) {
  const router = useRouter()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set())
  const [timeRemaining, setTimeRemaining] = useState(quiz.duration * 60) // in seconds
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleAutoSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }))
  }

  const handleMarkForReview = (questionId: string) => {
    setMarkedForReview((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(questionId)) {
        newSet.delete(questionId)
      } else {
        newSet.add(questionId)
      }
      return newSet
    })
  }

  const handleClearResponse = (questionId: string) => {
    setAnswers((prev) => {
      const newAnswers = { ...prev }
      delete newAnswers[questionId]
      return newAnswers
    })
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const handleAutoSubmit = async () => {
    if (submitting) return
    setSubmitting(true)
    await submitQuiz()
  }

  const handleSubmit = async () => {
    if (!confirm('Are you sure you want to submit the quiz? You cannot change your answers after submission.')) {
      return
    }
    setSubmitting(true)
    await submitQuiz()
  }

  const submitQuiz = async () => {
    try {
      const answerArray = quiz.questions.map((q) => ({
        questionId: q.id,
        selectedAnswer: answers[q.id] || '',
        timeSpent: 0, // Could track time per question
      }))

      const response = await fetch(`/api/quizzes/${quiz.id}/attempt`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: answerArray }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit quiz')
      }

      router.push(`/student/results/${quiz.id}`)
    } catch (error) {
      console.error('Error submitting quiz:', error)
      alert('Failed to submit quiz. Please try again.')
      setSubmitting(false)
    }
  }

  const currentQuestion = quiz.questions[currentQuestionIndex]
  const answeredCount = Object.keys(answers).length
  const markedCount = markedForReview.size

  const renderMath = (text: string) => {
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
    <div className="min-h-screen bg-gray-50">
      {/* Header with Timer */}
      <div className={`bg-white shadow-md sticky top-0 z-10 ${timeRemaining < 300 ? 'bg-red-50 border-b-2 border-red-500' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{quiz.title}</h1>
              <p className="text-sm text-gray-600">
                Question {currentQuestionIndex + 1} of {quiz.questions.length}
              </p>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold ${timeRemaining < 300 ? 'text-red-600' : 'text-gray-900'}`}>
                {formatTime(timeRemaining)}
              </div>
              <p className="text-xs text-gray-500">Time Remaining</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Question Paper */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Question {currentQuestion.order}
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleMarkForReview(currentQuestion.id)}
                      className={`px-3 py-1 text-sm rounded ${
                        markedForReview.has(currentQuestion.id)
                          ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                          : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      {markedForReview.has(currentQuestion.id) ? '✓ Marked' : 'Mark for Review'}
                    </button>
                    <button
                      onClick={() => handleClearResponse(currentQuestion.id)}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 border border-gray-300 rounded hover:bg-gray-200"
                    >
                      Clear Response
                    </button>
                  </div>
                </div>

                <div className="prose max-w-none mb-6">
                  {renderMath(currentQuestion.questionText)}
                </div>
              </div>

              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => {
                  const optionLabel = String.fromCharCode(65 + index) // A, B, C, D
                  const isSelected = answers[currentQuestion.id] === optionLabel

                  return (
                    <label
                      key={index}
                      className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${currentQuestion.id}`}
                        value={optionLabel}
                        checked={isSelected}
                        onChange={() => handleAnswerChange(currentQuestion.id, optionLabel)}
                        className="mt-1 mr-3"
                      />
                      <div className="flex-1">
                        <span className="font-medium text-gray-700 mr-2">{optionLabel}.</span>
                        <span className="text-gray-900">{renderMath(option)}</span>
                      </div>
                    </label>
                  )
                })}
              </div>

              {/* Navigation Buttons */}
              <div className="mt-8 flex justify-between">
                <button
                  onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                  disabled={currentQuestionIndex === 0}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentQuestionIndex(Math.min(quiz.questions.length - 1, currentQuestionIndex + 1))}
                  disabled={currentQuestionIndex === quiz.questions.length - 1}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel - Question List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Question Palette</h3>

              {/* Summary */}
              <div className="grid grid-cols-2 gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500">Total</p>
                  <p className="text-lg font-semibold text-gray-900">{quiz.questions.length}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Answered</p>
                  <p className="text-lg font-semibold text-green-600">{answeredCount}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Unanswered</p>
                  <p className="text-lg font-semibold text-gray-600">
                    {quiz.questions.length - answeredCount}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Marked</p>
                  <p className="text-lg font-semibold text-yellow-600">{markedCount}</p>
                </div>
              </div>

              {/* Question Grid */}
              <div className="grid grid-cols-5 gap-2 mb-6">
                {quiz.questions.map((q, index) => {
                  const isAnswered = !!answers[q.id]
                  const isMarked = markedForReview.has(q.id)
                  const isCurrent = index === currentQuestionIndex

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestionIndex(index)}
                      className={`h-10 w-10 rounded border-2 flex items-center justify-center text-sm font-medium transition-colors ${
                        isCurrent
                          ? 'border-blue-500 bg-blue-100 text-blue-700'
                          : isAnswered && isMarked
                          ? 'border-yellow-500 bg-yellow-100 text-yellow-700'
                          : isAnswered
                          ? 'border-green-500 bg-green-100 text-green-700'
                          : isMarked
                          ? 'border-yellow-300 bg-yellow-50 text-yellow-600'
                          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {index + 1}
                    </button>
                  )
                })}
              </div>

              {/* Legend */}
              <div className="space-y-2 text-xs mb-6">
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-green-500 bg-green-100 mr-2 rounded"></div>
                  <span>Answered</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-yellow-500 bg-yellow-100 mr-2 rounded"></div>
                  <span>Marked for Review</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-gray-300 bg-white mr-2 rounded"></div>
                  <span>Not Answered</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {submitting ? 'Submitting...' : 'Submit Quiz'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


