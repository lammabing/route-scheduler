
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Clock } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface DepartureTime {
  id: string;
  time: string;
  created_at: string;
}

interface DepartureTimesManagerProps {
  scheduleId: string;
  scheduleName: string;
  onClose: () => void;
}

const DepartureTimesManager = ({ scheduleId, scheduleName, onClose }: DepartureTimesManagerProps) => {
  const [departureTimes, setDepartureTimes] = useState<DepartureTime[]>([]);
  const [newTime, setNewTime] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  // Fetch departure times for this schedule
  const fetchDepartureTimes = async () => {
    try {
      const { data, error } = await supabase
        .from('departure_times')
        .select('*')
        .eq('schedule_id', scheduleId)
        .order('time', { ascending: true });

      if (error) throw error;
      setDepartureTimes(data || []);
    } catch (error) {
      console.error('Error fetching departure times:', error);
      toast.error('Failed to load departure times');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartureTimes();
  }, [scheduleId]);

  const handleAddTime = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTime.trim()) return;

    setAdding(true);
    try {
      const { data, error } = await supabase
        .from('departure_times')
        .insert([{
          schedule_id: scheduleId,
          time: newTime
        }])
        .select()
        .single();

      if (error) throw error;

      setDepartureTimes(prev => [...prev, data].sort((a, b) => a.time.localeCompare(b.time)));
      setNewTime("");
      toast.success('Departure time added successfully');
    } catch (error) {
      console.error('Error adding departure time:', error);
      toast.error('Failed to add departure time');
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteTime = async (timeId: string) => {
    if (!confirm('Are you sure you want to delete this departure time?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('departure_times')
        .delete()
        .eq('id', timeId);

      if (error) throw error;

      setDepartureTimes(prev => prev.filter(time => time.id !== timeId));
      toast.success('Departure time deleted successfully');
    } catch (error) {
      console.error('Error deleting departure time:', error);
      toast.error('Failed to delete departure time');
    }
  };

  const formatTimeDisplay = (time: string) => {
    try {
      const [hours, minutes] = time.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } catch {
      return time;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-pulse space-y-4 w-full">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded-md w-full"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Departure Times</h3>
          <p className="text-sm text-muted-foreground">
            Managing times for: {scheduleName}
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {departureTimes.length} times
        </Badge>
      </div>

      {/* Add new departure time form */}
      <form onSubmit={handleAddTime} className="flex gap-2 items-end">
        <div className="flex-1">
          <Label htmlFor="new-time">Add Departure Time</Label>
          <Input
            id="new-time"
            type="time"
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
            placeholder="HH:MM"
            required
          />
        </div>
        <Button type="submit" disabled={adding}>
          <Plus className="h-4 w-4 mr-1" />
          {adding ? "Adding..." : "Add"}
        </Button>
      </form>

      {/* Departure times table */}
      {departureTimes.length === 0 ? (
        <div className="text-center py-8 border rounded-md bg-muted/30">
          <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">No departure times added yet</p>
          <p className="text-sm text-muted-foreground">Add your first departure time above</p>
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Formatted Display</TableHead>
                <TableHead>Added On</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departureTimes.map((departureTime) => (
                <TableRow key={departureTime.id}>
                  <TableCell className="font-mono">
                    {departureTime.time}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatTimeDisplay(departureTime.time)}
                  </TableCell>
                  <TableCell>
                    {new Date(departureTime.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteTime(departureTime.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="flex justify-end pt-4 border-t">
        <Button onClick={onClose}>Done</Button>
      </div>
    </div>
  );
};

export default DepartureTimesManager;
