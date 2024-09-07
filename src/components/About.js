import './About.scss'
import AnimatedWord from './AnimatedWord'
import { useEffect, useState } from 'react'
import Loader from 'react-loaders'

const About = () => {
  const [letterClass, setLetterClass] = useState('text-animate')

  useEffect(() => {
    setLetterClass('text-animate-hover')
  }, [])
  return (
    <>
      <div id="about-page" className="row h-100">
        {/*=== PAGE TITLE AND DESCRIPTION === */}
        <div className="col-11 col-sm-6 col-md-7 col-lg-6 col-xl-6 order-2 order-sm-1 mb-auto mb-sm-0 d-flex flex-column justify-content-center ps-sm-5 align-items-center text-center text-sm-start align-items-sm-start">
          <h1 className="display-3">
            <AnimatedWord letterClass={letterClass} strArray={['ABOUT']} />
            &nbsp;
            <AnimatedWord letterClass={letterClass} strArray={['ME']} />
          </h1>
          <p className="fs-4">
          Hello there, I'm Muhammad Abdullah Badar, a Full-Stack Developer with a robust skill set that spans across technologies like Ruby on Rails, MERN, as well as SQL and No-SQL databases. My journey into the world of technology began with an academic background in Computer Science, where I discovered a deep passion for programming. The process of writing code, debugging, and ultimately solving complex problems felt like navigating an intricate game—a challenge I embraced with enthusiasm. This problem-solving mindset is something that not only fuels my work as a developer but also connects with my passion for esports, where strategy and precision are key.
          </p>
          <p className="fs-4">
          Over the years, I have honed my skills to deliver high-quality, scalable web applications that meet the diverse needs of clients. With 4+ years of professional experience, I have successfully completed 30+ projects on Fiverr, consistently earning 5-star ratings for my work. My approach to development is both methodical and creative, ensuring that each project is not only technically sound but also tailored to the specific goals and vision of the client. Whether it's building a feature-rich web application or optimizing an existing system, I am dedicated to bringing your ideas to life with precision and care.
          </p>
          <h2></h2>
        </div>

        {/*=== SELF PORTRAIT === */}
        <div
          id="imgwrapper"
          className="col-11 col-sm-6 col-md-5 col-lg-6 col-xl-5 order-1 order-sm-2 d-flex justify-content-center align-items-end align-items-sm-center justify-content-md-start justify-content-sm-center justify-content-lg-center  "
        >
          {/* <img
            alt="profilepicture"
            className="d-flex"
            src=""
          /> */}
        </div>
      </div>
    </>
  )
}

export default About
