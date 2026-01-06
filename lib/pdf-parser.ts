import pdfParse from 'pdf-parse'

export interface ParsedQuestion {
  questionText: string
  options: string[]
  correctAnswer: string
  explanation?: string
  marks?: number
}

export async function parsePDF(buffer: Buffer): Promise<ParsedQuestion[]> {
  const data = await pdfParse(buffer)
  const text = data.text

  const questions: ParsedQuestion[] = []
  const questionRegex = /(?:Q|Question)\s*(\d+)\.?\s*(.+?)(?=(?:Q|Question)\s*\d+\.|$)/gis

  let match
  while ((match = questionRegex.exec(text)) !== null) {
    const questionContent = match[2].trim()
    const lines = questionContent.split('\n').filter(line => line.trim())

    // Extract question text (usually first few lines)
    let questionText = ''
    let options: string[] = []
    let correctAnswer = ''
    let explanation = ''

    let currentSection = 'question'
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()

      // Check for options (A, B, C, D)
      if (/^[A-D][\.\)]\s/.test(line)) {
        currentSection = 'options'
        const optionText = line.replace(/^[A-D][\.\)]\s*/, '').trim()
        options.push(optionText)
      }
      // Check for correct answer indicator
      else if (/^(?:Answer|Correct|Ans)[:\s]+([A-D])/i.test(line)) {
        const answerMatch = line.match(/([A-D])/i)
        if (answerMatch) {
          correctAnswer = answerMatch[1].toUpperCase()
        }
      }
      // Check for explanation
      else if (/^(?:Explanation|Explain|Reason)[:\s]/i.test(line)) {
        currentSection = 'explanation'
        explanation = line.replace(/^(?:Explanation|Explain|Reason)[:\s]+/i, '').trim()
      }
      else if (currentSection === 'explanation') {
        explanation += ' ' + line
      }
      else if (currentSection === 'question') {
        questionText += (questionText ? ' ' : '') + line
      }
    }

    // If we found a question with options, add it
    if (questionText && options.length >= 2) {
      // Ensure we have 4 options (pad if needed)
      while (options.length < 4) {
        options.push('')
      }

      questions.push({
        questionText: questionText.trim(),
        options: options.slice(0, 4),
        correctAnswer: correctAnswer || 'A',
        explanation: explanation.trim() || undefined,
        marks: 1,
      })
    }
  }

  // Fallback: if regex didn't work, try simpler parsing
  if (questions.length === 0) {
    const simpleQuestions = text.split(/(?:\n\s*){2,}/).filter(block => block.trim().length > 20)
    
    for (const block of simpleQuestions.slice(0, 20)) {
      const lines = block.split('\n').filter(l => l.trim())
      if (lines.length >= 3) {
        questions.push({
          questionText: lines[0].trim(),
          options: lines.slice(1, 5).map(l => l.replace(/^[A-D][\.\)]\s*/, '').trim()),
          correctAnswer: 'A',
          marks: 1,
        })
      }
    }
  }

  return questions
}


