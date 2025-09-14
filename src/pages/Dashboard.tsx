import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, ShoppingCart, Receipt } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Stats {
  totalSites: number;
  activeSites: number;
  totalVendors: number;
  totalWorkers: number;
  totalExpenses: number;
  totalWorkerPayments: number;
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
  const [stats, setStats] = useState<Stats>({
    totalSites: 0,
    activeSites: 0,
    totalVendors: 0,
    totalWorkers: 0,
    totalExpenses: 0,
    totalWorkerPayments: 0,
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
        { data: recentExpenses },
      ] = await Promise.all([
        supabase.from("sites").select("*", { count: "exact", head: true }),
        supabase.from("sites").select("*", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("vendors").select("*", { count: "exact", head: true }),
        supabase.from("workers").select("*", { count: "exact", head: true }),
        supabase.from("expenses").select("amount"),
        supabase.from("worker_payments").select("amount"),
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

      setStats({
        totalSites: totalSites || 0,
        activeSites: activeSites || 0,
        totalVendors: totalVendors || 0,
        totalWorkers: totalWorkers || 0,
        totalExpenses,
        totalWorkerPayments,
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

  const statCards = [
    {
      title: "Total Sites",
      value: stats.totalSites,
      subtitle: `${stats.activeSites} active`,
      icon: Building2,
      color: "text-primary",
    },
    {
      title: "Vendors",
      value: stats.totalVendors,
      subtitle: "Registered vendors",
      icon: ShoppingCart,
      color: "text-accent",
    },
    {
      title: "Workers",
      value: stats.totalWorkers,
      subtitle: "Registered workers",
      icon: Users,
      color: "text-secondary",
    },
    {
      title: "Total Expenses",
      value: `₹${stats.totalExpenses.toLocaleString()}`,
      subtitle: `₹${stats.totalWorkerPayments.toLocaleString()} to workers`,
      icon: Receipt,
      color: "text-destructive",
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