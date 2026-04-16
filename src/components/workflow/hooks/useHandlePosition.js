export const getHandlePositions = (direction) => {
  return direction === "LR"
    ? { source: "right", target: "left" }
    : { source: "bottom", target: "top" };
};
