export default function FormCheckbox({ label, name, formik }){
  const checked = formik.values[name];

  return (
    <label className="inline-flex items-center space-x-2 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={() => formik.setFieldValue(name, !checked)}
        className="accent-blue-600 w-4 h-4 rounded"
      />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
};
