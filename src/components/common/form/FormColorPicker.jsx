
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
          className="w-12 h-12 border border-blue-500  rounded-full cursor-pointer shadow-sm transition-all"
        />
        {/* Color Value Display */}
        {/* <span className="text-sm ">{props?.value}</span> */}
      </div>

      {error && <p className="text-red-500 text-xs mt-1 font-medium">{error}</p>}
    </div>
  );
}
