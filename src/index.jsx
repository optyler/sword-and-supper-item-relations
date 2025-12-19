import React from 'react'
import { createRoot } from 'react-dom/client'
import { items } from './items'
import InteractionSystem from './InteractionSystem'

const root = createRoot(document.getElementById('root'))

function App() {
  return <InteractionSystem items={items} />
}

root.render(<App />)
