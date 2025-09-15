-- Add credit balance to vendors table
ALTER TABLE public.vendors ADD COLUMN credit_balance numeric DEFAULT 0;

-- Create site_income table to track income from sites
CREATE TABLE public.site_income (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  income_date DATE NOT NULL DEFAULT CURRENT_DATE,
  source TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for site_income
ALTER TABLE public.site_income ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for site_income
CREATE POLICY "Enable all operations for site_income" 
ON public.site_income 
FOR ALL 
USING (true);

-- Add credit_amount column to expenses for credit purchases
ALTER TABLE public.expenses ADD COLUMN credit_amount numeric DEFAULT 0;
ALTER TABLE public.expenses ADD COLUMN is_credit boolean DEFAULT false;

-- Create trigger for site_income updated_at
CREATE TRIGGER update_site_income_updated_at
BEFORE UPDATE ON public.site_income
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();