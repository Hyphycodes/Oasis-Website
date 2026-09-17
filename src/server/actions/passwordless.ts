'use server';

import { z } from 'zod';
import { getServiceClient, getSessionClient } from '@/lib/supabase/server';
import { SITE_URL } from '@/lib/site-url';
import { INITIAL_OWNER_EMAIL, findAuthUser, normalizeEmail } from '../owner-onboarding';
import type { ActionState } from './shared';

const sent: ActionState = {ok:true, message:'If this email has staff access, a sign-in link is on its way. Open it in this browser. Check spam too. The link works once.'};

export async function sendSignInLink(_previous: ActionState, form: FormData): Promise<ActionState> {
  const parsed = z.string().trim().email().max(254).safeParse(form.get('email'));
  if (!parsed.success) return {ok:false, message:'Enter a valid email address.'};
  try {
    const email = normalizeEmail(parsed.data);
    const service = getServiceClient();
    const session = await getSessionClient();
    if (!service || !session) return {ok:false,message:'Email sign-in is unavailable. Please try again later.'};
    let user = await findAuthUser(service, email);
    if (!user && email === INITIAL_OWNER_EMAIL) {
      const { data: owners, error } = await service.from('profiles').select('user_id').eq('role','owner').limit(1);
      if (error) throw error;
      if (owners?.length) return sent;
      // Creates an unverified identity only. Owner access is granted AFTER email verification.
      const {data,error:createError} = await service.auth.admin.createUser({email,email_confirm:false,user_metadata:{name:'Jerry Sanchez'}});
      if (createError) throw createError;
      user = data.user;
    }
    if (!user) return sent;
    const {data:profile,error} = await service.from('profiles').select('active').eq('user_id',user.id).maybeSingle();
    if (error) throw error;
    if (profile?.active === false || (!profile && email !== INITIAL_OWNER_EMAIL)) return sent;
    const {error:sendError} = await session.auth.signInWithOtp({email,options:{shouldCreateUser:false,emailRedirectTo:`${SITE_URL}/auth/callback`}});
    if (sendError) return {ok:false,message:'The sign-in email could not be sent. Wait a minute and try again. If it continues, the email service needs attention.'};
    return sent;
  } catch {
    return {ok:false,message:'Email sign-in is temporarily unavailable. Please try again shortly.'};
  }
}
