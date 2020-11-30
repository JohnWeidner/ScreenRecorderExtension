rm release.zip
# vi manifest.json
rm -rf build
mkdir build
mkdir build/src
cp arrow.png build/.
cp arrow_black.png build/.
cp src/background.js build/src/.
cp icon.png build/.
cp icon_red.png build/.
cp install.html build/.
cp install.js build/.
cp manifest.json build/.
cp ourrecorder.js build/.
cp receiver.html build/.
cp receiver.js build/.
cp options.js build/.
cp options.html build/.
cd build
zip ../release.zip *
