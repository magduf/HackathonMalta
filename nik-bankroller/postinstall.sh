
# remove preinstalled dapps
rm -rf node_modules/bankroller-core/data/dapps/*

# add our dapp
cp -r mydappconf node_modules/bankroller-core/data/dapps/