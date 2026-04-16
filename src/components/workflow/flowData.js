export const initialNodes = [
  {
    id: "1",
    type: "schedule",
     position: { x: 0, y: 0 },
    data: { interval: "one-time", time: "10:00" },
  },
  {
    id: "2",
    type: "instagram",
    position: { x: 0, y: 0 },
    data: { postType: "post", media: [], caption: "" },
  },
  {
    id: "3",
    type: "commentReply",
     position: { x: 0, y: 0 },
    data: { mode: "keyword" },
  },
  {
    id: "4",
    type: "dm",
    position: { x: 0, y: 0 },
    data: { dmType: "text" },
  },
];

export const initialEdges = [
  { id: "e1-2", source: "1", target: "2" },
  { id: "e2-3", source: "2", target: "3" },
  { id: "e3-4", source: "3", target: "4" },
];
