@echo off
echo Starting MongoDB daemon for WearStep...
start /b "" "C:\Users\Saikr\mongodb\bin\mongod.exe" --config "C:\Users\Saikr\mongodb\mongod.cfg"
echo MongoDB running on port 27017.
