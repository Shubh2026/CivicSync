-- ============================================================
-- CivicSync Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- ── profiles ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT,
  full_name     TEXT,
  avatar_url    TEXT,
  role          TEXT CHECK (role IN ('volunteer', 'ngo')),
  bio           TEXT,
  location      TEXT DEFAULT 'Amritsar, Punjab',
  phone         TEXT,
  skills        TEXT[] DEFAULT '{}',
  availability  TEXT[] DEFAULT '{}',   -- e.g. ['weekday_mornings', 'weekend_afternoons']
  causes        TEXT[] DEFAULT '{}',   -- e.g. ['education', 'environment']
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile"   ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ── opportunities ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.opportunities (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ngo_id          UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT NOT NULL,
  category        TEXT NOT NULL,          -- 'education' | 'environment' | 'health' | 'food' | 'elderly' | 'animals' | 'disaster' | 'other'
  location        TEXT NOT NULL,
  city            TEXT,
  state           TEXT,
  is_remote       BOOLEAN DEFAULT FALSE,
  urgency         TEXT CHECK (urgency IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  required_skills TEXT[] DEFAULT '{}',
  volunteers_needed INT DEFAULT 1,
  volunteers_accepted INT DEFAULT 0,
  date_start      DATE,
  date_end        DATE,
  hours_per_week  NUMERIC(4,1),
  is_one_time     BOOLEAN DEFAULT FALSE,
  image_url       TEXT,
  status          TEXT CHECK (status IN ('draft', 'active', 'closed', 'completed')) DEFAULT 'active',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active opportunities" ON public.opportunities FOR SELECT USING (status = 'active');
CREATE POLICY "NGO can manage own opportunities"     ON public.opportunities FOR ALL USING (auth.uid() = ngo_id);

-- ── volunteer_assignments ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.volunteer_assignments (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_id     UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  opportunity_id   UUID REFERENCES public.opportunities(id) ON DELETE CASCADE,
  status           TEXT CHECK (status IN ('accepted', 'ongoing', 'completed', 'cancelled')) DEFAULT 'accepted',
  hours_contributed NUMERIC(5,1) DEFAULT 0,
  feedback         TEXT,
  rating           INT CHECK (rating BETWEEN 1 AND 5),
  accepted_at      TIMESTAMPTZ DEFAULT NOW(),
  completed_at     TIMESTAMPTZ,
  UNIQUE (volunteer_id, opportunity_id)
);

ALTER TABLE public.volunteer_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Volunteers can view own assignments"   ON public.volunteer_assignments FOR SELECT USING (auth.uid() = volunteer_id);
CREATE POLICY "Volunteers can insert own assignments" ON public.volunteer_assignments FOR INSERT WITH CHECK (auth.uid() = volunteer_id);
CREATE POLICY "Volunteers can update own assignments" ON public.volunteer_assignments FOR UPDATE USING (auth.uid() = volunteer_id);

-- Increment volunteers_accepted on assignment insert
CREATE OR REPLACE FUNCTION increment_volunteers_accepted()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.opportunities
  SET volunteers_accepted = volunteers_accepted + 1
  WHERE id = NEW.opportunity_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_increment_volunteers_accepted
AFTER INSERT ON public.volunteer_assignments
FOR EACH ROW EXECUTE FUNCTION increment_volunteers_accepted();

-- ── Seed sample opportunities ─────────────────────────────────
INSERT INTO public.opportunities (title, description, category, location, city, state, urgency, required_skills, volunteers_needed, date_start, date_end, hours_per_week, is_one_time, status)
VALUES
  ('Food Distribution Drive', 'Help distribute nutritious meals to families in low-income areas of Amritsar. No prior experience needed — just a warm heart.', 'food', 'Amritsar, Punjab', 'Amritsar', 'Punjab', 'high', ARRAY['communication', 'physical activity'], 15, '2026-05-01', '2026-05-01', 4, TRUE, 'active'),
  ('Youth Literacy Program', 'Teach basic reading and writing to underprivileged children aged 8–14 in Ludhiana. Prior teaching experience preferred.', 'education', 'Ludhiana, Punjab', 'Ludhiana', 'Punjab', 'medium', ARRAY['teaching', 'communication', 'patience'], 8, '2026-05-05', '2026-07-31', 6, FALSE, 'active'),
  ('River Cleanup — Beas', 'Join our monthly cleanup drive along the Beas river. Bring gloves! Materials provided by GreenPunjab NGO.', 'environment', 'Amritsar, Punjab', 'Amritsar', 'Punjab', 'medium', ARRAY['physical activity'], 20, '2026-05-10', '2026-05-10', 5, TRUE, 'active'),
  ('Senior Citizen Companion', 'Spend a few hours weekly with elderly residents at a care home in Chandigarh. Light activities, conversations, and companionship.', 'elderly', 'Chandigarh', 'Chandigarh', 'Punjab', 'low', ARRAY['empathy', 'communication'], 5, '2026-05-01', '2026-08-31', 3, FALSE, 'active'),
  ('Digital Literacy Workshop', 'Teach basic smartphone and internet skills to adults above 50 in rural Punjab. Remote & in-person sessions available.', 'education', 'Remote', NULL, NULL, 'medium', ARRAY['teaching', 'technology', 'communication'], 10, '2026-05-15', '2026-06-30', 4, FALSE, 'active'),
  ('Mental Health Awareness Campaign', 'Design and distribute mental health awareness materials across colleges in Amritsar. Creative skills valued.', 'health', 'Amritsar, Punjab', 'Amritsar', 'Punjab', 'high', ARRAY['design', 'communication', 'empathy'], 6, '2026-05-20', '2026-05-25', 8, FALSE, 'active'),
  ('Animal Shelter Assistant', 'Help care for rescued animals at the Amritsar Animal Aid shelter. Tasks include feeding, cleaning, and socialising.', 'animals', 'Amritsar, Punjab', 'Amritsar', 'Punjab', 'critical', ARRAY['animal care', 'physical activity'], 4, '2026-05-01', '2026-09-30', 5, FALSE, 'active'),
  ('Disaster Relief — Flood Prep', 'Assist in pre-monsoon flood preparedness training for rural communities near Pathankot.', 'disaster', 'Pathankot, Punjab', 'Pathankot', 'Punjab', 'critical', ARRAY['first aid', 'communication', 'physical activity'], 12, '2026-05-25', '2026-06-05', 6, FALSE, 'active')
ON CONFLICT DO NOTHING;
