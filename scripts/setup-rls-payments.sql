-- Script pour ajouter les politiques RLS pour la table payments
-- Exécutez ce script dans Supabase SQL Editor

-- 1. Activer RLS sur la table payments si ce n'est pas déjà fait
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- 2. Politique pour permettre la lecture des paiements d'une famille
CREATE POLICY "Users can view payments for their families" ON payments
FOR SELECT USING (
  family_id IN (
    SELECT id FROM families 
    WHERE id = payments.family_id
  )
);

-- 3. Politique pour permettre l'insertion de paiements pour une famille
CREATE POLICY "Users can insert payments for families" ON payments
FOR INSERT WITH CHECK (
  family_id IN (
    SELECT id FROM families 
    WHERE id = payments.family_id
  )
);

-- 4. Politique pour permettre la mise à jour des paiements d'une famille
CREATE POLICY "Users can update payments for their families" ON payments
FOR UPDATE USING (
  family_id IN (
    SELECT id FROM families 
    WHERE id = payments.family_id
  )
);

-- 5. Politique pour permettre la suppression des paiements d'une famille
CREATE POLICY "Users can delete payments for their families" ON payments
FOR DELETE USING (
  family_id IN (
    SELECT id FROM families 
    WHERE id = payments.family_id
  )
); 