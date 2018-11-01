
privkey=${bankrollerPrivateKey:-"0x99a9681faf8e1e178902fe911fb7ba8df7a77539246cf5d76c0012324cd8a175"}

echo ""
echo ""
echo ""
echo "Start bankroller with privkey: $privkey"
echo ""
echo ""
echo ""

node_modules/.bin/concurrently "node_modules/.bin/bankroller-core start -r $privkey" "npm run start-gameserver"
