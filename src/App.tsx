
import { ToastProvider } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { supabase, isUsingRealCredentials } from "./lib/supabase";

const queryClient = new QueryClient();

const App = () => {
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(false);
  const [isCheckingConnection, setIsCheckingConnection] = useState<boolean>(true);

  // Check if Supabase connection is working
  useEffect(() => {
    const checkConnection = async () => {
      setIsCheckingConnection(true);
      try {
        // Simple query to test connection
        const { data, error } = await supabase
          .from("routes")
          .select("count", { count: 'exact', head: true });
          
        setIsSupabaseConnected(!error);
      } catch (error) {
        console.error("Supabase connection error:", error);
        setIsSupabaseConnected(false);
      } finally {
        setIsCheckingConnection(false);
      }
    };
    
    checkConnection();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ToastProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            {isCheckingConnection && (
              <div className="fixed top-0 left-0 right-0 bg-blue-500 text-white p-2 text-center z-50">
                Checking Supabase connection...
              </div>
            )}
            {!isCheckingConnection && !isSupabaseConnected && (
              <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white p-2 text-center z-50">
                {!isUsingRealCredentials() 
                  ? "Supabase environment variables missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to continue."
                  : "Failed to connect to Supabase. Some features may be unavailable."
                }
              </div>
            )}
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
