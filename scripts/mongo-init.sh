#!/usr/bin/env bash

/usr/bin/mongosh mongodb://mongo:27017/library --file mongo-replSet-init.js

/usr/bin/mongosh mongodb://mongo:27017/library?replicaSet=replica-set-name --file init-data.js
