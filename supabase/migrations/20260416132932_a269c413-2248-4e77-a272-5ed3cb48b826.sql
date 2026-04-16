-- Protect owner role from being deleted or changed
CREATE OR REPLACE FUNCTION public.protect_owner_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.role::text = 'owner' THEN
      RAISE EXCEPTION 'Cannot remove owner role';
    END IF;
    RETURN OLD;
  END IF;
  
  IF TG_OP = 'UPDATE' THEN
    IF OLD.role::text = 'owner' THEN
      RAISE EXCEPTION 'Cannot modify owner role';
    END IF;
    RETURN NEW;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER protect_owner_role_trigger
BEFORE DELETE OR UPDATE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.protect_owner_role();

-- Create helper function using plpgsql to avoid enum parse issue
CREATE OR REPLACE FUNCTION public.is_owner(_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role::text = 'owner'
  );
END;
$$;
