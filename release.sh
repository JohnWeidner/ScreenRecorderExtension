rm release.zip
# vi manifest.json
rm -rf build
mkdir build
mkdir build/src
mkdir build/assets
cp src/background.js build/src/.
cp assets/arrow.png build/assets/.
cp assets/arrow_black.png build/assets/.
cp assets/icon.png build/assets/.
cp assets/icon_red.png build/assets/.
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
