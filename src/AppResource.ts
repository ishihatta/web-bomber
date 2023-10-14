import { Assets, Spritesheet } from "pixi.js"
import { Howl } from "howler"
import aiInit from "bomber-ai"

const ALL_RESOURCE_COUNT = 9

let loadedResouceCount = 0

export let spritesheet: Spritesheet|null = null
export const sounds = {
    startGame: new Howl({ src: ['sounds/start_game.webm', 'sounds/start_game.mp3'], volume: 0.5, onload: onLoadResouce }),
    explosion: new Howl({ src: ['sounds/explosion.webm', 'sounds/explosion.mp3'], onload: onLoadResouce }),
    setBomb: new Howl({ src: ['sounds/set_bomb.webm', 'sounds/set_bomb.mp3'], onload: onLoadResouce }),
    walk: new Howl({ src: ['sounds/walk.webm', 'sounds/walk.mp3'], loop: true, onload: onLoadResouce }),
    powerUp: new Howl({ src: ['sounds/power_up.webm', 'sounds/power_up.mp3'], onload: onLoadResouce }),
    crash: new Howl({ src: ['sounds/crash.webm', 'sounds/crash.mp3'] ,onload: onLoadResouce }),
    bgm: new Howl({ src: ['sounds/Daily_News.webm', 'sounds/Daily_News.mp3'], loop: true, volume: 0.7, onload: onLoadResouce }),
}

let progressFunc: (allCount: number, finishCount: number) => void

export function load(progressCallback: (allCount: number, finishCount: number) => void) {
    progressFunc = progressCallback
    // AI の読み込み
    aiInit().then(_ => { onLoadResouce() })
    // スプライトシートの読み込み
    Assets.load('images/sprite_sheet.json').then(sheet => {
        spritesheet = sheet
        onLoadResouce()
    })
}

function onLoadResouce() {
    loadedResouceCount++
    progressFunc(ALL_RESOURCE_COUNT, loadedResouceCount)
}    
