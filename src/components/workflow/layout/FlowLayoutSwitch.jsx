import "../../../styles/flowLayout.css";

export default function FlowLayoutSwitch({
  direction,
  onChange,
}) {
  return (
    <div className="layout-switch">
      <button
        onClick={() => onChange("LR")}
        className={direction === "LR" ? "active" : ""}
      >
        Horizontal
      </button>
      <button
        onClick={() => onChange("TB")}
        className={direction === "TB" ? "active" : ""}
      >
        Vertical
      </button>
    </div>
  );
}
