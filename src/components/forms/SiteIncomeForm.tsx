import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

interface SiteIncome {
  id?: string;
  site_id: string;
  description: string;
  amount: number;
  income_date: string;
  source: string;
  notes: string;
}

interface SiteIncomeFormProps {
  income?: SiteIncome;
  isEdit?: boolean;
}

export default function SiteIncomeForm({ income, isEdit = false }: SiteIncomeFormProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const { id } = useParams();
  
  const [formData, setFormData] = useState<SiteIncome>({
    site_id: searchParams.get('site_id') || income?.site_id || '',
    description: income?.description || '',
    amount: income?.amount || 0,
    income_date: income?.income_date || new Date().toISOString().split('T')[0],
    source: income?.source || '',
    notes: income?.notes || '',
  });
  
  const [sites, setSites] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSites();
    if (isEdit && id) {
      fetchIncomeDetails();
    }
  }, [isEdit, id]);

  const fetchSites = async () => {
    const { data, error } = await supabase
      .from("sites")
      .select("id, name")
      .order("name");
    
    if (error) {
      console.error("Error fetching sites:", error);
      toast({
        title: "Error",
        description: "Failed to fetch sites",
        variant: "destructive",
      });
    } else {
      setSites(data || []);
    }
  };

  const fetchIncomeDetails = async () => {
    if (!id) return;
    
    const { data, error } = await supabase
      .from("site_income")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching income details:", error);
      toast({
        title: "Error",
        description: "Failed to fetch income details",
        variant: "destructive",
      });
    } else if (data) {
      setFormData(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEdit && id) {
        const { error } = await supabase
          .from("site_income")
          .update(formData)
          .eq("id", id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Income updated successfully",
        });
      } else {
        const { error } = await supabase
          .from("site_income")
          .insert([formData]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Income added successfully",
        });
      }

      navigate("/income");
    } catch (error) {
      console.error("Error saving income:", error);
      toast({
        title: "Error",
        description: "Failed to save income",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof SiteIncome, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center space-x-4 mb-6">
        <Button variant="outline" size="sm" onClick={() => navigate("/income")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Income
        </Button>
        <h1 className="text-2xl font-bold">
          {isEdit ? "Edit Income" : "Add Site Income"}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? "Edit Income" : "Add New Income"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="site_id">Site</Label>
              <Select
                value={formData.site_id}
                onValueChange={(value) => handleInputChange('site_id', value)}
                required
              >
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

            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter income description"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <Label htmlFor="income_date">Income Date</Label>
                <Input
                  id="income_date"
                  type="date"
                  value={formData.income_date}
                  onChange={(e) => handleInputChange('income_date', e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="source">Source</Label>
              <Input
                id="source"
                value={formData.source}
                onChange={(e) => handleInputChange('source', e.target.value)}
                placeholder="e.g., Client Payment, Advance, etc."
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Additional notes (optional)"
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/income")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : (isEdit ? "Update Income" : "Add Income")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}