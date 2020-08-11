if [ "$(whoami)" != "apps" ]; then
	echo "Please don't run this script unless you are apps, otherwise you will ruin the permissions"
	exit 1
fi

cd /var/www/html
git pull origin

chmod +x ./deployScripts/AllocationEvent.sh
chmod +x ./deployScripts/Confimation.sh
chmod +x ./deployScripts/PlacementEvent.sh
chmod +x ./deployScripts/ClaimEvent.sh

forever stopall

./deployScripts/AllocationEvent.sh
./deployScripts/Confimation.sh
./deployScripts/PlacementEvent.sh
./deployScripts/ClaimEvent.sh
