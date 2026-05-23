// components/form/FormButton.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { FiLoader } from 'react-icons/fi';


export default function FormButton({
  loading = false,
  handleClick,
  additionalCls = '',
  children = 'Save Changes',
  type = 'submit',
  disabled = false,
  variant = 'primary',
  size = 'md',
  icon,
}) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-gradient-to-r from-cyan-500 to-violet-500 text-white hover:shadow-lg hover:shadow-cyan-500/25';
      case 'secondary':
        return 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white';
      case 'danger':
        return 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:shadow-lg hover:shadow-red-500/25';
      case 'success':
        return 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg hover:shadow-emerald-500/25';
      default:
        return 'bg-gradient-to-r from-cyan-500 to-violet-500 text-white hover:shadow-lg hover:shadow-cyan-500/25';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm';
      case 'md':
        return 'px-6 py-2.5 text-sm';
      case 'lg':
        return 'px-8 py-3 text-base';
      default:
        return 'px-6 py-2.5 text-sm';
    }
  };

  return (
    <motion.button
      type={type}
      onClick={handleClick}
      disabled={disabled || loading}
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      className={`
        relative flex items-center justify-center gap-2 font-medium rounded-xl
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${getVariantStyles()}
        ${getSizeStyles()}
        ${additionalCls}
      `}
    >
      {loading ? (
        <>
          <FiLoader className="animate-spin" size={16} />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {icon && <span className="flex items-center">{icon}</span>}
          <span>{children}</span>
        </>
      )}
    </motion.button>
  );
}