const ConnectWhatsApp = () => {
  const handleConnect = () => {
    const clientId = 1298901931707459;
    const redirectUri = encodeURIComponent("https://chancily-sericate-cari.ngrok-free.dev/ai-agent/manage/6829e73bae34942d01318599");
    const signupUrl = `https://www.facebook.com/v20.0/dialog/oauth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=whatsapp_business_management,whatsapp_business_messaging,business_management,read_page_mailboxes,pages_show_list`;
    
    window.location.href = signupUrl;
  };

  return (
    <button
      onClick={handleConnect}
      className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
    >
      Connect WhatsApp
    </button>
  );
};

export default ConnectWhatsApp;
