import { UpdateUserProfileInput, UserProfile } from '@/lib/profile/types';

export interface UserProfileRepository {
  getByUserId(userId: number): Promise<UserProfile | null>;
  upsertByUserId(userId: number, input: UpdateUserProfileInput): Promise<UserProfile>;
}

const DEFAULT_PROFILE_BY_USER_ID = new Map<number, UserProfile>();

export const DEMO_USER_ID = 0;

const DEMO_PROFILE_SEED: Omit<UserProfile, 'userId' | 'updatedAt'> = {
  displayName: 'Mara Hoffmann',
  email: 'mara.hoffmann@kadia.earth',
  company: 'kadia.earth Demo',
  jobTitle: 'Projektmanagerin Erneuerbare',
  phone: '+49 30 12345678',
  bio: 'Leitet Standortbewertungen fuer Solar- und Windprojekte in der Fruehphase.',
  timezone: 'Europe/Berlin',
  location: 'Berlin'
};

const buildDefaultProfile = (
  userId: number,
  fallback: Partial<Pick<UserProfile, 'displayName' | 'email'>> = {}
): UserProfile => ({
  userId,
  displayName: fallback.displayName ?? DEMO_PROFILE_SEED.displayName,
  email: fallback.email ?? DEMO_PROFILE_SEED.email,
  company: DEMO_PROFILE_SEED.company,
  jobTitle: DEMO_PROFILE_SEED.jobTitle,
  phone: DEMO_PROFILE_SEED.phone,
  bio: DEMO_PROFILE_SEED.bio,
  timezone: DEMO_PROFILE_SEED.timezone,
  location: DEMO_PROFILE_SEED.location,
  updatedAt: new Date().toISOString()
});

const DEMO_PROFILE: UserProfile = {
  userId: DEMO_USER_ID,
  ...DEMO_PROFILE_SEED,
  updatedAt: new Date().toISOString()
};

DEFAULT_PROFILE_BY_USER_ID.set(DEMO_USER_ID, DEMO_PROFILE);

class InMemoryUserProfileRepository implements UserProfileRepository {
  async getByUserId(userId: number): Promise<UserProfile | null> {
    return DEFAULT_PROFILE_BY_USER_ID.get(userId) ?? null;
  }

  async upsertByUserId(
    userId: number,
    input: UpdateUserProfileInput
  ): Promise<UserProfile> {
    const existing = DEFAULT_PROFILE_BY_USER_ID.get(userId);
    const next: UserProfile = {
      ...(existing ?? buildDefaultProfile(userId)),
      ...input,
      userId,
      updatedAt: new Date().toISOString()
    };

    DEFAULT_PROFILE_BY_USER_ID.set(userId, next);
    return next;
  }
}

// Swap this with a Postgres-backed implementation later.
export const userProfileRepository: UserProfileRepository =
  new InMemoryUserProfileRepository();

export { buildDefaultProfile };
