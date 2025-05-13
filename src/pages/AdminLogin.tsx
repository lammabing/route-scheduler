
import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { Shield, ArrowRight, UserPlus, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { createAdminUser } from "@/utils/createAdminUser";
import { toast } from "sonner";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const { signIn, user, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in and is admin
  if (user && isAdmin) {
    return <Navigate to="/admin" />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsSubmitting(true);
    try {
      await signIn(email, password);
      navigate("/admin");
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateAdmin = async () => {
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    setIsCreatingAdmin(true);
    setCreateError(null);
    try {
      const result = await createAdminUser(email, password);
      toast.success(`Admin user created: ${result.email}`);
      // Clear the form
      setEmail("");
      setPassword("");
    } catch (error: any) {
      console.error("Error creating admin user:", error);
      const errorMessage = error?.message || "Failed to create admin user";
      setCreateError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsCreatingAdmin(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-slate-50">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <h1 className="mt-4 text-2xl font-semibold">Admin Login</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to access the admin dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {createError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span>Error: {createError}</span>
            </div>
          )}

          <div className="flex flex-col space-y-2">
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
            
            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">Or</span>
              </div>
            </div>
            
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleCreateAdmin}
              disabled={isCreatingAdmin}
            >
              <UserPlus className="mr-2" />
              {isCreatingAdmin ? "Creating Admin..." : "Create Admin User"}
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center text-sm">
          <Link to="/" className="text-primary hover:underline flex items-center justify-center gap-1">
            <ArrowRight className="h-4 w-4" /> Back to schedule
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
