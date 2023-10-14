import { Application } from 'pixi.js'
import { GameScreen } from './game_screen/GameScreen'
import { MainMenuScreen } from './main_menu/MainMenuScreen'
import { Screen } from './Screen'
import { PlayerType } from './PlayerType'
import { LoadingScreen } from './loading_screen/LoadingScreen'

const app = new Application({
    resizeTo: window,
    antialias: true,
})
window.document.body.appendChild(app.view as any)

let currentScreen: Screen|null = null

export function startMainMenu() {
    if (currentScreen != null) {
        currentScreen!.onClose()
        app.stage.removeChildren()
    }
    currentScreen = new MainMenuScreen(app)
}

export function startGame(playerType1: PlayerType, playerType2: PlayerType) {
    if (currentScreen != null) {
        currentScreen!.onClose()
        app.stage.removeChildren()
    }
    currentScreen = new GameScreen(app, playerType1, playerType2)
}

currentScreen = new LoadingScreen(app)

app.ticker.add(() => {
    currentScreen?.onNextFrame()
})
