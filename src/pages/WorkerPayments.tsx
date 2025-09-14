import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Eye, Calendar, IndianRupee, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface WorkerPayment {
  id: string;
  amount: number;
  payment_date: string;
  days_worked: number;
  description: string;
  notes: string;
  site: { name: string };
  worker: { name: string };
  created_at: string;
}

export default function WorkerPayments() {
  const [payments, setPayments] = useState<WorkerPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("worker_payments")
        .select(`
          *,
          site:sites(name),
          worker:workers(name)
        `)
        .order("payment_date", { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      console.error("Error fetching worker payments:", error);
      toast({
        title: "Error",
        description: "Failed to fetch worker payments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Worker Payments</h1>
          <Button disabled>
            <Plus className="h-4 w-4 mr-2" />
            Add Payment
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-muted rounded mb-2"></div>
                <div className="h-4 bg-muted rounded mb-4"></div>
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-4 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Worker Payments</h1>
        <Button asChild>
          <Link to="/worker-payments/add">
            <Plus className="h-4 w-4 mr-2" />
            Add Payment
          </Link>
        </Button>
      </div>

      {payments.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
              <IndianRupee className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No payments yet</h3>
            <p className="text-muted-foreground mb-4">Get started by adding your first worker payment.</p>
            <Button asChild>
              <Link to="/worker-payments/add">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Payment
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {payments.map((payment) => (
            <Card key={payment.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">
                    {payment.description || "Worker Payment"}
                  </CardTitle>
                  {payment.days_worked && (
                    <Badge variant="secondary">
                      {payment.days_worked} days
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <IndianRupee className="h-4 w-4 mr-2" />
                    ₹{payment.amount.toLocaleString()}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    {new Date(payment.payment_date).toLocaleDateString()}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Site: {payment.site?.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Worker: {payment.worker?.name}
                  </p>
                  {payment.days_worked && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-2" />
                      {payment.days_worked} days worked
                    </div>
                  )}
                </div>

                {payment.notes && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {payment.notes}
                  </p>
                )}

                <div className="flex space-x-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <Link to={`/worker-payments/edit/${payment.id}`}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}