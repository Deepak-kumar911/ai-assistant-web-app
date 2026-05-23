// components/form/FormToggle.tsx
import React from 'react';
import { motion } from 'framer-motion';


export const FormToggle = ({
  label,
  name,
  formik,
  handleOnChange,
  disabled = false,
  description,
}) => {
  const value = formik.values[name];
  
  const onChange = () => {
    const newValue = !value;
    if (handleOnChange) {
      handleOnChange(name, newValue);
    } else {
      formik.setFieldValue(name, newValue);
    }
  };

  return (
    <div className="flex items-center justify-between">
      {label && (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-300">{label}</span>
          {description && (
            <span className="text-xs text-gray-500 mt-0.5">{description}</span>
          )}
        </div>
      )}
      
      <button
        type="button"
        onClick={onChange}
        disabled={disabled}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300
          focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:ring-offset-2 focus:ring-offset-[#0F0F12]
          ${value ? 'bg-gradient-to-r from-cyan-500 to-violet-500' : 'bg-white/10'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <motion.span
          initial={false}
          animate={{ x: value ? 20 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className={`
            inline-block h-5 w-5 rounded-full bg-white shadow-lg
            ${value ? 'translate-x-5' : 'translate-x-0'}
          `}
        />
      </button>
    </div>
  );
};