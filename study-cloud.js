import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
const client = createClient('https://yfktbkqerjvhgopnoowj.supabase.co', 'sb_publishable_DnWZ6SjWDdwZ3eNWL3MQAA_cY4CJ0mI');
export async function loadStudyData(key) {
  const local = (() => { try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; } })();
  const { data: { user } } = await client.auth.getUser();
  if (!user) return local;
  const { data, error } = await client.from('study_data').select('payload').eq('user_id', user.id).eq('data_key', key).maybeSingle();
  if (error) { console.warn('Medo cloud load:', error.message); return local; }
  if (data && Array.isArray(data.payload)) return data.payload;
  if (local.length) await saveStudyData(key, local);
  return local;
}
export async function saveStudyData(key, payload) {
  localStorage.setItem(key, JSON.stringify(payload));
  const { data: { user } } = await client.auth.getUser();
  if (!user) return;
  const { error } = await client.from('study_data').upsert({ user_id: user.id, data_key: key, payload, updated_at: new Date().toISOString() }, { onConflict: 'user_id,data_key' });
  if (error) console.warn('Medo cloud save:', error.message);
}
