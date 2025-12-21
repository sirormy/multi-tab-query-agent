import React, { useState, KeyboardEvent } from 'react'

interface QueryInputProps {
    onBroadcast: (question: string) => void
}

export const QueryInput: React.FC<QueryInputProps> = ({ onBroadcast }) => {
    const [question, setQuestion] = useState('')

    const handleSend = () => {
        if (!question.trim()) return
        onBroadcast(question)
        // Optional: clear input after send?
        // setQuestion('') 
        // Spec doesn't say. Keeping it might be useful for tweaks.
    }

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSend()
        }
    }

    return (
        <div className="flex p-4 border-t border-gray-200 bg-white">
            <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 border border-gray-300 rounded-l-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Type a question to broadcast to all tabs..."
            />
            <button
                onClick={handleSend}
                className="bg-blue-600 text-white px-6 py-2 rounded-r-md hover:bg-blue-700 font-medium transition-colors cursor-pointer"
            >
                Broadcast
            </button>
        </div>
    )
}
