import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/current-user";
import { DISCLAIMER_VERSION } from "@/lib/disclaimer";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const currentUser = await getCurrentUser();
  if (!currentUser?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.$executeRaw`
    UPDATE users
    SET disclaimer_accepted_at = NOW(),
        disclaimer_version = ${DISCLAIMER_VERSION}
    WHERE id = ${currentUser.id}::uuid
  `;

  return NextResponse.json({ ok: true });
}
