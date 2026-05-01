import { useState } from 'react'

interface Props {
  content: string
  title?: string
}

export default function InfoTooltip({ content, title }: Props) {
  const [visible, setVisible] = useState(false)

  return (
    <span className="relative inline-block ml-1">
      <button
        type="button"
        className="text-gray-500 hover:text-indigo-400 transition-colors text-xs leading-none"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onClick={() => setVisible(!visible)}
        aria-label="Aide"
      >
        ⓘ
      </button>
      {visible && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-xl text-left pointer-events-none">
          {title && <p className="text-indigo-300 font-semibold text-xs mb-1">{title}</p>}
          <p className="text-gray-300 text-xs leading-relaxed">{content}</p>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-600" />
        </div>
      )}
    </span>
  )
}
