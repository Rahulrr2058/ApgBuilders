-- Create sites table
CREATE TABLE public.sites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT,
  description TEXT,
  start_date DATE,
  end_date DATE,
  budget DECIMAL(12,2),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create vendors table
CREATE TABLE public.vendors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  vendor_type TEXT, -- materials, services, equipment, etc.
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create workers table
CREATE TABLE public.workers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  skill_type TEXT, -- carpenter, mason, electrician, etc.
  daily_rate DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create expenses table (purchases from vendors)
CREATE TABLE public.expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  category TEXT, -- materials, services, equipment, etc.
  receipt_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create worker payments table
CREATE TABLE public.worker_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES public.workers(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  days_worked INTEGER,
  description TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS) for all tables
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_payments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allowing all operations for now - can be restricted later with auth)
CREATE POLICY "Enable all operations for sites" ON public.sites FOR ALL USING (true);
CREATE POLICY "Enable all operations for vendors" ON public.vendors FOR ALL USING (true);
CREATE POLICY "Enable all operations for workers" ON public.workers FOR ALL USING (true);
CREATE POLICY "Enable all operations for expenses" ON public.expenses FOR ALL USING (true);
CREATE POLICY "Enable all operations for worker_payments" ON public.worker_payments FOR ALL USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_sites_updated_at
    BEFORE UPDATE ON public.sites
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vendors_updated_at
    BEFORE UPDATE ON public.vendors
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workers_updated_at
    BEFORE UPDATE ON public.workers
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at
    BEFORE UPDATE ON public.expenses
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_worker_payments_updated_at
    BEFORE UPDATE ON public.worker_payments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_expenses_site_id ON public.expenses(site_id);
CREATE INDEX idx_expenses_vendor_id ON public.expenses(vendor_id);
CREATE INDEX idx_worker_payments_site_id ON public.worker_payments(site_id);
CREATE INDEX idx_worker_payments_worker_id ON public.worker_payments(worker_id);
CREATE INDEX idx_expenses_date ON public.expenses(expense_date);
CREATE INDEX idx_worker_payments_date ON public.worker_payments(payment_date);