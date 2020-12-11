#!/bin/sh

# =================================================================
# Check that we never commit a .only on a test
# Also check that we never pass a --spec directive in package.json
# =================================================================

stagedFiles=$(git status --porcelain | grep '^M' | awk '{print $2}')

for file in $stagedFiles; do
  if [[ $file == "checkForOnly.sh" ]]; then
    continue
  fi

  if [[ $file == "package.json" ]]; then
    specDirectiveCount=$(grep "\-\-spec" package.json | wc -l)
    if [[ $specDirectiveCount -gt 0 ]]; then
      echo "package.json contains a spec directive."
      exit 255
    else
      echo "package.json is OK"
    fi
  fi

  numberOfOnlys=$(grep "\.only" $file | wc -l)
  if [[ $numberOfOnlys -gt 0 ]]; then
    echo "$file contains .only(s)"
    grep -n "\.only" $file --color=auto
    exit 255
  fi
done

echo "No staged files contain .only"
