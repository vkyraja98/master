'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'

interface PDFUploadProps {
  onQuizCreated: (quizId: string) => void
}

export default function PDFUpload({ onQuizCreated }: PDFUploadProps) {
  const { data: session } = useSession()
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [duration, setDuration] = useState(60)
  const [classId, setClassId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [parsedQuestions, setParsedQuestions] = useState<any[]>([])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setError('')
    }
  }

  const handleParse = async () => {
    if (!file) {
      setError('Please select a PDF file')
      return
    }

    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/quizzes/parse-pdf', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to parse PDF')
        setLoading(false)
        return
      }

      setParsedQuestions(data.questions)
    } catch (err) {
      setError('An error occurred while parsing PDF')
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!title || !classId || parsedQuestions.length === 0) {
      setError('Please fill in all required fields and parse the PDF')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          duration,
          classId,
          questions: parsedQuestions.map((q, index) => ({
            questionText: q.questionText,
            questionType: 'MCQ',
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation || '',
            marks: q.marks || 1,
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

      <div>
        <label htmlFor="pdfFile" className="block text-sm font-medium text-gray-700 mb-2">
          Upload PDF File *
        </label>
        <input
          id="pdfFile"
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        {file && (
          <button
            type="button"
            onClick={handleParse}
            disabled={loading}
            className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Parsing...' : 'Parse PDF'}
          </button>
        )}
      </div>

      {parsedQuestions.length > 0 && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 font-medium">
            Successfully parsed {parsedQuestions.length} questions
          </p>
        </div>
      )}

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
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="classId" className="block text-sm font-medium text-gray-700 mb-1">
            Class *
          </label>
          <input
            id="classId"
            type="text"
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || parsedQuestions.length === 0}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating...' : 'Create Quiz'}
        </button>
      </div>
    </form>
  )
}


