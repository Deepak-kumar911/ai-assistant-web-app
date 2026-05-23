// components/common/ai-agent/tabs/AgentTask.tsx (Fixed)
import React, { useActionState, useEffect, useState } from 'react';
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
    FiSearch
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { addOrUpdateAgentTaskApi, getAgentTaskListApi, removeAgentTaskApi } from '../../../../api/agent/agentTaskApi';
import { useSelector } from 'react-redux';


// Predefined fields
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

// Field Type Selection Modal
const FieldTypeModal = ({ isOpen, onClose, onSelectType }) => {
    const fieldTypes = [
        { type: 'text', label: 'Text Input', icon: FiType, color: 'cyan' },
        { type: 'email', label: 'Email', icon: FiMail, color: 'blue' },
        { type: 'phone', label: 'Phone', icon: FiPhone, color: 'green' },
        { type: 'textarea', label: 'Text Area', icon: FiFileText, color: 'purple' },
        { type: 'dropdown', label: 'Dropdown', icon: FiList, color: 'orange' },
        { type: 'radio', label: 'Radio Button', icon: FiRadio, color: 'pink' },
        { type: 'checkbox', label: 'Checkbox', icon: FiCheckSquare, color: 'emerald' },
        { type: 'date', label: 'Date Picker', icon: FiDateIcon, color: 'violet' },
    ];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#0F0F12] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden"
            >
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <h3 className="text-lg font-semibold text-white">Select Field Type</h3>
                    <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10">
                        <FiX size={18} className="text-gray-400" />
                    </button>
                </div>
                <div className="p-4 grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                    {fieldTypes.map((fieldType) => {
                        const Icon = fieldType.icon;
                        return (
                            <button
                                key={fieldType.type}
                                onClick={() => {
                                    onSelectType(fieldType.type);
                                    onClose();
                                }}
                                className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all group"
                            >
                                <div className={`p-2 rounded-lg bg-${fieldType.color}-500/10`}>
                                    <Icon size={18} className={`text-${fieldType.color}-400`} />
                                </div>
                                <span className="text-sm text-white">{fieldType.label}</span>
                            </button>
                        );
                    })}
                </div>
            </motion.div>
        </div>
    );
};

// Add/Edit Field Modal
const FieldConfigModal = ({ isOpen, onClose, field, onSave, isEditing = false }) => {
    const [label, setLabel] = useState(field?.label || '');
    const [isRequired, setIsRequired] = useState(field?.isRequired || false);
    const [options, setOptions] = useState(field?.options?.length ? field.options : ['']);
    const [fieldType, setFieldType] = useState(field?.type || 'text');

    useEffect(() => {
        setFieldType(field?.type || 'text')
        setLabel(field?.label || '')
        setOptions(field?.options?.length ? field.options : [''])
    }, [isOpen])

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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#0F0F12] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden"
            >
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <h3 className="text-lg font-semibold text-white">
                        {isEditing ? 'Edit Field' : `Add ${getFieldTypeLabel()}`}
                    </h3>
                    <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10">
                        <FiX size={18} className="text-gray-400" />
                    </button>
                </div>

                <div className="p-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Field Label</label>
                        <input
                            type="text"
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            placeholder={`e.g., ${getFieldTypeLabel()} Label`}
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                        />
                    </div>

                    {['dropdown', 'radio', 'checkbox'].includes(fieldType) && (
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Options</label>
                            <div className="space-y-2">
                                {options.map((option, idx) => (
                                    <div key={idx} className="flex gap-2">
                                        <input
                                            type="text"
                                            value={option}
                                            onChange={(e) => handleOptionChange(idx, e.target.value)}
                                            placeholder={`Option ${idx + 1}`}
                                            className="flex-1 bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                                        />
                                        {options.length > 1 && (
                                            <button
                                                onClick={() => handleRemoveOption(idx)}
                                                className="p-2 rounded-lg hover:bg-red-500/10 text-red-400"
                                            >
                                                <FiTrash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    onClick={handleAddOption}
                                    className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1 mt-2"
                                >
                                    <FiPlus size={14} /> Add Option
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-sm text-gray-300">Required field</span>
                        <button
                            onClick={() => setIsRequired(!isRequired)}
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${isRequired ? 'bg-cyan-500' : 'bg-white/20'}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isRequired ? 'translate-x-4' : 'translate-x-0.5'}`} />
                        </button>
                    </div>
                </div>

                <div className="flex gap-3 p-4 border-t border-white/10">
                    <button onClick={onClose} className="flex-1 px-4 py-2 bg-white/5 rounded-lg text-gray-300 hover:bg-white/10">
                        Cancel
                    </button>
                    <button onClick={handleSubmit} className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-lg text-white font-medium">
                        {isEditing ? 'Update Field' : 'Add Field'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

// Task Form Modal
const TaskFormModal = ({ isOpen, onClose, onSave, editingTask }) => {
    const { details } = useSelector(state => state?.ai_agent);
    const [step, setStep] = useState(1);
    const [showFieldTypeModal, setShowFieldTypeModal] = useState(false);
    const [showFieldConfigModal, setShowFieldConfigModal] = useState(false);
    const [selectedFieldType, setSelectedFieldType] = useState(null);
    const [editingField, setEditingField] = useState(null);
    const [saving, setSaving] = useState(false);
    const [taskData, setTaskData] = useState({});


    useEffect(() => {
        setTaskData({
            _id: editingTask?._id || '',
            name: editingTask?.name || '',
            description: editingTask?.description || '',
            type: editingTask?.type || 'normal',
            formFields: editingTask?.formFields || [...PREDEFINED_FIELDS],
            bookingConfig: editingTask?.bookingConfig || {
                availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
                startTime: '09:00',
                endTime: '17:00',
                slotDuration: 30,
                bufferTime: 0,
                maxAdvanceDays: 30,
                maxPeoplePerSlot: 1,
            }
        })
    }, [isOpen])

    const daysOfWeek = [
        { value: 'monday', label: 'Monday' },
        { value: 'tuesday', label: 'Tuesday' },
        { value: 'wednesday', label: 'Wednesday' },
        { value: 'thursday', label: 'Thursday' },
        { value: 'friday', label: 'Friday' },
        { value: 'saturday', label: 'Saturday' },
        { value: 'sunday', label: 'Sunday' },
    ];

    const slotDurations = [15, 30, 45, 60, 90, 120];
    const bufferTimes = [0, 5, 10, 15, 30];

    const handleAddField = (field) => {
        setTaskData({
            ...taskData,
            formFields: [...taskData.formFields, field]
        });
        // toast.success('Field added successfully');
    };

    const handleUpdateField = (updatedField) => {
        setTaskData({
            ...taskData,
            formFields: taskData.formFields.map(f =>
                f.id === updatedField.id ? updatedField : f
            )
        });
        // toast.success('Field updated successfully');
    };

    const handleDeleteField = (fieldId) => {
        // Check if it's a predefined field
        const isPredefined = PREDEFINED_FIELDS.some(f => f.id === fieldId && f.isPredefined);
        if (isPredefined) {
            toast.error('Cannot delete predefined fields');
            return;
        }
        
        setTaskData({
            ...taskData,
            formFields: taskData.formFields.filter(f => f.id !== fieldId)
        });
        // toast.success('Field removed');
    };

    const handleSave = async () => {
        if (!taskData.name.trim()) {
            toast.error('Please enter a task name');
            return;
        }

        try {
            setSaving(true);
            const result = await addOrUpdateAgentTaskApi({agentId:details?._id,...taskData,bookingConfig:taskData?.type === 'booking' ? taskData.bookingConfig : {}}); // Replace with update API when available
            if (result.data?.success) {
                onSave(result?.data?.data, !!editingTask);
            }
            toast.success(editingTask ? 'Task updated successfully' : 'Task created successfully');
            onClose();
        } catch (error) {
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

    const renderStep1 = () => (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Task Name *</label>
                <input
                    type="text"
                    value={taskData.name}
                    onChange={(e) => setTaskData({ ...taskData, name: e.target.value })}
                    placeholder="e.g., Schedule Consultation, Contact Form"
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <textarea
                    value={taskData.description}
                    onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
                    placeholder="Describe what this task does..."
                    rows={3}
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 resize-none"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Task Type</label>
                <div className="flex gap-3">
                    <button
                        onClick={() => setTaskData({ ...taskData, type: 'normal' })}
                        className={`flex-1 p-3 rounded-xl border transition-all ${taskData.type === 'normal' ? 'bg-cyan-500/10 border-cyan-500/50' : 'bg-white/5 border-white/10'}`} >
                        <p className="font-medium text-white">Normal</p>
                        <p className="text-xs text-gray-400 mt-1">Simple form submission</p>
                    </button>
                    <button
                        onClick={() => setTaskData({ ...taskData, type: 'booking' })}
                        className={`flex-1 p-3 rounded-xl border transition-all ${taskData.type === 'booking' ? 'bg-cyan-500/10 border-cyan-500/50' : 'bg-white/5 border-white/10'}`}
                    >
                        <p className="font-medium text-white">Booking</p>
                        <p className="text-xs text-gray-400 mt-1">Appointment scheduling</p>
                    </button>
                </div>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-4">
            <div>
                <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-gray-300">Form Fields</label>
                    <button
                        onClick={() => setShowFieldTypeModal(true)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-cyan-500/20 text-cyan-400 rounded-lg text-sm hover:bg-cyan-500/30"
                    >
                        <FiPlus size={14} /> Add Field
                    </button>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
                    {taskData.formFields.map((field) => {
                        const isPredefined = field.isPredefined;
                        return (
                            <motion.div
                                key={field.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="p-3 bg-white/5 rounded-lg border border-white/10 group"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 flex-1">
                                        <div className="p-1.5 rounded-lg bg-cyan-500/10">
                                            {getFieldIcon(field.type)}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-medium text-white">{field.label}</p>
                                                {field.isRequired && (
                                                    <span className="text-xs text-red-400">*</span>
                                                )}
                                                {isPredefined && (
                                                    <span className="text-xs px-1.5 py-0.5 bg-cyan-500/20 text-cyan-400 rounded">Predefined</span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                {field.type.charAt(0).toUpperCase() + field.type.slice(1)}
                                                {field.options && ` • ${field.options.length} options`}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => {
                                                setEditingField(field);
                                                setShowFieldConfigModal(true);
                                            }}
                                            className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-cyan-400"
                                        >
                                            <FiEdit2 size={14} />
                                        </button>
                                        {!isPredefined && (
                                            <button
                                                onClick={() => handleDeleteField(field.id)}
                                                className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-red-400"
                                            >
                                                <FiTrash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Available Days</label>
                <div className="grid grid-cols-2 gap-2">
                    {daysOfWeek.map((day) => (
                        <label key={day.value} className="flex items-center gap-2 p-2 bg-white/5 rounded-lg cursor-pointer">
                            <input
                                type="checkbox"
                                checked={taskData.bookingConfig.availableDays.includes(day.value)}
                                onChange={(e) => {
                                    const newDays = e.target.checked
                                        ? [...taskData.bookingConfig.availableDays, day.value]
                                        : taskData.bookingConfig.availableDays.filter(d => d !== day.value);
                                    setTaskData({
                                        ...taskData,
                                        bookingConfig: { ...taskData.bookingConfig, availableDays: newDays }
                                    });
                                }}
                                className="rounded border-white/20 bg-black/20 text-cyan-500 focus:ring-cyan-500"
                            />
                            <span className="text-sm text-gray-300">{day.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Start Time</label>
                    <input
                        type="time"
                        value={taskData.bookingConfig.startTime}
                        onChange={(e) => setTaskData({
                            ...taskData,
                            bookingConfig: { ...taskData.bookingConfig, startTime: e.target.value }
                        })}
                        className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500/50"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">End Time</label>
                    <input
                        type="time"
                        value={taskData.bookingConfig.endTime}
                        onChange={(e) => setTaskData({
                            ...taskData,
                            bookingConfig: { ...taskData.bookingConfig, endTime: e.target.value }
                        })}
                        className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500/50"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Slot Duration</label>
                    <select
                        value={taskData.bookingConfig.slotDuration}
                        onChange={(e) => setTaskData({
                            ...taskData,
                            bookingConfig: { ...taskData.bookingConfig, slotDuration: parseInt(e.target.value) }
                        })}
                        className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500/50"
                    >
                        {slotDurations.map(dur => (
                            <option key={dur} value={dur}>{dur} min{dur > 1 ? 's' : ''}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Buffer Time</label>
                    <select
                        value={taskData.bookingConfig.bufferTime}
                        onChange={(e) => setTaskData({
                            ...taskData,
                            bookingConfig: { ...taskData.bookingConfig, bufferTime: parseInt(e.target.value) }
                        })}
                        className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500/50"
                    >
                        {bufferTimes.map(time => (
                            <option key={time} value={time}>{time === 0 ? 'None' : `${time} min`}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Max Advance Days</label>
                    <input
                        type="number"
                        min={1}
                        max={365}
                        value={taskData.bookingConfig.maxAdvanceDays}
                        onChange={(e) => setTaskData({
                            ...taskData,
                            bookingConfig: { ...taskData.bookingConfig, maxAdvanceDays: parseInt(e.target.value) }
                        })}
                        className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500/50"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Max People Per Slot</label>
                    <input
                        type="number"
                        min={1}
                        max={50}
                        value={taskData.bookingConfig.maxPeoplePerSlot}
                        onChange={(e) => setTaskData({
                            ...taskData,
                            bookingConfig: { ...taskData.bookingConfig, maxPeoplePerSlot: parseInt(e.target.value) }
                        })}
                        className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500/50"
                    />
                </div>
            </div>
        </div>
    );

    const renderStep4 = () => (
        <div className="space-y-4">
            <div className="p-4 bg-white/5 rounded-xl space-y-3">
                <div>
                    <p className="text-xs text-gray-500">Task Name</p>
                    <p className="text-sm text-white">{taskData.name}</p>
                </div>
                {taskData.description && (
                    <div>
                        <p className="text-xs text-gray-500">Description</p>
                        <p className="text-sm text-gray-300">{taskData.description}</p>
                    </div>
                )}
                <div>
                    <p className="text-xs text-gray-500">Task Type</p>
                    <p className="text-sm text-white capitalize">{taskData.type}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-500">Form Fields</p>
                    <p className="text-sm text-white">{taskData.formFields.length} fields total</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                        {taskData.formFields.map(field => (
                            <span key={field.id} className="text-xs px-2 py-1 bg-white/5 rounded-full">
                                {field.label}
                            </span>
                        ))}
                    </div>
                </div>
                {taskData.type === 'booking' && (
                    <div>
                        <p className="text-xs text-gray-500">Booking Configuration</p>
                        <p className="text-sm text-white">
                            {taskData.bookingConfig.availableDays.length} days • {taskData.bookingConfig.slotDuration} min slots •
                            Max {taskData.bookingConfig.maxPeoplePerSlot} people/slot
                        </p>
                    </div>
                )}
            </div>
        </div>
    );

    const steps = [
        { number: 1, title: 'Basic Info', icon: FiSettings },
        { number: 2, title: 'Form Fields', icon: FiCopy },
        { number: 3, title: taskData.type === 'booking' ? 'Booking Config' : 'Review', icon: FiCalendar },
        { number: 4, title: 'Review', icon: FiCheck },
    ];

    const filteredSteps = taskData.type === 'normal' ? steps.filter(s => s.number !== 3) : steps;
    const totalSteps = taskData.type === 'normal' ? 3 : 4;

    const getStepContent = () => {
        if (step === 1) return renderStep1();
        if (step === 2) return renderStep2();
        if (taskData.type === 'booking' && step === 3) return renderStep3();
        return renderStep4();
    };

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

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-[#0F0F12] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
                >
                    <div className="p-4 border-b border-white/10">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-white">
                                {editingTask ? 'Edit Task' : 'Create New Task'}
                            </h2>
                            <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10">
                                <FiX size={20} className="text-gray-400" />
                            </button>
                        </div>

                        <div className="flex gap-2">
                            {filteredSteps.map((s, idx) => (
                                <div key={s.number} className="flex-1">
                                    <div className={`flex items-center gap-2 ${step >= s.number ? 'text-cyan-400' : 'text-gray-500'}`}>
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${step > s.number ? 'bg-cyan-500 text-white' :
                                                step === s.number ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' :
                                                    'bg-white/10 text-gray-500'
                                            }`}>
                                            {step > s.number ? <FiCheck size={12} /> : s.number}
                                        </div>
                                        <span className="text-xs hidden sm:inline">{s.title}</span>
                                    </div>
                                    {idx < filteredSteps.length - 1 && (
                                        <div className={`h-0.5 mt-2 ${step > s.number ? 'bg-cyan-500' : 'bg-white/10'}`} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                        {getStepContent()}
                    </div>

                    <div className="flex gap-3 p-4 border-t border-white/10">
                        {step > 1 && (
                            <button
                                onClick={() => setStep(step - 1)}
                                className="px-4 py-2 bg-white/5 rounded-lg text-gray-300 hover:bg-white/10 flex items-center gap-2"
                            >
                                <FiChevronLeft size={16} /> Back
                            </button>
                        )}
                        <button
                            onClick={handleNext}
                            disabled={saving}
                            className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-lg text-white font-medium flex items-center justify-center gap-2"
                        >
                            {step === totalSteps ? (editingTask ? `${saving ? 'Updating' : 'Update'} Task` : `${saving ? 'Creating' : 'Create'} Task`) : 'Next'}
                            {step !== totalSteps && <FiChevronRight size={16} />}
                        </button>
                    </div>
                </motion.div>
            </div>

            <FieldTypeModal
                isOpen={showFieldTypeModal}
                onClose={() => setShowFieldTypeModal(false)}
                onSelectType={(type) => {
                    setSelectedFieldType(type);
                    setShowFieldConfigModal(true);
                }}
            />

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
        </>
    );
};

// Main AgentTask Component
// export default function AgentTask() {
//     const { details } = useSelector(state => state?.ai_agent);
//     const [tasks, setTasks] = useState([]);
//     const [showCreateModal, setShowCreateModal] = useState(false);
//     const [editingTask, setEditingTask] = useState(null);
//     const [loading, setLoading] = useState(false);
//     const [page, setPage] = useState(1);
//     const [totalRecords, setTotalRecords] = useState(0);
//     const [searchQuery, setSearchQuery] = useState('');
//     const pageSize = 10;

//     React.useEffect(() => {
//         fetchTasks();
//     }, []);

//     const fetchTasks = async () => {
//         setLoading(true);
//         try {
//             const result = await getAgentTaskListApi({agentId: details?._id, page, limit:pageSize, search:searchQuery}); // Replace with actual API call
//             setTasks((result?.data?.data || [])?.map(task => ({
//                 ...task,
//                 formFields: (task?.formFields || [])?.map(f => ({ ...f, id: f.id || `${f.type}-${Math.random().toString(36).substr(2, 9)}` }))
//             })));
//             setTotalRecords(result?.data?.pagination?.total || 0);
//         } catch (error) {
//             toast.error('Failed to load tasks');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleSaveTask = (newTask, isEditing) => {
//         if (isEditing) {
//             setTasks(tasks.map(t => t._id === newTask._id ? newTask : t));
//         } else {
//             setTasks([newTask, ...tasks]);
//         }
//     };

//     const handleEditTask = (task) => {
//         setEditingTask(task);
//         setShowCreateModal(true);
//     };

//     const handleDeleteTask = async (taskId) => {
//         try {
//             const confirmed = window.confirm('Are you sure you want to delete this task? This action cannot be undone.');
//             if (!confirmed) return;

//             await removeAgentTaskApi(taskId,details?._id); // Replace with actual API call
//             setTasks(tasks.filter(t => t._id !== taskId));
//             toast.success('Task deleted successfully');
//         } catch (error) {
//             toast.error('Failed to delete task');
//         }
//     };

//     const getFieldIcon = (type) => {
//         const icons = {
//             text: FiType, email: FiMail, phone: FiPhone, textarea: FiFileText,
//             dropdown: FiList, radio: FiRadio, checkbox: FiCheckSquare, date: FiDateIcon
//         };
//         const Icon = icons[type] || FiType;
//         return <Icon size={12} />;
//     };

//     return (
//         <div className="p-6 space-y-6">
//             <div className="flex items-center justify-between">
//                 <div>
//                     <h3 className="text-lg font-semibold text-white">Agent Tasks</h3>
//                     <p className="text-sm text-gray-400 mt-0.5">Create and manage forms and booking tasks</p>
//                 </div>
//                 <button
//                     onClick={() => {
//                         setEditingTask(null);
//                         setShowCreateModal(true);
//                     }}
//                     className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-xl text-white font-medium hover:shadow-lg transition-all"
//                 >
//                     <FiPlus size={16} />
//                     Create Task
//                 </button>
//             </div>

//             {loading ? (
//                 <div className="flex items-center justify-center py-12">
//                     <div className="w-6 h-6 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
//                 </div>
//             ) : tasks.length === 0 ? (
//                 <div className="text-center py-12">
//                     <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
//                         <FiCalendar size={24} className="text-gray-500" />
//                     </div>
//                     <p className="text-sm text-gray-400">No tasks created yet</p>
//                     <p className="text-xs text-gray-500 mt-1">Create your first task to collect data from users</p>
//                 </div>
//             ) : (
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     {tasks.map((task) => (
//                         <motion.div
//                             key={task.id}
//                             initial={{ opacity: 0, y: 20 }}
//                             animate={{ opacity: 1, y: 0 }}
//                             className="bg-[#0F0F12] border border-white/10 rounded-xl p-4 hover:border-white/20 transition-all group"
//                         >
//                             <div className="flex items-start justify-between mb-3">
//                                 <div className="flex items-center gap-2">
//                                     <div className="p-2 rounded-lg bg-cyan-500/10">
//                                         {task.type === 'booking' ? <FiCalendar size={18} className="text-cyan-400" /> : <FiCopy size={18} className="text-cyan-400" />}
//                                     </div>
//                                     <div>
//                                         <h4 className="font-semibold text-white">{task.name}</h4>
//                                         <p className="text-xs text-gray-500 capitalize">{task.type} task</p>
//                                     </div>
//                                 </div>
//                                 <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
//                                     <button
//                                         onClick={() => handleEditTask(task)}
//                                         className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-cyan-400"
//                                     >
//                                         <FiEdit2 size={14} />
//                                     </button>
//                                     <button
//                                         onClick={() => handleDeleteTask(task._id)}
//                                         className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-red-400"
//                                     >
//                                         <FiTrash2 size={14} />
//                                     </button>
//                                 </div>
//                             </div>

//                             {task.description && (
//                                 <p className="text-sm text-gray-400 mb-3 line-clamp-2">{task.description}</p>
//                             )}

//                             <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-white/10">
//                                 {task.formFields.map((field, idx) => (
//                                     <span key={field.id} className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-white/5 rounded-lg">
//                                         {getFieldIcon(field.type)}
//                                         {field.label}
//                                         {field.isRequired && <span className="text-red-400">*</span>}
//                                     </span>
//                                 ))}
//                             </div>

//                             {task.type === 'booking' && task.bookingConfig && (
//                                 <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
//                                     <span className="flex items-center gap-1">
//                                         <FiClock size={10} />
//                                         {task.bookingConfig.slotDuration} min slots
//                                     </span>
//                                     <span className="flex items-center gap-1">
//                                         <FiUsers size={10} />
//                                         Max {task.bookingConfig.maxPeoplePerSlot}
//                                     </span>
//                                 </div>
//                             )}
//                         </motion.div>
//                     ))}
//                 </div>
//             )}

//             {showCreateModal && (
//                 <TaskFormModal
//                     isOpen={showCreateModal}
//                     onClose={() => {
//                         setShowCreateModal(false);
//                         setEditingTask(null);
//                     }}
//                     onSave={handleSaveTask}
//                     editingTask={editingTask}
//                 />
//             )}
//         </div>
//     );
// }



// Debounce hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}


export default function AgentTask() {
  const { details } = useSelector((state) => state?.ai_agent);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const pageSize = 10;

  const debouncedSearch = useDebounce(searchQuery, 500);

  // Fetch tasks when page or search changes
  useEffect(() => {
    fetchTasks();
  }, [page, debouncedSearch]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      // Replace with your actual API call
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

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPage(1); // Reset to first page on search
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getFieldIcon = (type) => {
    const icons = {
      text: FiType, email: FiMail, phone: FiPhone, textarea: FiFileText,
      dropdown: FiList, radio: FiRadio, checkbox: FiCheckSquare, date: FiDateIcon
    };
    const Icon = icons[type] || FiType;
    return <Icon size={12} />;
  };

  const totalPages = Math.ceil(totalRecords / pageSize);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Agent Tasks</h3>
          <p className="text-sm text-gray-400 mt-0.5">
            {totalRecords > 0 ? `${totalRecords} total tasks` : 'Create and manage forms and booking tasks'}
          </p>
        </div>
        <button
          onClick={() => {
            // Open create task modal - implement your modal logic here
            toast.info('Create task functionality - integrate your modal');
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-xl text-white font-medium hover:shadow-lg transition-all"
        >
          <FiPlus size={16} />
          Create Task
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
        <input
          type="text"
          placeholder="Search tasks by name or description..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full bg-[#0F0F12] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery('');
              setPage(1);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
          >
            <FiX size={18} />
          </button>
        )}
      </div>

      {/* Tasks Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
            <FiCalendar size={24} className="text-gray-500" />
          </div>
          <p className="text-sm text-gray-400">
            {searchQuery ? 'No tasks match your search' : 'No tasks created yet'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {searchQuery ? 'Try a different search term' : 'Create your first task to collect data from users'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tasks.map((task, index) => (
              <motion.div
                key={task._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-[#0F0F12] border border-white/10 rounded-xl p-4 hover:border-white/20 transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-cyan-500/10">
                      {task.type === 'booking' ? (
                        <FiCalendar size={18} className="text-cyan-400" />
                      ) : (
                        <FiCopy size={18} className="text-cyan-400" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">{task.name}</h4>
                      <p className="text-xs text-gray-500 capitalize">{task.type} task</p>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        // Open edit task modal
                        toast.info('Edit task functionality - integrate your modal');
                      }}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-cyan-400"
                    >
                      <FiEdit2 size={14} />
                    </button>
                    <button
                      onClick={async () => {
                        if (window.confirm('Are you sure you want to delete this task?')) {
                          try {
                            // Replace with your delete API call
                            // await deleteTaskApi(task._id);
                            setTasks(tasks.filter(t => t._id !== task._id));
                            setTotalRecords(prev => prev - 1);
                            toast.success('Task deleted successfully');
                          } catch (error) {
                            toast.error('Failed to delete task');
                          }
                        }
                      }}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-red-400"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>

                {task.description && (
                  <p className="text-sm text-gray-400 mb-3 line-clamp-2">{task.description}</p>
                )}

                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-white/10">
                  {[...PREDEFINED_FIELDS, ...(task.formFields || [])].map((field, idx) => (
                    <span
                      key={field.id || idx}
                      className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-white/5 rounded-lg"
                    >
                      {getFieldIcon(field.type)}
                      {field.label}
                      {field.isRequired && <span className="text-red-400 text-[10px]">*</span>}
                    </span>
                  ))}
                </div>

                {task.type === 'booking' && task.bookingConfig && (
                  <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <FiClock size={10} />
                      {task.bookingConfig.slotDuration} min slots
                    </span>
                    <span className="flex items-center gap-1">
                      <FiUsers size={10} />
                      Max {task.bookingConfig.maxPeoplePerSlot}
                    </span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <div className="text-sm text-gray-400">
                Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, totalRecords)} of {totalRecords} tasks
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className={`
                    p-2 rounded-lg transition-all flex items-center gap-1
                    ${page === 1 
                      ? 'bg-white/5 text-gray-600 cursor-not-allowed' 
                      : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
                    }
                  `}
                >
                  <FiChevronLeft size={16} />
                  <span className="text-sm hidden sm:inline">Previous</span>
                </button>

                <div className="flex items-center gap-1">
                  {(() => {
                    const pages = [];
                    const maxVisible = 5;
                    let startPage = Math.max(1, page - Math.floor(maxVisible / 2));
                    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
                    
                    if (endPage - startPage + 1 < maxVisible) {
                      startPage = Math.max(1, endPage - maxVisible + 1);
                    }
                    
                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(i);
                    }
                    
                    return pages.map(p => (
                      <button
                        key={p}
                        onClick={() => handlePageChange(p)}
                        className={`
                          w-8 h-8 rounded-lg text-sm font-medium transition-all
                          ${page === p 
                            ? 'bg-gradient-to-r from-cyan-500 to-violet-500 text-white' 
                            : 'text-gray-400 hover:bg-white/10 hover:text-white'
                          }
                        `}
                      >
                        {p}
                      </button>
                    ));
                  })()}
                </div>

                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className={`
                    p-2 rounded-lg transition-all flex items-center gap-1
                    ${page === totalPages 
                      ? 'bg-white/5 text-gray-600 cursor-not-allowed' 
                      : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
                    }
                  `}
                >
                  <span className="text-sm hidden sm:inline">Next</span>
                  <FiChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}