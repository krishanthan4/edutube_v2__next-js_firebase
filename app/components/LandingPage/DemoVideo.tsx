import React from 'react'
import { GiBottomRight3dArrow } from "react-icons/gi";

function DemoVideo() {
  return (
    <div className='py-24 bg-white text-black flex flex-row justify-center items-center h-[100vh] overflow-x-hidden'>
        <div className='absolute w-full hidden md:flex flex-col items-start ps-14 select-none '><div className='z-20'>Demo Here <GiBottomRight3dArrow size={50} className='ms-10'/></div></div>
      <div className='w-[90%] md:w-[70%] h-[80%] md:h-[100%] flex flex-col items-center'>
      <div className=' h-full w-full rounded-xl overflow-hidden border-double border-stone-800 border-8 z-0'>
       <iframe width="100%" height="100%" src={`${process.env.NEXT_PUBLIC_DEMO_VIDEO}`} title="Demo Video"  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture;" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen draggable={false}></iframe>
      
       </div>
       <div className='bg-slate-900 w-[110%] h-[3%] sm:block hidden rounded-b-3xl rounded-t-lg'></div>
      </div>
        </div>
  )
}

export default DemoVideo