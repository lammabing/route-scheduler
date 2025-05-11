
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Info, Plus } from "lucide-react";

const AdminTimeInfo = () => {
  // For demo/placeholder - will be implemented fully in a separate PR
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Time Info Management</h2>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add New Time Info
        </Button>
      </div>

      <div className="rounded-md border p-6 bg-slate-50">
        <div className="flex flex-col items-center justify-center py-8">
          <Info className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Time Info Management Coming Soon</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
            This section will allow you to create and manage time info symbols and descriptions
            that can be associated with departure times.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl">
            {["*", "†", "‡"].map((symbol, index) => (
              <div key={index} className="border rounded-md p-4 bg-white">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-lg">{symbol}</span>
                </div>
                <div className="text-sm">
                  {index === 0 ? "Operates on weekdays only" : 
                   index === 1 ? "Express service" : "Connects to Line B"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTimeInfo;
