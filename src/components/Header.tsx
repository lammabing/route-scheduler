
import React from "react";
import { Bus } from "lucide-react";

const Header = () => {
  return (
    <div className="text-center mb-8 p-4 bg-primary/5 rounded-lg border">
      <div className="flex items-center justify-center gap-2 mb-2">
        <Bus className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold">Route Schedule Sync</h1>
      </div>
      <p className="text-muted-foreground">
        Find schedules for public transportation routes
      </p>
    </div>
  );
};

export default Header;
