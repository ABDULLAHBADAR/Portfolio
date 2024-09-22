import { useEffect, useState } from 'react'
import AnimatedWord from './AnimatedWord'
import './Projects.scss'

// Project Images
import CofiImage from '../assets/images/CoFiImg.png'
import AlohaImage from '../assets/images/AlohaImage.png'
import FahmImage from '../assets/images/FAHMImage.png'
import CodeswaveImage from '../assets/images/CodeswaveImage.png'
import YouSoundImage from '../assets/images/YouSound.png'
import FalayaImage from '../assets/images/FalayaImage.png'

const Projects = () => {
  const [letterClass, setLetterClass] = useState('text-animate')

  useEffect(() => {
    setLetterClass('text-animate-hover')
  }, [])

  // Array of projects
  const projects = [
    {
      title: 'Assemble',
      description: `A platform for influencers who can get their sessions booked
        by their fans, fans can ask for the video and audio responses from their idols to proceed with their goals,
        upgraded this entire website to a new initiative for my companys' client with one team member only`,
      imageUrl: 'https://ucarecdn.com/f1af7ea7-1620-4d44-ba30-fd4b08de2b74/Screenshot20240406at124538AM.png',
      liveDemoUrl: 'https://assemble.fyi/'
    },
    {
      title: 'CoFi',
      description: `CoFi is the first multi-party payment platform for premium elective procedures. 
        With CoFi, patients can pay two or more parties — surgeon, optometrist, facility — right at the surgeon's office. 
        Hundreds of practices use CoFi today to compliantly handle co-management and ASC fees, delighting partners and patients alike.`,
      imageUrl: CofiImage,
      liveDemoUrl: 'https://www.cofimd.com/'
    },
    {
      title: 'Aloha Laundry Life',
      description: `At Aloha we're meeting the laundry needs of millions of Americans with reliable, eco-conscious laundry solutions.
        In a country where 19% of households lack washer-dryer hookups, we emerged to redefine your laundry experience with cleanliness and sustainability. 🧺✨`,
      imageUrl: AlohaImage,
      liveDemoUrl: 'https://alohalaundry.io/'
    },
    {
      title: 'FAHM',
      description: `A Freelancing Project where I built a website for an agency which specializes in Collaborative and Creative User Research and UX Design Consulting.`,
      imageUrl: FahmImage,
      liveDemoUrl: 'https://ux-design.fahm-technology.com/'
    },
    {
      title: 'YouSound',
      description: `YouSound is a music & shopping experience powered by verified artists & brands. 
        Earn money by sharing. Free Streaming. Live Video. No Ads. No Subscriptions.`,
      imageUrl: YouSoundImage,
      liveDemoUrl: 'https://yousound.com/'
    },
    {
      title: 'Falaya - Flat Fee Broker',
      description: `Falaya is a technology platform that helps sellers sell their properties faster and save thousands on commissions.`,
      imageUrl: FalayaImage,
      liveDemoUrl: 'https://falaya.com/'
    },
    {
      title: 'Codeswave',
      description: `Codeswave is a cutting-edge startup specializing in web development and automation services. 
        With our skilled team, we deliver tailored solutions for your web needs.`,
      imageUrl: CodeswaveImage,
      liveDemoUrl: 'https://codeswave.com/'
    }
  ]

  return (
    <>
      <div id="projects-page" className="row">
        {/*=== PAGE TITLE AND DESCRIPTION === */}
        <div className="col-11 d-flex flex-column justify-content-end ps-sm-5 align-items-center text-center text-sm-start align-items-sm-start">
          <h1 className="display-3">
            <AnimatedWord letterClass={letterClass} strArray={['MY']} />
            &nbsp;
            <AnimatedWord letterClass={letterClass} strArray={['WORK']} />
          </h1>
          <p className="fs-4">A collection of some of my projects.</p>
        </div>

        {/*=== PROJECTS CARDS === */}
        <div id="projectslist" className="col-11 h-50 d-flex flex-column justify-contend-end">
          <div className="row row-cols-1 row-cols-md-3 g-4">
            {projects.map((project, index) => (
              <div className="col d-flex align-items-stretch" key={index}>
                <div className="card m-2">
                  <img src={project.imageUrl} className="card-img-top" alt="Project Image" />
                  <div className="card-body">
                    <h3 className="card-title">{project.title}</h3>
                    <p className="card-text fs-5">{project.description}</p>
                  </div>
                  <div className="card-footer">
                    <a href={project.liveDemoUrl} target="_blank" rel="noopener noreferrer">
                      <button className="livebtn btn fs-5">Live Demo</button>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default Projects
