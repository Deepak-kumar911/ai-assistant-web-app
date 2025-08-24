import { useState } from "react";
import { FiCopy, FiCheck } from "react-icons/fi";

export default function WidgetIntegrationSnippet({details}) {
  const [copied, setCopied] = useState(false);

  const codeSnippet = `
<script>
window.addEventListener("load", function () {
  // API key
  window.extensionApiKey = "${details?.apiKey || "YOUR_API_KEY"}";

  // Ensure mount point exists (React build expects #root)
  if (!document.getElementById("root")) {
    const root = document.createElement("div");
    root.id = "root";
    document.body.appendChild(root);
  }

  // Load CSS
  const css = document.createElement("link");
  css.rel = "stylesheet";
  css.href = "https://ai-assistant-api-eq7b.onrender.com/integration/build/assets/index-D-AbW53d.css";
  document.head.appendChild(css);

  // Load JS
  const js = document.createElement("script");
  js.src = "https://ai-assistant-api-eq7b.onrender.com/integration/build/assets/index-B1dJKXyp.js";
  js.async = true;
  document.body.appendChild(js);
});
</script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto bg-gray-900 text-gray-100 p-6 rounded-2xl shadow-lg">
      <h2 className="text-xl font-semibold mb-3">Integrate Chatbot</h2>
      <p className="mb-4 text-gray-400">
        Copy and paste this script before the closing <code>&lt;/body&gt;</code> tag of your website.
      </p>

      <div className="relative">
        <pre className="bg-gray-800 p-4 rounded-xl text-sm overflow-x-auto">
          <code>{codeSnippet}</code>
        </pre>
        <button
          onClick={handleCopy}
          className="absolute top-3 right-3 bg-gray-700 hover:bg-gray-600 p-2 rounded-lg transition"
        >
          {copied ? <FiCheck className="text-green-400" /> : <FiCopy />}
        </button>
      </div>

      {copied && <p className="text-green-400 mt-2">Copied to clipboard!</p>}
    </div>
  );
}
