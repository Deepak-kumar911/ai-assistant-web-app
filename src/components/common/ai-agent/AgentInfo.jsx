import { useFormik } from 'formik';
import { toast } from 'react-toastify';
import FormInputField from '../form/FormInputField';
import { FormToggle } from '../form/FormToggle';
import FormButton from '../form/FormButton';
import { agentInfoInitVal, agentInfoValidSchema, customizationInitVal, customizationValidSchema } from '../../../utils/validation';
import { updateAgentInfoApi } from '../../../utils/apiEndPoints';
import { useState } from 'react';
import FormTextArea from '../form/FormTextArea';


export default function AgentInfo({ details }) {
  const [uploading, setUploading] = useState(false);


  async function handleSubmit(values) {
    setUploading(true);
    let payload ={
    name: values?.name,
    companyName: values?.companyName,
    description: values?.description,
    isOnOff: values?.isOnOff,
    _id:values?._id
    }
    try {
      const response = await updateAgentInfoApi(payload);
      toast.success(response?.data?.message);
    } catch (error) {
      console.error('Error fetching agents:', error);
      toast.error(error?.response?.data?.message || 'Something went wrong!');
    } finally {
      setUploading(false);
    }
  };

  const formik = useFormik({
    initialValues: { ...agentInfoInitVal, ...details },
    validationSchema: agentInfoValidSchema,
    enableReinitialize: true,
    onSubmit: handleSubmit
  });


  return (
    <div>
      <h4 className='fs-3 fw-bold py-3'>Agent info</h4>
      <form onSubmit={formik.handleSubmit} className="space-y-6">
        <FormInputField
          label={"Name"}
          name={`name`}
          placeholder={`Agent name`}
          formik={formik}
          handleOnChange={(e, name) => formik.setFieldValue(name, e.target.value)}
        />
        <FormInputField
          label={"Company Name"}
          name={`companyName`}
          placeholder={`Company name`}
          formik={formik}
          handleOnChange={(e, name) => formik.setFieldValue(name, e.target.value)}
        />
        <FormTextArea
          label={"Description"}
          name={`description`}
          placeholder={`short description...`}
          formik={formik}
          handleOnChange={(e, name) => formik.setFieldValue(name, e.target.value)}
        />
        <div className='grid grid-rows-1 md:grid-cols-2 gap-5'>
          <FormToggle
            label="On/Off"
            name="isOnOff"
            formik={formik}
            handleOnChange={(name, val) => formik.setFieldValue('isOnOff', val)}
          />
        </div>
        <div className='flex justify-center items-center w-full'>
        <FormButton loading={uploading} handleClick={formik.handleSubmit} additionalCls={"w-[50%]"}/>
        </div>
      </form>
    </div>
  )
}
