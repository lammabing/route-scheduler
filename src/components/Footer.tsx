
import React from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "./ui/button";

interface FooterProps {
  refreshData: () => void;
}

const Footer = ({ refreshData }: FooterProps) => {
  return (
    <div className="text-center mt-8 p-4 border-t">
      <p className="text-sm text-muted-foreground mb-2">
        Schedules and times may change. Data is cached for offline use.
      </p>
      <Button 
        onClick={refreshData}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <RefreshCw className="h-4 w-4" />
        Refresh Data
      </Button>
    </div>
  );
};

export default Footer;
