-- Custom SQL migration file, put your code below! --
-- 1) Ensure the updated_at trigger function exists (idempotent)
CREATE
OR REPLACE FUNCTION public.trigger_set_updated_at () RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 2) Attach updated_at trigger to meals
DROP TRIGGER IF EXISTS set_updated_at_meals ON public.meals;

CREATE TRIGGER set_updated_at_meals BEFORE
UPDATE ON public.meals FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_updated_at ();

-- 3) Attach updated_at trigger to foods (if not present)
-- Add updated_at column if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'foods' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.foods ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();
  END IF;
END$$;

DROP TRIGGER IF EXISTS set_updated_at_foods ON public.foods;

CREATE TRIGGER set_updated_at_foods BEFORE
UPDATE ON public.foods FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_updated_at ();