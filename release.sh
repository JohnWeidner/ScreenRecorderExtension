rm release.zip
# vi manifest.json
rm -rf build
mkdir build
mkdir build/src
mkdir build/assets
cp src/background.js build/src/.
cp src/install.js build/src/.
cp manifest.json build/.
cp src/ourrecorder.js build/src/.
cp src/receiver.js build/src/.
cp src/options.js build/src/.
cp assets/arrow.png build/assets/.
cp assets/arrow_black.png build/assets/.
cp assets/icon.png build/assets/.
cp assets/icon_red.png build/assets/.
cp src/install.html build/.
cp src/receiver.html build/.
cp src/options.html build/.
cd build
zip ../release.zip *
