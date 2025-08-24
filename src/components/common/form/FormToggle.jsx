export const FormToggle = ({label, name, formik,handleOnChange }) => {
     const props = formik.getFieldProps(name);
    const error = formik.touched[name] && formik.errors[name];


  return (
    <div>
    <label htmlFor={props?.name} className="block text-sm font-semibold  mb-2">{label}</label>
    <div
      onClick={() =>handleOnChange(props?.name, !props?.value)}
      className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all duration-300 ${
        props?.value ? 'bg-blue-600' : 'bg-gray-300'
      }`}
    >
      <div className="w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300" style={{
        transform: props?.value ? 'translateX(100%)' : 'translateX(0)',
      }} />
    </div>
    </div>
  );
};
