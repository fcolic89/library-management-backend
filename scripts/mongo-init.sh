#!/usr/bin/env bash

set -m

/usr/bin/mongod --replSet replica-set-name --port 27017 --bind_ip_all &

sleep 5

/usr/bin/mongosh mongodb://mongo:27017/library --file mongo-replSet-init.js

/usr/bin/mongosh mongodb://mongo:27017/library?replicaSet=replica-set-name --file init-data.js

fg %1
