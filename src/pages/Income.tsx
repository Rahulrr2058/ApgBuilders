import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Eye, Edit, Trash2, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SiteIncome {
  id: string;
  site_id: string;
  description: string;
  amount: number;
  income_date: string;
  source: string;
  sites: { name: string };
}

export default function Income() {
  const { toast } = useToast();
  const [income, setIncome] = useState<SiteIncome[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIncome();
  }, []);

  const fetchIncome = async () => {
    try {
      const { data, error } = await supabase
        .from("site_income")
        .select(`
          *,
          sites (name)
        `)
        .order("income_date", { ascending: false });

      if (error) throw error;
      setIncome(data || []);
    } catch (error) {
      console.error("Error fetching income:", error);
      toast({
        title: "Error",
        description: "Failed to fetch income records",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteIncome = async (id: string) => {
    if (!confirm("Are you sure you want to delete this income record?")) return;

    try {
      const { error } = await supabase
        .from("site_income")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Income record deleted successfully",
      });
      
      fetchIncome();
    } catch (error) {
      console.error("Error deleting income:", error);
      toast({
        title: "Error",
        description: "Failed to delete income record",
        variant: "destructive",
      });
    }
  };

  const totalIncome = income.reduce((sum, item) => sum + Number(item.amount), 0);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Site Income</h1>
        <Link to="/income/add">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Income
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Income</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">₹{totalIncome.toLocaleString()}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Income Records</CardTitle>
        </CardHeader>
        <CardContent>
          {income.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No income records found</p>
              <Link to="/income/add">
                <Button>Add First Income Record</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {income.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.description}</h3>
                    <p className="text-sm text-muted-foreground">
                      Site: {item.sites?.name} • Date: {new Date(item.income_date).toLocaleDateString()}
                    </p>
                    {item.source && (
                      <p className="text-sm text-muted-foreground">Source: {item.source}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-semibold text-green-600">
                      ₹{Number(item.amount).toLocaleString()}
                    </span>
                    <div className="flex space-x-1">
                      <Link to={`/income/edit/${item.id}`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteIncome(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}