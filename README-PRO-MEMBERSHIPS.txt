MEDO PRO MEMBERSHIP STATUS

1) Run SQL-pro-memberships.sql once in Supabase SQL Editor.
2) Upload all files in this folder to the existing GitHub Pages repository, replacing matching files.
3) The page will show Free/Pro status for the signed-in user.

SECURITY / PAYMENT NOTES
- This package does NOT collect payments and does NOT automatically grant Pro.
- Do not add a client-side button that writes to pro_memberships. RLS intentionally allows users to SELECT only their own row.
- After manually verifying a payment, an administrator may run the commented activation SQL in Supabase SQL Editor, replacing USER_UUID with the user's Auth UID. This grants 30 days.
- For real automated payments, use a trusted payment provider webhook + Supabase Edge Function using a server-side secret. Never put the service_role key in website JavaScript.
- Expired memberships display as Free even if the row still says active.
