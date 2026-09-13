/** POST /api/auth/logout */
import { supabaseAsUser } from '../../../lib/supabase';
import { ok, methodGuard, cors } from '../../../lib/helpers';
import { getToken } from '../../../lib/auth';
import { withSafety } from '../../../lib/safety';

async function handler(req, res) {
  if (cors(req, res)) return;
  if (!methodGuard(req, res, ['POST'])) return;

  const token = getToken(req);
  if (token) { try { await supabaseAsUser(token).auth.signOut(); } catch (_) {} }
  return ok(res, { message: 'از حساب خارج شدید.' });
}

export default withSafety(handler);
