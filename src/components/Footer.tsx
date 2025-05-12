
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";

interface FooterProps {
  refreshData: () => void;
}

const Footer = ({ refreshData }: FooterProps) => {
  return (
    <footer className="mt-20 py-6 border-t">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Transit Schedule - All rights reserved
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh Data
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/admin">Admin Dashboard</Link>
          </Button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
