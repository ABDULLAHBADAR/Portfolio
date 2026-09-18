import Hero from './components/Hero/Hero'
import About from './components/About/About'
import Stack from './components/Stack/Stack'
import Work from './components/Work/Work'
import Specimens from './components/Specimens/Specimens'
import Ops from './components/Ops/Ops'
import Pipeline from './components/Pipeline/Pipeline'
import Experience from './components/Experience/Experience'
import Services from './components/Services/Services'
import Contact from './components/Contact/Contact'
import Footer from './components/Footer/Footer'
import SideNav from './components/SideNav/SideNav'
import styles from './App.module.css'

export default function App() {
  return (
    <div id="top" className={styles.top}>
      <Hero />
      <main className={styles.main}>
        <About />
        <Stack />
        <Work />
        <Specimens />
        <Ops />
        <Pipeline />
        <Experience />
        <Services />
        <Contact />
        <Footer />
      </main>
      <SideNav />
    </div>
  )
}
