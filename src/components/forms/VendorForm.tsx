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

interface Vendor {
  id?: string;
  name: string;
  contact_person: string;
  phone: string;
  email: string;
  address: string;
  vendor_type: string;
}

interface VendorFormProps {
  vendor?: Vendor;
  isEdit?: boolean;
}

export default function VendorForm({ vendor, isEdit = false }: VendorFormProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Vendor>({
    name: "",
    contact_person: "",
    phone: "",
    email: "",
    address: "",
    vendor_type: "",
    ...vendor
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEdit && vendor?.id) {
        const { error } = await supabase
          .from("vendors")
          .update(formData)
          .eq("id", vendor.id);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Vendor updated successfully",
        });
      } else {
        const { error } = await supabase
          .from("vendors")
          .insert([formData]);
        
        if (error) throw error;
        
        toast({
          title: "Success", 
          description: "Vendor created successfully",
        });
      }
      
      navigate("/vendors");
    } catch (error) {
      console.error("Error saving vendor:", error);
      toast({
        title: "Error",
        description: "Failed to save vendor",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" onClick={() => navigate("/vendors")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">{isEdit ? "Edit Vendor" : "Add Vendor"}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? "Update Vendor Details" : "Create New Vendor"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Vendor Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contact_person">Contact Person</Label>
                <Input
                  id="contact_person"
                  value={formData.contact_person}
                  onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
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
              <Label htmlFor="vendor_type">Vendor Type</Label>
              <Input
                id="vendor_type"
                value={formData.vendor_type}
                onChange={(e) => setFormData({ ...formData, vendor_type: e.target.value })}
                placeholder="e.g., Materials, Services, Equipment"
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
                {loading ? "Saving..." : (isEdit ? "Update Vendor" : "Create Vendor")}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate("/vendors")}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}