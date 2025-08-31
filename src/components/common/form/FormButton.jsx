import { useSelector } from "react-redux"

export default function FormButton({ loading = false, handleClick, btnText = "Save", loadingText = "Saving...",additionalCls }) {
  const {theme} = useSelector(state=>state?.ui)
    return (
            <button
                type="submit"
                disabled={loading}
                onClick={handleClick}
                className={`${additionalCls} ${theme?.button} text-white px-4 py-2 rounded ${theme?.buttonHover} transition`}  >
                {loading && loadingText || btnText}
            </button>

    )
}
