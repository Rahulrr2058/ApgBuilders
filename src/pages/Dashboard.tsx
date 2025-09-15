import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Users, ShoppingCart, Receipt, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Stats {
  totalSites: number;
  activeSites: number;
  totalVendors: number;
  totalWorkers: number;
  totalExpenses: number;
  totalWorkerPayments: number;
  totalIncome: number;
  netProfit: number;
  recentExpenses: Array<{
    id: string;
    description: string;
    amount: number;
    expense_date: string;
    site_name: string;
    vendor_name: string;
  }>;
}

export default function Dashboard() {
  const { toast } = useToast();
  const [stats, setStats] = useState<Stats>({
    totalSites: 0,
    activeSites: 0,
    totalVendors: 0,
    totalWorkers: 0,
    totalExpenses: 0,
    totalWorkerPayments: 0,
    totalIncome: 0,
    netProfit: 0,
    recentExpenses: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Fetch counts
      const [
        { count: totalSites },
        { count: activeSites },
        { count: totalVendors },
        { count: totalWorkers },
        { data: expensesSum },
        { data: paymentsSum },
        { data: incomeSum },
        { data: recentExpenses },
      ] = await Promise.all([
        supabase.from("sites").select("*", { count: "exact", head: true }),
        supabase.from("sites").select("*", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("vendors").select("*", { count: "exact", head: true }),
        supabase.from("workers").select("*", { count: "exact", head: true }),
        supabase.from("expenses").select("amount"),
        supabase.from("worker_payments").select("amount"),
        supabase.from("site_income").select("amount"),
        supabase
          .from("expenses")
          .select(`
            id,
            description,
            amount,
            expense_date,
            sites(name),
            vendors(name)
          `)
          .order("expense_date", { ascending: false })
          .limit(5),
      ]);

      const totalExpenses = expensesSum?.reduce((sum: number, item: any) => sum + (item.amount || 0), 0) || 0;
      const totalWorkerPayments = paymentsSum?.reduce((sum: number, item: any) => sum + (item.amount || 0), 0) || 0;
      const totalIncome = incomeSum?.reduce((sum: number, item: any) => sum + (item.amount || 0), 0) || 0;
      const netProfit = totalIncome - totalExpenses - totalWorkerPayments;

      setStats({
        totalSites: totalSites || 0,
        activeSites: activeSites || 0,
        totalVendors: totalVendors || 0,
        totalWorkers: totalWorkers || 0,
        totalExpenses,
        totalWorkerPayments,
        totalIncome,
        netProfit,
        recentExpenses: recentExpenses?.map((expense: any) => ({
          id: expense.id,
          description: expense.description,
          amount: expense.amount,
          expense_date: expense.expense_date,
          site_name: expense.sites?.name || "Unknown Site",
          vendor_name: expense.vendors?.name || "Unknown Vendor",
        })) || [],
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = async () => {
    try {
      const { data: sites, error: sitesError } = await supabase
        .from("sites")
        .select(`
          *,
          expenses(*),
          worker_payments(*),
          site_income(*)
        `);

      if (sitesError) throw sitesError;

      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "Site Name,Location,Status,Budget,Total Income,Total Expenses,Worker Payments,Net Profit\n";

      sites?.forEach((site: any) => {
        const siteIncome = site.site_income?.reduce((sum: number, income: any) => sum + Number(income.amount), 0) || 0;
        const siteExpenses = site.expenses?.reduce((sum: number, expense: any) => sum + Number(expense.amount), 0) || 0;
        const sitePayments = site.worker_payments?.reduce((sum: number, payment: any) => sum + Number(payment.amount), 0) || 0;
        const netProfit = siteIncome - siteExpenses - sitePayments;

        csvContent += `"${site.name}","${site.location || ''}","${site.status}","${site.budget || 0}","${siteIncome}","${siteExpenses}","${sitePayments}","${netProfit}"\n`;
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `apgbuilders-data-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Success",
        description: "Data exported successfully",
      });
    } catch (error) {
      console.error("Error exporting data:", error);
      toast({
        title: "Error",
        description: "Failed to export data",
        variant: "destructive",
      });
    }
  };

  const statCards = [
    {
      title: "Total Sites",
      value: stats.totalSites,
      subtitle: `${stats.activeSites} active`,
      icon: Building2,
      color: "text-primary",
    },
    {
      title: "Total Income",
      value: `₹${stats.totalIncome.toLocaleString()}`,
      subtitle: "Total revenue",
      icon: Receipt,
      color: "text-green-600",
    },
    {
      title: "Total Expenses",
      value: `₹${stats.totalExpenses.toLocaleString()}`,
      subtitle: `₹${stats.totalWorkerPayments.toLocaleString()} to workers`,
      icon: Receipt,
      color: "text-red-600",
    },
    {
      title: "Net Profit",
      value: `₹${stats.netProfit.toLocaleString()}`,
      subtitle: stats.netProfit >= 0 ? "Profit" : "Loss",
      icon: Receipt,
      color: stats.netProfit >= 0 ? "text-green-600" : "text-red-600",
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-8 bg-muted rounded mb-2"></div>
                <div className="h-6 bg-muted rounded mb-1"></div>
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
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex items-center space-x-2">
          <Button onClick={exportToCSV} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
        <p className="text-muted-foreground">Welcome to ApgBuilders Management System</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                  <p className="text-2xl font-bold">{card.value}</p>
                  <p className="text-xs text-muted-foreground">{card.subtitle}</p>
                </div>
                <card.icon className={`h-8 w-8 ${card.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Expenses */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentExpenses.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No expenses recorded yet.</p>
          ) : (
            <div className="space-y-4">
              {stats.recentExpenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <h4 className="font-medium">{expense.description}</h4>
                    <p className="text-sm text-muted-foreground">
                      {expense.site_name} • {expense.vendor_name}
                    </p>
                    <p className="text-xs text-muted-foreground">{expense.expense_date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">₹{expense.amount.toLocaleString()}</p>
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