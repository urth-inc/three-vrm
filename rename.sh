#!/bin/bash

find ./packages -type f | xargs sed -i "s/from 'three'/from 'three-r148'/g"
find ./packages -type f | xargs sed -i "s;from 'three/examples;from 'three-r148/examples;g"
