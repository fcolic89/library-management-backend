#!/usr/bin/env bash

host="mongodb://localhost:27017"
mongosh $host --username admin --password admin --authenticationDatabase library
