export type UserProfile = {
  userId: number;
  displayName: string;
  email: string;
  company: string;
  jobTitle: string;
  phone: string;
  bio: string;
  timezone: string;
  location: string;
  updatedAt: string;
};

export type UpdateUserProfileInput = Omit<UserProfile, 'userId' | 'updatedAt'>;
