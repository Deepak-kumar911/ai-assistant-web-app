import { FiHome, FiPieChart, FiSettings, FiUsers, FiZap, FiCalendar, FiClock, FiBarChart2 } from "react-icons/fi";
import InstagramOverView from "../../pages/integrations/instagram/OverView";
import WhatsAppOverView from "../../pages/integrations/whatsapp/OverView";
import WebIntegration from "../../components/integration/WebIntegration";
import InstagramAuth from "../../pages/integrations/instagram/InstagramAuth";
import InstagramPublisher from "../../pages/integrations/instagram/publish/InstagramPublisher";
import PostScheduler from "../../pages/integrations/instagram/PostScheduler";
import WorkflowSetup from "../../pages/integrations/instagram/WorkflowSetup";
import InstagramInsightsDashboard from "../../pages/integrations/instagram/InstagramInsightsDashboard";

export const integrationConfigs = {
  instagram: {
    name: "Instagram",
    sidebar: [
      { path: "overview", isSidebar: true, label: "Overview & Connection", icon: FiHome, iconSize: 18, component: InstagramOverView },
      { path: "comments-workflows", isSidebar: true, label: "Comments & Workflows", icon: FiZap, iconSize: 18, component: WorkflowSetup },
      { path: "smart-post-scheduler", isSidebar: true, label: "Post Scheduler", icon: FiCalendar, iconSize: 18, component: InstagramPublisher },
      { path: "post-scheduler", isSidebar: true, label: "Scheduled Posts Queue", icon: FiClock, iconSize: 18, component: PostScheduler },
      { path: "analytics", isSidebar: true, label: "Insights & Performance", icon: FiBarChart2, iconSize: 18, component: InstagramInsightsDashboard },

      // Non-sidebar sub-routes and backward-compatible aliases
      { path: "workflows", isSidebar: false, label: "Comments & Workflows", component: WorkflowSetup },
      { path: "scheduler", isSidebar: false, label: "Post Scheduler", component: InstagramPublisher },
      { path: "insights", isSidebar: false, label: "Insights & Performance", component: InstagramInsightsDashboard },
      { path: "post-scheduler/new", isSidebar: false, label: "Post Setup", component: WorkflowSetup },
      { path: "post-scheduler/update", isSidebar: false, label: "Post Setup", component: WorkflowSetup },
      { path: "permissions", isSidebar: false, label: "Permissions", component: InstagramOverView },
      { path: "auth/instagram/callback", isSidebar: false, label: "Auth", component: InstagramAuth },
    ],
  },
  whatsapp: {
    name: "WhatsApp",
    sidebar: [
      { path: "overview", isSidebar: true, label: "Overview", icon: FiHome, iconSize: 20, component: WhatsAppOverView },
      { path: "connect", isSidebar: true, label: "Connect", icon: FiPieChart, iconSize: 20, component: WhatsAppOverView },
      { path: "templates", isSidebar: true, label: "Templates", icon: FiUsers, iconSize: 20, component: WhatsAppOverView },
      { path: "automation", isSidebar: true, label: "Automation", icon: FiSettings, iconSize: 20, component: WhatsAppOverView },
    ],
  },
  website: {
    name: "Website",
    sidebar: [
      { path: "overview", isSidebar: true, label: "Overview", icon: FiHome, iconSize: 20, component: WebIntegration },
      { path: "connect", isSidebar: true, label: "Widget Customizer", icon: FiPieChart, iconSize: 20, component: WebIntegration },
      { path: "templates", isSidebar: true, label: "Templates", icon: FiUsers, iconSize: 20 },
      { path: "automation", isSidebar: true, label: "Automation", icon: FiSettings, iconSize: 20 },
    ],
  },
};
