# I) Launch project locally

- Launch DB (Postgre) and PostgREST (small backend exposing directly DB as a REST API)  `docker-compose up server db`

- When the DB is launched, you must build the db, the tables and fill users table. For this, you can use the sql file : `cat dump_db_demo.sql | docker exec -i NAME_OF_YOUR_DB_CONTAINER psql -U app_user -d app_db`
Example:
```bash
cat dump_db_demo.sql | docker exec -i db psql -U app_user -d app_db
```

- Launch frontend with : `npx webpack serve`

- Access it on `localhost:8080`


# II) Deploy project

- Build new image from frontend with the Dockerfile example (put it one level above the cosmian_js_lib to run it correctly) `docker build -f Dockerfile -t frontend .`

- Save this image `docker save frontend > frontend.tar`

- Send it to distant machine and load it from the distant machine `docker load < frontend.tar`

- Stop docker-compose and relaunch it
