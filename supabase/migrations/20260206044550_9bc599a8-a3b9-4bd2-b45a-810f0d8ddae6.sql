-- Grant necessary permissions to authenticated users on the projects table
GRANT INSERT, SELECT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Also ensure sequence permissions for the id column
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;