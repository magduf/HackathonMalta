const OS = require('os')
const http = require('http')
const DCWebapi = require('dc-webapi').default

// const platformId = OS.hostname()
const platformId = 'd663099e4cc6'
// const platformId = 'mysuperplatformid'

const dappManifest = require('./mydappconf/dapp.manifest.js')
const dappLogic = require('./mydappconf/dapp.logic.js')

const serverPort = process.env.serverPort || 7777
const playerPrivateKey = process.env.playerPrivateKey || '0x9957197e15d3973c04a0c2287e43b9519b0e33cdebf443dd63bed78635957f61'
const walletPass = 1234

/*
  Simple DappWrap )) class
 */
const Dapp = new class myDapp {
  async init (callback) {
    const webapi = await new DCWebapi({
      platformId: platformId,
      blockchainNetwork: 'ropsten'
    }).start()

    webapi.account.init(walletPass, playerPrivateKey)

    this.game = webapi.createGame({
      name: dappManifest.slug,
      contract: dappManifest.getContract(),
      rules: dappManifest.rules,
      gameLogicFunction: dappLogic
    })

    // this.game.on('webapi::status', data => {
    //   console.log('webapi::status', data)
    // })
  }

  async startGame (deposit = 10) {
    try {
      await this.game.start()
      return await this.game.connect({
        playerDeposit: deposit,
        gameData: [0, 0]
      })
    } catch (err) {
      console.error(err)
      console.warn(" ¯\_(ツ)_/¯ Can't connect, please repeat...")
    }
  }

  async play (userBet, userNum) {
    const result = await this.game.play({
      userBet: userBet,
      gameData: [userNum],
      rndOpts: [[1, 3]] // random from 1 to 3
    })

    return result
  }

  async endGame () {
    try {
      return await this.game.disconnect()
    } catch (err) {
      console.error(err)
      console.info('Disconnect result:', 'error')
    }
  }
}()

/*
  Run test game
   - init
   - open channel
   - play
   - close channel
 */
const test = async function () {
  console.log(`

    Init DApp

    ฅ^•ﻌ•^ฅ


  `)
  // Init dapp with logic and manifest
  // and init player account
  await Dapp.init()

  // Open Channel , find bankroller and send open TX with deposit
  console.log(`

  -------------------------------------------
    (⌐■_■) FIND BANKROLLER AND OPEN CHANNEL
  -------------------------------------------

  `)
  let userDeposit = 10
  await Dapp.startGame(userDeposit)

  // Play
  console.log(`

  -------------------------------
    Start PLAY  (ﾉ◕ヮ◕)ﾉ*:･ﾟ✧
  -------------------------------

  `)
  let userBet = 1
  // debugger
  const res1 = await Dapp.play(userBet, 1)
  console.log('Play 1 ', res1); console.log('\n\n\n')

  const res2 = await Dapp.play(userBet * 2, 2)
  console.log('Play 2', res2); console.log('\n\n\n')

  const res3 = await Dapp.play(userBet * 0.5, 3)
  console.log('Play 3', res3); console.log('\n\n\n')

  // end game
  console.log(`

  --------------------------
    Close CHANNEL (▰˘◡˘▰)
  --------------------------

  `)
  const end = await Dapp.endGame(userBet * 0.5, 3)
  console.log('end game result:', end)
}
test()
// console.log(`
//
//   Start game api server  at localhost:${serverPort}
//   try to open http://localhost:${serverPort}/test to run test
//
// `)
// const server = http.createServer((request, response) => {
//   if (request.url.indexOf('test') > -1) {
//     test()
//     response.end('Test runned, see server logs )))')
//   }
// })
// server.listen(serverPort)
//
// if (process.env.NODE_ENV === 'test') {
//   server.close(() => {
//     console.info('TEST IS OK')
//   })
// }
