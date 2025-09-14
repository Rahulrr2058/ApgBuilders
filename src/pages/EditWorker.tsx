import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import WorkerForm from "@/components/forms/WorkerForm";

export default function EditWorker() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    
    const fetchWorker = async () => {
      try {
        const { data, error } = await supabase
          .from("workers")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        setWorker(data);
      } catch (error) {
        console.error("Error fetching worker:", error);
        toast({
          title: "Error",
          description: "Failed to fetch worker details",
          variant: "destructive",
        });
        navigate("/workers");
      } finally {
        setLoading(false);
      }
    };

    fetchWorker();
  }, [id, navigate, toast]);

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  if (!worker) {
    return <div className="flex items-center justify-center h-64">Worker not found</div>;
  }

  return <WorkerForm worker={worker} isEdit={true} />;
}