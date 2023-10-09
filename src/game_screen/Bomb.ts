import { GameScreen } from "./GameScreen";
import { LightSprite } from "./LightSprite";
import { Constants } from "./Constants";
import { AnimatedSprite, Sprite } from "pixi.js";

export class Bomb extends LightSprite {
    power: number
    private moveTime = 0
    remainTime: number = Constants.BOMB_TIME
    private _sprite: AnimatedSprite

    constructor(gameScreen: GameScreen, x: number, y: number, power: number) {
        super(gameScreen)
        this.power = power
        this._sprite = new AnimatedSprite(gameScreen.spritesheet!.animations['bomb'])
        this._sprite.x = x
        this._sprite.y = y
        gameScreen.itemContainer.addChild(this._sprite)
    }

    sprite(): Sprite {
        return this._sprite
    }

    onNextFrame(): boolean {
        this.moveTime += 1 / 60
        this._sprite.currentFrame = Math.floor(this.moveTime / 0.2) % 3

        // タイムアウトしたら爆発する
        this.remainTime--
        if (this.remainTime <= 0) {
            this._sprite.removeFromParent()
            return true
        }
        return false
    }
}