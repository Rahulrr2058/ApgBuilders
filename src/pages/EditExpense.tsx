import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ExpenseForm from "@/components/forms/ExpenseForm";

export default function EditExpense() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    
    const fetchExpense = async () => {
      try {
        const { data, error } = await supabase
          .from("expenses")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        setExpense(data);
      } catch (error) {
        console.error("Error fetching expense:", error);
        toast({
          title: "Error",
          description: "Failed to fetch expense details",
          variant: "destructive",
        });
        navigate("/expenses");
      } finally {
        setLoading(false);
      }
    };

    fetchExpense();
  }, [id, navigate, toast]);

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  if (!expense) {
    return <div className="flex items-center justify-center h-64">Expense not found</div>;
  }

  return <ExpenseForm expense={expense} isEdit={true} />;
}