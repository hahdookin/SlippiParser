'use strict'

const { default: SlippiGame } = require('slp-parser-js')
const fs = require('fs')
const plotly = require('plotly')('hahdookin', 'QDQSyhJzNwTLSyY1VmYe')

// Your directory with slippi files
const gameFilesPath = "C:/Users/paperboy/Desktop/FM-v5.9-Slippi-r18-Win/Slippi"

const game = new SlippiGame('test.slp')

const charsList = [
    'Captain Falcon', 'Donkey Kong', 'Fox', 'Mr. Game & Watch',
    'Kirby', 'Bowser', 'Link', 'Luigi', 'Mario', 'Marth', 'Mewtwo',
    'Ness', 'Peach', 'Pikachu', 'Ice Climbers', 'Jigglypuff', 'Samus',
    'Yoshi', 'Zelda', 'Sheik', 'Falco', 'Young Link', 'Dr. Mario', 
    'Roy', 'Pichu', 'Ganondorf'
]

const compStagesList = {
    2: "Fountain of Dreams",
    3: "Pokemon Stadium",
    8: "Yoshi's Story",
    28: "Dream Land N64",
    31: "Battlefield",
    32: "Final Destination"
}

const movesList = {
    1: 'misc',
    2: 'jab',
    3: 'jab',
    4: 'jab',
    5: 'rapid-jabs',
    6: 'dash-attack',
    7: 'ftilt',
    8: 'uptilt',
    9: 'dtilt',
    10: 'fsmash',
    11: 'upsmash',
    12: 'dsmash',
    13: 'nair',
    14: 'fair',
    15: 'bair',
    16: 'uair',
    17: 'dair',
    18: 'neutral-b',
    19: 'side-b',
    20: 'up-b',
    21: 'down-b',
    50: 'getup',
    51: 'getup-slow',
    52: 'pummel',
    53: 'fthrow',
    54: 'bthrow',
    55: 'upthrow',
    56: 'dthrow',
    61: 'edge-slow',
    62: 'edge'
}

let actionsFreq = {
    avgWavedashCount: 0,
    avgWavelandCount: 0,
    avgAirDodgeCount: 0,
    avgDashDanceCount: 0,
    avgSpotDodgeCount: 0,
    avgRollCount: 0
}
let conversionsFreq = {
    counterAttack: 0,
    neutralWin: 0,
    trade: 0
}
let comboFreq = {}
let totalGamesCompleted = 0

const resetData = () => {
    actionsFreq = {
        avgWavedashCount: 0,
        avgWavelandCount: 0,
        avgAirDodgeCount: 0,
        avgDashDanceCount: 0,
        avgSpotDodgeCount: 0,
        avgRollCount: 0
    }
    conversionsFreq = {
        counterAttack: 0,
        neutralWin: 0,
        trade: 0
    }
    comboFreq = {}
    totalGamesCompleted = 0
}

// ****** For graphing data if needed ******

const getBarGraph = obj => {
    const data = [
        {
          x: Object.keys(obj),
          y: Object.values(obj),
          type: "bar"
        }
      ]
      const graphOptions = {filename: "basic-bar", fileopt: "overwrite"}
      plotly.plot(data, graphOptions, (err, msg) => {
          console.log(msg)
      })
}

const getGroupedBarChart = (obj1, obj2) => {
    const trace1 = {
          x: Object.keys(obj1),
          y: Object.values(obj1),
          name: 'First',
          type: "bar"
    }
    const trace2 = {
          x: Object.keys(obj2),
          y: Object.values(obj2),
          name: 'Second',
          type: "bar"
    }
    const data = [trace1, trace2]
    const layout = {barmode: 'group'}
    const graphOptions = {layout: layout, filename: "grouped-bar", fileopt: "overwrite"}
    
    plotly.plot(data, graphOptions, (err, msg) => {
        console.log(msg)
    })
}

// *********************************

const appendActions = (actionsArray, indexPlayer) => {
    const actions = actionsArray.slice(2)
    for (let player of actions) {
        if (player.playerIndex === indexPlayer) {
            actionsFreq.avgWavedashCount += player.wavedashCount
            actionsFreq.avgWavelandCount += player.wavelandCount
            actionsFreq.avgAirDodgeCount += player.airDodgeCount
            actionsFreq.avgDashDanceCount += player.dashDanceCount
            actionsFreq.avgSpotDodgeCount += player.spotDodgeCount
            actionsFreq.avgRollCount += player.rollCount
        }
    }
    totalGamesCompleted++
}

const appendConversions = (conversionsArray, indexPlayer) => {
    for (let conversion of conversionsArray) {
        if (conversion.playerIndex === indexPlayer) {
            conversionsFreq.counterAttack += conversion.openingType === 'counter-attack' ? 1 : 0
            conversionsFreq.neutralWin += conversion.openingType === 'neutral-win' ? 1 : 0
            conversionsFreq.trade += conversion.openingType === 'trade' ? 1 : 0
        }
    }
}

const checkCredentials = (playersArray, tag, id) => {
    for (let player of playersArray) {
        if (player.nametag === tag && player.characterId === id) {
            return [true, player.playerIndex]
        }
    }
    return [false, null]
}

// Conversions
const getConversions = (slippiObject, tag, id) => {
    const settings = slippiObject.getSettings()
    const players = settings.players
    const [meetsCredentials, index] = checkCredentials(players, tag, id)

    if (meetsCredentials) {
        const stats = slippiObject.getStats()
        const conversions = stats.conversions
        console.log("Getting conversions...")
        appendConversions(conversions, index)
    }
    console.log("--------END--------")
}

// Actions
const getActions = (slippiObject, tag, id) => {
    const settings = slippiObject.getSettings()
    const players = settings.players
    const [meetsCredentials, index]  = checkCredentials(players, tag, id)

    if (meetsCredentials) {
        const stats = slippiObject.getStats()

        if (stats.gameComplete) {
            console.log("Getting actions...")
            appendActions(stats.actionCounts, index)
        }
    }
    console.log("--------END--------")
}

// Combo Strings
const getComboStrings = (slippiObject, tag, id, ignorePummels) => {
    const settings = slippiObject.getSettings()
    const players = settings.players

    const [meetsCredentials, index]  = checkCredentials(players, tag, id)

    if (meetsCredentials) {
        const stats = slippiObject.getStats()
        const combos = stats.combos
        for (let combo of combos) {
            const isChosenPlayer = combo.playerIndex === index

            const comboPercent = (combo.endPercent - combo.startPercent).toFixed(2)
            if (combo.moves.length > 1 && comboPercent > 0 && isChosenPlayer) { 
                
                const comboLengthS = ((combo.endFrame - combo.startFrame) / 60).toFixed(2)

                let moves = []
                for (let move of combo.moves) {
                    if (ignorePummels) {
                        if (move.moveId !== 52) { // removes pummels
                            moves.push(movesList[move.moveId])
                        }
                    } else {
                        moves.push(movesList[move.moveId])
                    }
                }
                let movesString = moves.join(" ")
                if (moves.length > 1) {
                    comboFreq[movesString] = (comboFreq[movesString] || 0) + 1
                }

                console.log(`${combo.playerIndex}: ${movesString} - ${comboPercent}% - ${comboLengthS}s ${combo.didKill ? " => Killed":""}`)
            }
        }
        console.log("--------END--------")
    }
}

const getFrequencies = (slippiFilesPath, tag, id, type = 'all', ignorePummels = true, noSingleOccurence = true) => {
    let gamesParsed = 0

    let gameFiles = fs.readdirSync(slippiFilesPath)

    gameFiles.forEach(game => {
        let fGame = gameFilesPath.endsWith('/') ? `${gameFilesPath}${game}`:`${gameFilesPath}/${game}`
        const newGame = new SlippiGame(fGame)
        if (type === 'actions') getActions(newGame, tag, id)
        if (type === 'combos') getComboStrings(newGame, tag, id, ignorePummels)
        if (type === 'conversions') getConversions(newGame, tag, id)
        if (type === 'all') {
            getActions(newGame, tag, id)
            getComboStrings(newGame, tag, id, ignorePummels)
            getConversions(newGame, tag, id)
        }
        gamesParsed++
    })

    if (type === 'actions' || type === 'all') {
        for (let action in actionsFreq) {
            actionsFreq[action] = (actionsFreq[action] / totalGamesCompleted).toFixed(2)
        }
    }

    if ((type === 'combos' || type === 'all') && noSingleOccurence) {
        for (let key in comboFreq) {
            if (comboFreq[key] === 1) {
                delete comboFreq[key]
            } /*else {
                comboFreq[key] += "*".repeat(comboFreq[key])
            } */
        }
    }

    let temp
    switch (type) {
        case 'actions':
            temp = actionsFreq
            break
        case 'combos':
            temp = comboFreq
            break
        case 'conversions':
            temp = conversionsFreq
            break
        case 'all':
            temp = [actionsFreq, comboFreq, conversionsFreq]
            break
        default:
            temp = {}
    }

    console.log(`${totalGamesCompleted ? "Games Completed: " + totalGamesCompleted + " - ": ""}Total: ${gamesParsed}`)
    resetData()
    return temp
}


const [t1] = process.hrtime()
// getGroupedBarChart(getFrequencies(gameFilesPath, '', 7, 'actions'), getFrequencies(gameFilesPath, '', 0, 'actions'))
console.log(getFrequencies(gameFilesPath, '', 2))
const [t2] = process.hrtime()

console.log(`Perfomance time: ${(t2 - t1)} seconds`)