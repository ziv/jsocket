rm -rf ./dist/npm
mkdir -p ./dist/npm

# copy files make necessary changes
cp -r ./npm/* ./dist/npm/.
cp readme.md ./dist/npm/readme.md
cp LICENSE ./dist/npm/LICENSE

cd ./dist/npm
npm ci
tsc -p tsconfig.json
npm publish --access public