
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { seedSupabaseData } from "@/utils/seedSupabaseData";
import { toast } from "sonner";
import { Loader2, Database } from "lucide-react";

const AdminSeeder = () => {
  const [isSeeding, setIsSeeding] = useState(false);

  const handleSeedData = async () => {
    setIsSeeding(true);
    
    try {
      toast.info("Starting database seeding...", {
        duration: 2000,
      });
      
      await seedSupabaseData();
      
      toast.success("Database seeded successfully!", {
        description: "The app will now refresh to load the new data.",
      });
      
      // Reload the page to fetch fresh data
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error("Error seeding database:", error);
      toast.error("Failed to seed database", {
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="fixed bottom-20 right-4 z-50">
      <Button 
        onClick={handleSeedData} 
        disabled={isSeeding}
        size="sm"
        className="bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-2"
      >
        {isSeeding ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Seeding database...</span>
          </>
        ) : (
          <>
            <Database className="h-4 w-4" />
            <span>Seed Database</span>
          </>
        )}
      </Button>
    </div>
  );
};

export default AdminSeeder;
