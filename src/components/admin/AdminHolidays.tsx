
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Calendar, Plus, Edit2, Trash2, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { format } from "date-fns";

const holidaySchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be 100 characters or less"),
  date: z.string().min(1, "Date is required"),
  description: z.string().optional(),
});

type HolidayFormData = z.infer<typeof holidaySchema>;

interface DatabaseHoliday {
  id: string;
  name: string;
  date: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

const AdminHolidays = () => {
  const [holidays, setHolidays] = useState<DatabaseHoliday[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<DatabaseHoliday | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<HolidayFormData>({
    resolver: zodResolver(holidaySchema),
    defaultValues: {
      name: "",
      date: "",
      description: "",
    },
  });

  // Fetch holidays
  const fetchHolidays = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('public_holidays')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;
      setHolidays(data || []);
    } catch (error) {
      console.error('Error fetching holidays:', error);
      toast.error('Failed to load holidays');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  // Handle form submission
  const onSubmit = async (data: HolidayFormData) => {
    try {
      setIsSubmitting(true);

      if (editingHoliday) {
        // Update existing holiday
        const { error } = await supabase
          .from('public_holidays')
          .update({
            name: data.name,
            date: data.date,
            description: data.description,
          })
          .eq('id', editingHoliday.id);

        if (error) throw error;
        toast.success('Holiday updated successfully');
      } else {
        // Create new holiday
        const { error } = await supabase
          .from('public_holidays')
          .insert({
            name: data.name,
            date: data.date,
            description: data.description,
          });

        if (error) throw error;
        toast.success('Holiday created successfully');
      }

      // Reset form and close dialog
      form.reset();
      setIsDialogOpen(false);
      setEditingHoliday(null);
      
      // Refresh the list
      await fetchHolidays();
    } catch (error) {
      console.error('Error saving holiday:', error);
      toast.error(editingHoliday ? 'Failed to update holiday' : 'Failed to create holiday');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async (holidayId: string) => {
    try {
      const { error } = await supabase
        .from('public_holidays')
        .delete()
        .eq('id', holidayId);

      if (error) throw error;

      toast.success('Holiday deleted successfully');
      await fetchHolidays();
    } catch (error) {
      console.error('Error deleting holiday:', error);
      toast.error('Failed to delete holiday');
    }
  };

  // Handle edit
  const handleEdit = (holiday: DatabaseHoliday) => {
    setEditingHoliday(holiday);
    form.setValue('name', holiday.name);
    form.setValue('date', holiday.date);
    form.setValue('description', holiday.description || '');
    setIsDialogOpen(true);
  };

  // Handle add new
  const handleAddNew = () => {
    setEditingHoliday(null);
    form.reset();
    setIsDialogOpen(true);
  };

  const formatDateDisplay = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMMM d, yyyy');
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Holiday Management</h2>
          <p className="text-muted-foreground">Manage public holidays that affect schedule operations</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew} className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> Add New Holiday
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingHoliday ? 'Edit Holiday' : 'Add New Holiday'}
              </DialogTitle>
              <DialogDescription>
                {editingHoliday 
                  ? 'Update the holiday information below.'
                  : 'Create a new public holiday that can affect schedule operations.'
                }
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Holiday Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., New Year's Day, Christmas" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Additional information about this holiday..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {editingHoliday ? 'Update' : 'Create'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {holidays.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
            <CardTitle className="mb-2">No Holidays Created</CardTitle>
            <CardDescription className="text-center max-w-md mb-4">
              Public holidays can affect schedule operations and may trigger holiday schedules.
            </CardDescription>
            <Button onClick={handleAddNew}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Holiday
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Public Holidays ({holidays.length})</CardTitle>
            <CardDescription>
              Manage holidays that can affect schedule operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Holiday Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {holidays.map((holiday) => (
                  <TableRow key={holiday.id}>
                    <TableCell className="font-medium">{holiday.name}</TableCell>
                    <TableCell>
                      <div className="font-mono">
                        {formatDateDisplay(holiday.date)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {holiday.description && (
                        <div className="max-w-xs truncate" title={holiday.description}>
                          {holiday.description}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(holiday)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Holiday</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete the holiday "{holiday.name}"? 
                                This action cannot be undone and may affect schedule operations.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(holiday.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminHolidays;
