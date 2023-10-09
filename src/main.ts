import { Application, Assets, Spritesheet } from 'pixi.js'
import { GameScreen } from './game_screen/GameScreen'
import { MainMenuScreen } from './main_menu/MainMenuScreen'
import { Screen } from './Screen'
import aiInit from 'bomber-ai'
import { PlayerType } from './PlayerType'
import { Howl } from 'howler'

const app = new Application({
    resizeTo: window,
    antialias: true,
})
window.document.body.appendChild(app.view as any)

let spritesheet: Spritesheet|null = null
let currentScreen: Screen|null = null

const allResouceCount = 9
let loadedResouceCount = 0
function onLoadResouce() {
    loadedResouceCount++
    if (loadedResouceCount >= allResouceCount) {
        startMainMenu()
    }
}

// AI の読み込み
aiInit().then(_ => { onLoadResouce() })

// スプライトシートの読み込み
Assets.load('images/sprite_sheet.json').then(sheet => {
    spritesheet = sheet
    onLoadResouce()
})

// サウンドの読み込み
export const sounds = {
    startGame: new Howl({ src: ['sounds/start_game.webm', 'sounds/start_game.mp3'], volume: 0.5, onload: onLoadResouce }),
    explosion: new Howl({ src: ['sounds/explosion.webm', 'sounds/explosion.mp3'], onload: onLoadResouce }),
    setBomb: new Howl({ src: ['sounds/set_bomb.webm', 'sounds/set_bomb.mp3'], onload: onLoadResouce }),
    walk: new Howl({ src: ['sounds/walk.webm', 'sounds/walk.mp3'], loop: true, onload: onLoadResouce }),
    powerUp: new Howl({ src: ['sounds/power_up.webm', 'sounds/power_up.mp3'], onload: onLoadResouce }),
    crash: new Howl({ src: ['sounds/crash.webm', 'sounds/crash.mp3'] ,onload: onLoadResouce }),
    bgm: new Howl({ src: ['sounds/Daily_News.webm', 'sounds/Daily_News.mp3'], loop: true, volume: 0.7, onload: onLoadResouce }),
}

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
