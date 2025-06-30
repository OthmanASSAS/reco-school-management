'use client';

import { useEffect, useState } from 'react';
import supabase from '@/lib/supabase';

export default function Dashboard() {
  const [families, setFamilies] = useState<any[]>([]);

  

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('families')
        .select('*, students(*)');        
        console.log('Familles sans relation :', data);

      if (error) {
        console.error('Erreur de chargement des données :', error);
        return;
      }

      setFamilies(data);
    };

    fetchData();
  }, []);
console.log({families});
  return (
    <div className="space-y-6">
      {families.map((family) => (
        <div key={family.id} className="border rounded p-4 bg-gray-50">
          <h2 className="text-xl font-semibold">
            {family.last_name} {family.first_name}
          </h2>
          <p>Email : {family.email}</p>
          <p>Téléphone : {family.phone}</p>
          <p>Adresse : {family.address}, {family.postal_code} {family.city}</p>
          <h3 className="font-medium mt-2">Inscrits :</h3>
          <ul className="list-disc ml-5">
            {family.students?.map((student: any) => (
              <li key={student.id}>
                {student.first_name} {student.last_name} ({student.registration_type}) - {student.level}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
