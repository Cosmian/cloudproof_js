--
-- PostgreSQL database cluster dump
--

SET default_transaction_read_only = off;

SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;


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
    "uid" text NOT NULL DEFAULT uuid_generate_v4(),
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
    id uuid,
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
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: app_user
--

INSERT INTO public.users (id, "firstName", "lastName", email, phone, country, region, "employeeNumber", security)
VALUES
(uuid_generate_v4 (),'Emerson','Wilkins','enim.diam@icloud.edu','01 01 31 41 37','Spain','Antofagasta','BYE60HQT6XG','confidential'),
(uuid_generate_v4 (), 'Ocean','Meyers','ultrices.vivamus@aol.net','07 45 55 66 55','Spain','Podlaskie','SXK82FCR9EP','confidential'),
(uuid_generate_v4 (),'Kiara','Harper','vitae@outlook.com','07 17 88 69 58','Germany','Rajasthan','CWN36QTX2BN','secret'),
(uuid_generate_v4 (),'Joelle','Becker','felis.adipiscing@hotmail.org','01 11 46 84 14','France','İzmir','AFR04EPJ1YM','secret'),
(uuid_generate_v4 (),'Stacy','Reyes','risus.a@yahoo.ca','03 53 66 40 67','France','Nord-Pas-de-Calais','ZVW02EAM3ZC','secret'),
(uuid_generate_v4 (),'Donna','Velazquez','mus.donec@aol.couk','01 69 11 40 51','Germany','Tuyên Quang','DOP17EIM7ST','top_secret'),
(uuid_generate_v4 (),'Wylie','Snider','fringilla.mi@google.com','07 36 72 54 66','France','Kansas','RYS34KBD5VW','top_secret'),
(uuid_generate_v4 (),'Brielle','Finley','egestas.aliquam@hotmail.edu','02 75 95 77 31','France','Ulyanovsk Oblast','MFU36KUO6UD','top_secret'),
(uuid_generate_v4 (),'Bryar','Christian','ullamcorper.eu.euismod@google.ca','02 44 54 20 55','Germany','Hatay','TRK72WOV9VH','confidential'),
(uuid_generate_v4 (),'Diana','Wilson','nascetur.ridiculus.mus@outlook.net','03 35 75 32 28','Germany','Ulster','UPS23SOZ6QN','confidential'),
(uuid_generate_v4 (),'Paul','Ford','pede.suspendisse@icloud.com','05 13 27 74 63','Germany','Rio Grande do Sul','CWT54TJX4RT','confidential'),
(uuid_generate_v4 (),'Felicia','Massey','lacus.varius.et@yahoo.ca','06 72 81 43 63','Germany','Brecknockshire','BAC58KIS7DY','secret'),
(uuid_generate_v4 (),'Barclay','Allison','in.cursus@aol.com','08 71 12 69 37','Germany','Caquetá','KLL08RGK2JW','secret'),
(uuid_generate_v4 (),'Skyler','Richmond','elit@google.net','Figueroa','France','Chiapas','ITO71LVO4PD','secret'),
(uuid_generate_v4 (),'Justin','Cross','neque.vitae@yahoo.edu','07 56 26 00 16','Germany','Friuli-Venezia Giulia','HHH01MIH6SZ','top_secret'),
(uuid_generate_v4 (),'Miranda','Cotton','eget.magna@google.ca','06 73 42 44 47','Spain','Møre og Romsdal','DFW37PPI8TY','top_secret'),
(uuid_generate_v4 (),'Figueroa','Kane','aenean.eget@protonmail.ca','02 44 08 45 32','France','Kansas','HFG82IKJ2OC','top_secret'),
(uuid_generate_v4 (),'Lesley','Sullivan','orci.ut@protonmail.couk','02 24 15 21 81','Spain','Lubelskie','WOA67IVR6CM','confidential'),
(uuid_generate_v4 (),'Clio','Figueroa','tellus@yahoo.org','06 87 82 58 97','France','Munster','ASS31LNB5CV','confidential'),
(uuid_generate_v4 (),'Forrest','Parsons','iaculis.quis@yahoo.com','06 81 51 26 17','France','Hải Phòng','MJS53TBZ8UL','confidential'),
(uuid_generate_v4 (),'Maxwell','Park','ut@yahoo.com','01 37 79 08 31','Germany','Guanacaste','PHQ43BNF8MI','secret'),
(uuid_generate_v4 (),'Kalia','Hayden','non.egestas.a@aol.ca','02 24 48 01 44','Spain','Gävleborgs län','QUW73NPX4UG','secret'),
(uuid_generate_v4 (),'Russell','Willis','sit.amet@icloud.edu','07 42 02 43 15','France','Bihar','QOU03UHS4LQ','secret'),
(uuid_generate_v4 (),'Judah','Chang','tempor.arcu@icloud.ca','02 15 66 88 81','Spain','Assam','BJJ93AIN8LC','top_secret'),
(uuid_generate_v4 (),'Chaim','Richards','nunc.sed@protonmail.com','08 97 39 30 70','Germany','Xīběi','JTS20MCR7GX','top_secret'),
(uuid_generate_v4 (),'Zachary','Porter','suscipit.nonummy.fusce@hotmail.couk','02 02 52 43 30','Germany','Kaduna','NLN76SBS2EI','top_secret'),
(uuid_generate_v4 (),'Cade','Gould','neque.vitae@google.org','09 82 18 22 16','Germany','Luik','RSW01YCJ6HJ','confidential'),
(uuid_generate_v4 (),'Hiram','Gates','tristique.senectus@outlook.net','02 46 85 81 87','Spain','Niger','EGG84NJY5TH','confidential'),
(uuid_generate_v4 (),'Deirdre','Tate','laoreet.ipsum@hotmail.com','02 99 26 61 08','Spain','Anambra','SLO36EYL1LQ','confidential'),
(uuid_generate_v4 (),'Len','Carlson','non@aol.ca','05 69 55 17 78','Germany','Western Visayas','DHS57TIH5JX','secret'),
(uuid_generate_v4 (),'Griffin','Porter','volutpat.nulla@protonmail.org','03 44 78 02 98','Germany','Rheinland-Pfalz','JTQ18TFU5XL','secret'),
(uuid_generate_v4 (),'Caleb','Sellers','ipsum.dolor@aol.net','08 43 33 76 76','Spain','Lanarkshire','DJE23GBD4HV','secret'),
(uuid_generate_v4 (),'Wang','Chan','venenatis.vel@outlook.net','07 13 38 17 82','Spain','Tripura','VYY77VOW0QR','top_secret'),
(uuid_generate_v4 (),'Kalia','Douglas','mus.proin@hotmail.net','03 56 82 77 04','France','Tripura','AHM27UPN3HD','top_secret'),
(uuid_generate_v4 (),'Ivy','Wong','sit.amet.lorem@google.org','04 95 11 83 54','Germany','Kahramanmaraş','YCE84QZN1AU','top_secret'),
(uuid_generate_v4 (),'Brendan','Rivers','nonummy.ut@aol.couk','02 24 31 11 26','Germany','Free State','RVY06JHG6DN','confidential'),
(uuid_generate_v4 (),'Jane','Mckay','vestibulum@protonmail.couk','01 48 61 56 13','France','Newfoundland and Labrador','CEL23TSP8QV','confidential'),
(uuid_generate_v4 (),'Leroy','Cole','integer.eu@aol.edu','06 78 56 75 66','Germany','Bengkulu','SCI84CBR1UF','confidential'),
(uuid_generate_v4 (),'Axel','Buckley','dignissim.maecenas@aol.com','09 61 37 41 27','Germany','Luik','JWL04CDN7BL','secret'),
(uuid_generate_v4 (),'Martin','Stuart','feugiat.non@icloud.com','09 80 48 88 65','Germany','Queensland','LVT07UPM5YB','secret'),
(uuid_generate_v4 (),'Jerry','Gonzales','convallis.convallis@aol.org','07 24 80 13 06','Spain','São Paulo','RBU57EWQ8MI','secret'),
(uuid_generate_v4 (),'Pandora','Robinson','libero.mauris@yahoo.couk','05 92 75 54 58','Spain','Meghalaya','GFM62DCY6SQ','top_secret'),
(uuid_generate_v4 (),'Xander','Douglas','arcu.sed@protonmail.couk','08 22 77 36 03','France','Ile de France','DIY45MVM4TV','top_secret'),
(uuid_generate_v4 (),'Tyler','Webb','pede.praesent@outlook.edu','07 71 71 93 44','Germany','Northern Mindanao','XWN45SZY1HB','top_secret'),
(uuid_generate_v4 (),'Martena','Lynn','magnis.dis@outlook.com','06 88 58 74 37','Germany','Zhōngnán','MYO35XFT4CC','confidential'),
(uuid_generate_v4 (),'Clinton','Bradshaw','venenatis.lacus.etiam@google.net','08 42 86 17 33','France','North West','MIK59YOF7GO','confidential'),
(uuid_generate_v4 (),'Giacomo','House','risus@hotmail.org','08 84 84 60 44','Germany','FATA','OCQ75JAR6BE','confidential'),
(uuid_generate_v4 (),'Molly','Whitehead','interdum.nunc.sollicitudin@yahoo.couk','06 61 67 75 61','France','South Island','NIS84SJD6FR','secret'),
(uuid_generate_v4 (),'Luke','Reed','molestie@protonmail.org','08 73 28 17 78','Spain','Central Region','KAY46LAI4JN','secret'),
(uuid_generate_v4 (),'Mason','Snider','nulla.semper@protonmail.ca','02 57 65 38 41','Spain','Ilocos Region','YOC20OKT9UN','secret'),
(uuid_generate_v4 (),'Dieter','Bright','in.molestie@hotmail.ca','04 74 61 75 34','Spain','Cajamarca','IJI23SQF8YO','top_secret'),
(uuid_generate_v4 (),'Tashya','Vazquez','ultricies@yahoo.edu','07 98 70 76 64','Spain','Zhytomyr oblast','DBU82FRI2YJ','top_secret'),
(uuid_generate_v4 (),'Jordan','Wilder','eget.lacus@aol.ca','06 50 84 72 43','Spain','Central Java','DGG17XWQ6UM','top_secret'),
(uuid_generate_v4 (),'Dominique','Mcfarland','ac@outlook.ca','07 17 21 15 05','Germany','Kursk Oblast','JIP69EHR6KY','confidential'),
(uuid_generate_v4 (),'Hyatt','Marks','at.sem.molestie@yahoo.com','03 47 59 28 56','France','Picardie','YVU78WCO3LK','confidential'),
(uuid_generate_v4 (),'Kasper','Brennan','bibendum@google.ca','04 57 71 59 02','France','Rogaland','THP01CAA6LJ','confidential'),
(uuid_generate_v4 (),'Summer','Crane','ipsum@aol.org','05 35 71 18 22','Germany','North Chungcheong','UJY85LZO1VG','secret'),
(uuid_generate_v4 (),'Xenos','Whitfield','a.feugiat@outlook.couk','08 30 96 35 54','Spain','Kherson oblast','NVG99IMP6JD','secret'),
(uuid_generate_v4 (),'Dale','Lane','lacus@aol.com','06 57 86 21 77','Spain','California','WOG25MBO3PC','secret'),
(uuid_generate_v4 (),'Baker','Knowles','sem.ut@protonmail.edu','02 59 68 76 19','France','Heredia','JAI31QCC1CS','top_secret'),
(uuid_generate_v4 (),'Elaine','Chase','tellus.sem.mollis@icloud.ca','08 96 37 63 57','France','Dalarnas län','TCF97SQG4US','top_secret'),
(uuid_generate_v4 (),'Sophia','Salinas','arcu.sed@outlook.couk','04 88 58 20 33','Spain','East Java','QPD64DEE4MN','top_secret'),
(uuid_generate_v4 (),'Ramona','Sampson','nullam.suscipit@yahoo.ca','07 66 19 62 82','France','Principado de Asturias','XDX32WIN7KD','confidential'),
(uuid_generate_v4 (),'Iris','Berg','ante@aol.ca','01 00 34 62 27','Spain','Atacama','JOJ64MTG8YN','confidential'),
(uuid_generate_v4 (),'Calvin','Joyner','ipsum@google.couk','06 84 59 78 28','France','Lagos','DPF55GCD6AS','confidential'),
(uuid_generate_v4 (),'Martina','Hickman','erat.volutpat@protonmail.com','02 21 24 02 39','Spain','Catalunya','YRL83GET3VE','secret'),
(uuid_generate_v4 (),'Xantha','Montgomery','risus.odio@protonmail.com','03 05 74 29 97','Germany','Merionethshire','UCQ10RTQ2SI','secret'),
(uuid_generate_v4 (),'Amy','Wright','nunc.lectus@aol.com','05 65 15 40 63','France','Penza Oblast','IPT58WWO5LX','secret'),
(uuid_generate_v4 (),'Alma','Schroeder','aliquet.magna.a@protonmail.couk','04 23 46 16 33','Germany','East Kalimantan','EMH30WSQ3MS','top_secret'),
(uuid_generate_v4 (),'Marvin','Bowen','malesuada@aol.couk','07 42 38 86 27','France','Tasmania','YUQ42QOG7XD','top_secret'),
(uuid_generate_v4 (),'Ila','Drake','posuere.enim@google.edu','02 47 45 63 07','France','Gävleborgs län','RJT61MYB8MY','top_secret'),
(uuid_generate_v4 (),'Noble','Cunningham','mollis.non@yahoo.couk','05 19 20 79 58','Spain','Brussels Hoofdstedelijk Gewest','FCF77JFT8EW','confidential'),
(uuid_generate_v4 (),'Lilah','Stewart','tincidunt.orci@google.ca','05 56 71 95 15','Germany','South Australia','HZI85ZFQ4SH','confidential'),
(uuid_generate_v4 (),'Gavin','Bailey','dui.in.sodales@protonmail.net','08 25 25 31 93','Spain','Diyarbakır','NVH67DKP6FV','confidential'),
(uuid_generate_v4 (),'Janna','Hurst','consectetuer.cursus.et@google.couk','04 26 15 12 98','Spain','Ceuta','EOR61GBW9OL','secret'),
(uuid_generate_v4 (),'Kylie','Mullen','lobortis.quam@google.edu','02 46 54 90 13','Germany','Waals-Brabant','TBS73YUW3PQ','secret'),
(uuid_generate_v4 (),'MacKensie','Atkinson','integer.eu@google.org','08 03 38 16 24','France','Sachsen','NGO64EMM1XG','secret'),
(uuid_generate_v4 (),'Jack','Armstrong','varius.nam@protonmail.edu','07 22 43 06 14','Spain','Andaman and Nicobar Islands','EEI44MCQ4MF','top_secret'),
(uuid_generate_v4 (),'Karly','Maxwell','pharetra.nam@icloud.edu','03 93 73 18 84','Spain','Henegouwen','ABY52MFR3GP','top_secret'),
(uuid_generate_v4 (),'Lucius','Baxter','eu.metus@icloud.org','06 37 54 06 88','France','North Region','UCI44NTO1YV','top_secret'),
(uuid_generate_v4 (),'Palmer','Mccall','a.auctor@google.edu','01 95 80 85 96','Germany','Michigan','QCB22NGM7VN','confidential'),
(uuid_generate_v4 (),'Reagan','Lynch','donec.nibh@google.ca','04 15 43 21 21','France','Gävleborgs län','BUD99RIH9KB','confidential'),
(uuid_generate_v4 (),'Kibo','Mcintosh','aliquam@protonmail.net','08 88 35 57 43','France','Małopolskie','VZR07UEQ2PU','confidential'),
(uuid_generate_v4 (),'Peter','Edwards','cras@protonmail.edu','01 56 71 49 15','Spain','Chernivtsi oblast','FIY93USG7LF','secret'),
(uuid_generate_v4 (),'Kato','Parsons','lectus@google.com','02 15 37 96 48','France','Western Australia','BXB16IOM1OH','secret'),
(uuid_generate_v4 (),'Suki','Newman','sed.id@protonmail.ca','07 25 82 47 51','France','Bình Dương','EFC57JHW4MT','secret'),
(uuid_generate_v4 (),'Sean','Tucker','quis.arcu.vel@icloud.ca','02 55 88 99 01','Germany','Kahramanmaraş','DPF11YBI4FX','top_secret'),
(uuid_generate_v4 (),'Eve','Collier','diam.duis.mi@icloud.org','02 38 25 54 78','Germany','Corse','EXV52JNI9ZG','top_secret'),
(uuid_generate_v4 (),'Martena','Grimes','cras.eu@yahoo.edu','08 78 28 44 11','Germany','South Island','NBX34YIH1OQ','top_secret'),
(uuid_generate_v4 (),'Eagan','Foster','donec.sollicitudin@yahoo.de','05 27 63 48 34','Germany','Munster','DVD87LBG6UL','confidential'),
(uuid_generate_v4 (),'Felix','Navidad','et.magnis@hotmail.es','05 95 41 55 09','Spain','Antofagasta','JDG52IJE1FN','confidential'),
(uuid_generate_v4 (),'Shaine','Quinn','sit.amet.lorem@protonmail.edu','06 13 89 12 11','Germany','West Region','XNW76UKP0DP','confidential'),
(uuid_generate_v4 (),'Wylie','Gay','adipiscing.lobortis.risus@hotmail.ca','08 99 13 97 15','Germany','Antofagasta','OMR67KMM3QR','secret'),
(uuid_generate_v4 (),'Felix','Garcia','pede.sagittis@aol.es','08 26 78 84 71','Spain','Paraíba','EQN94VSX2IJ','secret'),
(uuid_generate_v4 (),'Beck','Gray','felis.ullamcorper@google.couk','08 72 82 86 44','Germany','Noord Holland','VCD88TYG7IX','secret'),
(uuid_generate_v4 (),'Felix','Robert','dolor.sit@hotmail.fr','03 37 88 63 83','France','Aquitaine','BTZ36YSA2XP','top_secret'),
(uuid_generate_v4 (),'Aaron','Stanton','magna.sed@yahoo.org','09 21 34 93 29','Germany','Mexico City','UDB51OGB2XO','top_secret'),
(uuid_generate_v4 (),'Uriah','Foley','mi.fringilla.mi@yahoo.edu','09 39 55 67 05','Germany','North Gyeongsang','JXW87GWD3IF','top_secret'),
(uuid_generate_v4 (),'Ima','Ewing','vitae@yahoo.com','02 91 58 54 73','Germany','National Capital Region','JCO37AVA1LH','confidential');

-- --
-- -- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: app_user
-- --

-- SELECT pg_catalog.setval(uuid_generate_v4 (),'public.users_id_seq', 101, false);


--
-- Name: encrypted_directory encrypted_directory_pkey; Type: CONSTRAINT; Schema: public; Owner: app_user
--

-- ALTER TABLE ONLY public.encrypted_directory
--     ADD CONSTRAINT encrypted_directory_pkey PRIMARY KEY ("UID");


--
-- Name: index_chain index_chain_pkey; Type: CONSTRAINT; Schema: public; Owner: app_user
--

-- ALTER TABLE ONLY public.index_chain
--     ADD CONSTRAINT index_chain_pkey PRIMARY KEY ("UID");


--
-- Name: index_entry index_entry_pkey; Type: CONSTRAINT; Schema: public; Owner: app_user
--

-- ALTER TABLE ONLY public.index_entry
--     ADD CONSTRAINT index_entry_pkey PRIMARY KEY ("UID");


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: app_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);
