'use client'

import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

interface Attempt {
  id: string
  score: number | null
  submittedAt: Date | null
  quiz: {
    id: string
    title: string
    questions: { marks: number }[]
  }
}

interface StudentProgressChartProps {
  attempts: Attempt[]
}

export default function StudentProgressChart({ attempts }: StudentProgressChartProps) {
  const data = {
    labels: attempts.map((attempt, index) => `Quiz ${index + 1}`),
    datasets: [
      {
        label: 'Score',
        data: attempts.map((attempt) => {
          const totalMarks = attempt.quiz.questions.reduce((sum, q) => sum + q.marks, 0)
          const percentage = totalMarks > 0 ? ((attempt.score || 0) / totalMarks) * 100 : 0
          return percentage
        }),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.1,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function (value: any) {
            return value + '%'
          },
        },
      },
    },
  }

  return (
    <div style={{ height: '300px' }}>
      <Line data={data} options={options} />
    </div>
  )
}


