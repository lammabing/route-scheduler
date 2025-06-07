
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Bell, Plus, Edit2, Trash2, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { format } from "date-fns";

const announcementSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be 200 characters or less"),
  content: z.string().min(1, "Content is required").max(1000, "Content must be 1000 characters or less"),
  urgency: z.enum(['info', 'important', 'urgent']),
  routeId: z.string().optional(),
  effectiveFrom: z.string().optional(),
  effectiveUntil: z.string().optional(),
});

type AnnouncementFormData = z.infer<typeof announcementSchema>;

interface DatabaseAnnouncement {
  id: string;
  title: string;
  content: string;
  route_id?: string;
  urgency: 'info' | 'important' | 'urgent';
  effective_from?: string;
  effective_until?: string;
  created_at: string;
  updated_at: string;
}

interface Route {
  id: string;
  name: string;
  origin: string;
  destination: string;
}

const AdminAnnouncements = () => {
  const [announcements, setAnnouncements] = useState<DatabaseAnnouncement[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<DatabaseAnnouncement | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AnnouncementFormData>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: "",
      content: "",
      urgency: "info",
      routeId: "",
      effectiveFrom: "",
      effectiveUntil: "",
    },
  });

  // Fetch announcements and routes
  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch announcements
      const { data: announcementsData, error: announcementsError } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });

      if (announcementsError) throw announcementsError;

      // Fetch routes
      const { data: routesData, error: routesError } = await supabase
        .from('routes')
        .select('id, name, origin, destination')
        .order('name', { ascending: true });

      if (routesError) throw routesError;

      setAnnouncements(announcementsData || []);
      setRoutes(routesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load announcements and routes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle form submission
  const onSubmit = async (data: AnnouncementFormData) => {
    try {
      setIsSubmitting(true);

      const announcementData = {
        title: data.title,
        content: data.content,
        urgency: data.urgency,
        route_id: data.routeId || null,
        effective_from: data.effectiveFrom || null,
        effective_until: data.effectiveUntil || null,
      };

      if (editingAnnouncement) {
        // Update existing announcement
        const { error } = await supabase
          .from('announcements')
          .update(announcementData)
          .eq('id', editingAnnouncement.id);

        if (error) throw error;
        toast.success('Announcement updated successfully');
      } else {
        // Create new announcement
        const { error } = await supabase
          .from('announcements')
          .insert(announcementData);

        if (error) throw error;
        toast.success('Announcement created successfully');
      }

      // Reset form and close dialog
      form.reset();
      setIsDialogOpen(false);
      setEditingAnnouncement(null);
      
      // Refresh the list
      await fetchData();
    } catch (error) {
      console.error('Error saving announcement:', error);
      toast.error(editingAnnouncement ? 'Failed to update announcement' : 'Failed to create announcement');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async (announcementId: string) => {
    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', announcementId);

      if (error) throw error;

      toast.success('Announcement deleted successfully');
      await fetchData();
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast.error('Failed to delete announcement');
    }
  };

  // Handle edit
  const handleEdit = (announcement: DatabaseAnnouncement) => {
    setEditingAnnouncement(announcement);
    form.setValue('title', announcement.title);
    form.setValue('content', announcement.content);
    form.setValue('urgency', announcement.urgency);
    form.setValue('routeId', announcement.route_id || '');
    form.setValue('effectiveFrom', announcement.effective_from || '');
    form.setValue('effectiveUntil', announcement.effective_until || '');
    setIsDialogOpen(true);
  };

  // Handle add new
  const handleAddNew = () => {
    setEditingAnnouncement(null);
    form.reset();
    setIsDialogOpen(true);
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'urgent':
        return <Badge variant="destructive">Urgent</Badge>;
      case 'important':
        return <Badge variant="secondary">Important</Badge>;
      case 'info':
      default:
        return <Badge variant="outline">Info</Badge>;
    }
  };

  const getRouteName = (routeId?: string) => {
    if (!routeId) return 'All Routes';
    const route = routes.find(r => r.id === routeId);
    return route ? `${route.name} (${route.origin} → ${route.destination})` : 'Unknown Route';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
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
          <h2 className="text-2xl font-bold">Announcement Management</h2>
          <p className="text-muted-foreground">Create and manage announcements that can be displayed on route schedules</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew} className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> Add New Announcement
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingAnnouncement ? 'Edit Announcement' : 'Add New Announcement'}
              </DialogTitle>
              <DialogDescription>
                {editingAnnouncement 
                  ? 'Update the announcement information below.'
                  : 'Create a new announcement that can be displayed to users.'
                }
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Service Disruption, Schedule Change" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter the announcement details..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="urgency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Urgency Level</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select urgency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="info">Info</SelectItem>
                            <SelectItem value="important">Important</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="routeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Route (Optional)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="All routes" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">All Routes</SelectItem>
                            {routes.map((route) => (
                              <SelectItem key={route.id} value={route.id}>
                                {route.name} ({route.origin} → {route.destination})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="effectiveFrom"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Effective From (Optional)</FormLabel>
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
                    name="effectiveUntil"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Effective Until (Optional)</FormLabel>
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
                </div>
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
                    {editingAnnouncement ? 'Update' : 'Create'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {announcements.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Bell className="h-16 w-16 text-muted-foreground mb-4" />
            <CardTitle className="mb-2">No Announcements Created</CardTitle>
            <CardDescription className="text-center max-w-md mb-4">
              Announcements can notify users about service disruptions, schedule changes, or important information.
            </CardDescription>
            <Button onClick={handleAddNew}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Announcement
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Announcements ({announcements.length})</CardTitle>
            <CardDescription>
              Manage announcements that can be displayed to users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Urgency</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Effective Period</TableHead>
                  <TableHead>Content</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {announcements.map((announcement) => (
                  <TableRow key={announcement.id}>
                    <TableCell className="font-medium">{announcement.title}</TableCell>
                    <TableCell>{getUrgencyBadge(announcement.urgency)}</TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate">
                        {getRouteName(announcement.route_id)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {announcement.effective_from || announcement.effective_until ? (
                          <>
                            {formatDate(announcement.effective_from)} - {formatDate(announcement.effective_until)}
                          </>
                        ) : (
                          'Ongoing'
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate" title={announcement.content}>
                        {announcement.content}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(announcement)}
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
                              <AlertDialogTitle>Delete Announcement</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete the announcement "{announcement.title}"? 
                                This action cannot be undone and the announcement will no longer be displayed to users.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(announcement.id)}
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

export default AdminAnnouncements;
