// components/form/FormInputField.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertCircle, FiCheckCircle } from 'react-icons/fi';



export default function FormInputField({
  label,
  name,
  type = 'text',
  placeholder,
  formik,
  handleOnChange,
  disabled = false,
  required = false,
  icon,
  hint,
}) {
  const error = formik.touched[name] && formik.errors[name];
  const value = formik.values[name];
  const isTouched = formik.touched[name];
  const isValid = isTouched && !error;

  const onChange = (e) => {
    if (handleOnChange) {
      handleOnChange(e, name);
    } else {
      formik.setFieldValue(name, e.target.value);
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-1.5">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            {icon}
          </div>
        )}
        
        <input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value || ''}
          onChange={onChange}
          onBlur={formik.handleBlur}
          disabled={disabled}
          className={`
            w-full bg-[#0F0F12] border rounded-xl px-4 py-2.5 
            text-white placeholder-gray-500 transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-cyan-500/50
            disabled:opacity-50 disabled:cursor-not-allowed
            ${icon ? 'pl-10' : 'pl-4'}
            ${error && isTouched 
              ? 'border-red-500/50 focus:border-red-500' 
              : isValid 
                ? 'border-emerald-500/50 focus:border-emerald-500' 
                : 'border-white/10 focus:border-cyan-500/50'
            }
          `}
        />
        
        <AnimatePresence>
          {isValid && !error && isTouched && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <FiCheckCircle className="text-emerald-400" size={18} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <AnimatePresence>
        {error && isTouched && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-1.5 mt-1.5"
          >
            <FiAlertCircle size={12} className="text-red-400" />
            <p className="text-xs text-red-400">{error}</p>
          </motion.div>
        )}
        
        {hint && !error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-gray-500 mt-1.5"
          >
            {hint}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}