'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { signIn, signUp } from './actions';
import { ActionState } from '@/lib/auth/middleware';

export function Login({ mode = 'signin' }: { mode?: 'signin' | 'signup' }) {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const priceId = searchParams.get('priceId');
  const inviteId = searchParams.get('inviteId');
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    mode === 'signin' ? signIn : signUp,
    { error: '' }
  );

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-linen text-ink">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-28 top-16 h-72 w-72 rounded-full bg-[#DCE8D8]/70 blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-[#F7E7A6]/55 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(255,255,255,0.45),transparent_45%),radial-gradient(circle_at_80%_82%,rgba(46,92,85,0.12),transparent_45%)]" />
      </div>

      <header className="fixed inset-x-0 top-0 z-30 pt-2">
        <div className="mx-auto flex w-full items-center px-5 sm:px-6">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between rounded-full border border-white/45 bg-linen/55 px-4 py-2 shadow-[0_16px_40px_rgba(20,40,29,0.16),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl supports-[backdrop-filter]:bg-linen/50">
            <Link
              href="/"
              className="ml-2 inline-flex items-center whitespace-nowrap text-sm font-medium leading-none tracking-[0.01em] text-ink sm:ml-3"
            >
              <span className="relative z-10">
                kadia<span className="text-[#2E5C55]">.</span>earth
              </span>
            </Link>
            <Link
              href="/"
              className="rounded-full border border-ink/10 bg-white/70 px-4 py-1.5 text-xs font-medium tracking-[0.02em] text-ink transition hover:bg-white"
            >
              Zur Startseite
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-6xl items-center justify-center px-5 pb-10 pt-28 sm:px-6">
        <section className="w-full max-w-md rounded-[2rem] border border-white/60 bg-white/72 p-6 shadow-[0_22px_60px_rgba(20,40,29,0.12)] backdrop-blur-xl sm:p-8">
          <div className="mb-6">
            <h1 className="mt-2 text-3xl font-semibold leading-tight text-ink">
              {mode === 'signin' ? 'Willkommen zurueck' : 'Konto erstellen'}
            </h1>
            <p className="mt-2 text-sm text-ink/70">
              {mode === 'signin'
                ? 'Melde dich an, um dein Screening-Dashboard zu oeffnen.'
                : 'Registriere dich und starte direkt mit deinem ersten Screening.'}
            </p>
          </div>

          <form className="space-y-5" action={formAction}>
            <input type="hidden" name="redirect" value={redirect || ''} />
            <input type="hidden" name="priceId" value={priceId || ''} />
            <input type="hidden" name="inviteId" value={inviteId || ''} />

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-ink/85">
                E-Mail
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                defaultValue={state.email}
                required
                maxLength={50}
                className="h-11 rounded-full border border-ink/15 bg-white/90 px-4 text-sm text-ink placeholder:text-ink/40 focus-visible:ring-2 focus-visible:ring-brand/35"
                placeholder="dein.name@firma.de"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-ink/85"
              >
                Passwort
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete={
                  mode === 'signin' ? 'current-password' : 'new-password'
                }
                defaultValue={state.password}
                required
                minLength={8}
                maxLength={100}
                className="h-11 rounded-full border border-ink/15 bg-white/90 px-4 text-sm text-ink placeholder:text-ink/40 focus-visible:ring-2 focus-visible:ring-brand/35"
                placeholder="Mindestens 8 Zeichen"
              />
            </div>

            {state?.error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {state.error}
              </div>
            )}

            <Button
              type="submit"
              className="h-11 w-full rounded-full bg-[#F7E7A6] text-sm font-medium text-ink shadow-[0_10px_26px_rgba(247,231,166,0.35)] transition hover:scale-[1.01] hover:bg-[#F2DC93]"
              disabled={pending}
            >
              {pending ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Bitte warten...
                </>
              ) : mode === 'signin' ? (
                'Login'
              ) : (
                'Account anlegen'
              )}
            </Button>

            <Link
              href={`${mode === 'signin' ? '/sign-up' : '/sign-in'}${
                redirect ? `?redirect=${redirect}` : ''
              }${priceId ? `&priceId=${priceId}` : ''}`}
              className="inline-flex w-full justify-center rounded-full border border-ink/15 bg-white/70 px-4 py-2.5 text-sm font-medium text-ink/85 transition hover:bg-white"
            >
              {mode === 'signin'
                ? 'Noch kein Konto? Jetzt registrieren'
                : 'Bereits registriert? Jetzt einloggen'}
            </Link>
          </form>
        </section>
      </main>
    </div>
  );
}



