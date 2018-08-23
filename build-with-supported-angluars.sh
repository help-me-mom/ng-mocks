#!/bin/sh
set -e
VERSIONS="5 6"
PACKAGES="common compiler core forms platform-browser platform-browser-dynamic"

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

  echo $version | grep -Eq "^5" && NEW="$NEW rxjs@5.5.5 zone.js@0.8.14 typescript@2.4" || NEW="$NEW rxjs@6.0.0 zone.js@0.8.26 typescript@2.7"

  npm uninstall --no-save $OLD
  npm install --no-save $NEW
  npm run build:all
done
echo Testing complete
npm install
