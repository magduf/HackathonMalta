QUIZBOX
______
A voice controlled quiz game. Players answer questions to compete for real money.

Presentation:
[a link](https://docs.google.com/presentation/d/1qOxNKU2f9C3Jmqte-MVI15MjGp_NuqMTce3_kOgwVRA/edit)

QUICKSTART
_________

    $ cd ben-truffle
    $ npm install

Start ganache.

    $ ganache-cli --unlock 0 --unlock 1 --unlock 3 --deterministic --mnemonic "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat"

Migrate quiz contract.

    $ truffle migrate

Start the quizmaster script to admnister a quiz. Use the command line to administer the quiz.

    $ truffle exec scripts/quizmaster.js

Start the snips player script.

    $ truffle exec scripts/snpis.js

Have fun and try to win some cryptocurrency, cryptocollectibles, or cryptoassets!

