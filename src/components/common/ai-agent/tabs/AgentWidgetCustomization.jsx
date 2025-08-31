import { useFormik } from 'formik';
import { toast } from 'react-toastify';
import FormInputField from '../../form/FormInputField';
import FormSelect from '../../form/FormSelect';
import { agentPosition, agentVoice } from '../../../../utils/constant';
import { FormToggle } from '../../form/FormToggle';
import FormButton from '../../form/FormButton';
import FormColorPicker from '../../form/FormColorPicker';
import { customizationInitVal, customizationValidSchema } from '../../../../utils/validation';
import { useEffect, useState } from 'react';
import { getWebIntegrationByIdApi, updateWebIntegrationByIdApi } from '../../../../utils/apis/integration/webIntegrationApi';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Loader from '../../Loader';

export default function AgentWidgetCustomization() {
  const { details: agent } = useSelector(state => state?.ai_agent)
  const {theme} = useSelector(state=>state?.ui)
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate()

  async function handleSubmit(values) {
    setUploading(true);
    try {
      const response = await updateWebIntegrationByIdApi(values);
      toast.success(response?.data?.message);
    } catch (error) {
      console.error('Error fetching agents:', error);
      toast.error(error?.response?.data?.message || 'Something went wrong!');
    } finally {
      setUploading(false);
    }
  };
  
  const formik = useFormik({
    initialValues: customizationInitVal,
    validationSchema: customizationValidSchema,
    enableReinitialize: true,
    onSubmit: handleSubmit
  });

  async function fetchDetails() {
    setLoading(true);
    try {
      const response = await getWebIntegrationByIdApi(agent?._id);
      formik.setValues(response?.data?.data);
    } catch (error) {
      console.error('Error fetching agents:', error);
      toast.error(error?.response?.data?.message || 'Something went wrong!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (agent?._id) {
      fetchDetails()
    } else {
      navigate(-1)
    }
  }, [agent?._id])

  return (
  <div className={`${theme.card || "bg-white"} shadow-lg rounded-2xl p-6`}>
  <h4 className="text-2xl font-bold  mb-6">Agent Customization</h4>

  {loading ? (
    <Loader />
  ) : (
    <form onSubmit={formik.handleSubmit} className="space-y-8">
      {/* 🎨 Colors */}
      <div className={`${theme?.subcard || "bg-gray-50"} rounded-xl p-4 shadow-sm`}>
        <h5 className="text-lg font-semibold  mb-3">Brand Colors</h5>
        <div className="flex flex-wrap gap-4">
          {["color1", "color2", "color3"].map((color, idx) => (
            <FormColorPicker
              key={color}
              label={`Color ${idx + 1}`}
              name={color}
              formik={formik}
              handleOnChange={(e) => formik.setFieldValue(color, e.target.value)}
            />
          ))}
        </div>
      </div>

      {/* 💬 Greeting messages */}
      <div className={`${theme?.subcard || "bg-gray-50"} rounded-xl p-4 shadow-sm`}>
        <h5 className="text-lg font-semibold mb-3">
          Greeting Messages <span className="text-sm text-gray-500">(max 3)</span>
        </h5>
        <div className="grid grid-cols-3 items-center gap-3">
          {formik.values?.greetingMsg?.map((msg, index) => (
            <div
              key={index}
              className="flex flex-col gap-2 "
            >
              <div className='flex items-center justify-center gap-2'>
              <FormInputField
                name={`greetingMsg[${index}]`}
                placeholder={`Message ${index + 1}`}
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
                      "greetingMsg",
                      formik.values.greetingMsg.filter((_, i) => i !== index)
                    )
                  }
                  className="px-3 py-2 bg-red-100 text-red-600 rounded-lg 
                             hover:bg-red-200 transition"
                >
                  ✕
                </button>
              )}
              </div>
            </div>
          ))}

          {/* Add new message button */}
          {formik.values?.greetingMsg?.length < 3 && (
            <button
              type="button"
              onClick={() =>
                formik.setFieldValue("greetingMsg", [
                  ...formik.values.greetingMsg,
                  "",
                ])
              }
              className="px-4 py-2 bg-indigo-100 text-indigo-600 rounded-lg 
                         hover:bg-indigo-200 transition w-fit"
            >
              + Add Message
            </button>
          )}
        </div>
      </div>

      {/* ⚙️ Preferences */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormSelect
          name="position"
          label="Position"
          options={agentPosition}
          formik={formik}
          placeholder="Select"
          handleOnChange={(e) =>
            formik.setFieldValue("position", e?.target?.value)
          }
        />

        <FormSelect
          name="agentVoice"
          label="Voice"
          options={agentVoice}
          formik={formik}
          placeholder="Select"
          handleOnChange={(e) =>
            formik.setFieldValue("agentVoice", e?.target?.value)
          }
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormToggle
          label="Show Agent"
          name="showAgent"
          formik={formik}
          handleOnChange={(name, val) => formik.setFieldValue("showAgent", val)}
        />
        <FormToggle
          label="Voice Chat"
          name="isVoiceChat"
          formik={formik}
          handleOnChange={(name, val) =>
            formik.setFieldValue("isVoiceChat", val)
          }
        />
      </div>

      {/* ✅ Submit */}
      <div className="flex justify-center">
        <FormButton
          loading={uploading}
          handleClick={formik.handleSubmit}
          additionalCls="w-[60%] md:w-[40%]"
        />
      </div>
    </form>
  )}
</div>
  );
}
