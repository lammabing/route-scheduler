
import { Route } from "@/types";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Bus, Train, TrainFront } from "lucide-react";

interface RouteSelectorProps {
  routes: Route[];
  selectedRouteId: string;
  onRouteChange: (routeId: string) => void;
  disabled?: boolean;
}

const RouteSelector = ({
  routes,
  selectedRouteId,
  onRouteChange,
  disabled = false
}: RouteSelectorProps) => {
  // Get the current selected route
  const selectedRoute = routes.find(route => route.id === selectedRouteId);

  // Handle selection change
  const handleChange = (value: string) => {
    onRouteChange(value);
  };

  // Get icon based on transport type
  const getTransportIcon = (type: string) => {
    switch (type) {
      case "bus":
        return <Bus className="h-4 w-4 mr-2" />;
      case "train":
        return <Train className="h-4 w-4 mr-2" />;
      case "tram":
        return <TrainFront className="h-4 w-4 mr-2" />; // Changed from Tram to TrainFront
      default:
        return <Bus className="h-4 w-4 mr-2" />;
    }
  };

  return (
    <div className="w-full">
      <Select
        value={selectedRouteId}
        onValueChange={handleChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a route">
            {selectedRoute && (
              <div className="flex items-center">
                {getTransportIcon(selectedRoute.transportType)}
                <span className="font-medium">{selectedRoute.name}</span>
                <span className="mx-1">-</span>
                <span className="text-sm text-muted-foreground">
                  {selectedRoute.origin} → {selectedRoute.destination}
                </span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {routes.map((route) => (
            <SelectItem 
              key={route.id} 
              value={route.id}
            >
              <div className="flex items-center">
                {getTransportIcon(route.transportType)}
                <span className="font-medium">{route.name}</span>
                <span className="mx-1">-</span>
                <span className="text-sm text-muted-foreground">
                  {route.origin} → {route.destination}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default RouteSelector;
