import React from 'react'
import Navbar from '../components/Navbar.jsx'
import Hero from '../components/Hero.jsx'
import AiTools from '../components/AiTools.jsx'
import Testimonial from '../components/Testimonial.jsx'
import Plan from '../components/Plan.jsx'
import Footer from '../components/Footer.jsx'

function Home() {
  return (
    <>
        <Navbar/>
        <Hero/>
        <AiTools/>
        <Testimonial/>
        <Plan/>
        <Footer/>
        <div className='fixed bottom-6 right-4 sm:right-6 z-40 pointer-events-none select-none'>
          <div className='relative animate-bounce [animation-duration:2.2s]'>
            <div className='absolute -inset-2 rounded-full bg-primary/20 blur-md animate-pulse'></div>
            <div className='relative h-16 w-16 rounded-full bg-gradient-to-b from-primary to-indigo-700 shadow-xl flex items-center justify-center border-2 border-white'>
              <div className='h-8 w-8 rounded-full bg-white/90 flex items-center justify-center text-primary font-bold text-lg'>AI</div>
              <span className='absolute -top-1 -right-1 h-3 w-3 rounded-full bg-green-400 border border-white animate-ping'></span>
              <span className='absolute -top-1 -right-1 h-3 w-3 rounded-full bg-green-400 border border-white'></span>
            </div>
          </div>
        </div>
    </>
  )
}

export default Home