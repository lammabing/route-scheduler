
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bell, Plus } from "lucide-react";

const AdminAnnouncements = () => {
  // For demo/placeholder - will be implemented fully in a separate PR
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Announcement Management</h2>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add New Announcement
        </Button>
      </div>

      <div className="rounded-md border p-6 bg-slate-50">
        <div className="flex flex-col items-center justify-center py-8">
          <Bell className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Announcement Management Coming Soon</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
            This section will allow you to create and manage announcements that can be displayed on route schedules.
          </p>
          <div className="grid grid-cols-1 gap-4 w-full max-w-3xl">
            {["Service Disruption", "Schedule Change", "Holiday Service Alert"].map((title, index) => (
              <div key={index} className="border rounded-md p-4 bg-white">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{title}</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    index === 0 ? "bg-red-100 text-red-800" : 
                    index === 1 ? "bg-amber-100 text-amber-800" : 
                    "bg-blue-100 text-blue-800"
                  }`}>
                    {index === 0 ? "Urgent" : index === 1 ? "Important" : "Info"}
                  </span>
                </div>
                <div className="text-sm mb-2">
                  {index === 0 
                    ? "Temporary disruption on Route A due to construction. Expect delays of 10-15 minutes." 
                    : index === 1 
                    ? "Schedule changes effective June 1. Please check updated departure times."
                    : "Holiday service schedule will be in effect on December 25."}
                </div>
                <div className="text-xs text-muted-foreground">
                  {index === 0 ? "May 15 - May 30, 2026" : 
                   index === 1 ? "Effective June 1, 2026" : 
                   "December 25, 2026"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnnouncements;
