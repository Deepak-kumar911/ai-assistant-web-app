import { useState } from 'react';
import { formFields } from './ToolBox';
import { FiEdit } from 'react-icons/fi';

const FormCanvas = () => {
  const [fields, setFields] = useState([]);
  const [editingField, setEditingField] = useState(null);

  const handleDrop = (e) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('field-type');
    const field = formFields.find((f) => f.id === type);
    if (field) {
      setFields([...fields, { ...field, key: Date.now(), required: false }]);
    }
  };

  const handleEditChange = (key, value) => {
    setEditingField((prev) => ({ ...prev, [key]: value }));
  };

  const saveChanges = () => {
    setFields((prev) =>
      prev.map((f) => (f.key === editingField.key ? editingField : f))
    );
    setEditingField(null);
  };

  return (
    <div
      className="p-6 border rounded-lg w-full md:w-3/4 bg-white min-h-[350px] shadow-sm mx-auto"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <h2 className="text-2xl font-extrabold text-gray-800 mb-6 border-b pb-2">
        Form Canvas
      </h2>

      {fields.length === 0 && (
        <p className="text-gray-400 italic text-center py-12">
          Drag fields here to build your form
        </p>
      )}

      {fields.map((field) => (
        <div
          key={field.key}
          className="flex justify-between items-center p-4 mb-4 border rounded-lg cursor-pointer hover:shadow-md hover:bg-gray-50 transition duration-200"
          onClick={() => setEditingField({ ...field })}
          title="Click to edit field"
        >
          <div>
            <span className="text-gray-900 text-lg font-semibold">{field.label}</span>{' '}
            <span className="text-gray-500 text-sm">({field.id})</span>
            {field.required && (
              <span className="text-red-500 ml-2 font-semibold">*</span>
            )}
          </div>
          <div className="text-gray-400 text-xl">
            <FiEdit />
          </div>
        </div>
      ))}

      {editingField && (
        <div className="fixed top-16 right-16 w-full max-w-md bg-white border rounded-xl shadow-2xl p-6 z-50">
          <h1 className="text-xl font-bold border-b pb-2 mb-4">Edit Field</h1>

          <div className="space-y-4">
            {/* Label */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Label
              </label>
              <input
                type="text"
                value={editingField?.label}
                onChange={(e) => handleEditChange('label', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="Enter field label"
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={editingField?.id}
                onChange={(e) => handleEditChange('id', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              >
                <option value="text">Text</option>
                <option value="textarea">Textarea</option>
                <option value="checkbox">Checkbox</option>
              </select>
            </div>

            {/* Required */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="required"
                checked={editingField?.required}
                onChange={(e) => handleEditChange('required', e.target.checked)}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label
                htmlFor="required"
                className="text-sm font-medium text-gray-700 select-none"
              >
                Required
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end mt-6 space-x-3">
            <button
              onClick={() => setEditingField(null)}
              className="px-4 py-2 rounded-md text-sm bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button
              onClick={saveChanges}
              className="px-4 py-2 rounded-md text-sm bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormCanvas;
