--
-- PostgreSQL database cluster dump
--

SET default_transaction_read_only = off;

SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;

--
-- Drop tables
--
DROP TABLE public.encrypted_users;
DROP TABLE public.users;
DROP TABLE public.index_chain;
DROP TABLE public.index_entry;

--
-- Drop databases (except postgres and template1)
--

DROP DATABASE app_db;




--
-- Drop roles
--

DROP ROLE app_user;


--
-- Roles
--

CREATE ROLE app_user;
ALTER ROLE app_user WITH SUPERUSER INHERIT CREATEROLE CREATEDB LOGIN REPLICATION BYPASSRLS PASSWORD 'SCRAM-SHA-256$4096:C00FSonwjVZMZF2wJbV5Tg==$T/zgeRp7WPHN2HtVONKYKPdMm/+N72wD+I2WnzPSX2s=:Sr0lph57P9tMJQs3NDLfFoukMRUDLDhGQEN3EK97ET0=';


CREATE DATABASE app_db  ENCODING = 'UTF8' LOCALE = 'en_US.utf8';


ALTER DATABASE app_db OWNER TO app_user;

\connect app_db

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: encrypted_directory; Type: TABLE; Schema: public; Owner: app_user
--

CREATE TABLE public.encrypted_users (
    "uid" text NOT NULL,
    "enc_basic" text NOT NULL,
    "enc_hr" text NOT NULL,
    "enc_security" text NOT NULL
);


ALTER TABLE public.encrypted_users OWNER TO app_user;

--
-- Name: index_chain; Type: TABLE; Schema: public; Owner: app_user
--

CREATE TABLE public.index_chain (
    "uid" text NOT NULL,
    "value" text NOT NULL
);


ALTER TABLE public.index_chain OWNER TO app_user;

--
-- Name: index_entry; Type: TABLE; Schema: public; Owner: app_user
--

CREATE TABLE public.index_entry (
    "uid" text NOT NULL,
    "value" text NOT NULL
);


ALTER TABLE public.index_entry OWNER TO app_user;

--
-- Name: users; Type: TABLE; Schema: public; Owner: app_user
--

CREATE TABLE public.users (
    "id" text NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    country text NOT NULL,
    region text NOT NULL,
    "employeeNumber" text NOT NULL,
    security text NOT NULL,
    enc_uid text DEFAULT NULL
);


ALTER TABLE public.users OWNER TO app_user;

--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: app_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);
