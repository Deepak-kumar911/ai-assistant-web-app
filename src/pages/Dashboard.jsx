import React from 'react'

export default function Dashboard() {
  return (
    <div>
      <div className="text-xl font-semibold text-gray-800 mb-4">Welcome to your dashboard</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-md">Widget 1</div>
        <div className="bg-white p-6 rounded-2xl shadow-md">Widget 2</div>
        <div className="bg-white p-6 rounded-2xl shadow-md">Widget 3</div>
        <div className="bg-white p-6 rounded-2xl shadow-md">Widget 4</div>
      </div>
    </div>
  )
}
