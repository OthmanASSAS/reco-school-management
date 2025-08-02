import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY!;
const sb = createClient(supabaseUrl, supabaseServiceKey);

async function createTables() {
  console.log("🔧 Création des tables 'subjects' et 'grades'...");

  try {
    // Table subjects
    await sb.rpc("exec_sql", {
      sql: `
        CREATE TABLE IF NOT EXISTS subjects (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
          name VARCHAR(100) NOT NULL,
          description TEXT,
          color VARCHAR(7) DEFAULT '#3B82F6',
          order_index INTEGER DEFAULT 0,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(course_id, name)
        );
      `,
    });
    console.log("   ✅ Table 'subjects' créée ou déjà existante.");

    // Table grades
    await sb.rpc("exec_sql", {
      sql: `
        CREATE TABLE IF NOT EXISTS grades (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          student_id UUID REFERENCES students(id) ON DELETE CASCADE,
          subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
          score DECIMAL(5,2) CHECK (score >= 0 AND score <= 20),
          coefficient INTEGER DEFAULT 1,
          period_type TEXT,
          period_value TEXT,
          school_year_id UUID REFERENCES school_years(id) ON DELETE CASCADE,
          comments TEXT,
          evaluation_date DATE NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `,
    });
    console.log("   ✅ Table 'grades' créée ou déjà existante.");

    // Créer les index
    await sb.rpc("exec_sql", {
      sql: "CREATE INDEX IF NOT EXISTS idx_subjects_course_id ON subjects(course_id);",
    });
    await sb.rpc("exec_sql", {
      sql: "CREATE INDEX IF NOT EXISTS idx_subjects_order ON subjects(order_index);",
    });
    await sb.rpc("exec_sql", {
      sql: "CREATE INDEX IF NOT EXISTS idx_grades_student_id ON grades(student_id);",
    });
    await sb.rpc("exec_sql", {
      sql: "CREATE INDEX IF NOT EXISTS idx_grades_subject_id ON grades(subject_id);",
    });
    await sb.rpc("exec_sql", {
      sql: "CREATE INDEX IF NOT EXISTS idx_grades_date ON grades(evaluation_date);",
    });
    console.log("   ✅ Index créés ou déjà existants.");

  } catch (error) {
    console.error("❌ Erreur lors de la création des tables:", error);
    process.exit(1);
  }
}

createTables().then(() => {
  console.log("🎉 Création des tables terminée.");
  process.exit(0);
}).catch(e => {
  console.error(e);
  process.exit(1);
});
