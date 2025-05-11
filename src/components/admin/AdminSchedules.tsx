
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useSchedule } from "@/hooks/useSchedule";
import { format } from "date-fns";

const AdminSchedules = () => {
  // For demo/placeholder - will be implemented fully in a separate PR
  const { routes } = useSchedule({});

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Schedule Management</h2>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add New Schedule
        </Button>
      </div>

      <div className="rounded-md border p-6 bg-slate-50">
        <div className="flex flex-col items-center justify-center py-8">
          <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Schedule Management Coming Soon</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
            This section will allow you to create and manage schedules for each route,
            including departure times, effective dates, and associated time info and fares.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 w-full max-w-4xl">
            {routes.slice(0, 6).map((route, index) => (
              <div key={route.id || index} className="border rounded-md p-4 bg-white">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{route.name}</span>
                  <Badge variant="outline">{route.transportType}</Badge>
                </div>
                <div className="text-sm text-muted-foreground mb-2">
                  {route.origin} → {route.destination}
                </div>
                <div className="text-xs text-muted-foreground">
                  Effective: {format(new Date(), "MMMM d, yyyy")} - Ongoing
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSchedules;
