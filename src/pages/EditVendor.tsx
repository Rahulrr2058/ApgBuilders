import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import VendorForm from "@/components/forms/VendorForm";

export default function EditVendor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    
    const fetchVendor = async () => {
      try {
        const { data, error } = await supabase
          .from("vendors")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        setVendor(data);
      } catch (error) {
        console.error("Error fetching vendor:", error);
        toast({
          title: "Error",
          description: "Failed to fetch vendor details",
          variant: "destructive",
        });
        navigate("/vendors");
      } finally {
        setLoading(false);
      }
    };

    fetchVendor();
  }, [id, navigate, toast]);

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  if (!vendor) {
    return <div className="flex items-center justify-center h-64">Vendor not found</div>;
  }

  return <VendorForm vendor={vendor} isEdit={true} />;
}