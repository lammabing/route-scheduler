
import { Fare } from "@/types";
import { formatCurrency } from "@/utils/formatUtils";
import { Badge } from "@/components/ui/badge";

interface FareDisplayProps {
  fares: Fare[];
  compact?: boolean;
}

const FareDisplay = ({ fares, compact = false }: FareDisplayProps) => {
  const getFareTypeColor = (fareType: string) => {
    switch (fareType) {
      case "standard":
        return "bg-primary text-primary-foreground";
      case "concession":
        return "bg-blue-500 text-white";
      case "student":
        return "bg-green-500 text-white";
      case "senior":
        return "bg-purple-500 text-white";
      case "child":
        return "bg-amber-500 text-white";
      case "other":
        return "bg-slate-500 text-white";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (compact) {
    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {fares.map((fare) => (
          <Badge 
            key={fare.id}
            className={getFareTypeColor(fare.fareType)} 
            variant="outline"
          >
            {fare.name}: {formatCurrency(fare.price, fare.currency)}
          </Badge>
        ))}
      </div>
    );
  }

  return (
    <div className="mt-2 space-y-1">
      <h4 className="text-sm font-medium">Available Fares:</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
        {fares.map((fare) => (
          <div 
            key={fare.id}
            className="p-2 border rounded-md"
          >
            <div className="flex justify-between items-center">
              <Badge className={getFareTypeColor(fare.fareType)}>
                {fare.name}
              </Badge>
              <span className="font-bold">
                {formatCurrency(fare.price, fare.currency)}
              </span>
            </div>
            {fare.description && (
              <p className="text-xs text-muted-foreground mt-1">
                {fare.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FareDisplay;
