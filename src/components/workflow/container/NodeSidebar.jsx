// src/components/NodeSidebar.jsx
import React, { useEffect, useState } from 'react';
import { getNodeDefinationListApi } from '../../../api/nodeDefination/nodeDefinationApi';
import { toast } from 'react-toastify';

const nodeTypesList = [
  { type: 'start', label: 'Start Node' },
  { type: 'http', label: 'HTTP Request' },
  { type: 'email', label: 'Send Email' },
  { type: 'end', label: 'End Node' },
];

export default function NodeSidebar() {
  const [search, setSearch] = useState('');
  const [list,setList] = useState([])
  const [listCount, setListCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const filtered = nodeTypesList.filter((n) =>
    n.label.toLowerCase().includes(search.toLowerCase())
  );

  const fetchNodeList = ()=>{
    getNodeDefinationListApi({setList,setListCount,filterData:{search},setLoading})
    .then(result=>{})
    .catch(err=>toast.error(err?.message || "Failed to laod nodes"))
  }

  useEffect(()=>{
    fetchNodeList()
  },[])

  return (
    <div className="w-72 border-l bg-white p-4 shadow-lg flex flex-col">
      <input
        type="text"
        placeholder="Search nodes..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-4 p-2 border rounded"
      />
      <div className="overflow-y-auto">
        {filtered.map((node) => (
          <div
            key={node.type}
            draggable
            onDragStart={(e) =>
              e.dataTransfer.setData(
                'application/node-type',
                JSON.stringify(node)
              )
            }
            className="cursor-grab p-3 mb-2 rounded-lg bg-blue-100 hover:bg-blue-200"
          >
            {node.label}
          </div>
        ))}
      </div>
    </div>
  );
}
