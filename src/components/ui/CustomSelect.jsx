import React, { useState, useRef, useEffect } from "react";
import { FiChevronDown, FiCheck } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

export default function CustomSelect({
  value,
  onChange,
  options = [],
  placeholder = "Select...",
  icon: LeadingIcon,
  className = "",
  disabled = false,
  dropUp = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const selectedOption = options.find((opt) => String(opt.value) === String(value));

  return (
    <div ref={containerRef} className={`relative select-none ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 border cursor-pointer ${
          isOpen
            ? "bg-white/[0.08] border-cyan-500/50 text-white shadow-[0_0_12px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/30"
            : "bg-white/[0.04] border-white/10 hover:border-white/20 text-gray-200 hover:bg-white/[0.06]"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <div className="flex items-center gap-2 truncate min-w-0">
          {LeadingIcon && <LeadingIcon size={14} className="text-gray-400 shrink-0" />}
          {selectedOption?.icon && (
            <selectedOption.icon
              size={13}
              className={selectedOption.iconColor || "text-cyan-400 shrink-0"}
            />
          )}
          {selectedOption?.dot && (
            <span className={`w-2 h-2 rounded-full shrink-0 ${selectedOption.dot}`} />
          )}
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        <FiChevronDown
          size={14}
          className={`text-gray-400 transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-180 text-cyan-400" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: dropUp ? 4 : -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: dropUp ? 4 : -4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={`absolute left-0 right-0 z-50 p-1.5 rounded-xl bg-[#0F1422] border border-white/15 shadow-2xl backdrop-blur-2xl max-h-64 overflow-y-auto custom-scrollbar ${
              dropUp ? "bottom-full mb-1.5" : "top-full mt-1.5"
            }`}
            style={{ minWidth: "160px" }}
          >
            {options.map((opt) => {
              const isSelected = String(opt.value) === String(value);
              const OptIcon = opt.icon;

              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors text-left cursor-pointer ${
                    isSelected
                      ? "bg-cyan-500/15 text-cyan-300 font-semibold"
                      : "text-gray-300 hover:text-white hover:bg-white/[0.06]"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate min-w-0">
                    {opt.dot && (
                      <span className={`w-2 h-2 rounded-full shrink-0 ${opt.dot}`} />
                    )}
                    {OptIcon && (
                      <OptIcon
                        size={13}
                        className={opt.iconColor || (isSelected ? "text-cyan-400" : "text-gray-400")}
                      />
                    )}
                    <span className="truncate">{opt.label}</span>
                  </div>

                  {isSelected && (
                    <FiCheck size={13} className="text-cyan-400 shrink-0 ml-1" />
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
