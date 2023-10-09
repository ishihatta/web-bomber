import { GameScreen } from "./GameScreen"
import { Constants } from "./Constants"
import { Sprite } from "pixi.js"

export abstract class LightSprite {
    gameScreen: GameScreen
    width: number = Constants.CHARACTER_SIZE
    height: number = Constants.CHARACTER_SIZE

    constructor(gameScreen: GameScreen) {
        this.gameScreen = gameScreen
    }

    abstract sprite(): Sprite

    get x(): number {
        return this.sprite().x
    }

    get y(): number {
        return this.sprite().y
    }

    onNextFrame(): boolean { return false }
}