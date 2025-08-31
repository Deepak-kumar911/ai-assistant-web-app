import { useEffect, useState } from "react";
import IntegrationModal from "./IntegrationModal"; // the modal we built
import { FaGlobe, FaWhatsapp, FaInstagram, FaFacebook } from "react-icons/fa";
import { getAllActiveIntegrationApi } from "../../../../../utils/apis/apiEndPoints";
import Loader from "../../../Loader";
import { IoArrowBackCircleOutline } from "react-icons/io5";
import WebIntegration from "../WebIntegration";

export const integrationIcons = (name) => {
    switch (name?.toLowerCase()) {
        case "website":
            return <FaGlobe className="text-blue-500 text-2xl" />
        case "whatsapp":
            return <FaWhatsapp className="text-green-500 text-2xl" />
        case "instagram":
            return <FaInstagram className="text-pink-500 text-2xl" />
        case "facebook":
            return <FaFacebook className="text-blue-700 text-2xl" />
        default:
            return <FaGlobe className="text-blue-500 text-2xl" />
    }
}


export default function IntegrationTab() {
    const [isOpen, setIsOpen] = useState(false);
    const [activeIntegration, setActiveIntegration] = useState(null);
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(false);

    // Dummy integration customization components
    const IntegrationPages = {
        website: <WebIntegration/>,
        whatsapp: <div className="p-6">💬 WhatsApp Integration Settings</div>,
        instagram: <div className="p-6">📸 Instagram Integration Settings</div>,
        facebook: <div className="p-6">📘 Facebook Integration Settings</div>,
    };

    const fetchList = async () => {
        setLoading(true);
        try {
            const response = await getAllActiveIntegrationApi();
            setList(response?.data?.data || []);
        } catch (error) {
            console.error('Error fetching agents:', error);
            toast.error(error?.response?.data?.message || 'Something went wrong!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchList();
    }, []);

    return (
        <>
            {activeIntegration ? (
                // Show customization page
                IntegrationPages[activeIntegration]
                    ? <div>
                        <div onClick={()=>setActiveIntegration(null)} className="flex gap-2 items-center cursor-pointer"><IoArrowBackCircleOutline/> Back</div> 
                        {IntegrationPages[activeIntegration]}
                    </div> 
                    : <div className="border rounded-2xl shadow-md bg-white">
                        <div className="p-6">⚙️ Settings not found</div> </div>

            ) :<div className="p-6 space-y-6">
                    {/* Top Bar */}
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-gray-800">Your Integrations</h2>
                        <button
                            onClick={() => setIsOpen(true)}
                            className="px-5 py-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 
                       text-white font-medium shadow-lg hover:scale-105 transition" >
                            + Add New Integration
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-content-center">
                            <Loader />
                        </div>
                    ) : <>
                        {/* Active Integrations List */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {list?.map((item) => (
                                <button
                                    key={item._id}
                                    onClick={() => setActiveIntegration(item?.integrationCategoryId?.name?.toLowerCase())}
                                    className="flex flex-col items-center gap-2 p-4 rounded-xl border  hover:border-indigo-500 shadow-sm hover:shadow-md transition bg-white" >
                                    <div className="p-3 bg-gray-100 rounded-full">{integrationIcons(item?.integrationCategoryId?.name)}</div>
                                    <h3 className="font-semibold text-gray-800">{item?.integrationCategoryId?.name}</h3>
                                    {/* <p className="text-sm text-gray-500 text-left">{item?.integrationCategoryId.description}</p> */}
                                </button>
                            ))}
                        </div>

                    </>}
                </div>}

            {/* Add New Integration Modal */}
            <IntegrationModal isOpen={isOpen} refetch={fetchList} setIsOpen={setIsOpen}/>
        </>
    );
}

