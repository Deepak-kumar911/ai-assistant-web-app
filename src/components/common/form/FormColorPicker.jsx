
export default function FormColorPicker({ label, name,formik,handleOnChange }) {
    const props = formik.getFieldProps(name);
    const error = formik.touched[name] && formik.errors[name]

  return (
    <div className=" mb-4">
      <label htmlFor={name} className="block text-sm font-semibold mb-1"> {label} </label>

      <div className="flex items-center gap-3">
        {/* Color Picker */}
        <input
          type="color"
          id={props?.name}
          {...props}
          onChange={(e) => handleOnChange(e,props?.name)}
          style={{ backgroundColor: props?.value || "#ffffff" }}
            className="w-12 h-12 rounded-full cursor-pointer shadow-md 
             transition-all duration-200 hover:scale-105 focus:scale-110 
             focus:ring-2 focus:ring-indigo-400
             [&::-webkit-color-swatch]:border-none 
             [&::-webkit-color-swatch]:rounded-full 
             [&::-webkit-color-swatch-wrapper]:p-0"
        />
      </div>

      {error && <p className="text-red-500 text-xs mt-1 font-medium">{error}</p>}
    </div>
  );
}
