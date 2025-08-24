export default function FormTextArea({
  label,
  name,
  formik,
  placeholder,
  rows = 4,
  disabled = false,
  showCount = false,
  maxLength,
  className = '',
  labelClassName = '',
  errorClassName = '',
}) {
  const props = formik.getFieldProps(name);
  const error = formik.touched[name] && formik.errors[name];
  const charCount = props.value?.length || 0;

  return (
    <div className={`w-full space-y-1 ${className}`}>
      {label && (
        <div className="flex justify-between items-center">
          <label
            className={`block text-sm font-medium  ${labelClassName}`}
            htmlFor={name}
          >
            {label}
          </label>
          {showCount && maxLength && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {charCount}/{maxLength}
            </span>
          )}
        </div>
      )}

      <div className="relative">
        <textarea
          {...props}
          id={name}
          placeholder={placeholder}
          rows={rows}
          disabled={disabled}
          maxLength={maxLength}
          className={`w-full px-4 py-3 text-sm border rounded-xl shadow-sm resize-none transition-all duration-200
            focus:ring-2 focus:outline-none
            ${
              error
                ? 'border-red-500 focus:ring-red-500/30'
                : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500/30'
            }
            ${
              disabled
                ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed opacity-70'
                : ' dark:bg-gray-800'
            }`}
        />

        {/* Focus border animation */}
        {!error && !disabled && (
          <div className="absolute inset-0 rounded-xl pointer-events-none overflow-hidden">
            <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-500/20 transition-all duration-200" />
          </div>
        )}
      </div>

      {error && (
        <p
          className={`text-red-500 dark:text-red-400 text-xs mt-1 flex items-center ${errorClassName}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3 w-3 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {formik.errors[name]}
        </p>
      )}
    </div>
  );
}