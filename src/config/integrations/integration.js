import { FiHome, FiPieChart, FiSettings, FiUsers } from "react-icons/fi";
import InstagramOverView from "../../pages/integrations/instagram/OverView";
import WhatsAppOverView from "../../pages/integrations/whatsapp/OverView";
import WebIntegration from "../../components/integration/WebIntegration";
import InstagramAuth from "../../pages/integrations/instagram/InstagramAuth";
import InstagramPublisher from "../../pages/integrations/instagram/publish/InstagramPublisher";
import WorkflowSpace from "../../pages/workflow/WorkflowSpace";

export const integrationConfigs = {
  instagram: {
    name: "Instagram",
    sidebar: [
      { path: "overview",isSidebar:true,label: "Overview",icon: FiHome,iconSize:20,component:InstagramOverView },
      { path: "smart-post-scheduler",isSidebar:true, label: "Smart Post Scheduler",icon: FiPieChart,iconSize:20,component:InstagramPublisher  },
      { path: "permissions",isSidebar:true, label: "Permissions",icon: FiUsers,iconSize:20 },
      { path: "analytics",isSidebar:true, label: "Analytics",icon: FiSettings,iconSize:20  },
      { path: "custom",isSidebar:true, label: "Custom",icon: FiSettings,iconSize:20,component:WorkflowSpace  },

      { path: "auth/instagram/callback",isSidebar:false,label: "Auth",component:InstagramAuth },

    ],
  },
  whatsapp: {
    name: "WhatsApp",
    sidebar: [
      { path: "overview",isSidebar:true, label: "Overview",icon: FiHome,iconSize:20,component:WhatsAppOverView   },
      { path: "connect",isSidebar:true, label: "Connect",icon: FiPieChart,iconSize:20,component:WhatsAppOverView },
      { path: "templates",isSidebar:true, label: "Templates",icon: FiUsers,iconSize:20,component:WhatsAppOverView },
      { path: "automation",isSidebar:true, label: "Automation",icon: FiSettings,iconSize:20,component:WhatsAppOverView },
    ],
  },
  website: {
    name: "Website",
    sidebar: [
      { path: "overview",isSidebar:true, label: "Overview",icon: FiHome,iconSize:20   },
      { path: "connect",isSidebar:true, label: "Connect",icon: FiPieChart,iconSize:20,component:WebIntegration },
      { path: "templates",isSidebar:true, label: "Templates",icon: FiUsers,iconSize:20 },
      { path: "automation",isSidebar:true, label: "Automation",icon: FiSettings,iconSize:20 },
    ],
  },
};
