#! /bin/bash

cat sqlScripts/creation.sql sqlScripts/insertion.sql | sqlite3 ${1}