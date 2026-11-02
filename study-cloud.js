import { supabase } from './supabase.js';

const getUser = async () => {
const { data, error } = await supabase.auth.getUser();

if (error) {
console.warn('Medo cloud auth:', error.message);
return null;
}

return data.user;
};

const getCacheKey = (key, userId) => `${key}:${userId}`;

export async function loadStudyData(key) {
const user = await getUser();

if (!user) return [];

const cacheKey = getCacheKey(key, user.id);

const { data, error } = await supabase
.from('study_data')
.select('payload')
.eq('user_id', user.id)
.eq('data_key', key)
.maybeSingle();

if (error) {
console.warn('Medo cloud load:', error.message);

```
try {
  return JSON.parse(localStorage.getItem(cacheKey) || '[]');
} catch {
  return [];
}
```

}

if (data && Array.isArray(data.payload)) {
localStorage.setItem(cacheKey, JSON.stringify(data.payload));
return data.payload;
}

return [];
}

export async function saveStudyData(key, payload) {
const user = await getUser();

if (!user) return false;

const cacheKey = getCacheKey(key, user.id);

const { error } = await supabase
.from('study_data')
.upsert(
{
user_id: user.id,
data_key: key,
payload,
updated_at: new Date().toISOString()
},
{ onConflict: 'user_id,data_key' }
);

if (error) {
console.warn('Medo cloud save:', error.message);
return false;
}

localStorage.setItem(cacheKey, JSON.stringify(payload));
return true;
}
