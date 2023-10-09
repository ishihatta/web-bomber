import { AnimatedSprite, Sprite } from "pixi.js";
import { GameScreen } from "./GameScreen";
import { LightSprite } from "./LightSprite";

export enum ExplosionPosition {
    CENTER,
    VERTICAL,
    HORIZONTAL,
    LEFT,
    TOP,
    RIGHT,
    BOTTOM
}

export class Explosion extends LightSprite {
    static TIME_TO_LIVE = 30

    private remainTime = Explosion.TIME_TO_LIVE
    private _sprite: AnimatedSprite

    constructor(gameScreen: GameScreen, x: number, y: number, position: ExplosionPosition) {
        super(gameScreen)
        let spriteName = 'exp_center'
        if (position == ExplosionPosition.VERTICAL) spriteName = 'exp_vertical'
        else if (position == ExplosionPosition.HORIZONTAL) spriteName = 'exp_horizontal'
        else if (position == ExplosionPosition.TOP) spriteName = 'exp_top'
        else if (position == ExplosionPosition.BOTTOM) spriteName = 'exp_bottom'
        else if (position == ExplosionPosition.LEFT) spriteName = 'exp_left'
        else if (position == ExplosionPosition.RIGHT) spriteName = 'exp_right'
        this._sprite = new AnimatedSprite(gameScreen.spritesheet!.animations[spriteName])
        this._sprite.x = x
        this._sprite.y = y
        this._sprite.roundPixels = true
        gameScreen.itemContainer.addChild(this._sprite)
    }

    sprite(): Sprite {
        return this._sprite
    }

    onNextFrame(): boolean {
        this.remainTime--
        this._sprite.currentFrame = (this.remainTime < 3 || this.remainTime > Explosion.TIME_TO_LIVE - 3) ? 0 : 1
        if (this.remainTime <= 0) {
            this._sprite.removeFromParent()
            return true
        }
        return false
    }

}