import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

interface WorkerPayment {
  id?: string;
  site_id: string;
  worker_id: string;
  amount: number;
  payment_date: string;
  days_worked: number;
  description: string;
  notes: string;
}

interface WorkerPaymentFormProps {
  workerPayment?: WorkerPayment;
  isEdit?: boolean;
}

export default function WorkerPaymentForm({ workerPayment, isEdit = false }: WorkerPaymentFormProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [sites, setSites] = useState<any[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [formData, setFormData] = useState<WorkerPayment>({
    site_id: "",
    worker_id: "",
    amount: 0,
    payment_date: new Date().toISOString().split('T')[0],
    days_worked: 0,
    description: "",
    notes: "",
    ...workerPayment
  });

  useEffect(() => {
    fetchSites();
    fetchWorkers();
  }, []);

  const fetchSites = async () => {
    const { data } = await supabase.from("sites").select("id, name").order("name");
    setSites(data || []);
  };

  const fetchWorkers = async () => {
    const { data } = await supabase.from("workers").select("id, name, daily_rate").order("name");
    setWorkers(data || []);
  };

  const calculateAmount = (workerId: string, days: number) => {
    const worker = workers.find(w => w.id === workerId);
    if (worker && worker.daily_rate && days) {
      setFormData(prev => ({ ...prev, amount: worker.daily_rate * days }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEdit && workerPayment?.id) {
        const { error } = await supabase
          .from("worker_payments")
          .update(formData)
          .eq("id", workerPayment.id);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Worker payment updated successfully",
        });
      } else {
        const { error } = await supabase
          .from("worker_payments")
          .insert([formData]);
        
        if (error) throw error;
        
        toast({
          title: "Success", 
          description: "Worker payment created successfully",
        });
      }
      
      navigate("/worker-payments");
    } catch (error) {
      console.error("Error saving worker payment:", error);
      toast({
        title: "Error",
        description: "Failed to save worker payment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" onClick={() => navigate("/worker-payments")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">{isEdit ? "Edit Worker Payment" : "Add Worker Payment"}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? "Update Payment Details" : "Create New Payment"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="site_id">Site *</Label>
                <Select value={formData.site_id} onValueChange={(value) => setFormData({ ...formData, site_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a site" />
                  </SelectTrigger>
                  <SelectContent>
                    {sites.map((site) => (
                      <SelectItem key={site.id} value={site.id}>
                        {site.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="worker_id">Worker *</Label>
                <Select 
                  value={formData.worker_id} 
                  onValueChange={(value) => {
                    setFormData({ ...formData, worker_id: value });
                    if (formData.days_worked) {
                      calculateAmount(value, formData.days_worked);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a worker" />
                  </SelectTrigger>
                  <SelectContent>
                    {workers.map((worker) => (
                      <SelectItem key={worker.id} value={worker.id}>
                        {worker.name} {worker.daily_rate && `(₹${worker.daily_rate}/day)`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="days_worked">Days Worked</Label>
                <Input
                  id="days_worked"
                  type="number"
                  value={formData.days_worked}
                  onChange={(e) => {
                    const days = Number(e.target.value);
                    setFormData({ ...formData, days_worked: days });
                    if (formData.worker_id) {
                      calculateAmount(formData.worker_id, days);
                    }
                  }}
                  min="0"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₹) *</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="payment_date">Payment Date</Label>
                <Input
                  id="payment_date"
                  type="date"
                  value={formData.payment_date}
                  onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Payment for work done"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex space-x-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : (isEdit ? "Update Payment" : "Create Payment")}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate("/worker-payments")}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}