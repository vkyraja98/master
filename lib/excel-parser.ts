import * as XLSX from 'xlsx'

export interface ParsedQuestion {
  questionText: string
  options: string[]
  correctAnswer: string
  explanation?: string
  marks?: number
}

export async function parseExcel(buffer: Buffer): Promise<ParsedQuestion[]> {
  const workbook = XLSX.read(buffer, { type: 'buffer' })
  const sheetName = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[sheetName]
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' }) as any[][]

  const questions: ParsedQuestion[] = []

  // Skip header row if present
  const startRow = data[0]?.some((cell: any) => 
    typeof cell === 'string' && /question|option|answer/i.test(cell)
  ) ? 1 : 0

  for (let i = startRow; i < data.length; i++) {
    const row = data[i]
    
    if (!row || row.length < 6) continue

    const questionText = String(row[0] || '').trim()
    const optionA = String(row[1] || '').trim()
    const optionB = String(row[2] || '').trim()
    const optionC = String(row[3] || '').trim()
    const optionD = String(row[4] || '').trim()
    const correctAnswer = String(row[5] || 'A').trim().toUpperCase()
    const explanation = row[6] ? String(row[6]).trim() : undefined

    // Validate that we have at least question text and 2 options
    if (questionText && (optionA || optionB)) {
      questions.push({
        questionText,
        options: [
          optionA || '',
          optionB || '',
          optionC || '',
          optionD || '',
        ],
        correctAnswer: ['A', 'B', 'C', 'D'].includes(correctAnswer) ? correctAnswer : 'A',
        explanation,
        marks: 1,
      })
    }
  }

  return questions
}


