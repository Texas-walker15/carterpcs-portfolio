import { useState } from 'react'
import Nav from '../components/navigation/Nav'
import Intro from '../sections/intro/Intro'
import Hero from '../sections/hero/Hero'
import { useLenis } from '../hooks/useLenis'

function App() {
  useLenis()
  const [introComplete, setIntroComplete] = useState(false)

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>

      <Nav />

      <main id="main-content">
        <Hero ready={introComplete} />
      </main>

      {!introComplete && <Intro onComplete={() => setIntroComplete(true)} />}
    </>
  )
}

export default App
