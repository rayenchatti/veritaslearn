# Database Access Control

This is the #1 source of critical vulnerabilities in vibe-coded apps. AI assistants routinely generate database schemas without proper access control, leaving entire tables exposed.

## Supabase Row-Level Security (RLS)

### Enable RLS on Every Table
Tables created via SQL Editor or migrations have RLS **disabled by default**. A table without RLS is fully readable and writable by anyone with the anon key (which is public). Run this in every migration to catch missed tables:

```sql
DO $$ DECLARE r RECORD;
BEGIN
  FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', r.tablename);
  END LOOP;
END $$;
```

### Dangerous RLS Policies
**Never use `USING (true)` or `USING (auth.uid() IS NOT NULL)` on SELECT/UPDATE/DELETE.** These let any authenticated user access every row in the table. Always scope to the row owner:

```sql
-- BAD: any logged-in user can read all rows
CREATE POLICY "Users can view data" ON public.documents
  FOR SELECT TO authenticated USING (true);

-- GOOD: users can only read their own rows
CREATE POLICY "Users can view own data" ON public.documents
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
```

### Missing WITH CHECK
Always include `WITH CHECK` on INSERT and UPDATE policies. Without it, a user can reassign row ownership or insert rows as another user:

```sql
-- BAD: user can UPDATE user_id to someone else's ID
CREATE POLICY "Users can update tasks" ON public.tasks
  FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id);

-- GOOD: WITH CHECK prevents changing user_id
CREATE POLICY "Users can update tasks" ON public.tasks
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);
```

### Sensitive Fields on User-Accessible Tables
If a `profiles` table lets users UPDATE their own row, they can set `is_admin = true`, `credits = 99999`, or `subscription_tier = 'enterprise'`. Fixes:

- **Option A:** Move sensitive fields to a `private` schema table not exposed via PostgREST.
- **Option B:** Use column-level privileges:
  ```sql
  REVOKE UPDATE ON profiles FROM authenticated;
  GRANT UPDATE (display_name, avatar_url) ON profiles TO authenticated;
  ```

### SECURITY DEFINER Functions
`SECURITY DEFINER` functions bypass RLS entirely. Always:
- Keep them in a `private` schema
- Set `SET search_path = ''`
- Validate all inputs inside the function

### Storage Buckets
Storage buckets need their own policies. Scope uploads to the user's UID folder:

```sql
CREATE POLICY "Users upload to own folder"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::TEXT
  );
```
