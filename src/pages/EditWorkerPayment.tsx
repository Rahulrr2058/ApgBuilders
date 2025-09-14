import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import WorkerPaymentForm from "@/components/forms/WorkerPaymentForm";

export default function EditWorkerPayment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [workerPayment, setWorkerPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    
    const fetchWorkerPayment = async () => {
      try {
        const { data, error } = await supabase
          .from("worker_payments")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        setWorkerPayment(data);
      } catch (error) {
        console.error("Error fetching worker payment:", error);
        toast({
          title: "Error",
          description: "Failed to fetch worker payment details",
          variant: "destructive",
        });
        navigate("/worker-payments");
      } finally {
        setLoading(false);
      }
    };

    fetchWorkerPayment();
  }, [id, navigate, toast]);

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  if (!workerPayment) {
    return <div className="flex items-center justify-center h-64">Worker payment not found</div>;
  }

  return <WorkerPaymentForm workerPayment={workerPayment} isEdit={true} />;
}