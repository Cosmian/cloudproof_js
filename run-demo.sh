#!/bin/sh
set -exEu

cd ~/demo_cloudproof/

docker load <frontend.tar
docker-compose -f docker-compose.yml down
docker-compose -f docker-compose.yml up -d

docker cp dump_db_demo.sh db:/tmp/
docker cp dump_db_demo.sql db:/tmp/
docker exec -i db sh /tmp/dump_db_demo.sh
