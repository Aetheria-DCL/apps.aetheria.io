export PLACEMENTEVENTMODE="linuxProduction"

cd public/apps/PlacementEvent/js-dev

npm install
webpack-cli

cd ../../../../private/PlacementEvent
npm install
npm run build
npm run run

cd ../..
