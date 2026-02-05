-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create app_role enum for project roles
CREATE TYPE public.app_role AS ENUM ('owner', 'contributor', 'viewer');

-- Create projects table
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  vision TEXT DEFAULT '',
  scope TEXT DEFAULT '',
  current_phase TEXT NOT NULL DEFAULT 'idea',
  target_users TEXT[] DEFAULT '{}',
  features TEXT[] DEFAULT '{}',
  constraints TEXT[] DEFAULT '{}',
  phase_progress JSONB DEFAULT '{"idea": 0, "requirements": 0, "design": 0, "development": 0, "testing": 0, "documentation": 0, "deployment": 0}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create project_members table for collaboration
CREATE TABLE public.project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'viewer',
  invite_token TEXT,
  invited_by UUID REFERENCES public.profiles(id),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(project_id, user_id)
);

-- Create requirements table
CREATE TABLE public.requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('functional', 'non-functional')),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'implemented')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create use_cases table
CREATE TABLE public.use_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  actor TEXT NOT NULL,
  description TEXT DEFAULT '',
  preconditions TEXT[] DEFAULT '{}',
  steps TEXT[] DEFAULT '{}',
  postconditions TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create design_artifacts table
CREATE TABLE public.design_artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('use-case', 'class', 'sequence', 'activity', 'state', 'component', 'er')),
  title TEXT NOT NULL,
  content TEXT DEFAULT '',
  mermaid_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create test_cases table
CREATE TABLE public.test_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('unit', 'integration', 'functional', 'e2e')),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  steps TEXT[] DEFAULT '{}',
  expected_result TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'passed', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create documents table
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('srs', 'design', 'api', 'developer', 'testing', 'deployment')),
  title TEXT NOT NULL,
  content TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create chat_messages table for project chat history
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id),
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.use_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.design_artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Helper function: Check if user is project owner
CREATE OR REPLACE FUNCTION public.is_project_owner(project_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.projects
    WHERE id = project_id AND owner_id = auth.uid()
  );
$$;

-- Helper function: Check if user is project member with any role
CREATE OR REPLACE FUNCTION public.is_project_member(project_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.projects WHERE id = project_id AND owner_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.project_members WHERE project_id = is_project_member.project_id AND user_id = auth.uid()
  );
$$;

-- Helper function: Check if user can edit (owner or contributor)
CREATE OR REPLACE FUNCTION public.can_edit_project(project_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.projects WHERE id = project_id AND owner_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.project_members 
    WHERE project_id = can_edit_project.project_id 
    AND user_id = auth.uid() 
    AND role IN ('owner', 'contributor')
  );
$$;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

-- Projects policies
CREATE POLICY "Users can view projects they own or are members of"
  ON public.projects FOR SELECT
  TO authenticated
  USING (public.is_project_member(id));

CREATE POLICY "Users can create projects"
  ON public.projects FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update projects"
  ON public.projects FOR UPDATE
  TO authenticated
  USING (public.can_edit_project(id));

CREATE POLICY "Owners can delete projects"
  ON public.projects FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

-- Project members policies
CREATE POLICY "Members can view project members"
  ON public.project_members FOR SELECT
  TO authenticated
  USING (public.is_project_member(project_id));

CREATE POLICY "Owners can add members"
  ON public.project_members FOR INSERT
  TO authenticated
  WITH CHECK (public.is_project_owner(project_id));

CREATE POLICY "Owners can update members"
  ON public.project_members FOR UPDATE
  TO authenticated
  USING (public.is_project_owner(project_id));

CREATE POLICY "Owners can remove members or members can leave"
  ON public.project_members FOR DELETE
  TO authenticated
  USING (public.is_project_owner(project_id) OR user_id = auth.uid());

-- Requirements policies
CREATE POLICY "Members can view requirements"
  ON public.requirements FOR SELECT
  TO authenticated
  USING (public.is_project_member(project_id));

CREATE POLICY "Editors can create requirements"
  ON public.requirements FOR INSERT
  TO authenticated
  WITH CHECK (public.can_edit_project(project_id));

CREATE POLICY "Editors can update requirements"
  ON public.requirements FOR UPDATE
  TO authenticated
  USING (public.can_edit_project(project_id));

CREATE POLICY "Editors can delete requirements"
  ON public.requirements FOR DELETE
  TO authenticated
  USING (public.can_edit_project(project_id));

-- Use cases policies
CREATE POLICY "Members can view use cases"
  ON public.use_cases FOR SELECT
  TO authenticated
  USING (public.is_project_member(project_id));

CREATE POLICY "Editors can create use cases"
  ON public.use_cases FOR INSERT
  TO authenticated
  WITH CHECK (public.can_edit_project(project_id));

CREATE POLICY "Editors can update use cases"
  ON public.use_cases FOR UPDATE
  TO authenticated
  USING (public.can_edit_project(project_id));

CREATE POLICY "Editors can delete use cases"
  ON public.use_cases FOR DELETE
  TO authenticated
  USING (public.can_edit_project(project_id));

-- Design artifacts policies
CREATE POLICY "Members can view design artifacts"
  ON public.design_artifacts FOR SELECT
  TO authenticated
  USING (public.is_project_member(project_id));

CREATE POLICY "Editors can create design artifacts"
  ON public.design_artifacts FOR INSERT
  TO authenticated
  WITH CHECK (public.can_edit_project(project_id));

CREATE POLICY "Editors can update design artifacts"
  ON public.design_artifacts FOR UPDATE
  TO authenticated
  USING (public.can_edit_project(project_id));

CREATE POLICY "Editors can delete design artifacts"
  ON public.design_artifacts FOR DELETE
  TO authenticated
  USING (public.can_edit_project(project_id));

-- Test cases policies
CREATE POLICY "Members can view test cases"
  ON public.test_cases FOR SELECT
  TO authenticated
  USING (public.is_project_member(project_id));

CREATE POLICY "Editors can create test cases"
  ON public.test_cases FOR INSERT
  TO authenticated
  WITH CHECK (public.can_edit_project(project_id));

CREATE POLICY "Editors can update test cases"
  ON public.test_cases FOR UPDATE
  TO authenticated
  USING (public.can_edit_project(project_id));

CREATE POLICY "Editors can delete test cases"
  ON public.test_cases FOR DELETE
  TO authenticated
  USING (public.can_edit_project(project_id));

-- Documents policies
CREATE POLICY "Members can view documents"
  ON public.documents FOR SELECT
  TO authenticated
  USING (public.is_project_member(project_id));

CREATE POLICY "Editors can create documents"
  ON public.documents FOR INSERT
  TO authenticated
  WITH CHECK (public.can_edit_project(project_id));

CREATE POLICY "Editors can update documents"
  ON public.documents FOR UPDATE
  TO authenticated
  USING (public.can_edit_project(project_id));

CREATE POLICY "Editors can delete documents"
  ON public.documents FOR DELETE
  TO authenticated
  USING (public.can_edit_project(project_id));

-- Chat messages policies
CREATE POLICY "Members can view chat messages"
  ON public.chat_messages FOR SELECT
  TO authenticated
  USING (public.is_project_member(project_id));

CREATE POLICY "Editors can create chat messages"
  ON public.chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (public.can_edit_project(project_id));

-- Create trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_requirements_updated_at
  BEFORE UPDATE ON public.requirements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_use_cases_updated_at
  BEFORE UPDATE ON public.use_cases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_design_artifacts_updated_at
  BEFORE UPDATE ON public.design_artifacts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_test_cases_updated_at
  BEFORE UPDATE ON public.test_cases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for collaboration
ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
ALTER PUBLICATION supabase_realtime ADD TABLE public.requirements;
ALTER PUBLICATION supabase_realtime ADD TABLE public.use_cases;
ALTER PUBLICATION supabase_realtime ADD TABLE public.design_artifacts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.test_cases;
ALTER PUBLICATION supabase_realtime ADD TABLE public.documents;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;