
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
import { Tag, Plus, Edit2, Trash2, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Fare } from "@/types";
import { FareType, CurrencyCode } from "@/types/database.types";

const fareSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be 100 characters or less"),
  fare_type: z.enum(["standard", "concession", "student", "senior", "child", "other"]),
  price: z.number().min(0, "Price must be a positive number"),
  currency: z.enum(["USD", "EUR", "GBP", "JPY", "AUD", "CAD"]),
  description: z.string().optional(),
  schedule_id: z.string().min(1, "Schedule is required"),
});

type FareFormData = z.infer<typeof fareSchema>;

interface DatabaseFare {
  id: string;
  name: string;
  fare_type: FareType;
  price: number;
  currency: CurrencyCode;
  description?: string;
  schedule_id: string;
  created_at: string;
  updated_at: string;
  schedules?: {
    name: string;
    routes?: {
      name: string;
    };
  };
}

interface Schedule {
  id: string;
  name: string;
  route_id: string;
  routes?: {
    name: string;
  };
}

const AdminFares = () => {
  const [fares, setFares] = useState<DatabaseFare[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFare, setEditingFare] = useState<DatabaseFare | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FareFormData>({
    resolver: zodResolver(fareSchema),
    defaultValues: {
      name: "",
      fare_type: "standard",
      price: 0,
      currency: "USD",
      description: "",
      schedule_id: "",
    },
  });

  // Fetch fares
  const fetchFares = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('fares')
        .select(`
          *,
          schedules (
            name,
            routes (
              name
            )
          )
        `)
        .order('name');

      if (error) throw error;
      setFares(data || []);
    } catch (error) {
      console.error('Error fetching fares:', error);
      toast.error('Failed to load fares');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch schedules
  const fetchSchedules = async () => {
    try {
      const { data, error } = await supabase
        .from('schedules')
        .select(`
          id,
          name,
          route_id,
          routes (
            name
          )
        `)
        .order('name');

      if (error) throw error;
      setSchedules(data || []);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      toast.error('Failed to load schedules');
    }
  };

  useEffect(() => {
    fetchFares();
    fetchSchedules();
  }, []);

  // Handle form submission
  const onSubmit = async (data: FareFormData) => {
    try {
      setIsSubmitting(true);

      if (editingFare) {
        // Update existing fare
        const { error } = await supabase
          .from('fares')
          .update({
            name: data.name,
            fare_type: data.fare_type,
            price: data.price,
            currency: data.currency,
            description: data.description,
            schedule_id: data.schedule_id,
          })
          .eq('id', editingFare.id);

        if (error) throw error;
        toast.success('Fare updated successfully');
      } else {
        // Create new fare
        const { error } = await supabase
          .from('fares')
          .insert({
            name: data.name,
            fare_type: data.fare_type,
            price: data.price,
            currency: data.currency,
            description: data.description,
            schedule_id: data.schedule_id,
          });

        if (error) throw error;
        toast.success('Fare created successfully');
      }

      // Reset form and close dialog
      form.reset();
      setIsDialogOpen(false);
      setEditingFare(null);
      
      // Refresh the list
      await fetchFares();
    } catch (error) {
      console.error('Error saving fare:', error);
      toast.error(editingFare ? 'Failed to update fare' : 'Failed to create fare');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async (fareId: string) => {
    try {
      const { error } = await supabase
        .from('fares')
        .delete()
        .eq('id', fareId);

      if (error) throw error;

      toast.success('Fare deleted successfully');
      await fetchFares();
    } catch (error) {
      console.error('Error deleting fare:', error);
      toast.error('Failed to delete fare');
    }
  };

  // Handle edit
  const handleEdit = (fare: DatabaseFare) => {
    setEditingFare(fare);
    form.setValue('name', fare.name);
    form.setValue('fare_type', fare.fare_type);
    form.setValue('price', fare.price);
    form.setValue('currency', fare.currency);
    form.setValue('description', fare.description || '');
    form.setValue('schedule_id', fare.schedule_id);
    setIsDialogOpen(true);
  };

  // Handle add new
  const handleAddNew = () => {
    setEditingFare(null);
    form.reset();
    setIsDialogOpen(true);
  };

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

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
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
          <h2 className="text-2xl font-bold">Fare Management</h2>
          <p className="text-muted-foreground">Manage fares for different passenger types and schedules</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew} className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> Add New Fare
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingFare ? 'Edit Fare' : 'Add New Fare'}
              </DialogTitle>
              <DialogDescription>
                {editingFare 
                  ? 'Update the fare information below.'
                  : 'Create a new fare that can be associated with schedules.'
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
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Adult, Student, Senior" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fare_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fare Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select fare type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="concession">Concession</SelectItem>
                          <SelectItem value="student">Student</SelectItem>
                          <SelectItem value="senior">Senior</SelectItem>
                          <SelectItem value="child">Child</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Currency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="EUR">EUR</SelectItem>
                            <SelectItem value="GBP">GBP</SelectItem>
                            <SelectItem value="JPY">JPY</SelectItem>
                            <SelectItem value="AUD">AUD</SelectItem>
                            <SelectItem value="CAD">CAD</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="schedule_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Schedule</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select schedule" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {schedules.map((schedule) => (
                            <SelectItem key={schedule.id} value={schedule.id}>
                              {schedule.name} {schedule.routes?.name && `(${schedule.routes.name})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                          placeholder="Additional information about this fare..."
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
                    {editingFare ? 'Update' : 'Create'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {fares.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Tag className="h-16 w-16 text-muted-foreground mb-4" />
            <CardTitle className="mb-2">No Fares Created</CardTitle>
            <CardDescription className="text-center max-w-md mb-4">
              Fares define pricing for different passenger types and can be associated with specific schedules.
            </CardDescription>
            <Button onClick={handleAddNew}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Fare
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Fares ({fares.length})</CardTitle>
            <CardDescription>
              Manage pricing for different passenger types across your schedules
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fares.map((fare) => (
                  <TableRow key={fare.id}>
                    <TableCell className="font-medium">{fare.name}</TableCell>
                    <TableCell>
                      <Badge className={getFareTypeColor(fare.fare_type)}>
                        {fare.fare_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono font-semibold">
                      {formatCurrency(fare.price, fare.currency)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{fare.schedules?.name}</div>
                        {fare.schedules?.routes?.name && (
                          <div className="text-sm text-muted-foreground">
                            {fare.schedules.routes.name}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {fare.description && (
                        <div className="max-w-xs truncate" title={fare.description}>
                          {fare.description}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(fare)}
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
                              <AlertDialogTitle>Delete Fare</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete the fare "{fare.name}"? 
                                This action cannot be undone and may affect existing bookings.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(fare.id)}
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

export default AdminFares;
