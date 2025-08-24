export default function FormInputField({label,name,formik,type = 'text', placeholder = '',handleOnChange,isTouched,isError}) {
    const props = formik.getFieldProps(name);
    const error = ((formik.touched[name] && formik.errors[name]) || (isTouched && isError));

    return (
        <div className="w-full mb-5">
            <label htmlFor={name} className="block text-sm font-semibold  mb-2">{label}</label>
            <input
                {...props}
                id={name}
                name={name}
                type={type}
                placeholder={placeholder}
                onChange={(e) => handleOnChange(e, props?.name)}
                className={`w-full rounded-md p-2 text-sm border transition duration-300 ease-in-out shadow-sm focus:outline-none focus:ring-2 ${error ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-500'}`} />
            {error && (
                <p className="text-red-500 text-xs mt-1 font-medium">
                    {error}
                </p>
            )}
        </div>
    );
}
