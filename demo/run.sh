#!/bin/sh
set -exEu

cd ~/demo_cloudproof/

docker load < demo.tar
docker-compose -f docker-compose.yml down
docker-compose -f docker-compose.yml up -d