import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import FormButton from '../../form/FormButton'
import { useFormik } from 'formik';
import { agentBehaviourInitVal, agentBehaviourValidSchema } from '../../../../utils/validation';
import FormTextArea from '../../form/FormTextArea';
import { updateAgentInfoApi } from '../../../../utils/apis/apiEndPoints';
import { toast } from 'react-toastify';

export default function AgentBehaviour({refetch}) {
  const { details } = useSelector(state => state?.ai_agent)
  const [saving, setSaving] = useState(false);

  async function handleSubmit(values) {
    setSaving(true);
    let payload = {
      behaviour: values?.behaviour,
      _id: details?._id
    }
    try {
      const response = await updateAgentInfoApi(payload);
      toast.success(response?.data?.message);
      refetch && refetch()
    } catch (error) {
      console.error('Error fetching agents:', error);
      toast.error(error?.response?.data?.message || 'Something went wrong!');
    } finally {
      setSaving(false);
    }
  };

  const formik = useFormik({
    initialValues: { ...agentBehaviourInitVal, behaviour: details?.behaviour },
    validationSchema: agentBehaviourValidSchema,
    enableReinitialize: true,
    onSubmit: handleSubmit
  });

  return (
    <div>
      <div>
        <FormTextArea
          label={""}
          name={`behaviour`}
          placeholder={`Describe agent behaviour here...`}
          formik={formik}
          handleOnChange={(e, name) => formik.setFieldValue(name, e.target.value)}
        />
        <div className="flex justify-center mt-5">
          <FormButton
            loading={saving}
            handleClick={formik.handleSubmit}
            additionalCls="w-[50%] md:w-[30%]"
          />
        </div>
      </div>
    </div>
  )
}
