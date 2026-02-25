'use client';

import { useEffect, useMemo, useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

type UserProfile = {
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

const EMPTY_PROFILE: UserProfile = {
  displayName: '',
  email: '',
  company: '',
  jobTitle: '',
  phone: '',
  bio: '',
  timezone: 'Europe/Berlin',
  location: '',
  updatedAt: ''
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>(EMPTY_PROFILE);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/profile', { cache: 'no-store' });

        if (!response.ok) {
          throw new Error('Profil konnte nicht geladen werden.');
        }

        const data = (await response.json()) as UserProfile;
        if (active) {
          setProfile(data);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      active = false;
    };
  }, []);

  const lastSavedLabel = useMemo(() => {
    if (!profile.updatedAt) {
      return 'Noch nicht gespeichert';
    }

    const date = new Date(profile.updatedAt);
    return Number.isNaN(date.getTime())
      ? 'Zuletzt gespeichert: unbekannt'
      : `Zuletzt gespeichert: ${date.toLocaleString('de-DE')}`;
  }, [profile.updatedAt]);

  const updateField = (field: keyof UserProfile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    setSuccess(null);
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      setIsSaving(true);

      const payload = {
        displayName: profile.displayName,
        email: profile.email,
        company: profile.company,
        jobTitle: profile.jobTitle,
        phone: profile.phone,
        bio: profile.bio,
        timezone: profile.timezone,
        location: profile.location
      };

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Profil konnte nicht gespeichert werden.');
      }

      const data = (await response.json()) as UserProfile;
      setProfile(data);
      setSuccess('Profil gespeichert.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[980px] pb-10 pt-6">
      <section className="mb-6 px-2 sm:px-4">
        <h1 className="mt-5 text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl">
          Dein Profil
        </h1>
      </section>

      <Card className="app-glass-card">
        <CardHeader>
          <CardTitle>Profildaten</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-ink/70">
              <Loader2 className="h-4 w-4 animate-spin" />
              Profil wird geladen...
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-5">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <Label htmlFor="displayName" className="mb-2">
                    Anzeigename
                  </Label>
                  <Input
                    id="displayName"
                    value={profile.displayName}
                    onChange={(event) =>
                      updateField('displayName', event.target.value)
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="mb-2">
                    E-Mail
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(event) => updateField('email', event.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="company" className="mb-2">
                    Unternehmen
                  </Label>
                  <Input
                    id="company"
                    value={profile.company}
                    onChange={(event) => updateField('company', event.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="jobTitle" className="mb-2">
                    Rolle
                  </Label>
                  <Input
                    id="jobTitle"
                    value={profile.jobTitle}
                    onChange={(event) => updateField('jobTitle', event.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="mb-2">
                    Telefon
                  </Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(event) => updateField('phone', event.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="timezone" className="mb-2">
                    Zeitzone
                  </Label>
                  <Input
                    id="timezone"
                    value={profile.timezone}
                    onChange={(event) => updateField('timezone', event.target.value)}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="location" className="mb-2">
                    Standort
                  </Label>
                  <Input
                    id="location"
                    value={profile.location}
                    onChange={(event) => updateField('location', event.target.value)}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="bio" className="mb-2">
                    Kurzbeschreibung
                  </Label>
                  <Textarea
                    id="bio"
                    value={profile.bio}
                    onChange={(event) => updateField('bio', event.target.value)}
                    rows={4}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t border-slate-200/70 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-ink/55">{lastSavedLabel}</p>
                <Button
                  type="submit"
                  className="app-brand-button"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Speichert...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Profil speichern
                    </>
                  )}
                </Button>
              </div>

              {error ? <p className="text-sm text-red-600">{error}</p> : null}
              {success ? <p className="text-sm text-primary">{success}</p> : null}
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
