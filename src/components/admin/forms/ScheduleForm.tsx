
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Route } from "@/types";

interface ScheduleFormProps {
  routes: Route[];
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const ScheduleForm = ({ routes, initialData, onSubmit, onCancel }: ScheduleFormProps) => {
  const [formData, setFormData] = useState({
    name: "",
    route_id: "",
    effective_from: "",
    effective_until: "",
    is_weekend_schedule: false,
    is_holiday_schedule: false,
  });

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        route_id: initialData.route_id || "",
        effective_from: initialData.effective_from || "",
        effective_until: initialData.effective_until || "",
        is_weekend_schedule: initialData.is_weekend_schedule || false,
        is_holiday_schedule: initialData.is_holiday_schedule || false,
      });
    } else {
      setFormData({
        name: "",
        route_id: "",
        effective_from: "",
        effective_until: "",
        is_weekend_schedule: false,
        is_holiday_schedule: false,
      });
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      effective_from: formData.effective_from || null,
      effective_until: formData.effective_until || null,
    };
    
    onSubmit(submitData);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Schedule Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder="e.g., Weekday Morning Schedule"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="route">Route</Label>
          <Select
            value={formData.route_id}
            onValueChange={(value) => handleInputChange("route_id", value)}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a route" />
            </SelectTrigger>
            <SelectContent>
              {routes.map((route) => (
                <SelectItem key={route.id} value={route.id}>
                  {route.name} ({route.origin} → {route.destination})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="effective_from">Effective From</Label>
          <Input
            id="effective_from"
            type="date"
            value={formData.effective_from}
            onChange={(e) => handleInputChange("effective_from", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="effective_until">Effective Until (Optional)</Label>
          <Input
            id="effective_until"
            type="date"
            value={formData.effective_until}
            onChange={(e) => handleInputChange("effective_until", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label>Schedule Type</Label>
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_weekend_schedule"
              checked={formData.is_weekend_schedule}
              onCheckedChange={(checked) => handleInputChange("is_weekend_schedule", checked)}
            />
            <Label htmlFor="is_weekend_schedule">Weekend Schedule</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_holiday_schedule"
              checked={formData.is_holiday_schedule}
              onCheckedChange={(checked) => handleInputChange("is_holiday_schedule", checked)}
            />
            <Label htmlFor="is_holiday_schedule">Holiday Schedule</Label>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Leave both unchecked for a regular weekday schedule.
        </p>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {initialData ? "Update Schedule" : "Create Schedule"}
        </Button>
      </div>
    </form>
  );
};

export default ScheduleForm;
