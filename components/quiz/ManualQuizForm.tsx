'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import LatexEditor from '@/components/editor/LatexEditor'

interface Question {
  questionText: string
  questionType: 'MCQ' | 'MSQ' | 'NAT'
  options: string[]
  correctAnswer: string // For MSQ: comma separated values, For NAT: number string
  explanation: string
  marks: number
}

interface ManualQuizFormProps {
  onQuizCreated: (quizId: string) => void
}

export default function ManualQuizForm({ onQuizCreated }: ManualQuizFormProps) {
  const { data: session } = useSession()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [duration, setDuration] = useState(60)
  const [classId, setClassId] = useState('')

  // Access Control State
  const [accessType, setAccessType] = useState('CLASS') // CLASS, PUBLIC, CODE, EMAIL
  const [accessCode, setAccessCode] = useState('')
  const [allowedEmails, setAllowedEmails] = useState('')

  const [questions, setQuestions] = useState<Question[]>([
    {
      questionText: '',
      questionType: 'MCQ',
      options: ['', '', '', ''],
      correctAnswer: 'A',
      explanation: '',
      marks: 1,
    },
  ])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const generateAccessCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    setAccessCode(code)
  }

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        questionText: '',
        questionType: 'MCQ',
        options: ['', '', '', ''],
        correctAnswer: 'A',
        explanation: '',
        marks: 1,
      },
    ])
  }

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index))
  }

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const updated = [...questions]

    // Reset correct answer when type changes
    if (field === 'questionType' && value !== updated[index].questionType) {
      updated[index] = {
        ...updated[index],
        [field]: value,
        correctAnswer: value === 'NAT' ? '' : 'A'
      }
    } else {
      updated[index] = { ...updated[index], [field]: value }
    }

    setQuestions(updated)
  }

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updated = [...questions]
    updated[questionIndex].options[optionIndex] = value
    setQuestions(updated)
  }

  // Helper for MSQ checkbox handling
  const toggleMsqAnswer = (questionIndex: number, option: string) => {
    const q = questions[questionIndex]
    const current = q.correctAnswer ? q.correctAnswer.split(',') : []
    let newAnswers
    if (current.includes(option)) {
      newAnswers = current.filter(a => a !== option)
    } else {
      newAnswers = [...current, option].sort()
    }
    updateQuestion(questionIndex, 'correctAnswer', newAnswers.join(','))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!title || !classId || questions.length === 0) {
      setError('Please fill in all required fields')
      setLoading(false)
      return
    }

    if (accessType === 'CODE' && !accessCode) {
      setError('Please generate or enter an access code')
      setLoading(false)
      return
    }

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      if (!q.questionText) {
        setError(`Question ${i + 1} is missing text`)
        setLoading(false)
        return
      }
      if (q.questionType !== 'NAT' && q.options.some(opt => !opt)) {
        setError(`Question ${i + 1} has empty options`)
        setLoading(false)
        return
      }
      if (!q.correctAnswer) {
        setError(`Question ${i + 1} is missing a correct answer`)
        setLoading(false)
        return
      }
    }

    try {
      const response = await fetch('/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          duration,
          classId,
          accessType,
          accessCode: accessType === 'CODE' ? accessCode : null,
          allowedEmails: accessType === 'EMAIL' ? allowedEmails : null,
          questions: questions.map((q, index) => ({
            questionText: q.questionText,
            questionType: q.questionType,
            options: q.questionType === 'NAT' ? [] : q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            marks: q.marks,
            order: index + 1,
          })),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to create quiz')
        setLoading(false)
        return
      }

      onQuizCreated(data.quizId)
    } catch (err) {
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Basic Info */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Quiz Details</h3>
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Quiz Title *
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter quiz title"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter quiz description"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
              Duration (minutes) *
            </label>
            <input
              id="duration"
              type="number"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              required
              min={1}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="classId" className="block text-sm font-medium text-gray-700 mb-1">
              Class ID / Name *
            </label>
            <input
              id="classId"
              type="text"
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter class ID or name"
            />
          </div>
        </div>
      </div>

      {/* Access Settings */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Access Settings</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Access Type</label>
          <div className="flex flex-wrap gap-4">
            {['CLASS', 'PUBLIC', 'CODE', 'EMAIL'].map((type) => (
              <label key={type} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="accessType"
                  value={type}
                  checked={accessType === type}
                  onChange={(e) => setAccessType(e.target.value)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-900 font-medium text-sm">
                  {type === 'CLASS' ? 'Class Only' :
                    type === 'PUBLIC' ? 'Public Link' :
                      type === 'CODE' ? 'Access Code' : 'Email Restricted'}
                </span>
              </label>
            ))}
          </div>
        </div>

        {accessType === 'CODE' && (
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Access Code</label>
              <input
                type="text"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 font-mono tracking-wider"
                placeholder="Generate or enter code"
              />
            </div>
            <button
              type="button"
              onClick={generateAccessCode}
              className="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-200"
            >
              Generate Code
            </button>
          </div>
        )}

        {accessType === 'EMAIL' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Allowed Emails (comma separated)</label>
            <textarea
              value={allowedEmails}
              onChange={(e) => setAllowedEmails(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
              placeholder="student1@example.com, student2@example.com"
            />
          </div>
        )}
      </div>

      {/* Questions */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Questions</h3>
          <button
            type="button"
            onClick={addQuestion}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Add Question
          </button>
        </div>

        <div className="space-y-6">
          {questions.map((question, qIndex) => (
            <div key={qIndex} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex justify-between items-start mb-6 border-b pb-4">
                <div className="flex items-center gap-4">
                  <h4 className="font-bold text-gray-900 text-lg">Question {qIndex + 1}</h4>
                  <select
                    value={question.questionType}
                    onChange={(e) => updateQuestion(qIndex, 'questionType', e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-700"
                  >
                    <option value="MCQ">Multiple Choice (MCQ)</option>
                    <option value="MSQ">Multiple Select (MSQ)</option>
                    <option value="NAT">Numerical (NAT)</option>
                  </select>
                </div>
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQuestion(qIndex)}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Remove Question
                  </button>
                )}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question Text *
                </label>
                <LatexEditor
                  value={question.questionText}
                  onChange={(value) => updateQuestion(qIndex, 'questionText', value)}
                  placeholder="Enter question text (supports LaTeX)"
                />
              </div>

              {question.questionType !== 'NAT' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Options *</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {['A', 'B', 'C', 'D'].map((optionLabel, optIndex) => (
                      <div key={optIndex}>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                            Option {optionLabel}
                          </label>
                        </div>
                        <LatexEditor
                          value={question.options[optIndex]}
                          onChange={(value) => updateOption(qIndex, optIndex, value)}
                          placeholder={`Enter option ${optionLabel}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 bg-gray-50 p-4 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Correct Answer *
                  </label>

                  {question.questionType === 'MCQ' && (
                    <select
                      value={question.correctAnswer}
                      onChange={(e) => updateQuestion(qIndex, 'correctAnswer', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
                    >
                      <option value="A">Option A</option>
                      <option value="B">Option B</option>
                      <option value="C">Option C</option>
                      <option value="D">Option D</option>
                    </select>
                  )}

                  {question.questionType === 'MSQ' && (
                    <div className="flex gap-4 pt-2">
                      {['A', 'B', 'C', 'D'].map((opt) => (
                        <label key={opt} className="flex items-center space-x-2 cursor-pointer bg-white px-3 py-2 rounded border border-gray-200 hover:border-blue-300">
                          <input
                            type="checkbox"
                            checked={question.correctAnswer.split(',').includes(opt)}
                            onChange={() => toggleMsqAnswer(qIndex, opt)}
                            className="rounded text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium text-gray-700">{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {question.questionType === 'NAT' && (
                    <input
                      type="number"
                      step="any"
                      value={question.correctAnswer}
                      onChange={(e) => updateQuestion(qIndex, 'correctAnswer', e.target.value)}
                      placeholder="Enter numeric answer"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Marks
                  </label>
                  <input
                    type="number"
                    value={question.marks}
                    onChange={(e) => updateQuestion(qIndex, 'marks', parseInt(e.target.value))}
                    min={1}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Explanation (Optional)
                </label>
                <LatexEditor
                  value={question.explanation}
                  onChange={(value) => updateQuestion(qIndex, 'explanation', value)}
                  placeholder="Enter explanation"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4 border-t">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm"
        >
          {loading ? 'Creating Quiz...' : 'Create Quiz'}
        </button>
      </div>
    </form>
  )
}


