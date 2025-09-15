import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Phone, Mail, MapPin, User, DollarSign, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Worker {
  id: string;
  name: string;
  skill_type: string;
  phone: string;
  email: string;
  address: string;
  daily_rate: number;
}

interface WorkerStats {
  totalPayments: number;
  totalDaysWorked: number;
  paymentsCount: number;
  averageDailyEarning: number;
}

export default function ViewWorker() {
  const { id } = useParams();
  const { toast } = useToast();
  const [worker, setWorker] = useState<Worker | null>(null);
  const [stats, setStats] = useState<WorkerStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchWorkerDetails();
    }
  }, [id]);

  const fetchWorkerDetails = async () => {
    try {
      // Fetch worker details
      const { data: workerData, error: workerError } = await supabase
        .from("workers")
        .select("*")
        .eq("id", id)
        .single();

      if (workerError) throw workerError;

      // Fetch worker statistics
      const { data: paymentsData, error: paymentsError } = await supabase
        .from("worker_payments")
        .select("amount, days_worked")
        .eq("worker_id", id);

      if (paymentsError) throw paymentsError;

      const totalPayments = paymentsData?.reduce((sum, payment) => sum + Number(payment.amount), 0) || 0;
      const totalDaysWorked = paymentsData?.reduce((sum, payment) => sum + (payment.days_worked || 0), 0) || 0;
      const averageDailyEarning = totalDaysWorked > 0 ? totalPayments / totalDaysWorked : 0;

      setWorker(workerData);
      setStats({
        totalPayments,
        totalDaysWorked,
        paymentsCount: paymentsData?.length || 0,
        averageDailyEarning,
      });
    } catch (error) {
      console.error("Error fetching worker details:", error);
      toast({
        title: "Error",
        description: "Failed to fetch worker details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (!worker) {
    return <div className="text-center">Worker not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/workers">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Workers
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">{worker.name}</h1>
        </div>
        <Link to={`/workers/edit/${worker.id}`}>
          <Button variant="outline">Edit Worker</Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{stats?.totalPayments.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Days Worked</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalDaysWorked}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Rate</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{worker.daily_rate?.toLocaleString() || 'N/A'}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Daily Earning</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats?.averageDailyEarning.toFixed(0)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Worker Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>Skill: {worker.skill_type || 'N/A'}</span>
            </div>
            {worker.phone && (
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{worker.phone}</span>
              </div>
            )}
            {worker.email && (
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{worker.email}</span>
              </div>
            )}
            {worker.address && (
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{worker.address}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to={`/worker-payments/add?worker_id=${worker.id}`} className="block">
              <Button variant="outline" className="w-full justify-start">
                <DollarSign className="h-4 w-4 mr-2" />
                Add Payment
              </Button>
            </Link>
            <Button variant="outline" className="w-full justify-start" disabled>
              <Calendar className="h-4 w-4 mr-2" />
              View Schedule (Coming Soon)
              </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}