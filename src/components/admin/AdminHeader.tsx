
import { ArrowLeft, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const AdminHeader = () => {
  const { user, signOut } = useAuth();
  
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your routes, schedules, and content
        </p>
      </div>
      
      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-2 text-sm bg-muted/50 px-3 py-1.5 rounded-full">
            <User className="h-4 w-4" />
            <span>{user.email}</span>
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={signOut}
          >
            Sign out
          </Button>
          
          <Button asChild variant="outline">
            <Link to="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Schedule
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminHeader;
