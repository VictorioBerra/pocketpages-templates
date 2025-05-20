#!/bin/bash

PB_VERSION=${1:-0.28.1}
PB_URL="https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip"

npx download --extract --out dest "$PB_URL"

mv dest/pocketbase ./pocketbase

chmod +x ./pocketbase

rm -rf dest

echo "Pocketbase v${PB_VERSION} downloaded and extracted to ./pocketbase"