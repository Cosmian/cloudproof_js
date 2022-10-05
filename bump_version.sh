#!/bin/sh

#
# Example:
#
# bash bump_version.sh 3.0.1 3.0.2

set -exEu

OLD_VERSION=$1
NEW_VERSION=$2

sed -i "s/\"version\": \"$OLD_VERSION\"/\"version\": \"$NEW_VERSION\"/" package.json
sed -i "s/$OLD_VERSION/$NEW_VERSION/" site/index.html
