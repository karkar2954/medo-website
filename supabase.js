import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://yfktbkqerjvhgopnoowj.supabase.co';

const SUPABASE_KEY = 'sb_publishable_DnWZ6SjWDdwZ3eNWL3MQAA_cY4CJ0mI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);