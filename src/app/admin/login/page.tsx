import { isSupabaseConfigured } from '@/lib/supabase/server';
import { LoginForm } from './LoginForm';

export default function LoginPage() {
  const configured = isSupabaseConfigured();

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-12">
      <h1 className="text-[length:var(--text-display-md)] font-semibold leading-none tracking-[-0.025em] text-brown [font-variation-settings:'wdth'_104]">
        Oasis admin
      </h1>
      <p className="mt-3 text-[0.9375rem] text-brown-soft">
        Sign in to update the website.
      </p>

      <div className="mt-8">
        {configured ? (
          <LoginForm />
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
