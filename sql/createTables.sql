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
references public.letters (id)
);