import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Layout from './pages/Layout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import WriteArtical from './pages/WriteArtical.jsx'
import BlogTiltles from './pages/BlogTiltles.jsx'
import GenerateImages from './pages/GenerateImages.jsx'
import RemoveBackground from './pages/RemoveBackground.jsx'
import RemoveObject from './pages/RemoveObject.jsx'
import ReviewResume from './pages/ReviewResume.jsx'
import Community from './pages/Community.jsx'
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