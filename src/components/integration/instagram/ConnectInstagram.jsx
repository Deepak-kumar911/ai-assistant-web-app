import { useState } from "react";
import { connectInstagramApi } from "../../../utils/apis/integration/instagramIntegrationApi";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

const ConnectInstagram = () => {
  const [loading,setLoading] = useState(false)
    const { details:integrationDetails } = useSelector(state => state?.integration)

  const handleConnect = async()=>{
      setLoading(true)
    try {
      const res = await connectInstagramApi()
      if(res?.status==200 && res?.data?.url){
        window.location.href = res?.data?.url;
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Something went wrong!');
    }finally{
      setLoading(false)
    }
  }
  return (
    <button
      onClick={handleConnect}
      disabled={loading || !integrationDetails?._id}
      className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
    >
      {loading ? "loading" : "Connect instagram"}
    </button>
  );
};

export default ConnectInstagram;
