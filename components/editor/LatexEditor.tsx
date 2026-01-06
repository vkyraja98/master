'use client'

import { useState } from 'react'
import { InlineMath, BlockMath } from 'react-katex'
import 'katex/dist/katex.min.css'

interface LatexEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function LatexEditor({ value, onChange, placeholder }: LatexEditorProps) {
  const [showPreview, setShowPreview] = useState(true)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs text-gray-500">LaTeX supported (use $ for inline, $$ for block)</label>
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="text-xs text-blue-600 hover:text-blue-700"
        >
          {showPreview ? 'Hide Preview' : 'Show Preview'}
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm text-gray-900"
          />
        </div>
        {showPreview && (
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 min-h-[100px]">
            {value ? (
              <div className="prose max-w-none">
                {value.split(/(\$\$[\s\S]*?\$\$|\$[^\$]+\$)/).map((part, index) => {
                  if (part.startsWith('$$') && part.endsWith('$$')) {
                    const latex = part.slice(2, -2).trim()
                    return <BlockMath key={index} math={latex} />
                  } else if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
                    const latex = part.slice(1, -1).trim()
                    return <InlineMath key={index} math={latex} />
                  } else {
                    return <span key={index}>{part}</span>
                  }
                })}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">Preview will appear here</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}


