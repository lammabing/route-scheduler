
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tag, Plus } from "lucide-react";

const AdminFares = () => {
  // For demo/placeholder - will be implemented fully in a separate PR
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Fare Management</h2>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add New Fare
        </Button>
      </div>

      <div className="rounded-md border p-6 bg-slate-50">
        <div className="flex flex-col items-center justify-center py-8">
          <Tag className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Fare Management Coming Soon</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
            This section will allow you to create and manage fares that can be associated with routes and departures.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl">
            {["Standard", "Concession", "Child"].map((fareType, index) => (
              <div key={index} className="border rounded-md p-4 bg-white">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{fareType}</span>
                  <span className="text-lg font-bold">
                    ${(4.5 - (index * 1.5)).toFixed(2)}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {index === 0 ? "Regular adult fare" : 
                   index === 1 ? "Students and seniors" : "Children under 12"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminFares;
