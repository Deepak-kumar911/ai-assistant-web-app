import React, { useEffect, useState } from 'react';
import { LuFolder, LuSquareCheck, LuUser } from 'react-icons/lu';
import AgentCustomization from '../../components/common/ai-agent/Customization';
import { useNavigate, useParams } from 'react-router-dom';
import { getAiAgentByIdApi } from '../../utils/apiEndPoints';
import { toast } from 'react-toastify';
import WidgetIntegrationSnippet from '../../components/common/ai-agent/widget/WidgetIntegration';

export default function ManageAiAgent() {
  const [activeTab, setActiveTab] = useState('customization');
    const navigate = useNavigate();
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const params = useParams()


  const fetchDetails = async () => {
    setLoading(true);
    try {
      const response = await getAiAgentByIdApi(params?.id);
      setDetails(response?.data?.data || {});
      toast.success(response?.data?.message);
    } catch (error) {
      console.error('Error fetching agents:', error);
      toast.error(error?.response?.data?.message || 'Something went wrong!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if(params?.id){
      fetchDetails();
    }
  }, []);

  const tabsOptions = [
    {
      value: 'customization',
      label: 'Customization',
      icon: <LuUser className="w-4 h-4" />,
      content: <AgentCustomization details={details}/>,
    },
    {
      value: 'behaviour',
      label: 'Behaviour',
      icon: <LuFolder className="w-4 h-4" />,
      content: (
        <div>
          <textarea
            placeholder="Describe agent behaviour here..."
            className="w-full border rounded-md px-4 py-2 text-sm focus:ring-2 focus:ring-teal-500"
          />
          <button className="mt-4 bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700 transition">
            Save
          </button>
        </div>
      ),
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
      content: <WidgetIntegrationSnippet details={details}/>
    },
  ];

  return (
    <div className="p-6">
      {/* Tabs Header */}
      <div className="flex flex-wrap gap-4 border-b mb-6">
        {tabsOptions.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all border-b-2 ${
              activeTab === tab.value
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
    </div>
  );
}
