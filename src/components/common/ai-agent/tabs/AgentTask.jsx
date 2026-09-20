// components/common/ai-agent/tabs/AgentTask.jsx
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPlus,
  FiSave,
  FiTrash2,
  FiEdit2,
  FiX,
  FiCalendar,
  FiClock,
  FiUsers,
  FiSettings,
  FiChevronRight,
  FiChevronLeft,
  FiCheck,
  FiCopy,
  FiType,
  FiMail,
  FiPhone,
  FiFileText,
  FiList,
  FiRadio,
  FiCheckSquare,
  FiCalendar as FiDateIcon,
  FiSearch,
  FiAlertCircle
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { addOrUpdateAgentTaskApi, getAgentTaskListApi, removeAgentTaskApi } from '../../../../api/agent/agentTaskApi';
import { useSelector } from 'react-redux';

// Predefined fields that every task has by default
const PREDEFINED_FIELDS = [
  {
    id: 'predefined_name',
    type: 'text',
    label: 'Full Name',
    isRequired: true,
    isPredefined: true
  },
  {
    id: 'predefined_email',
    type: 'email',
    label: 'Email Address',
    isRequired: true,
    isPredefined: true
  },
];

// Debounce hook for smooth search
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// 1. Field Type Selection Modal
const FieldTypeModal = ({ isOpen, onClose, onSelectType }) => {
  const fieldTypes = [
    { type: 'text', label: 'Text Input', icon: FiType, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { type: 'email', label: 'Email', icon: FiMail, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { type: 'phone', label: 'Phone', icon: FiPhone, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { type: 'textarea', label: 'Text Area', icon: FiFileText, color: 'text-violet-400', bg: 'bg-violet-500/10' },
    { type: 'dropdown', label: 'Dropdown', icon: FiList, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { type: 'radio', label: 'Radio Button', icon: FiRadio, color: 'text-rose-400', bg: 'bg-rose-500/10' },
    { type: 'checkbox', label: 'Checkbox', icon: FiCheckSquare, color: 'text-teal-400', bg: 'bg-teal-500/10' },
    { type: 'date', label: 'Date Picker', icon: FiDateIcon, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  ];

  if (!isOpen) return null;
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-black/80 backdrop-blur-md flex min-h-full items-center justify-center p-3 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#0F172A] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl backdrop-blur-2xl flex flex-col max-h-[calc(100dvh-2rem)] sm:max-h-[85vh] my-auto overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/[0.08] shrink-0 bg-[#0F172A]">
          <h3 className="text-sm sm:text-base font-bold text-[#F8FAFC]">Select Field Type</h3>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-white/10 text-[#94A3B8] hover:text-white transition-colors cursor-pointer">
            <FiX size={18} />
          </button>
        </div>

        <div className="p-4 grid grid-cols-2 gap-2.5 overflow-y-auto flex-1 min-h-0 custom-scrollbar">
          {fieldTypes.map((fieldType) => {
            const Icon = fieldType.icon;
            return (
              <button
                key={fieldType.type}
                onClick={() => {
                  onSelectType(fieldType.type);
                  onClose();
                }}
                className="flex items-center gap-3 p-3 bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-cyan-500/40 rounded-xl transition-all group text-left cursor-pointer"
              >
                <div className={`p-2 rounded-xl ${fieldType.bg} ${fieldType.color} shrink-0`}>
                  <Icon size={16} />
                </div>
                <span className="text-xs font-semibold text-[#CBD5E1] group-hover:text-white transition-colors">{fieldType.label}</span>
              </button>
            );
          })}
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

// 2. Add / Edit Field Config Modal
const FieldConfigModal = ({ isOpen, onClose, field, onSave, isEditing = false }) => {
  const [label, setLabel] = useState(field?.label || '');
  const [isRequired, setIsRequired] = useState(field?.isRequired || false);
  const [options, setOptions] = useState(field?.options?.length ? field.options : ['']);
  const [fieldType, setFieldType] = useState(field?.type || 'text');

  useEffect(() => {
    setFieldType(field?.type || 'text');
    setLabel(field?.label || '');
    setOptions(field?.options?.length ? field.options : ['']);
  }, [isOpen, field]);

  const handleAddOption = () => {
    setOptions([...options, '']);
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleRemoveOption = (index) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!label.trim()) {
      toast.error('Please enter a field label');
      return;
    }

    const newField = {
      id: field?.id || Date.now().toString(),
      type: fieldType,
      label: label.trim(),
      isRequired: isRequired,
    };

    if (['dropdown', 'radio', 'checkbox'].includes(fieldType)) {
      const validOptions = options.filter(opt => opt.trim());
      if (validOptions.length === 0) {
        toast.error('Please add at least one option');
        return;
      }
      newField.options = validOptions;
    }

    onSave(newField);
    onClose();
  };

  if (!isOpen) return null;

  const getFieldTypeLabel = () => {
    const types = {
      text: 'Text Input', email: 'Email', phone: 'Phone', textarea: 'Text Area',
      dropdown: 'Dropdown', radio: 'Radio Button', checkbox: 'Checkbox', date: 'Date Picker'
    };
    return types[fieldType] || 'Field';
  };

  if (!isOpen) return null;
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-black/80 backdrop-blur-md flex min-h-full items-center justify-center p-3 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#0F172A] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl backdrop-blur-2xl flex flex-col max-h-[calc(100dvh-2rem)] sm:max-h-[85vh] my-auto overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/[0.08] shrink-0 bg-[#0F172A]">
          <h3 className="text-sm sm:text-base font-bold text-[#F8FAFC]">
            {isEditing ? 'Edit Field' : `Add ${getFieldTypeLabel()}`}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-white/10 text-[#94A3B8] hover:text-white transition-colors cursor-pointer">
            <FiX size={18} />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 min-h-0 custom-scrollbar">
          <div>
            <label className="block text-xs font-semibold text-[#CBD5E1] mb-1.5">
              Field Label <span className="text-cyan-400">*</span>
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder={`e.g. ${getFieldTypeLabel()} Label`}
              className="w-full bg-[#131D31] border border-white/10 hover:border-white/20 focus:border-cyan-500 text-xs sm:text-sm text-[#F8FAFC] placeholder-[#64748B] rounded-xl px-3.5 py-2.5 transition-all focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
            />
          </div>

          {['dropdown', 'radio', 'checkbox'].includes(fieldType) && (
            <div>
              <label className="block text-xs font-semibold text-[#CBD5E1] mb-2">Options</label>
              <div className="space-y-2">
                {options.map((option, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                      placeholder={`Option ${idx + 1}`}
                      className="flex-1 bg-[#131D31] border border-white/10 hover:border-white/20 focus:border-cyan-500 text-xs text-[#F8FAFC] placeholder-[#64748B] rounded-xl px-3 py-2 transition-all focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                    />
                    {options.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(idx)}
                        className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                      >
                        <FiTrash2 size={15} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 mt-2 cursor-pointer"
                >
                  <FiPlus size={13} /> Add Another Option
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between p-3.5 bg-white/[0.03] border border-white/10 rounded-xl">
            <div>
              <p className="text-xs font-semibold text-[#CBD5E1]">Required field</p>
              <p className="text-[10px] text-[#64748B]">User must fill this before submission</p>
            </div>
            <button
              type="button"
              onClick={() => setIsRequired(!isRequired)}
              className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors cursor-pointer ${
                isRequired ? 'bg-cyan-500' : 'bg-white/20'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isRequired ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-4 sm:p-5 border-t border-white/[0.08] shrink-0 bg-[#0F172A] mt-auto">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-[#CBD5E1] bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-[#080C14] shadow-[0_0_12px_rgba(6,182,212,0.25)] transition-all cursor-pointer"
          >
            {isEditing ? 'Update Field' : 'Add Field'}
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

// 3. Multi-Step Task Form Modal
const TaskFormModal = ({ isOpen, onClose, onSave, editingTask }) => {
  const { details } = useSelector((state) => state?.ai_agent);
  const [step, setStep] = useState(1);
  const [showFieldTypeModal, setShowFieldTypeModal] = useState(false);
  const [showFieldConfigModal, setShowFieldConfigModal] = useState(false);
  const [selectedFieldType, setSelectedFieldType] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [saving, setSaving] = useState(false);
  const [taskData, setTaskData] = useState({
    _id: '',
    name: '',
    description: '',
    type: 'normal',
    formFields: [...PREDEFINED_FIELDS],
    bookingConfig: {
      availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      startTime: '09:00',
      endTime: '17:00',
      slotDuration: 30,
      bufferTime: 0,
      maxAdvanceDays: 30,
      maxPeoplePerSlot: 1,
    }
  });

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setTaskData({
        _id: editingTask?._id || '',
        name: editingTask?.name || '',
        description: editingTask?.description || '',
        type: editingTask?.type || 'normal',
        formFields: editingTask?.formFields?.length ? editingTask.formFields : [...PREDEFINED_FIELDS],
        bookingConfig: editingTask?.bookingConfig || {
          availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
          startTime: '09:00',
          endTime: '17:00',
          slotDuration: 30,
          bufferTime: 0,
          maxAdvanceDays: 30,
          maxPeoplePerSlot: 1,
        }
      });
    }
  }, [isOpen, editingTask]);

  if (!isOpen) return null;
  if (typeof document === 'undefined') return null;

  const daysOfWeek = [
    { value: 'monday', label: 'Mon' },
    { value: 'tuesday', label: 'Tue' },
    { value: 'wednesday', label: 'Wed' },
    { value: 'thursday', label: 'Thu' },
    { value: 'friday', label: 'Fri' },
    { value: 'saturday', label: 'Sat' },
    { value: 'sunday', label: 'Sun' },
  ];

  const slotDurations = [15, 30, 45, 60, 90, 120];
  const bufferTimes = [0, 5, 10, 15, 30];

  const handleAddField = (field) => {
    setTaskData((prev) => ({
      ...prev,
      formFields: [...prev.formFields, field]
    }));
  };

  const handleUpdateField = (updatedField) => {
    setTaskData((prev) => ({
      ...prev,
      formFields: prev.formFields.map((f) => (f.id === updatedField.id ? updatedField : f))
    }));
  };

  const handleDeleteField = (fieldId) => {
    const isPredefined = PREDEFINED_FIELDS.some((f) => f.id === fieldId && f.isPredefined);
    if (isPredefined) {
      toast.error('Cannot delete predefined fields');
      return;
    }
    setTaskData((prev) => ({
      ...prev,
      formFields: prev.formFields.filter((f) => f.id !== fieldId)
    }));
  };

  const handleSave = async () => {
    if (!taskData.name.trim()) {
      toast.error('Please enter a task name');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        agentId: details?._id,
        ...taskData,
        bookingConfig: taskData.type === 'booking' ? taskData.bookingConfig : {}
      };
      const result = await addOrUpdateAgentTaskApi(payload);
      if (result?.data?.success) {
        onSave(result?.data?.data || taskData, !!editingTask);
      }
      toast.success(editingTask ? 'Task updated successfully' : 'Task created successfully');
      onClose();
    } catch (error) {
      console.error('Error saving task:', error);
      toast.error(editingTask ? 'Failed to update task' : 'Failed to create task');
    } finally {
      setSaving(false);
    }
  };

  const getFieldIcon = (type) => {
    const icons = {
      text: FiType, email: FiMail, phone: FiPhone, textarea: FiFileText,
      dropdown: FiList, radio: FiRadio, checkbox: FiCheckSquare, date: FiDateIcon
    };
    const Icon = icons[type] || FiType;
    return <Icon size={14} />;
  };

  const steps = [
    { number: 1, title: 'Basic Info', icon: FiSettings },
    { number: 2, title: 'Form Fields', icon: FiCopy },
    ...(taskData.type === 'booking' ? [{ number: 3, title: 'Booking Config', icon: FiCalendar }] : []),
    { number: taskData.type === 'booking' ? 4 : 3, title: 'Review', icon: FiCheck },
  ];

  const totalSteps = steps.length;

  const handleNext = () => {
    if (step === 1 && !taskData.name.trim()) {
      toast.error('Please enter a task name');
      return;
    }
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleSave();
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex min-h-full items-center justify-center p-3 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-[#0F172A] border border-white/10 rounded-2xl w-full max-w-xl shadow-2xl backdrop-blur-2xl flex flex-col max-h-[calc(100dvh-2rem)] sm:max-h-[85vh] my-auto overflow-hidden"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/[0.08] shrink-0 bg-[#0F172A] z-10">
          <div>
            <h3 className="text-base font-bold text-[#F8FAFC]">
              {editingTask ? 'Edit Agent Task' : 'Create New Agent Task'}
            </h3>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Step {step} of {totalSteps}: {steps[step - 1]?.title}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-white/10 text-[#94A3B8] hover:text-white transition-colors cursor-pointer">
            <FiX size={18} />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center px-4 sm:px-5 py-2.5 bg-white/[0.02] border-b border-white/[0.06] overflow-x-auto no-scrollbar gap-2 shrink-0 z-10">
          {steps.map((s, idx) => (
            <div key={idx} className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setStep(idx + 1)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  step === idx + 1
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : step > idx + 1
                    ? 'bg-white/[0.04] text-emerald-400 border border-emerald-500/20'
                    : 'text-[#64748B] hover:text-[#CBD5E1]'
                }`}
              >
                <span>{s.number}.</span>
                <span>{s.title}</span>
              </button>
              {idx < steps.length - 1 && <span className="text-white/20 text-xs">/</span>}
            </div>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 min-h-0 custom-scrollbar space-y-4">
          {/* STEP 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#CBD5E1] mb-1.5">
                  Task Name <span className="text-cyan-400">*</span>
                </label>
                <input
                  type="text"
                  value={taskData.name}
                  onChange={(e) => setTaskData({ ...taskData, name: e.target.value })}
                  placeholder="e.g. Schedule Consultation, Inbound Demo Request"
                  className="w-full bg-[#131D31] border border-white/10 hover:border-white/20 focus:border-cyan-500 text-xs sm:text-sm text-[#F8FAFC] placeholder-[#64748B] rounded-xl px-3.5 py-2.5 transition-all focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#CBD5E1] mb-1.5">
                  Task Description
                </label>
                <textarea
                  value={taskData.description}
                  onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
                  placeholder="Briefly describe the purpose of this task..."
                  rows={3}
                  className="w-full bg-[#131D31] border border-white/10 hover:border-white/20 focus:border-cyan-500 text-xs sm:text-sm text-[#F8FAFC] placeholder-[#64748B] rounded-xl p-3.5 transition-all focus:outline-none focus:ring-1 focus:ring-cyan-500/50 resize-none custom-scrollbar"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#CBD5E1] mb-2">Task Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTaskData({ ...taskData, type: 'normal' })}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      taskData.type === 'normal'
                        ? 'bg-cyan-500/15 border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                        : 'bg-white/[0.03] border-white/10 hover:border-white/20'
                    }`}
                  >
                    <p className="text-xs font-bold text-[#F8FAFC]">Normal Form</p>
                    <p className="text-[11px] text-[#94A3B8] mt-0.5">Collect structured customer details & inquiries</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTaskData({ ...taskData, type: 'booking' })}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      taskData.type === 'booking'
                        ? 'bg-cyan-500/15 border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                        : 'bg-white/[0.03] border-white/10 hover:border-white/20'
                    }`}
                  >
                    <p className="text-xs font-bold text-[#F8FAFC]">Booking / Scheduling</p>
                    <p className="text-[11px] text-[#94A3B8] mt-0.5">Automate appointment slots and availability</p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Form Fields */}
          {step === 2 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#CBD5E1] uppercase tracking-wider">Configured Fields</h4>
                  <p className="text-[11px] text-[#94A3B8]">Fields required during conversational collection</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowFieldTypeModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-[#080C14] shadow-[0_0_10px_rgba(6,182,212,0.2)] active:scale-95 transition-all cursor-pointer"
                >
                  <FiPlus size={14} /> Add Field
                </button>
              </div>

              <div className="space-y-2">
                {taskData.formFields.map((field) => {
                  const isPredefined = field.isPredefined;
                  return (
                    <div
                      key={field.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 shrink-0">
                          {getFieldIcon(field.type)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-[#F8FAFC] truncate">{field.label}</span>
                            {field.isRequired && <span className="text-rose-400 text-xs">*</span>}
                            {isPredefined && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-[#64748B] capitalize">
                            {field.type} {field.options ? `(${field.options.length} options)` : ''}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingField(field);
                            setShowFieldConfigModal(true);
                          }}
                          className="p-1.5 rounded-lg text-[#94A3B8] hover:text-cyan-300 hover:bg-white/10 transition-colors cursor-pointer"
                        >
                          <FiEdit2 size={13} />
                        </button>
                        {!isPredefined && (
                          <button
                            type="button"
                            onClick={() => handleDeleteField(field.id)}
                            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          >
                            <FiTrash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: Booking Config (only if booking) */}
          {taskData.type === 'booking' && step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#CBD5E1] mb-2">Available Booking Days</label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                  {daysOfWeek.map((day) => {
                    const isSelected = taskData.bookingConfig.availableDays.includes(day.value);
                    return (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => {
                          const newDays = isSelected
                            ? taskData.bookingConfig.availableDays.filter((d) => d !== day.value)
                            : [...taskData.bookingConfig.availableDays, day.value];
                          setTaskData({
                            ...taskData,
                            bookingConfig: { ...taskData.bookingConfig, availableDays: newDays }
                          });
                        }}
                        className={`py-2 text-center rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                            : 'bg-white/[0.03] text-[#64748B] border-white/10 hover:border-white/20'
                        }`}
                      >
                        {day.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#CBD5E1] mb-1.5">Start Time</label>
                  <input
                    type="time"
                    value={taskData.bookingConfig.startTime}
                    onChange={(e) =>
                      setTaskData({
                        ...taskData,
                        bookingConfig: { ...taskData.bookingConfig, startTime: e.target.value }
                      })
                    }
                    className="w-full bg-[#131D31] border border-white/10 text-xs text-[#F8FAFC] rounded-xl px-3 py-2 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#CBD5E1] mb-1.5">End Time</label>
                  <input
                    type="time"
                    value={taskData.bookingConfig.endTime}
                    onChange={(e) =>
                      setTaskData({
                        ...taskData,
                        bookingConfig: { ...taskData.bookingConfig, endTime: e.target.value }
                      })
                    }
                    className="w-full bg-[#131D31] border border-white/10 text-xs text-[#F8FAFC] rounded-xl px-3 py-2 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#CBD5E1] mb-1.5">Slot Duration</label>
                  <select
                    value={taskData.bookingConfig.slotDuration}
                    onChange={(e) =>
                      setTaskData({
                        ...taskData,
                        bookingConfig: { ...taskData.bookingConfig, slotDuration: parseInt(e.target.value) }
                      })
                    }
                    className="w-full bg-[#131D31] border border-white/10 text-xs text-[#F8FAFC] rounded-xl px-3 py-2 focus:border-cyan-500 focus:outline-none"
                  >
                    {slotDurations.map((dur) => (
                      <option key={dur} value={dur} className="bg-[#131D31]">
                        {dur} mins
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#CBD5E1] mb-1.5">Buffer Between Slots</label>
                  <select
                    value={taskData.bookingConfig.bufferTime}
                    onChange={(e) =>
                      setTaskData({
                        ...taskData,
                        bookingConfig: { ...taskData.bookingConfig, bufferTime: parseInt(e.target.value) }
                      })
                    }
                    className="w-full bg-[#131D31] border border-white/10 text-xs text-[#F8FAFC] rounded-xl px-3 py-2 focus:border-cyan-500 focus:outline-none"
                  >
                    {bufferTimes.map((time) => (
                      <option key={time} value={time} className="bg-[#131D31]">
                        {time === 0 ? 'None' : `${time} mins`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#CBD5E1] mb-1.5">Max Advance Days</label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={taskData.bookingConfig.maxAdvanceDays ?? 30}
                    onChange={(e) =>
                      setTaskData({
                        ...taskData,
                        bookingConfig: { ...taskData.bookingConfig, maxAdvanceDays: parseInt(e.target.value) || 30 }
                      })
                    }
                    className="w-full bg-[#131D31] border border-white/10 text-xs text-[#F8FAFC] rounded-xl px-3 py-2 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#CBD5E1] mb-1.5">Max Guests / Slot</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={taskData.bookingConfig.maxPeoplePerSlot ?? 1}
                    onChange={(e) =>
                      setTaskData({
                        ...taskData,
                        bookingConfig: { ...taskData.bookingConfig, maxPeoplePerSlot: parseInt(e.target.value) || 1 }
                      })
                    }
                    className="w-full bg-[#131D31] border border-white/10 text-xs text-[#F8FAFC] rounded-xl px-3 py-2 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* FINAL STEP: Review */}
          {((taskData.type === 'normal' && step === 3) || (taskData.type === 'booking' && step === 4)) && (
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
                <span className="text-[#94A3B8]">Task Name</span>
                <span className="font-bold text-[#F8FAFC]">{taskData.name}</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
                <span className="text-[#94A3B8]">Type</span>
                <span className="font-semibold text-cyan-400 capitalize">{taskData.type}</span>
              </div>
              <div className="border-b border-white/[0.08] pb-2">
                <span className="text-[#94A3B8] block mb-1">Form Fields ({taskData.formFields.length})</span>
                <div className="flex flex-wrap gap-1.5">
                  {taskData.formFields.map((f) => (
                    <span key={f.id} className="px-2 py-0.5 rounded-lg bg-white/[0.06] text-[#CBD5E1] text-[11px]">
                      {f.label} {f.isRequired && '*'}
                    </span>
                  ))}
                </div>
              </div>
              {taskData.type === 'booking' && (
                <div className="pt-1">
                  <span className="text-[#94A3B8] block mb-1">Booking Window</span>
                  <p className="text-[#CBD5E1] text-[11px]">
                    {taskData.bookingConfig.startTime} - {taskData.bookingConfig.endTime} • {taskData.bookingConfig.slotDuration} min slots
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-t border-white/[0.08] shrink-0 bg-[#0F172A] mt-auto z-10">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-semibold text-[#CBD5E1] bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 transition-all cursor-pointer"
            >
              <FiChevronLeft size={14} /> Back
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={handleNext}
            disabled={saving}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-[#080C14] shadow-[0_0_14px_rgba(6,182,212,0.25)] transition-all cursor-pointer disabled:opacity-50"
          >
            {step === totalSteps ? (
              saving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-[#080C14] border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <FiSave size={14} />
                  <span>{editingTask ? 'Update Task' : 'Create Task'}</span>
                </>
              )
            ) : (
              <>
                <span>Next</span>
                <FiChevronRight size={14} />
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* Nested Field Type Selection Modal */}
      <FieldTypeModal
        isOpen={showFieldTypeModal}
        onClose={() => setShowFieldTypeModal(false)}
        onSelectType={(type) => {
          setSelectedFieldType(type);
          setShowFieldConfigModal(true);
        }}
      />

      {/* Nested Field Config Modal */}
      <FieldConfigModal
        isOpen={showFieldConfigModal}
        onClose={() => {
          setShowFieldConfigModal(false);
          setSelectedFieldType(null);
          setEditingField(null);
        }}
        field={editingField || { type: selectedFieldType }}
        onSave={(field) => {
          if (editingField) {
            handleUpdateField(field);
          } else {
            handleAddField(field);
          }
          setShowFieldConfigModal(false);
          setSelectedFieldType(null);
          setEditingField(null);
        }}
        isEditing={!!editingField}
      />
    </div>,
    document.body
  );
};

// 4. Main AgentTask Component
export default function AgentTask() {
  const { details } = useSelector((state) => state?.ai_agent);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [page, setPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const pageSize = 8;

  const debouncedSearch = useDebounce(searchQuery, 400);

  const fetchTasks = async () => {
    if (!details?._id) return;
    setLoading(true);
    try {
      const response = await getAgentTaskListApi({
        agentId: details?._id,
        page,
        limit: pageSize,
        search: debouncedSearch
      });
      setTasks(response?.data?.data || []);
      setTotalRecords(response?.data?.pagination?.total || 0);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [page, debouncedSearch, details?._id]);

  const handleSaveTask = (savedTask, isEditing) => {
    fetchTasks();
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await removeAgentTaskApi(taskId);
        setTasks((prev) => prev.filter((t) => t._id !== taskId));
        setTotalRecords((prev) => Math.max(0, prev - 1));
        toast.success('Task deleted successfully');
      } catch (error) {
        console.error('Failed to delete task:', error);
        toast.error('Failed to delete task');
      }
    }
  };

  const getFieldIcon = (type) => {
    const icons = {
      text: FiType, email: FiMail, phone: FiPhone, textarea: FiFileText,
      dropdown: FiList, radio: FiRadio, checkbox: FiCheckSquare, date: FiDateIcon
    };
    const Icon = icons[type] || FiType;
    return <Icon size={11} />;
  };

  const totalPages = Math.ceil(totalRecords / pageSize);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Top Header & CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-[#F8FAFC]">Agent Tasks & Forms</h3>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            {totalRecords > 0 ? `${totalRecords} task${totalRecords > 1 ? 's' : ''} configured` : 'Configure structured forms and appointment booking tasks'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingTask(null);
            setShowCreateModal(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-[#080C14] shadow-[0_0_14px_rgba(6,182,212,0.25)] active:scale-95 transition-all cursor-pointer shrink-0"
        >
          <FiPlus size={16} />
          <span>Create Task</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative flex items-center">
        <span className="absolute left-3.5 text-[#64748B] pointer-events-none">
          <FiSearch size={16} />
        </span>
        <input
          type="text"
          placeholder="Search tasks by name or description..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(1);
          }}
          className="w-full bg-[#131D31] border border-white/10 hover:border-white/20 focus:border-cyan-500 text-xs sm:text-sm text-[#F8FAFC] placeholder-[#64748B] rounded-xl pl-10 pr-10 py-2.5 transition-all focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setPage(1);
            }}
            className="absolute right-3 text-[#64748B] hover:text-white transition-colors cursor-pointer"
          >
            <FiX size={16} />
          </button>
        )}
      </div>

      {/* Tasks Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-16 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
          <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center mx-auto mb-3 text-[#64748B]">
            <FiCalendar size={26} />
          </div>
          <p className="text-sm font-semibold text-[#CBD5E1]">
            {searchQuery ? 'No matching tasks found' : 'No tasks created yet'}
          </p>
          <p className="text-xs text-[#64748B] mt-1 max-w-sm mx-auto">
            {searchQuery
              ? 'Try adjusting your search terms'
              : 'Create your first task to collect structured data or schedule appointments directly from chat.'}
          </p>
          {!searchQuery && (
            <button
              type="button"
              onClick={() => {
                setEditingTask(null);
                setShowCreateModal(true);
              }}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 text-[#080C14] cursor-pointer"
            >
              <FiPlus size={14} /> Create Task Now
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tasks.map((task) => (
              <motion.div
                key={task._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 sm:p-5 rounded-2xl bg-[#0F172A]/70 border border-white/10 hover:border-white/20 backdrop-blur-xl transition-all duration-200 flex flex-col justify-between group shadow-lg"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shrink-0">
                        {task.type === 'booking' ? <FiCalendar size={18} /> : <FiCopy size={18} />}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-[#F8FAFC] truncate">{task.name}</h4>
                        <span className="inline-block mt-0.5 text-[10px] uppercase font-bold tracking-wider text-cyan-400">
                          {task.type} Task
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingTask(task);
                          setShowCreateModal(true);
                        }}
                        className="p-1.5 rounded-xl text-[#94A3B8] hover:text-cyan-300 hover:bg-white/10 transition-colors cursor-pointer"
                        title="Edit Task"
                      >
                        <FiEdit2 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteTask(task._id)}
                        className="p-1.5 rounded-xl text-[#94A3B8] hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Delete Task"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {task.description && (
                    <p className="text-xs text-[#94A3B8] line-clamp-2 leading-relaxed mb-3">
                      {task.description}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-white/[0.06] space-y-2">
                  <div className="flex flex-wrap gap-1.5">
                    {(task.formFields || []).slice(0, 4).map((field, idx) => (
                      <span
                        key={field.id || idx}
                        className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 bg-white/[0.04] text-[#CBD5E1] rounded-lg border border-white/5"
                      >
                        {getFieldIcon(field.type)}
                        <span>{field.label}</span>
                        {field.isRequired && <span className="text-rose-400 text-[9px]">*</span>}
                      </span>
                    ))}
                    {(task.formFields || []).length > 4 && (
                      <span className="text-[10px] text-[#64748B] self-center">
                        +{task.formFields.length - 4} more
                      </span>
                    )}
                  </div>

                  {task.type === 'booking' && task.bookingConfig && (
                    <div className="flex items-center gap-3 text-[11px] text-[#64748B] pt-1">
                      <span className="flex items-center gap-1 text-cyan-400/80">
                        <FiClock size={11} />
                        {task.bookingConfig.slotDuration} min slots
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <FiUsers size={11} />
                        Max {task.bookingConfig.maxPeoplePerSlot || 1}/slot
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#CBD5E1] bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              >
                <FiChevronLeft size={14} /> Previous
              </button>

              <span className="text-xs text-[#94A3B8]">
                Page <strong className="text-white">{page}</strong> of <strong className="text-white">{totalPages}</strong>
              </span>

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#CBD5E1] bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              >
                Next <FiChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Task Creation & Edit Modal */}
      <TaskFormModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        editingTask={editingTask}
      />
    </div>
  );
}