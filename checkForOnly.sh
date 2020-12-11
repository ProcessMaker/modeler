#!/bin/sh
badLineCount=$(find . -iname \*.spec.js -exec grep -Hn "\.only" {} \; | wc -l)
if [ $badLineCount -eq 0 ]; then
  echo "it's safe"
else
  echo "it contains .only statements"
  find . -iname \*.spec.js -exec grep -Hn "\.only" {} \;
  exit -1
fi
