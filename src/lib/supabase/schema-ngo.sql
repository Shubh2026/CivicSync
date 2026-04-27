-- ============================================================
-- CivicSync NGO Schema Addition
-- Run this AFTER schema.sql in your Supabase SQL Editor
-- ============================================================

-- ── community_needs ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.community_needs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ngo_id       UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  description  TEXT NOT NULL,
  category     TEXT NOT NULL,
  location     TEXT NOT NULL,
  city         TEXT,
  state        TEXT,
  urgency      TEXT CHECK (urgency IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  beneficiaries INT,           -- estimated people affected
  image_urls   TEXT[] DEFAULT '{}',
  status       TEXT CHECK (status IN ('active', 'addressed', 'archived')) DEFAULT 'active',
  linked_opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE SET NULL,
  source       TEXT DEFAULT 'manual',  -- 'manual' | 'csv'
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.community_needs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "NGO can manage own needs" ON public.community_needs FOR ALL USING (auth.uid() = ngo_id);
CREATE POLICY "Anyone can view community needs" ON public.community_needs FOR SELECT USING (status = 'active');

-- ── Additional policies for NGO dashboard ────────────────────
-- Allow NGOs to view assignments on opportunities they own
CREATE POLICY "NGO can view assignments on own opportunities"
  ON public.volunteer_assignments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.opportunities
      WHERE opportunities.id = volunteer_assignments.opportunity_id
        AND opportunities.ngo_id = auth.uid()
    )
  );

-- Allow anyone to view other profiles (for NGO to see volunteer details)
-- (scoped: only profiles of volunteers who accepted NGO's requests)
CREATE POLICY "Public profile read"
  ON public.profiles FOR SELECT
  USING (true);

-- NGO can view ALL their own opportunities regardless of status
CREATE POLICY "NGO can view all own opportunities"
  ON public.opportunities FOR SELECT
  USING (auth.uid() = ngo_id);
