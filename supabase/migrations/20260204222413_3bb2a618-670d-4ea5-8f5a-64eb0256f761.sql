-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create a table for saved chats
CREATE TABLE public.chats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  personality TEXT NOT NULL DEFAULT 'CHAOS',
  custom_personality JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (public access for now since no auth)
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (no auth required)
CREATE POLICY "Anyone can view chats" 
ON public.chats 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create chats" 
ON public.chats 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update chats" 
ON public.chats 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete chats" 
ON public.chats 
FOR DELETE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_chats_updated_at
BEFORE UPDATE ON public.chats
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();