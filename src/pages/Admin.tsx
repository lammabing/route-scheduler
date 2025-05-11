
import { useState } from "react";
import { toast } from "sonner";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminTabs from "@/components/admin/AdminTabs";
import AdminRoutes from "@/components/admin/AdminRoutes";
import AdminSchedules from "@/components/admin/AdminSchedules";
import AdminTimeInfo from "@/components/admin/AdminTimeInfo";
import AdminFares from "@/components/admin/AdminFares";
import AdminHolidays from "@/components/admin/AdminHolidays";
import AdminAnnouncements from "@/components/admin/AdminAnnouncements";

const Admin = () => {
  const [activeTab, setActiveTab] = useState("routes");

  const renderActiveTab = () => {
    switch (activeTab) {
      case "routes":
        return <AdminRoutes />;
      case "schedules":
        return <AdminSchedules />;
      case "timeInfo":
        return <AdminTimeInfo />;
      case "fares":
        return <AdminFares />;
      case "holidays":
        return <AdminHolidays />;
      case "announcements":
        return <AdminAnnouncements />;
      default:
        return <AdminRoutes />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl min-h-screen">
      <AdminHeader />
      
      <div className="mt-6">
        <AdminTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <div className="mt-6">
          {renderActiveTab()}
        </div>
      </div>
    </div>
  );
};

export default Admin;
