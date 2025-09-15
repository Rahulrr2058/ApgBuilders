import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

interface Expense {
  id?: string;
  site_id: string;
  vendor_id: string;
  description: string;
  amount: number;
  expense_date: string;
  category: string;
  receipt_url: string;
  notes: string;
  is_credit: boolean;
  credit_amount: number;
}

interface ExpenseFormProps {
  expense?: Expense;
  isEdit?: boolean;
}

export default function ExpenseForm({ expense, isEdit = false }: ExpenseFormProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [sites, setSites] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [formData, setFormData] = useState<Expense>({
    site_id: "",
    vendor_id: "",
    description: "",
    amount: 0,
    expense_date: new Date().toISOString().split('T')[0],
    category: "",
    receipt_url: "",
    notes: "",
    is_credit: false,
    credit_amount: 0,
    ...expense
  });

  useEffect(() => {
    fetchSites();
    fetchVendors();
  }, []);

  const fetchSites = async () => {
    const { data } = await supabase.from("sites").select("id, name").order("name");
    setSites(data || []);
  };

  const fetchVendors = async () => {
    const { data } = await supabase.from("vendors").select("id, name").order("name");
    setVendors(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEdit && expense?.id) {
        const { error } = await supabase
          .from("expenses")
          .update(formData)
          .eq("id", expense.id);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Expense updated successfully",
        });
      } else {
        const { error } = await supabase
          .from("expenses")
          .insert([formData]);
        
        if (error) throw error;
        
        toast({
          title: "Success", 
          description: "Expense created successfully",
        });
      }
      
      navigate("/expenses");
    } catch (error) {
      console.error("Error saving expense:", error);
      toast({
        title: "Error",
        description: "Failed to save expense",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" onClick={() => navigate("/expenses")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">{isEdit ? "Edit Expense" : "Add Expense"}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? "Update Expense Details" : "Create New Expense"}</CardTitle>
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
                <Label htmlFor="vendor_id">Vendor *</Label>
                <Select value={formData.vendor_id} onValueChange={(value) => setFormData({ ...formData, vendor_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    {vendors.map((vendor) => (
                      <SelectItem key={vendor.id} value={vendor.id}>
                        {vendor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <Label htmlFor="expense_date">Date</Label>
                <Input
                  id="expense_date"
                  type="date"
                  value={formData.expense_date}
                  onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., Materials, Services"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_credit"
                checked={formData.is_credit}
                onCheckedChange={(checked) => setFormData({ ...formData, is_credit: checked as boolean })}
              />
              <Label htmlFor="is_credit">This is a credit purchase</Label>
            </div>

            {formData.is_credit && (
              <div className="space-y-2">
                <Label htmlFor="credit_amount">Credit Amount (₹)</Label>
                <Input
                  id="credit_amount"
                  type="number"
                  value={formData.credit_amount}
                  onChange={(e) => setFormData({ ...formData, credit_amount: Number(e.target.value) })}
                  min="0"
                  step="0.01"
                  placeholder={`Max: ${formData.amount}`}
                />
                <p className="text-sm text-muted-foreground">
                  Leave empty to use the full amount as credit
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="receipt_url">Receipt URL</Label>
              <Input
                id="receipt_url"
                value={formData.receipt_url}
                onChange={(e) => setFormData({ ...formData, receipt_url: e.target.value })}
                placeholder="https://..."
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
                {loading ? "Saving..." : (isEdit ? "Update Expense" : "Create Expense")}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate("/expenses")}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}