import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Calendar, DollarSign, Users, ShoppingCart, Receipt } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Site {
  id: string;
  name: string;
  location: string;
  description: string;
  status: string;
  start_date: string;
  end_date: string;
  budget: number;
}

interface SiteStats {
  totalExpenses: number;
  totalIncome: number;
  totalWorkerPayments: number;
  workersCount: number;
  vendorsCount: number;
  expensesCount: number;
}

export default function ViewSite() {
  const { id } = useParams();
  const { toast } = useToast();
  const [site, setSite] = useState<Site | null>(null);
  const [stats, setStats] = useState<SiteStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchSiteDetails();
    }
  }, [id]);

  const fetchSiteDetails = async () => {
    try {
      // Fetch site details
      const { data: siteData, error: siteError } = await supabase
        .from("sites")
        .select("*")
        .eq("id", id)
        .single();

      if (siteError) throw siteError;

      // Fetch site statistics
      const [expensesData, incomeData, paymentsData] = await Promise.all([
        supabase.from("expenses").select("amount").eq("site_id", id),
        supabase.from("site_income").select("amount").eq("site_id", id),
        supabase.from("worker_payments").select("amount").eq("site_id", id),
      ]);

      const totalExpenses = expensesData.data?.reduce((sum, expense) => sum + Number(expense.amount), 0) || 0;
      const totalIncome = incomeData.data?.reduce((sum, income) => sum + Number(income.amount), 0) || 0;
      const totalWorkerPayments = paymentsData.data?.reduce((sum, payment) => sum + Number(payment.amount), 0) || 0;

      setSite(siteData);
      setStats({
        totalExpenses,
        totalIncome,
        totalWorkerPayments,
        workersCount: 0, // Could be enhanced to count unique workers
        vendorsCount: 0, // Could be enhanced to count unique vendors
        expensesCount: expensesData.data?.length || 0,
      });
    } catch (error) {
      console.error("Error fetching site details:", error);
      toast({
        title: "Error",
        description: "Failed to fetch site details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (!site) {
    return <div className="text-center">Site not found</div>;
  }

  const netProfit = (stats?.totalIncome || 0) - (stats?.totalExpenses || 0) - (stats?.totalWorkerPayments || 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/sites">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Sites
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">{site.name}</h1>
        </div>
        <div className="flex space-x-2">
          <Link to={`/sites/edit/${site.id}`}>
            <Button variant="outline">Edit Site</Button>
          </Link>
          <Link to={`/income/add?site_id=${site.id}`}>
            <Button>Add Income</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{stats?.totalIncome.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">₹{stats?.totalExpenses.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Worker Payments</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">₹{stats?.totalWorkerPayments.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₹{netProfit.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Site Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{site.location}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>
                {site.start_date ? new Date(site.start_date).toLocaleDateString() : 'N/A'} - 
                {site.end_date ? new Date(site.end_date).toLocaleDateString() : 'Ongoing'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span>Budget: ₹{site.budget?.toLocaleString() || 'N/A'}</span>
            </div>
            <div>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                site.status === 'active' ? 'bg-green-100 text-green-800' : 
                site.status === 'completed' ? 'bg-blue-100 text-blue-800' : 
                'bg-gray-100 text-gray-800'
              }`}>
                {site.status}
              </span>
            </div>
            {site.description && (
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">{site.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to={`/expenses/add?site_id=${site.id}`} className="block">
              <Button variant="outline" className="w-full justify-start">
                <Receipt className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
            </Link>
            <Link to={`/worker-payments/add?site_id=${site.id}`} className="block">
              <Button variant="outline" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                Add Worker Payment
              </Button>
            </Link>
            <Link to={`/income/add?site_id=${site.id}`} className="block">
              <Button variant="outline" className="w-full justify-start">
                <DollarSign className="h-4 w-4 mr-2" />
                Add Income
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}