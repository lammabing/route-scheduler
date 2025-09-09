import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Plus, Edit, Trash2, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLocalSchedule } from "@/hooks/useLocalSchedule";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ScheduleForm from "./forms/ScheduleForm";
import DepartureTimesManager from "./DepartureTimesManager";
import { api } from "@/lib/local-api";

interface Schedule {
  id: string;
  route_id: string;
  name: string;
  effective_from?: string;
  effective_until?: string;
  is_weekend_schedule: boolean;
  is_holiday_schedule: boolean;
  created_at: string;
  routes?: {
    name: string;
    origin: string;
    destination: string;
  };
}

const AdminSchedules = () => {
  const { routes } = useLocalSchedule({});
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDepartureTimesDialogOpen, setIsDepartureTimesDialogOpen] = useState(false);

  // Fetch schedules from local API
  const fetchSchedules = async () => {
    try {
      const data = await api.getSchedules();
      setSchedules(data || []);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      toast.error('Failed to load schedules');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const handleCreateSchedule = async (scheduleData: any) => {
    try {
      await api.createSchedule(scheduleData);
      setIsCreateDialogOpen(false);
      toast.success('Schedule created successfully');
      fetchSchedules(); // Refresh the list
    } catch (error) {
      console.error('Error creating schedule:', error);
      toast.error('Failed to create schedule');
    }
  };

  const handleUpdateSchedule = async (scheduleData: any) => {
    if (!selectedSchedule) return;

    try {
      await api.updateSchedule(selectedSchedule.id, scheduleData);
      setIsEditDialogOpen(false);
      setSelectedSchedule(null);
      toast.success('Schedule updated successfully');
      fetchSchedules(); // Refresh the list
    } catch (error) {
      console.error('Error updating schedule:', error);
      toast.error('Failed to update schedule');
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (!confirm('Are you sure you want to delete this schedule? This will also delete all associated departure times.')) {
      return;
    }

    try {
      await api.deleteSchedule(scheduleId);
      setSchedules(prev => prev.filter(schedule => schedule.id !== scheduleId));
      toast.success('Schedule deleted successfully');
    } catch (error) {
      console.error('Error deleting schedule:', error);
      toast.error('Failed to delete schedule');
    }
  };

  const getScheduleTypeLabel = (schedule: Schedule) => {
    if (schedule.is_holiday_schedule) return 'Holiday';
    if (schedule.is_weekend_schedule) return 'Weekend';
    return 'Weekday';
  };

  const getScheduleTypeColor = (schedule: Schedule) => {
    if (schedule.is_holiday_schedule) return 'bg-purple-100 text-purple-800';
    if (schedule.is_weekend_schedule) return 'bg-blue-100 text-blue-800';
    return 'bg-green-100 text-green-800';
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-pulse space-y-4 w-full">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded-md w-full"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Schedule Management</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> Add New Schedule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Schedule</DialogTitle>
              <DialogDescription>
                Create a new schedule for a route with specific effective dates and type.
              </DialogDescription>
            </DialogHeader>
            <ScheduleForm
              routes={routes}
              onSubmit={handleCreateSchedule}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {schedules.length === 0 ? (
        <div className="rounded-md border p-6 bg-slate-50">
          <div className="flex flex-col items-center justify-center py-8">
            <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Schedules Found</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
              Create your first schedule to start managing departure times and route information.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" /> Create First Schedule
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Schedule Name</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Effective Period</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedules.map((schedule) => (
                <TableRow key={schedule.id}>
                  <TableCell className="font-medium">{schedule.name}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{schedule.routes?.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {schedule.routes?.origin} → {schedule.routes?.destination}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getScheduleTypeColor(schedule)}>
                      {getScheduleTypeLabel(schedule)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {schedule.effective_from ? (
                        <>
                          <div>From: {format(new Date(schedule.effective_from), "MMM d, yyyy")}</div>
                          {schedule.effective_until && (
                            <div>Until: {format(new Date(schedule.effective_until), "MMM d, yyyy")}</div>
                          )}
                          {!schedule.effective_until && (
                            <div className="text-muted-foreground">Ongoing</div>
                          )}
                        </>
                      ) : (
                        <span className="text-muted-foreground">No date specified</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(schedule.created_at), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedSchedule(schedule);
                          setIsDepartureTimesDialogOpen(true);
                        }}
                      >
                        <Clock className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedSchedule(schedule);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteSchedule(schedule.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Edit Schedule Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Schedule</DialogTitle>
            <DialogDescription>
              Update the schedule information and effective dates.
            </DialogDescription>
          </DialogHeader>
          {selectedSchedule && (
            <ScheduleForm
              routes={routes}
              initialData={selectedSchedule}
              onSubmit={handleUpdateSchedule}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setSelectedSchedule(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Departure Times Dialog */}
      <Dialog open={isDepartureTimesDialogOpen} onOpenChange={setIsDepartureTimesDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Departure Times</DialogTitle>
            <DialogDescription>
              Add and manage departure times for {selectedSchedule?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedSchedule && (
            <DepartureTimesManager
              scheduleId={selectedSchedule.id}
              scheduleName={selectedSchedule.name}
              onClose={() => {
                setIsDepartureTimesDialogOpen(false);
                setSelectedSchedule(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSchedules;