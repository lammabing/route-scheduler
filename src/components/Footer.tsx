
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface FooterProps {
  refreshData: () => void;
}

const Footer = ({ refreshData }: FooterProps) => {
  const { user, isAdmin } = useAuth();
  
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
          {isAdmin ? (
            <Button asChild variant="outline" size="sm">
              <Link to="/admin">Admin Dashboard</Link>
            </Button>
          ) : user ? (
            <Button asChild variant="outline" size="sm">
              <Link to="/admin/login">Admin Access</Link>
            </Button>
          ) : (
            <Button asChild variant="outline" size="sm">
              <Link to="/admin/login">Admin Login</Link>
            </Button>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
