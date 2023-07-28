#!/usr/bin/env bash

host="mongodb://localhost:27017/library?replicaSet=replica-set-name"
mongosh $host --username admin --password admin --authenticationDatabase library
