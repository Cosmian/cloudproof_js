#!/bin/sh

#
# Example:
#
# bash bump_version.sh 3.0.1 3.0.2

set -exEu

OLD_VERSION=$1
NEW_VERSION=$2
DATE=$(date +%F)

# Update CHANGELOG.md
sed -i "5 i ---" CHANGELOG.md
sed -i "6 i ## [$NEW_VERSION] - $DATE" CHANGELOG.md
sed -i "7 i ### Added" CHANGELOG.md
sed -i "8 i ### Changed" CHANGELOG.md
sed -i "9 i ### Fixed" CHANGELOG.md
sed -i "10 i ### Removed" CHANGELOG.md
sed -i "11 i \\\\" CHANGELOG.md

# Update version where it needs to be
sed -i "s/\"version\": \"$OLD_VERSION\"/\"version\": \"$NEW_VERSION\"/" package.json
sed -i "s/$OLD_VERSION/$NEW_VERSION/" site/index.html
