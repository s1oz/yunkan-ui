@echo off
cd /d "%~dp0"
python serve.py --api http://127.0.0.1:23326 --media http://127.0.0.1:23406 --host 0.0.0.0 --port 18081 %*
