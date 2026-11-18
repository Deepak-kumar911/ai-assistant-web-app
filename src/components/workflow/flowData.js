export const initialNodes = [
  {
    id: "1",
    type: "schedule",
    position: { x: 50, y: 120 },
    data: { scheduleType: "instant", interval: "one-time", time: "10:00" },
  },
  {
    id: "2",
    type: "instagram",
    position: { x: 420, y: 120 },
    data: { postType: "post", media: [], caption: "" },
  },
  {
    id: "3",
    type: "commentReply",
    position: { x: 800, y: 120 },
    data: { mode: "keyword", keyword: "", reply: "" },
  },
  {
    id: "4",
    type: "dm",
    position: { x: 1180, y: 120 },
    data: { dmType: "text", text: "" },
  },
];

export const initialEdges = [
  { id: "e1-2", source: "1", target: "2", sourceHandle: "schedule", targetHandle: "in", animated: true },
  { id: "e2-3", source: "2", target: "3", sourceHandle: "comments", targetHandle: "keyword", animated: true },
  { id: "e3-4", source: "3", target: "4", sourceHandle: "reply", targetHandle: "in", animated: true },
];
