import React from 'react'
import Toolbox from './ToolBox'
import FormCanvas from './FormCanvas'

function CustomForms() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Forms</h2>
      <div className="flex gap-6">
        <Toolbox />
        <FormCanvas />
      </div>
    </div>
  )
}

export default CustomForms
