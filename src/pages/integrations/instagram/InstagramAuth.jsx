import React, { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { getInstagramAccessTokenApi } from '../../../utils/apis/integration/instagramIntegrationApi';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';


export default function InstagramAuth() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [loading, setLoading] = useState(false)
    const { details } = useSelector(state => state?.ai_agent)
    const { details:integrationDetails } = useSelector(state => state?.integration)
    const { platform } = useParams();
    const navigate = useNavigate()
    const aiAgentId = details?._id
    const categoryId = integrationDetails?._id


    const handleAccessToken = async (code) => {
        setLoading(true)
        try {
            const res = await getInstagramAccessTokenApi({ code,aiAgentId,categoryId })
            if (res?.status == 200 && res?.data?.success == 1) {
                navigate(`/integration/${platform}/overview`)
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Something went wrong!');
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const code = searchParams.get("code")
        if (code && aiAgentId && categoryId) {
            handleAccessToken(code)
        }
    }, [searchParams.toString(),aiAgentId,categoryId])
    
    return (
        <div>
            {
                loading ? "Connecting...." : "Connected"
            }
        </div>
    )
}
