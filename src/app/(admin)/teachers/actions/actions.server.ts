// /Users/oassas/Projets/inscription-app/src/app/(admin)/teachers/actions/actions.server.ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createTeacher(data: { fullName: string; email: string; phone: string }) {
  try {
    await prisma.teacher.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
      },
    });
    revalidatePath("/teachers");
    return { success: true };
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function updateTeacher(id: string, data: { fullName: string; email: string; phone: string }) {
  try {
    await prisma.teacher.update({
      where: { id },
      data: {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
      },
    });
    revalidatePath("/teachers");
    return { success: true };
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function deleteTeacher(id: string) {
  try {
    await prisma.teacher.delete({
      where: { id },
    });
    revalidatePath("/teachers");
    return { success: true };
  } catch (error: any) {
    throw new Error(error.message);
  }
}
