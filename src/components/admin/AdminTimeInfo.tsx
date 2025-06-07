
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Info, Plus, Edit2, Trash2, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { TimeInfo } from "@/types";

const timeInfoSchema = z.object({
  symbol: z.string().min(1, "Symbol is required").max(5, "Symbol must be 5 characters or less"),
  description: z.string().min(1, "Description is required").max(255, "Description must be 255 characters or less"),
});

type TimeInfoFormData = z.infer<typeof timeInfoSchema>;

const AdminTimeInfo = () => {
  const [timeInfos, setTimeInfos] = useState<TimeInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTimeInfo, setEditingTimeInfo] = useState<TimeInfo | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<TimeInfoFormData>({
    resolver: zodResolver(timeInfoSchema),
    defaultValues: {
      symbol: "",
      description: "",
    },
  });

  // Fetch time infos
  const fetchTimeInfos = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('time_infos')
        .select('*')
        .order('symbol');

      if (error) throw error;

      const formattedTimeInfos: TimeInfo[] = data.map(info => ({
        id: info.id,
        symbol: info.symbol,
        description: info.description
      }));

      setTimeInfos(formattedTimeInfos);
    } catch (error) {
      console.error('Error fetching time infos:', error);
      toast.error('Failed to load time infos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeInfos();
  }, []);

  // Handle form submission
  const onSubmit = async (data: TimeInfoFormData) => {
    try {
      setIsSubmitting(true);

      if (editingTimeInfo) {
        // Update existing time info
        const { error } = await supabase
          .from('time_infos')
          .update({
            symbol: data.symbol,
            description: data.description,
          })
          .eq('id', editingTimeInfo.id);

        if (error) throw error;
        toast.success('Time info updated successfully');
      } else {
        // Create new time info
        const { error } = await supabase
          .from('time_infos')
          .insert({
            symbol: data.symbol,
            description: data.description,
          });

        if (error) throw error;
        toast.success('Time info created successfully');
      }

      // Reset form and close dialog
      form.reset();
      setIsDialogOpen(false);
      setEditingTimeInfo(null);
      
      // Refresh the list
      await fetchTimeInfos();
    } catch (error) {
      console.error('Error saving time info:', error);
      toast.error(editingTimeInfo ? 'Failed to update time info' : 'Failed to create time info');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async (timeInfoId: string) => {
    try {
      const { error } = await supabase
        .from('time_infos')
        .delete()
        .eq('id', timeInfoId);

      if (error) throw error;

      toast.success('Time info deleted successfully');
      await fetchTimeInfos();
    } catch (error) {
      console.error('Error deleting time info:', error);
      toast.error('Failed to delete time info');
    }
  };

  // Handle edit
  const handleEdit = (timeInfo: TimeInfo) => {
    setEditingTimeInfo(timeInfo);
    form.setValue('symbol', timeInfo.symbol);
    form.setValue('description', timeInfo.description);
    setIsDialogOpen(true);
  };

  // Handle add new
  const handleAddNew = () => {
    setEditingTimeInfo(null);
    form.reset();
    setIsDialogOpen(true);
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
          <h2 className="text-2xl font-bold">Time Info Management</h2>
          <p className="text-muted-foreground">Manage symbols and descriptions for departure time notations</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew} className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> Add New Time Info
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingTimeInfo ? 'Edit Time Info' : 'Add New Time Info'}
              </DialogTitle>
              <DialogDescription>
                {editingTimeInfo 
                  ? 'Update the symbol and description for this time info.'
                  : 'Create a new time info symbol that can be associated with departure times.'
                }
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="symbol"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Symbol</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., *, †, ‡" {...field} />
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
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe what this symbol means..."
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
                    {editingTimeInfo ? 'Update' : 'Create'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {timeInfos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Info className="h-16 w-16 text-muted-foreground mb-4" />
            <CardTitle className="mb-2">No Time Infos Created</CardTitle>
            <CardDescription className="text-center max-w-md mb-4">
              Time infos are symbols that can be associated with departure times to provide additional information to passengers.
            </CardDescription>
            <Button onClick={handleAddNew}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Time Info
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Time Info Symbols ({timeInfos.length})</CardTitle>
            <CardDescription>
              Manage symbols that can be associated with departure times
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {timeInfos.map((timeInfo) => (
                  <TableRow key={timeInfo.id}>
                    <TableCell>
                      <span className="font-mono text-lg font-semibold px-2 py-1 bg-primary text-primary-foreground rounded">
                        {timeInfo.symbol}
                      </span>
                    </TableCell>
                    <TableCell>{timeInfo.description}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(timeInfo)}
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
                              <AlertDialogTitle>Delete Time Info</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete the time info "{timeInfo.symbol}"? 
                                This action cannot be undone and may affect existing schedules.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(timeInfo.id)}
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

export default AdminTimeInfo;
