import { useFormik } from 'formik';
import { toast } from 'react-toastify';
import FormInputField from '../form/FormInputField';
import FormSelect from '../form/FormSelect';
import { agentPosition, agentVoice } from '../../../utils/constant';
import { FormToggle } from '../form/FormToggle';
import FormButton from '../form/FormButton';
import FormColorPicker from '../form/FormColorPicker';
import { customizationInitVal, customizationValidSchema } from '../../../utils/validation';
import { updateAgentWedgetApi } from '../../../utils/apiEndPoints';
import { useState } from 'react';

export default function AgentWidgetCustomization({ details }) {
  const [uploading, setUploading] = useState(false);

  async function handleSubmit(values) {
    setUploading(true);
    try {
      const response = await updateAgentWedgetApi(values);
      toast.success(response?.data?.message);
    } catch (error) {
      console.error('Error fetching agents:', error);
      toast.error(error?.response?.data?.message || 'Something went wrong!');
    } finally {
      setUploading(false);
    }
  };

  const formik = useFormik({
    initialValues: { ...customizationInitVal, ...details?.widget_settings },
    validationSchema: customizationValidSchema,
    enableReinitialize: true,
    onSubmit: handleSubmit
  });


  return (
    <div className="">
      <h4 className='fs-3 fw-bold py-5'>Agent wedget</h4>
      <form onSubmit={formik.handleSubmit} className="space-y-6">
        <div className="flex items-center gap-4">
          <FormColorPicker
            label="Color 1"
            name="color1"
            formik={formik}
            handleOnChange={(e) =>
              formik.setFieldValue('color1', e.target.value)
            }
          />
          <FormColorPicker
            label="Color 2"
            name="color2"
            formik={formik}
            handleOnChange={(e) =>
              formik.setFieldValue('color2', e.target.value)
            }
          />
          <FormColorPicker
            label="Color 3"
            name="color3"
            formik={formik}
            handleOnChange={(e) =>
              formik.setFieldValue('color3', e.target.value)
            }
          />
        </div>

        {/* Greeting messages */}
        <div>
          <label className="block text-sm font-medium  mb-2">
            Greeting Messages (max 3)
          </label>
          <div className="flex flex-wrap gap-3 items-center">
            {formik.values?.greetingMsg?.map((msg, index) => (
              <div key={index} className="flex items-center gap-2">
                <FormInputField
                  name={`greetingMsg[${index}]`}
                  placeholder={`Msg-${index + 1}`}
                  formik={formik}
                  isTouched={formik?.touched?.greetingMsg?.[index]}
                  isError={formik?.errors?.greetingMsg?.[index]}
                  handleOnChange={(e, name) =>
                    formik.setFieldValue(name, e.target.value)
                  }
                />
                {formik.values?.greetingMsg?.length !== 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      formik.setFieldValue(
                        'greetingMsg',
                        formik.values.greetingMsg.filter((_, i) => i !== index)
                      )
                    }
                    className="px-3 py-2 bg-red-500 rounded hover:bg-red-700"
                  >
                    -
                  </button>
                )}
              </div>
            ))}
            {formik.values?.greetingMsg?.length < 3 && (
              <button
                type="button"
                onClick={() =>
                  formik.setFieldValue('greetingMsg', [...formik.values.greetingMsg, '',])}
                className="px-3 py-2 bg-green-500 rounded hover:bg-green-600">+</button>
            )}
          </div>
        </div>

        {/* Other customization options */}
        <div className='grid grid-rows-1 md:grid-cols-2 gap-5'>
          <FormSelect
            name="position"
            label="Position"
            options={agentPosition}
            formik={formik}
            placeholder="Select"
            handleOnChange={(e) => formik.setFieldValue('position', e?.target?.value)}
          />

          <FormSelect
            name="agentVoice"
            label="Voice"
            options={agentVoice}
            formik={formik}
            placeholder="Select"
            handleOnChange={(e) => formik.setFieldValue('agentVoice', e?.target?.value)}
          />
        </div>

        <div className='grid grid-rows-1 md:grid-cols-2 gap-5'>
          <FormToggle
            label="Show Agent"
            name="showAgent"
            formik={formik}
            handleOnChange={(name, val) => formik.setFieldValue('showAgent', val)}
          />
          <FormToggle
            label="Voice Chat"
            name="isVoiceChat"
            formik={formik}
            handleOnChange={(name, val) => formik.setFieldValue('isVoiceChat', val)}
          />
        </div>
        <div className='flex justify-center items-center w-full'>
        <FormButton loading={uploading} handleClick={formik.handleSubmit} additionalCls={"w-[50%]"}/>
</div>
      </form>
    </div>
  );
}
