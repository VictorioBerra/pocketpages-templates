npx download --extract --out dest https://github.com/pocketbase/pocketbase/releases/download/v0.28.1/pocketbase_0.28.1_linux_amd64.zip
mv dest/pocketbase ./pocketbase
chmod +x ./pocketbase
rm -rf dest