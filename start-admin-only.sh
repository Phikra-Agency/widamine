#!/bin/bash
tmux send-keys -t widamine-admin "cd /home/alae/Documents/repos/widamine/new-widamine && npm run dev -- --port 5174 --host" C-m
