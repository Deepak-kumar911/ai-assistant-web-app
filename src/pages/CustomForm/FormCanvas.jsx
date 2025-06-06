import { useState } from 'react';
import { formFields } from './ToolBox';
import {
  Box,
  Heading,
  Text,
  Flex,
  Input,
  Select,
  Checkbox,
  Button,
  Stack,
} from '@chakra-ui/react';
import { FiEdit } from 'react-icons/fi';

const FormCanvas = () => {
  const [fields, setFields] = useState([]);
  const [editingField, setEditingField] = useState(null);

  const handleDrop = (e) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('field-type');
    console.log("drop",type)
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
    <Box
      p={6}
      className="border rounded-lg w-3/4 bg-white min-h-[350px] shadow-sm mx-auto"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <Heading
        as="h2"
        size="xl"
        fontWeight="extrabold"
        mb={6}
        className="border-b pb-2 text-gray-800"
      >
        Form Canvas
      </Heading>

      {fields.length === 0 && (
        <Text
          className="text-gray-400 italic text-center py-12"
        >
          Drag fields here to build your form
        </Text>
      )}

      {fields.map((field) => (
        <Flex
          key={field.key}
          p={4}
          mb={4}
          className="border rounded-lg cursor-pointer hover:shadow-md hover:bg-gray-50 transition duration-200 justify-between items-center"
          onClick={() => { console.log(field,field);setEditingField({ ...field })}}
          title="Click to edit field"
        >
          <Box>
            <Text className="text-gray-900 text-lg font-semibold" as="span">
              {field.label}
            </Text>{' '}
            <Text className="text-gray-500 text-sm" as="span">
              ({field.id})
            </Text>
            {field.required && (
              <Text className="text-red-500 ml-2 font-semibold" as="span">
                *
              </Text>
            )}
          </Box>
          <Box className="text-gray-400 text-xl">
            <FiEdit />
          </Box>
        </Flex>
      ))}

      {editingField && (
  <div className="fixed top-16 right-16 w-full max-w-md bg-white border rounded-xl shadow-2xl p-6 z-50">
    <h1 className="text-xl font-bold  border-b pb-2 mb-4">
      Edit Field
    </h1>

    <div className="space-y-4">
      {/* Label Input */}
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

      {/* Type Select */}
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

      {/* Required Checkbox */}
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

    {/* Action Buttons */}
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

    </Box>
  );
};

export default FormCanvas;
