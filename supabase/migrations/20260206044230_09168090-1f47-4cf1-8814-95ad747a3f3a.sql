-- Drop the existing restrictive INSERT policy
DROP POLICY IF EXISTS "Users can create projects" ON public.projects;

-- Create a new PERMISSIVE INSERT policy for authenticated users
CREATE POLICY "Users can create projects"
ON public.projects
FOR INSERT
TO authenticated
WITH CHECK (owner_id = auth.uid());