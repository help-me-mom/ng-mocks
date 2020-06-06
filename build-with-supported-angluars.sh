#!/bin/sh
set -e
VERSIONS="5 6 7 8 9"
PACKAGES="animations common compiler core forms platform-browser platform-browser-dynamic router"

for version in $VERSIONS
do
  echo Building with Angular $version...
  OLD="rxjs zone.js"
  NEW=""
  for package in $PACKAGES
  do
    OLD="$OLD @angular/$package"
    NEW="$NEW @angular/$package@$version"
  done

  echo $version | grep -Eq "^5" && NEW="$NEW rxjs@5.5.5 zone.js@0.8.14 typescript@2.4"
  echo $version | grep -Eq "^6" && NEW="$NEW rxjs@6.0.0 zone.js@0.8.26 typescript@2.7"
  echo $version | grep -Eq "^7" && NEW="$NEW rxjs@6.0.0 zone.js@0.8.26 typescript@3.1"
  echo $version | grep -Eq "^8" && NEW="$NEW rxjs@6.4.0 zone.js@0.9.1 typescript@3.4.3"
  echo $version | grep -Eq "^9" && NEW="$NEW rxjs@6.5.3 zone.js@0.10.2 typescript@3.6.4"

  echo $NEW

  npm uninstall --no-save $OLD
  npm install --no-save $NEW
  npm run build:all
done
npm install
npm run e2e
echo Testing complete
