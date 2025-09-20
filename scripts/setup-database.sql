-- Script complet pour configurer la base de données Supabase
-- Exécutez ce script dans Supabase SQL Editor

-- ===================================
-- 1. FONCTION EXEC_SQL
-- ===================================

-- Créer la fonction exec_sql pour permettre l'exécution de SQL dynamique
CREATE OR REPLACE FUNCTION public.exec_sql(sql text)
RETURNS void
LANGUAGE plpgsql
SECURITY definer
SET search_path = public
AS $function$
BEGIN
  EXECUTE sql;
END;
$function$;

-- ===================================
-- 2. COLONNE SCHOOL_YEAR_ID SUR PAYMENTS
-- ===================================

-- Ajouter la colonne school_year_id si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='payments' AND column_name='school_year_id'
  ) THEN
    ALTER TABLE payments ADD COLUMN school_year_id UUID REFERENCES school_years(id);
    RAISE NOTICE 'Colonne school_year_id ajoutée à payments';
  ELSE
    RAISE NOTICE 'Colonne school_year_id existe déjà';
  END IF;
END $$;

-- Créer un index pour les requêtes filtrées par année
CREATE INDEX IF NOT EXISTS idx_payments_school_year_id ON payments (school_year_id);

-- ===================================
-- 3. RECHARGEMENT DU SCHÉMA SUPABASE
-- ===================================

-- Notifier PostgREST de recharger le schéma
SELECT pg_notify('pgrst', 'reload schema');

-- ===================================
-- 4. VÉRIFICATION
-- ===================================

-- Vérifier que tout est en place
SELECT
  'exec_sql' as fonction,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.routines
    WHERE routine_name = 'exec_sql' AND routine_schema = 'public'
  ) THEN '✅ OK' ELSE '❌ MANQUANT' END as status

UNION ALL

SELECT
  'payments.school_year_id' as fonction,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payments' AND column_name = 'school_year_id'
  ) THEN '✅ OK' ELSE '❌ MANQUANT' END as status;