-- Run ONLY against a dedicated AI Passport Neon project.
-- Never run this migration against Dreamboard.
CREATE TABLE IF NOT EXISTS passport_students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_group text NOT NULL CHECK (class_group IN ('5A','5B')),
  pin_digest char(64) NOT NULL UNIQUE,
  is_demo boolean NOT NULL DEFAULT false,
  progress jsonb NOT NULL DEFAULT '{}'::jsonb,
  revision integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS passport_students_group_idx ON passport_students(class_group);
CREATE TABLE IF NOT EXISTS passport_login_limits (
  bucket char(64) PRIMARY KEY,
  attempts integer NOT NULL DEFAULT 0,
  window_start timestamptz NOT NULL DEFAULT now()
);
-- Name, last initial, email, or full student IDs are not collected.
