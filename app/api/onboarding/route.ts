import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser?.id) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as {
    displayName?: string;
    country?: string;
    skillLevel?: string;
    markerSelections?: Array<{ brand: string; series: string; setSize: string; extraColors?: string[] }>;
  };

  const displayName = Object.prototype.hasOwnProperty.call(body, "displayName")
    ? body.displayName?.trim() || null
    : undefined;

  const country = Object.prototype.hasOwnProperty.call(body, "country") ? body.country || null : undefined;
  const skillLevel = Object.prototype.hasOwnProperty.call(body, "skillLevel") ? body.skillLevel || null : undefined;

  try {
    await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        ...(displayName !== undefined ? { displayName } : {}),
        ...(country !== undefined ? { country } : {}),
        ...(skillLevel !== undefined ? { skillLevel } : {}),
        onboardingComplete: true,
      } as never,
    });

    // Keep linked/duplicate rows in sync for the same email to avoid profile drift.
    await prisma.user.updateMany({
      where: { email: currentUser.email, NOT: { id: currentUser.id } },
      data: {
        ...(displayName !== undefined ? { displayName } : {}),
        ...(country !== undefined ? { country } : {}),
        ...(skillLevel !== undefined ? { skillLevel } : {}),
      } as never,
    });
  } catch {
    await prisma.$executeRaw`
      UPDATE users
      SET
        display_name = COALESCE(${displayName}, display_name),
        country = COALESCE(${country}, country),
        skill_level = COALESCE(${skillLevel}, skill_level),
        onboarding_complete = true,
        updated_at = NOW()
      WHERE id = ${currentUser.id}::uuid
    `;
  }

  revalidatePath("/app", "layout");
  revalidatePath("/app/profile");

  return NextResponse.json({ ok: true, markerCount: body.markerSelections?.length ?? 0 });
}
