import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

interface Worker {
  id?: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  skill_type: string;
  daily_rate: number;
}

interface WorkerFormProps {
  worker?: Worker;
  isEdit?: boolean;
}

export default function WorkerForm({ worker, isEdit = false }: WorkerFormProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Worker>({
    name: "",
    phone: "",
    email: "",
    address: "",
    skill_type: "",
    daily_rate: 0,
    ...worker
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEdit && worker?.id) {
        const { error } = await supabase
          .from("workers")
          .update(formData)
          .eq("id", worker.id);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Worker updated successfully",
        });
      } else {
        const { error } = await supabase
          .from("workers")
          .insert([formData]);
        
        if (error) throw error;
        
        toast({
          title: "Success", 
          description: "Worker created successfully",
        });
      }
      
      navigate("/workers");
    } catch (error) {
      console.error("Error saving worker:", error);
      toast({
        title: "Error",
        description: "Failed to save worker",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" onClick={() => navigate("/workers")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">{isEdit ? "Edit Worker" : "Add Worker"}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? "Update Worker Details" : "Create New Worker"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Worker Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="skill_type">Skill Type</Label>
                <Input
                  id="skill_type"
                  value={formData.skill_type}
                  onChange={(e) => setFormData({ ...formData, skill_type: e.target.value })}
                  placeholder="e.g., Carpenter, Mason, Electrician"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="daily_rate">Daily Rate (₹)</Label>
              <Input
                id="daily_rate"
                type="number"
                value={formData.daily_rate}
                onChange={(e) => setFormData({ ...formData, daily_rate: Number(e.target.value) })}
                min="0"
                step="0.01"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex space-x-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : (isEdit ? "Update Worker" : "Create Worker")}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate("/workers")}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}