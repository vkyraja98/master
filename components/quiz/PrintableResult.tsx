import { InlineMath, BlockMath } from 'react-katex'
import 'katex/dist/katex.min.css'

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

interface PrintableResultProps {
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

export default function PrintableResult({ quiz, attempt }: PrintableResultProps) {
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
    <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif', color: '#000' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px', borderBottom: '2px solid #000', paddingBottom: '20px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '10px' }}>{quiz.title}</h1>
        <h2 style={{ fontSize: '20px', color: '#666' }}>Quiz Results</h2>
        <p style={{ marginTop: '10px', color: '#666' }}>
          Submitted on: {attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleString() : 'N/A'}
        </p>
      </div>

      <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
          <div>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Score</p>
            <p style={{ fontSize: '24px', fontWeight: 'bold' }}>
              {attempt.score?.toFixed(1) || 0} / {totalMarks}
            </p>
          </div>
          <div>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Percentage</p>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#2563eb' }}>
              {percentage.toFixed(1)}%
            </p>
          </div>
          <div>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Questions</p>
            <p style={{ fontSize: '24px', fontWeight: 'bold' }}>
              {attempt.answers.filter(a => a.selectedAnswer).length} / {quiz.questions.length}
            </p>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '40px' }}>
        {quiz.questions.map((question, index) => {
          const answer = attempt.answers.find(a => a.questionId === question.id)
          const selectedAnswer = answer?.selectedAnswer || null
          const isCorrect = answer?.isCorrect || false

          return (
            <div
              key={question.id}
              style={{
                marginBottom: '30px',
                padding: '20px',
                border: `2px solid ${isCorrect ? '#10b981' : '#ef4444'}`,
                borderRadius: '8px',
                pageBreakInside: 'avoid',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>Question {question.order}</h3>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span
                    style={{
                      padding: '5px 15px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      backgroundColor: isCorrect ? '#d1fae5' : '#fee2e2',
                      color: isCorrect ? '#065f46' : '#991b1b',
                    }}
                  >
                    {isCorrect ? 'Correct' : 'Incorrect'}
                  </span>
                  <span style={{ fontSize: '14px', color: '#666' }}>
                    Marks: {isCorrect ? question.marks : 0} / {question.marks}
                  </span>
                </div>
              </div>

              <div style={{ marginBottom: '15px', fontSize: '16px' }}>
                {renderMath(question.questionText)}
              </div>

              <div style={{ marginBottom: '15px' }}>
                {question.options.map((option, optIndex) => {
                  const optionLabel = String.fromCharCode(65 + optIndex)
                  const isSelected = selectedAnswer === optionLabel
                  const isCorrectAnswer = question.correctAnswer === optionLabel

                  return (
                    <div
                      key={optIndex}
                      style={{
                        padding: '10px',
                        marginBottom: '8px',
                        borderRadius: '6px',
                        border: `2px solid ${
                          isCorrectAnswer
                            ? '#10b981'
                            : isSelected
                            ? '#ef4444'
                            : '#e5e7eb'
                        }`,
                        backgroundColor:
                          isCorrectAnswer
                            ? '#d1fae5'
                            : isSelected
                            ? '#fee2e2'
                            : 'transparent',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ fontWeight: 'bold', marginRight: '8px' }}>{optionLabel}.</span>
                        <span>{renderMath(option)}</span>
                        {isCorrectAnswer && (
                          <span style={{ marginLeft: 'auto', color: '#10b981', fontWeight: 'bold' }}>
                            ✓ Correct
                          </span>
                        )}
                        {isSelected && !isCorrectAnswer && (
                          <span style={{ marginLeft: 'auto', color: '#ef4444', fontWeight: 'bold' }}>
                            Your Answer
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {question.explanation && (
                <div
                  style={{
                    marginTop: '15px',
                    padding: '15px',
                    backgroundColor: '#dbeafe',
                    border: '1px solid #93c5fd',
                    borderRadius: '6px',
                  }}
                >
                  <p style={{ fontWeight: 'bold', marginBottom: '5px', color: '#1e40af' }}>
                    Explanation:
                  </p>
                  <p style={{ color: '#1e3a8a', fontSize: '14px' }}>
                    {renderMath(question.explanation)}
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '2px solid #000', textAlign: 'center', color: '#666', fontSize: '12px' }}>
        <p>Generated on {new Date().toLocaleString()}</p>
      </div>
    </div>
  )
}


