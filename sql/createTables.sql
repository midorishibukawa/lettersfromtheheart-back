CREATE TABLE IF NOT EXISTS public.users (
    id          SERIAL PRIMARY KEY,
    username    TEXT    NOT NULL    UNIQUE,
    email       TEXT    NOT NULL    UNIQUE,
    password    TEXT    NOT NULL
);

CREATE TABLE IF NOT EXISTS public.letters (
id          SERIAL PRIMARY KEY,
from_user INTEGER NOT NULL,
constraint fk_user
foreign key (from_user)
references public.users (id),
text TEXT NOT NULL,
reply_to INTEGER 
constraint fk_reply_to
references public.letters (id),
creation_date TIMESTAMPTZ
);

CREATE OR REPLACE FUNCTION set_creation_date()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.creation_date IS NULL then
    	SET TIME ZONE 'America/Sao_Paulo';
        NEW.creation_date = current_timestamp;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_creation_date_trigger
BEFORE INSERT ON public.letters
FOR EACH ROW
EXECUTE FUNCTION set_creation_date();