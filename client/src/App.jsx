import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/home'
import Layout from './pages/Layout'
import Dashboard from './pages/Dashboard'
import WriteArtical from './pages/WriteArtical'
import BlogTiltles from './pages/BlogTiltles'
import GenerateImages from './pages/GenerateImages'
import RemoveBackground from './pages/RemoveBackground'
import RemoveObject from './pages/RemoveObject'
import ReviewResume from './pages/reviewResume'
import Community from './pages/Community'
import { Toaster } from 'react-hot-toast'
function App() {
  return (
    <div>
      <Toaster/>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path ="/ai" element ={<Layout/>}>
          <Route index element={<Dashboard/>}/>
          <Route path="write-article" element={<WriteArtical/>}/>
          <Route path="blog-titles" element={<BlogTiltles/>}/>
          <Route path="generate-images" element={<GenerateImages/>}/>
          <Route path="remove-background" element={<RemoveBackground/>}/>
          <Route path="remove-object" element={<RemoveObject/>}/>
          <Route path="review-resume" element={<ReviewResume/>}/>
          <Route path="community" element={<Community/>}/>

        </Route>
      </Routes>
    </div>
  )
}

export default App