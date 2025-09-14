import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import SiteForm from "@/components/forms/SiteForm";

export default function EditSite() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [site, setSite] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    
    const fetchSite = async () => {
      try {
        const { data, error } = await supabase
          .from("sites")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        setSite(data);
      } catch (error) {
        console.error("Error fetching site:", error);
        toast({
          title: "Error",
          description: "Failed to fetch site details",
          variant: "destructive",
        });
        navigate("/sites");
      } finally {
        setLoading(false);
      }
    };

    fetchSite();
  }, [id, navigate, toast]);

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  if (!site) {
    return <div className="flex items-center justify-center h-64">Site not found</div>;
  }

  return <SiteForm site={site} isEdit={true} />;
}