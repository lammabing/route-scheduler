
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Plus } from "lucide-react";

const AdminHolidays = () => {
  // For demo/placeholder - will be implemented fully in a separate PR
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Holiday Management</h2>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add New Holiday
        </Button>
      </div>

      <div className="rounded-md border p-6 bg-slate-50">
        <div className="flex flex-col items-center justify-center py-8">
          <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Holiday Management Coming Soon</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
            This section will allow you to create and manage public holidays that can affect schedule operations.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl">
            {["New Year's Day", "Independence Day", "Labor Day", "Thanksgiving", "Christmas"].map((holiday, index) => (
              <div key={index} className="border rounded-md p-4 bg-white">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{holiday}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {index === 0 ? "January 1, 2026" : 
                   index === 1 ? "July 4, 2026" : 
                   index === 2 ? "September 7, 2026" : 
                   index === 3 ? "November 26, 2026" :
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

export default AdminHolidays;
