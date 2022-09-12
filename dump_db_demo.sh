#!/bin/sh

set -exE

export PGPASSWORD=password

psql -h localhost -U app_user -d app_db -f /tmp/dump_db_demo.sql
