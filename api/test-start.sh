#!/bin/bash
cd /home/alae/Documents/repos/widamine/api
timeout 15 npm run dev 2>&1 | tee /tmp/api-test-start.log
