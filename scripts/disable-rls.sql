-- Désactiver RLS temporairement pour le développement
-- À exécuter dans le dashboard Supabase

-- Désactiver RLS sur subjects
ALTER TABLE subjects DISABLE ROW LEVEL SECURITY;

-- Désactiver RLS sur grades
ALTER TABLE grades DISABLE ROW LEVEL SECURITY;

-- Désactiver RLS sur courses
ALTER TABLE courses DISABLE ROW LEVEL SECURITY;

-- Désactiver RLS sur students
ALTER TABLE students DISABLE ROW LEVEL SECURITY;

-- Désactiver RLS sur school_years
ALTER TABLE school_years DISABLE ROW LEVEL SECURITY;

-- Vérifier que les données sont accessibles
SELECT COUNT(*) FROM subjects;
SELECT COUNT(*) FROM grades;
SELECT COUNT(*) FROM courses;
SELECT COUNT(*) FROM students;
SELECT COUNT(*) FROM school_years; 