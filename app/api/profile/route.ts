import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getUser } from '@/lib/db/queries';
import { isLandingOnlyMode } from '@/lib/config/runtime';
import {
  buildDefaultProfile,
  DEMO_USER_ID,
  userProfileRepository
} from '@/lib/profile/repository';

const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(100),
  email: z.string().email().max(255),
  company: z.string().max(120),
  jobTitle: z.string().max(120),
  phone: z.string().max(40),
  bio: z.string().max(500),
  timezone: z.string().max(80),
  location: z.string().max(120)
});

export async function GET() {
  const landingOnly = isLandingOnlyMode();
  const user = await getUser();
  const effectiveUserId = user?.id ?? (landingOnly ? DEMO_USER_ID : null);

  if (effectiveUserId === null) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const profileFromStore = await userProfileRepository.getByUserId(effectiveUserId);
  const profile =
    profileFromStore ??
    buildDefaultProfile(effectiveUserId, {
      displayName: user?.name ?? undefined,
      email: user?.email
    });

  return Response.json(profile);
}

export async function PUT(request: NextRequest) {
  const landingOnly = isLandingOnlyMode();
  const user = await getUser();
  const effectiveUserId = user?.id ?? (landingOnly ? DEMO_USER_ID : null);

  if (effectiveUserId === null) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = updateProfileSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const profile = await userProfileRepository.upsertByUserId(
    effectiveUserId,
    parsed.data
  );
  return Response.json(profile);
}
