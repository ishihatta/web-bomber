import { AnimatedSprite, Sprite } from "pixi.js";
import { GameScreen } from "./GameScreen";
import { LightSprite } from "./LightSprite";

export class PowerUpItem extends LightSprite {
    private moveTime = 0
    private _sprite: AnimatedSprite

    constructor(gameScreen: GameScreen, x: number, y: number) {
        super(gameScreen)
        this._sprite = new AnimatedSprite(gameScreen.spritesheet!.animations['power_up_item'])
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
        return false
    }

}