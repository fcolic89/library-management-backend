#!/usr/bin/env bash

set -m

replica_set_name="r0"

/usr/bin/mongod --replSet $replica_set_name --port 27017 --bind_ip localhost,$(hostname) &

sleep 5

/usr/bin/mongosh mongodb://127.0.0.1:27017/library --file mongo-replSet-init.js

/usr/bin/mongosh mongodb://127.0.0.1:27017/library?replicaSet=$replica_set_name --file init-data.js

cat << EOF >> /etc/bash.bashrc
connect(){
  local host="mongodb://localhost:27017/library?replicaSet=$replica_set_name"
  mongosh "\$host"
}
EOF

fg %1
