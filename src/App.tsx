import { Scene } from './components/Scene'
import { Sections } from './components/Sections'

export default function App() {
  return (
    <>
      <section className="hero">
        <div className="hero-identity">
          <h1 className="hero-name">Kevin Nguyen</h1>
        </div>
        <div className="hero-scene">
          <Scene />
        </div>
        <p className="hero-hint">choose your path</p>
      </section>
      <Sections />
    </>
  )
}
