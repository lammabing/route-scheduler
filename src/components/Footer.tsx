
import React from "react";

interface FooterProps {
  refreshData: () => void;
}

const Footer = ({ refreshData }: FooterProps) => {
  return (
    <div className="text-center text-xs text-muted-foreground mt-8">
      <p>
        Schedules and times may change. Data is cached for offline use.{' '}
        <button 
          onClick={refreshData}
          className="text-primary underline"
        >
          Refresh Data
        </button>
      </p>
    </div>
  );
};

export default Footer;
