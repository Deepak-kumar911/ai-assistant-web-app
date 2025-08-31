import React, { useEffect, useState } from 'react';
import { LuFolder, LuSquareCheck, LuUser } from 'react-icons/lu';
import { useNavigate, useParams } from 'react-router-dom';
import { getAiAgentByIdApi } from '../../utils/apis/apiEndPoints';
import { toast } from 'react-toastify';
import IntegrationTab from '../../components/common/ai-agent/integration/tab/IntegrationTab';
import { useDispatch, useSelector } from 'react-redux';
import { resentAgentDetail, setAgentDetail } from '../../stateManagement/slices/aiAgentSlice';
import Loader from '../../components/common/Loader';
import AgentInfo from '../../components/common/ai-agent/tabs/AgentInfo';
import AgentBehaviour from '../../components/common/ai-agent/tabs/AgentBehaviour';

export default function ManageAiAgent() {
  const dispatch = useDispatch()
  const {details} = useSelector(state=>state?.ai_agent)
  const [activeTab, setActiveTab] = useState('customization');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const params = useParams()


  const fetchDetails = async () => {
    setLoading(true);
    try {
      const response = await getAiAgentByIdApi(params?.id);
      dispatch(setAgentDetail(response?.data?.data))
    } catch (error) {
      console.error('Error fetching agents:', error);
      toast.error(error?.response?.data?.message || 'Something went wrong!');
      dispatch(resentAgentDetail())
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params?.id) {
      fetchDetails();
    } else {
      navigate(-1)
    }
  }, []);

  const tabsOptions = [
    {
      value: 'customization',
      label: 'Info',
      icon: <LuUser className="w-4 h-4" />,
      content: <AgentInfo/>,
    },
    {
      value: 'behaviour',
      label: 'Behaviour',
      icon: <LuFolder className="w-4 h-4" />,
      content: <AgentBehaviour refetch={fetchDetails}/>,
    },
    {
      value: 'training',
      label: 'Training',
      icon: <LuSquareCheck className="w-4 h-4" />,
      content: (
        <div className="flex flex-col gap-4">
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            className="border px-4 py-2 rounded text-sm"
          />
          <input
            type="text"
            placeholder="FAQ question..."
            className="border px-4 py-2 rounded text-sm"
          />
          <input
            type="url"
            placeholder="Website URL"
            className="border px-4 py-2 rounded text-sm"
          />
          <button className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700 transition">
            Upload & Save
          </button>
        </div>
      ),
    },
    {
      value: 'integration',
      label: 'Integration',
      icon: <LuSquareCheck className="w-4 h-4" />,
      content: <IntegrationTab/>
    },
  ];

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <div className="p-6">
          {/* Tabs Header */}
          <div className="flex flex-wrap gap-4 border-b mb-6">
            {tabsOptions.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all border-b-2 ${activeTab === tab.value
                    ? 'border-teal-600 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-teal-500 hover:border-teal-300'
                  }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Active Tab Content */}
          <div className="mt-4">
            {tabsOptions.map(
              (tab) =>
                tab.value === activeTab && (
                  <div key={tab.value} className="animate-fadeIn">
                    {tab.content}
                  </div>
                )
            )}
          </div>
        </div>)}
    </>
  );
}
