import React from 'react'
import MainRouter from './routes/mainRouter'
import AppWrapper from './context/AppWrapper'

export default function App() {
  return (
    <div>
      <AppWrapper>
      <MainRouter/>
      </AppWrapper>
    </div>
  )
}
