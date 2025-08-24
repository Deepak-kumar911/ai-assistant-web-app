import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllUserAIagentApi } from '../../utils/apiEndPoints';
import Loader from '../../components/common/Loader';
import { toast } from 'react-toastify';

const AllAgent = () => {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const response = await getAllUserAIagentApi();
      setList(response?.data?.data || []);
      toast.success('Agents fetched successfully!');
    } catch (error) {
      console.error('Error fetching agents:', error);
      toast.error(error?.response?.data?.message || 'Something went wrong!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Your AI Agents</h2>

      {loading ? (
        <Loader />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {list?.map((agent) => (
            <Link
              to={`/ai-agent/manage/${agent._id}`}
              key={agent._id}
              className="no-underline"
            >
              <div
                onClick={() => navigate(`/ai-agent/manage/${agent._id}`)}
                className="p-5 rounded-2xl shadow-lg transition transform hover:scale-[1.03] hover:shadow-xl cursor-pointer"
              >
                <div className="flex flex-col gap-3">
                  <h3 className="text-lg">{agent?.name}</h3>
                  <p className="">{agent?.description}</p>
                  <p
                    className={`text-sm font-medium ${
                      agent?.isOnOff ? 'text-green-600' : 'text-orange-500'
                    }`}
                  >
                    Status: {agent?.isOnOff ? 'Active' : 'Paused'}
                  </p>
                  <button className="bg-blue-600 text-white text-sm px-4 py-2 rounded hover:bg-blue-700 transition">
                    Manage
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllAgent;
