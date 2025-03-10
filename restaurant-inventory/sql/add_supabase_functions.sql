-- SQL functions to add to Supabase
-- Function to check if a column exists in a table
CREATE OR REPLACE FUNCTION public.check_column_exists(table_name text, column_name text) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER AS $$ DECLARE column_exists boolean; BEGIN SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2) INTO column_exists; RETURN column_exists; END; $$;
-- Function to add a column if it doesn't exist
CREATE OR REPLACE FUNCTION public.add_column_if_not_exists(table_name text, column_name text, column_type text, column_default text DEFAULT NULL) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$ DECLARE column_exists boolean; alter_statement text; BEGIN SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2) INTO column_exists; IF NOT column_exists THEN alter_statement := 'ALTER TABLE public.' || quote_ident($1) || ' ADD COLUMN ' || quote_ident($2) || ' ' || $3; IF $4 IS NOT NULL THEN alter_statement := alter_statement || ' DEFAULT ' || $4; END IF; EXECUTE alter_statement; END IF; END; $$;
-- Transaction functions
CREATE OR REPLACE FUNCTION public.begin_transaction() RETURNS json LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN BEGIN; RETURN json_build_object('status', 'transaction started'); END; $$;
CREATE OR REPLACE FUNCTION public.commit_transaction() RETURNS json LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN COMMIT; RETURN json_build_object('status', 'transaction committed'); END; $$;
CREATE OR REPLACE FUNCTION public.rollback_transaction() RETURNS json LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN ROLLBACK; RETURN json_build_object('status', 'transaction rolled back'); END; $$;
