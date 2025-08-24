export default function FormSelect({
  label,
  name,
  formik,
  options,
  handleOnChange,
  placeholder = 'Select an option',
}) {
  const props = formik.getFieldProps(name);
  const error = formik.touched[name] && formik.errors[name];

  return (
    <div className="w-full mb-5">
      <label  htmlFor={name} className="block text-sm font-semibold  mb-2"> {label}  </label>

      <div className="relative">
        <select
          {...props}
          id={name}
          name={name}
          onChange={(e) => handleOnChange(e, props.name)}
          className={`w-full appearance-none px-4 py-2 text-sm  border rounded-lg shadow-sm transition duration-300 ease-in-out focus:outline-none focus:ring-2 ${
            error
              ? 'border-red-500 focus:ring-red-400'
              : 'border-gray-300 focus:ring-blue-500'
          }`}
        >
          <option value={""} className="p-4">-- select option --</option>
          {options?.map(({ label, value }, idx) => (
            <option key={idx} value={value} className="p-4">
              {label}
            </option>
          ))}
        </select>

        {/* Dropdown arrow */}
        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {error && (
        <p className="text-red-500 text-xs mt-1 font-medium">
          {formik.errors[name]}
        </p>
      )}
    </div>
  );
}
