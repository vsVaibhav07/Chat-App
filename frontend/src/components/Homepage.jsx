import React from 'react'
import Sidebar from './Sidebar'
import Chatbox from './Chatbox'

const Homepage = () => {
  return (
    <div className="flex flex-col md:flex-row h-screen w-full p-6 max-h-screen overflow-hidden">
      <Sidebar />
      <Chatbox />
    </div>
  )
}

export default Homepage
