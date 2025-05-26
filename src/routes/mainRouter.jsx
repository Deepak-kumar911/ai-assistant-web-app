import React, { useEffect } from 'react'
import { Routes,Route } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'

// helper function
import { getToken } from '../utils/helperFunction'

// pages
import SignUp from '../pages/SignUp'
import SignIn from '../pages/SignIn'
import Dashboard from '../pages/Dashboard'
import AllAgent from '../pages/aiAgent/AllAgent'
import ManageAiAgent from '../pages/aiAgent/ManageAiAgent'

import UserLayout from '../layout/UserLayout'


export default function MainRouter() {
    const {setLogin,login} = useAppContext()

   const privateRoute = ()=>{
    return (
        <>
        <Route path='/dashboard' element={<UserLayout><Dashboard/></UserLayout>}/>
        <Route path='/' element={<UserLayout><Dashboard/></UserLayout>}/>
        <Route path='/ai-agent' element={<UserLayout><AllAgent/></UserLayout>}/>
        <Route path='/ai-agent/manage/:id' element={<UserLayout><ManageAiAgent/></UserLayout>}/>
        </>
    )
   }

      const publicRoute = ()=>{
    return (
        <>
        <Route path='/' element={<SignIn/>}/>
        <Route path='/sign-in' element={<SignIn/>}/>
        <Route path='/sign-up' element={<SignUp/>}/>
        </>
    )
   }

   useEffect(()=>{
    let token = getToken()
    if(token){
        setLogin(true)
    }
   },[login])

   console.log("app",login);
   

  return (
    <div>
        <Routes>
            {login && privateRoute()}
            {!login && publicRoute()}
        </Routes>
    </div>
  )
}
