#!/bin/bash
# Full regression suite for Bushido. Usage: ./runall.sh  (tests game_test.html built by mktest.py)
cd /home/claude/bushido
python3 -I mktest.py
(timeout 600 python3 crawl.py he game_test.html > r_cr_he.log 2>&1 &)
(timeout 600 python3 crawl.py en game_test.html > r_cr_en.log 2>&1 &)
(timeout 700 python3 soak.py he game_test.html 300 > r_soak_he.log 2>&1 &)
(timeout 700 python3 soak.py en game_test.html 300 > r_soak_en.log 2>&1 &)
(timeout 900 python3 t2.py he > r_t2_he.log 2>&1 &)
(timeout 900 python3 t2.py en > r_t2_en.log 2>&1 &)
timeout 120 python3 t10.py > r_t10.log 2>&1
timeout 120 python3 t15.py > r_t15.log 2>&1
timeout 120 python3 t17.py > r_t17.log 2>&1
echo quick-done
