rm -rf ./dist/npm
mkdir -p ./dist/npm
# copy files make necessary changes
cp readme.md ./dist/npm/readme.md
cp LICENSE ./dist/npm/LICENSE
cp npm/package.json ./dist/npm/package.json
cp npm/tsconfig.npm.json ./dist/npm/tsconfig.json

cp mod.ts ./dist/npm/index.ts # nodejs entry point
cp read.ts ./dist/npm/read.ts
cp write.ts ./dist/npm/write.ts
cp utils.ts ./dist/npm/utils.ts

cp nodejs-client.ts ./dist/npm/client.ts # nodejs client
cp nodejs-server.ts ./dist/npm/server.ts # nodejs server

cd ./dist/npm
tsc -p tsconfig.json
npm publish --access public