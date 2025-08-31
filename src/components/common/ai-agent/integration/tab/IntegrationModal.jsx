import { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import { motion } from "framer-motion";
import { addIntegrationApi, getAllIntegrationCategoryApi } from "../../../../../utils/apis/apiEndPoints";
import Loader from "../../../Loader";
import { toast } from "react-toastify";
import { integrationIcons } from "./IntegrationTab";
import { useSelector } from "react-redux";



export default function IntegrationModal({ isOpen, setIsOpen,refetch }) {
  const {details} = useSelector(state=>state?.ai_agent)
  const [search, setSearch] = useState("");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState({ _id: null, loading: false })


  const fetchList = async () => {
    setLoading(true);
    try {
      const response = await getAllIntegrationCategoryApi();
      setList(response?.data?.data || []);
    } catch (error) {
      console.error('Error fetching agents:', error);
      toast.error(error?.response?.data?.message || 'Something went wrong!');
    } finally {
      setLoading(false);
    }
  };

  const addIntegration = async (_id) => {
    if (!_id || !details?._id) return
    setSaving({ _id, loading: true });
    try {
      const response = await addIntegrationApi({ agentId: details?._id, categoryId: _id });
      toast.success(response?.data?.message)
      setIsOpen(false)
      refetch && refetch()
    } catch (error) {
      console.error('Error fetching agents:', error);
      toast.error(error?.response?.data?.message || 'Something went wrong!');
    } finally {
      setSaving({ _id: null, loading: false });
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const filtered = list?.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );


  return (
    <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-6 flex flex-col"
        >
          {/* Header */}
          <div className="flex justify-between items-center border-b pb-3 mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Choose Integration</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-800">
              ✕
            </button>
          </div>

          {loading ? (
            <Loader />
          ) : <>

            {/* Search Bar */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search integrations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2 border rounded-xl shadow-sm focus:ring-2 
                           focus:ring-indigo-400 outline-none transition"
              />
            </div>

            {/* Integration Grid (scrollable) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 overflow-y-auto max-h-[400px] pr-2 p-6">
              {filtered.length > 0 ? (
                filtered.map((item, idx) => (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => !saving?.loading && addIntegration(item?._id)}
                    disabled={saving?.loading} // disable all while saving
                    className={`flex flex-col gap-2 p-4 rounded-xl border transition bg-white ${saving?.loading ? "opacity-50 cursor-not-allowed" : "hover:border-indigo-500 shadow-sm hover:shadow-md"}`}
                  >
                    <div className="flex flex-col items-center text-center w-full">
                      <div className="p-3 bg-gray-100 rounded-full">
                        {saving?.loading && saving?._id == item?._id ? (
                          <svg
                            className="animate-spin h-6 w-6 text-indigo-500"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24" >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" ></path>
                          </svg>
                        ) : (
                          integrationIcons(item?.name)
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-800 mt-2">{item?.name}</h3>
                    </div>
                    <p className="text-sm text-gray-500 ">{item?.description}</p>
                  </motion.button>

                ))
              ) : (
                <p className="col-span-full text-center text-gray-500">
                  No integrations found.
                </p>
              )}
            </div>

          </>}

        </motion.div>
      </div>
    </Dialog>
  );
}
