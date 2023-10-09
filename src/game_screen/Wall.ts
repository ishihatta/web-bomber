import { LightSprite } from "./LightSprite"
import { GameScreen } from "./GameScreen"
import { Sprite } from "pixi.js"
import { PowerUpItem } from "./PowerUpItem"

export class Wall extends LightSprite {
    private static TIME_TO_MELT = 30

    isBreakable: boolean
    private _sprite: Sprite
    private meltState = 0

    constructor(gameScreen: GameScreen, x: number, y: number, isBreakable: boolean) {
        super(gameScreen)
        this.isBreakable = isBreakable
        const texture = gameScreen.spritesheet!.textures[isBreakable ? 'breakable_wall.png' : 'wall.png']
        this._sprite = new Sprite(texture)
        this._sprite.x = x
        this._sprite.y = y
        gameScreen.itemContainer.addChild(this._sprite)
    }

    sprite(): Sprite {
        return this._sprite
    }

    onNextFrame(): boolean {
        if (this.meltState > 0) {
            this.meltState++;
            if (this.meltState >= Wall.TIME_TO_MELT) {
                // 一定の確率でパワーアップアイテムが出る
                if (Math.random() < 0.1) {
                    this.gameScreen.powerUpItems.push(new PowerUpItem(this.gameScreen, this.x, this.y))
                }
                this._sprite.removeFromParent()
                return true
            }
            this._sprite.tint = 0xff0000
            this._sprite.alpha = 1 - this.meltState / Wall.TIME_TO_MELT
        }
        return false
    }

    isMelting(): boolean {
        return this.meltState > 0
    }

    startMelting() {
        if (this.meltState == 0) {
            this.meltState = 1
        }
    }
}