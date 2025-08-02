-- Configuration des politiques RLS pour permettre l'accès aux données
-- À exécuter dans le dashboard Supabase

-- Activer RLS sur toutes les tables
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_years ENABLE ROW LEVEL SECURITY;

-- Politique pour subjects : permettre la lecture à tous les utilisateurs authentifiés
CREATE POLICY "Allow read access to subjects" ON subjects
FOR SELECT USING (auth.role() = 'authenticated');

-- Politique pour grades : permettre la lecture à tous les utilisateurs authentifiés
CREATE POLICY "Allow read access to grades" ON grades
FOR SELECT USING (auth.role() = 'authenticated');

-- Politique pour courses : permettre la lecture à tous les utilisateurs authentifiés
CREATE POLICY "Allow read access to courses" ON courses
FOR SELECT USING (auth.role() = 'authenticated');

-- Politique pour students : permettre la lecture à tous les utilisateurs authentifiés
CREATE POLICY "Allow read access to students" ON students
FOR SELECT USING (auth.role() = 'authenticated');

-- Politique pour school_years : permettre la lecture à tous les utilisateurs authentifiés
CREATE POLICY "Allow read access to school_years" ON school_years
FOR SELECT USING (auth.role() = 'authenticated');

-- Politiques pour l'écriture (si nécessaire)
CREATE POLICY "Allow insert access to grades" ON grades
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow update access to grades" ON grades
FOR UPDATE USING (auth.role() = 'authenticated'); 