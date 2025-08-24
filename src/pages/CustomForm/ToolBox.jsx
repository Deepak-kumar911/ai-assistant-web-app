export const formFields = [
  { id: 'text', label: 'Text Field' },
  { id: 'textarea', label: 'Textarea' },
  { id: 'checkbox', label: 'Checkbox' }
];

const Toolbox = () => {
  return (
    <div className="w-full md:w-1/4 p-4 border bg-gray-50 rounded-md">
      <h2 className="text-lg font-semibold mb-4">Toolbox</h2>

      {formFields.map((field) => (
        <div
          key={field.id}
          draggable
          onDragStart={(e) => e.dataTransfer.setData('field-type', field.id)}
          className="p-3 mb-3 bg-white border rounded-md cursor-grab hover:bg-gray-100 transition"
        >
          {field.label}
        </div>
      ))}
    </div>
  );
};

export default Toolbox;
