export PLACEMENTEVENTMODE="linuxProduction"

cd public/apps/ClaimEvent/js-dev
npm install
webpack-cli

cd ../../../../private/ClaimEvent
npm install
npm run build
npm run run

cd ../..
