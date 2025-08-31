import React, { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'

// helper function
import { getToken } from '../utils/helperFunction'

// pages
import SignUp from '../pages/SignUp'
import SignIn from '../pages/SignIn'
import Dashboard from '../pages/Dashboard'
import AllAgent from '../pages/aiAgent/AllAgent'
import ManageAiAgent from '../pages/aiAgent/ManageAiAgent'

import UserLayout from '../layout/UserLayout'
import CustomForms from '../pages/CustomForm/CustomForms'
import { useDispatch, useSelector } from 'react-redux'
import { logout, setLogin } from '../stateManagement/slices/authSlice'


export default function MainRouter() {
    const dispatch = useDispatch()
    const authSlice = useSelector(state=>state?.auth)
    const login = authSlice?.login

    const privateRoute = () => {
        return (
            <>
                <Route path='/dashboard' element={<UserLayout><Dashboard /></UserLayout>} />
                <Route path='/' element={<UserLayout><Dashboard /></UserLayout>} />
                <Route path='/ai-agent' element={<UserLayout><AllAgent /></UserLayout>} />
                <Route path='/ai-agent/manage/:id' element={<UserLayout><ManageAiAgent /></UserLayout>} />
                <Route path='/form' element={<UserLayout><CustomForms /></UserLayout>} />
            </>
        )
    }

    const publicRoute = () => {
        return (
            <>
                <Route path='/' element={<SignIn />} />
                <Route path='/sign-in' element={<SignIn />} />
                {/* <Route path='/sign-up' element={<SignUp />} /> */}
            </>
        )
    }

    return (
        <div>
            <Routes>
                {privateRoute()}
                {publicRoute()}
            </Routes>
        </div>
    )
}
