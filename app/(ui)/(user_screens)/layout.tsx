import React, { ReactNode } from 'react'
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';

function Layout({children}:{children:React.ReactNode}) {
  return (
    <>
      <div><Navbar/></div>
      {children}
    </>
  )
}

export default Layout