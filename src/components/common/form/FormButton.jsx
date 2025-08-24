export default function FormButton({ loading = false, handleClick, btnText = "Save", loadingText = "Saving...",additionalCls }) {
    return (
            <button
                type="submit"
                disabled={loading}
                onClick={handleClick}
                className={`${additionalCls} bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700 transition`}  >
                {loading && loadingText || btnText}
            </button>

    )
}
