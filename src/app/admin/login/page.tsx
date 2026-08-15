import { isLocalDb } from '@/lib/db';
import { isSupabaseConfigured } from '@/lib/supabase/server';
import { LOCAL_STAFF } from '@/server/auth';
import { ROLE_SUMMARY, type Role } from '@/server/permissions';
import { LocalSignIn, LoginForm } from './LoginForm';

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  const configured = isSupabaseConfigured();
  const local = isLocalDb();

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5 py-12">
      <h1 className="text-[length:var(--text-display-md)] font-semibold leading-none tracking-[-0.025em] text-brown">
        Oasis admin
      </h1>
      <p className="mt-3 text-[0.9375rem] text-brown-soft">Sign in to update the website.</p>

      <div className="mt-8">
        {configured ? (
          <LoginForm />
        ) : local ? (
          <div className="rounded-(--radius-md) border border-warning/60 bg-warning/8 p-5">
            <p className="text-[0.9375rem] font-semibold text-warning">Local development copy</p>
            <p className="mt-2 text-[0.875rem] leading-relaxed text-brown-soft">
              No content system is connected, so this is running on a file on your machine. Pick an
              account to see what each role can do. This screen does not exist in production.
            </p>
            <div className="mt-5 grid gap-2">
              {(Object.keys(LOCAL_STAFF) as Role[]).map((role) => (
                <LocalSignIn
                  key={role}
                  role={role}
                  name={LOCAL_STAFF[role].name}
                  summary={ROLE_SUMMARY[role]}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-(--radius-md) border-2 border-warning bg-linen p-5">
            <p className="text-[0.9375rem] font-semibold text-brown">
              The content system is not connected yet.
            </p>
            <p className="measure mt-3 text-[0.9375rem] leading-relaxed text-brown-soft">
              The website is running from its built-in content and is working normally. To turn on
              editing, a developer needs to create the Supabase project and set the environment
              variables listed in <code className="text-brown">docs/ENVIRONMENT.md</code>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
