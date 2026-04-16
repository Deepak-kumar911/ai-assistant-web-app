export const getHandleStyle = ({ direction, offset }) => {
  return direction === "LR"
    ? {
        top: `${offset}%`,
        transform: "translateY(-50%)",
      }
    : {
        left: `${offset}%`,
        transform: "translateX(-50%)",
      };
};
