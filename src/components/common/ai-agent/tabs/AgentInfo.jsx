// components/common/ai-agent/tabs/AgentInfo.tsx (Updated - Clean inline form)
import { useFormik } from 'formik';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import FormInputField from '../../form/FormInputField';
import { FormToggle } from '../../form/FormToggle';
import FormButton from '../../form/FormButton';
import { agentInfoInitVal, agentInfoValidSchema } from '../../../../utils/validation';
import { useState } from 'react';
import FormTextArea from '../../form/FormTextArea';
import { useSelector } from 'react-redux';
import { updateAgentInfoApi } from '../../../../api/authApi';
import { FiSave, FiUser, FiBriefcase, FiFileText, FiPower } from 'react-icons/fi';

export default function AgentInfo({ onSave }) {
  const { details } = useSelector(state => state?.ai_agent);
  const [uploading, setUploading] = useState(false);

  async function handleSubmit(values) {
    setUploading(true);
    let payload = {
      name: values?.name,
      companyName: values?.companyName,
      description: values?.description,
      isOnOff: values?.isOnOff,
      _id: values?._id
    };
    try {
      const response = await updateAgentInfoApi(payload);
      toast.success(response?.data?.message);
      onSave?.();
    } catch (error) {
      console.error('Error fetching agents:', error);
      toast.error(error?.response?.data?.message || 'Something went wrong!');
    } finally {
      setUploading(false);
    }
  }

  const formik = useFormik({
    initialValues: { ...agentInfoInitVal, ...details },
    validationSchema: agentInfoValidSchema,
    enableReinitialize: true,
    onSubmit: handleSubmit
  });

  return (
    <motion.form
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onSubmit={formik.handleSubmit}
      className="p-6 space-y-6"
    >
      {/* Two-column layout for better spacing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormInputField
          label="Agent Name"
          name="name"
          placeholder="e.g., Customer Support Bot"
          formik={formik}
          handleOnChange = {(e, name) => formik.setFieldValue(name, e.target.value)}
          icon={<FiUser size={16} />}
          hint="Choose a descriptive name for your agent"
        />
        
        <FormInputField
          label="Company Name"
          name="companyName"
          placeholder="Your company name"
          formik={formik}
          handleOnChange = {(e, name) => formik.setFieldValue(name, e.target.value)}
          icon={<FiBriefcase size={16} />}
          hint="This will be used for branding"
        />
      </div>

      <FormTextArea
        label="Description"
        name="description"
        placeholder="Describe what this agent does, its purpose, and key capabilities..."
        formik={formik}
        handleOnChange = {(e, name) => formik.setFieldValue(name, e.target.value)}
        rows={4}
        hint="A clear description helps users understand the agent's role"
      />

      {/* Status Card */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-white/5 to-transparent border border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10">
              <FiPower size={18} className="text-cyan-400" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-white">Agent Status</h4>
              <p className="text-xs text-gray-400 mt-0.5">
                {formik.values.isOnOff 
                  ? 'Agent is active and responding to queries' 
                  : 'Agent is paused and will not respond'}
              </p>
            </div>
          </div>
          <FormToggle
            name="isOnOff"
            formik={formik}
            handleOnChange={(name, value) => formik.setFieldValue(name, value)}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end pt-4 border-t border-white/10">
        <FormButton 
          loading={uploading} 
          type="submit"
          icon={<FiSave size={16} />}
        >
          Save Changes
        </FormButton>
      </div>
    </motion.form>
  );
}