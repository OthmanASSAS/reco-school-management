-- Script pour ajouter school_year_id à la table payments (facultatif)
-- Exécutez ce script dans Supabase SQL Editor

-- 1. Ajouter la colonne school_year_id si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='payments' AND column_name='school_year_id'
  ) THEN
    ALTER TABLE payments ADD COLUMN school_year_id UUID REFERENCES school_years(id);
  END IF;
END $$;

-- 2. Créer un index pour les requêtes filtrées par année
CREATE INDEX IF NOT EXISTS idx_payments_school_year_id ON payments (school_year_id); 