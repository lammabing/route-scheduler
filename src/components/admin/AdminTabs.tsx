
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Route, 
  Calendar, 
  Info, 
  Tag, 
  Calendar as HolidayIcon,
  Bell
} from "lucide-react";

interface AdminTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const AdminTabs = ({ activeTab, setActiveTab }: AdminTabsProps) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="w-full grid grid-cols-2 md:grid-cols-6">
        <TabsTrigger value="routes" className="flex gap-2 items-center">
          <Route className="h-4 w-4" /> Routes
        </TabsTrigger>
        <TabsTrigger value="schedules" className="flex gap-2 items-center">
          <Calendar className="h-4 w-4" /> Schedules
        </TabsTrigger>
        <TabsTrigger value="timeInfo" className="flex gap-2 items-center">
          <Info className="h-4 w-4" /> Time Info
        </TabsTrigger>
        <TabsTrigger value="fares" className="flex gap-2 items-center">
          <Tag className="h-4 w-4" /> Fares
        </TabsTrigger>
        <TabsTrigger value="holidays" className="flex gap-2 items-center">
          <HolidayIcon className="h-4 w-4" /> Holidays
        </TabsTrigger>
        <TabsTrigger value="announcements" className="flex gap-2 items-center">
          <Bell className="h-4 w-4" /> Announcements
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default AdminTabs;
