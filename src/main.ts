import { Application, Assets, Spritesheet } from 'pixi.js'
import { GameScreen } from './game_screen/GameScreen'
import { MainMenuScreen } from './main_menu/MainMenuScreen'
import { Screen } from './Screen'
import aiInit from 'bomber-ai'
import { PlayerType } from './PlayerType'

const app = new Application({
    resizeTo: window,
    antialias: true,
})
window.document.body.appendChild(app.view as any)

let spritesheet: Spritesheet|null = null
let currentScreen: Screen|null = null

Promise.all([
    Assets.load('images/sprite_sheet.json'),
    aiInit(),
]).then(results => {
    spritesheet = results[0]
    startMainMenu()
})

export function startMainMenu() {
    if (currentScreen != null) {
        currentScreen!.onClose()
        app.stage.removeChildren()
    }
    currentScreen = new MainMenuScreen(app, spritesheet!)
}

export function startGame(playerType1: PlayerType, playerType2: PlayerType) {
    if (currentScreen != null) {
        currentScreen!.onClose()
        app.stage.removeChildren()
    }
    currentScreen = new GameScreen(app, spritesheet!, playerType1, playerType2)
}

app.ticker.add(() => {
    currentScreen?.onNextFrame()
})
