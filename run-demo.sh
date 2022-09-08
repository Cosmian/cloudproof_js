#!/bin/sh
set -exEu

cd ~/demo_cloudproof/

docker load <frontend.tar
docker-compose -f docker-compose.yml down
docker-compose -f docker-compose.yml up -d
docker cp dump_db_demo.sql db:/tmp/
docker exec -i db psql -h localhost -U app_user -d app_db -f /tmp/dump_db_demo.sql
