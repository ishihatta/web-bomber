import { LightSprite } from "./LightSprite";
import { GameScreen } from "./GameScreen";
import { PowerUpItem } from "./PowerUpItem";
import { Constants } from "./Constants";
import { Bomb } from "./Bomb";
import { PlayerInput, PlayerMove, PlayerOperation } from "./PlayerOperation";
import { AnimatedSprite, Sprite } from "pixi.js";
import * as AppResource from "../AppResource";

enum PlayerDirection {
    DOWN, LEFT, UP, RIGHT
}

export class Player extends LightSprite {
    private static WALK_SPEED = 2
    private static TIME_TO_DEATH = 60

    private playerNumber: number
    private playerOperation: PlayerOperation
    private _sprite: AnimatedSprite
    private _x: number
    private _y: number

    pushedX = 0
    pushedY = 0

    private direction: PlayerDirection = PlayerDirection.DOWN
    private moveTime = 0
    power = 1
    private playerInput: PlayerInput|null = null
    private walkSoundIsPlaying = false
    private walkSoundId = 0
    private deathState = 0

    constructor(gameScreen: GameScreen, playerNumber: number, playerOperation: PlayerOperation, x: number, y: number) {
        super(gameScreen)

        this.playerNumber = playerNumber
        this.playerOperation = playerOperation
        this._sprite = new AnimatedSprite(gameScreen.spritesheet!.animations['pl' + (playerNumber + 1)])
        this._sprite.x = x
        this._sprite.y = y
        this._x = x
        this._y = y
        gameScreen.playerContainer.addChild(this._sprite)
    }

    sprite(): Sprite {
        return this._sprite
    }

    get x(): number {
        return this._x
    }

    get y(): number {
        return this._y
    }

    /**
     * このフレームでの移動処理
     * この処理の後に別プレイヤーとの当たり判定が入る
     * その後 onNextFrame() が呼ばれる
     */
    moveForNextFrame() {
        if (this.isDead()) return

        // 移動前の位置を保存しておく
        const oldX = this._x
        const oldY = this._y

        this.playerInput = this.playerOperation.getPlayerInput()
        switch (this.playerInput.move) {
            case PlayerMove.LEFT:
                this.direction = PlayerDirection.LEFT
                this._x -= Player.WALK_SPEED
                break
            case PlayerMove.RIGHT:
                this.direction = PlayerDirection.RIGHT
                this._x += Player.WALK_SPEED
                break
            case PlayerMove.DOWN:
                this.direction = PlayerDirection.DOWN
                this._y += Player.WALK_SPEED
                break
            case PlayerMove.UP:
                this.direction = PlayerDirection.UP
                this._y -= Player.WALK_SPEED
                break
        }

        // 壁や爆弾との当たり判定
        const detectedObjects = Array<LightSprite>();
        [this.gameScreen.walls, this.gameScreen.bombs].forEach(objs => {
            objs.forEach(obj => {
                // ぶつかっているいて
                if (Math.abs(obj.x - this._x) < Constants.CHARACTER_SIZE && Math.abs(obj.y - this._y) < Constants.CHARACTER_SIZE) {
                    // かつ同じ升目になくて
                    if (obj.x / Constants.CHARACTER_SIZE != Math.floor((this._x + Constants.CHARACTER_SIZE / 2) / Constants.CHARACTER_SIZE) ||
                        obj.y / Constants.CHARACTER_SIZE != Math.floor((this._y + Constants.CHARACTER_SIZE / 2) / Constants.CHARACTER_SIZE)) {
                        // かつ移動先にあると「衝突した」
                        if (this.playerInput?.move == PlayerMove.LEFT && obj.x < this._x ||
                            this.playerInput?.move == PlayerMove.RIGHT && obj.x > this._x ||
                            this.playerInput?.move == PlayerMove.UP && obj.y < this._y ||
                            this.playerInput?.move == PlayerMove.DOWN && obj.y > this._y) {
                            detectedObjects.push(obj)
                        }
                    }
                }
            })
        })
        if (detectedObjects.length > 0) {
            this._x = oldX
            this._y = oldY
        }
        if (detectedObjects.length == 1) {
            const obj = detectedObjects[0]
            if (this.playerInput.move == PlayerMove.LEFT ||
                    this.playerInput.move == PlayerMove.RIGHT) {
                if (this._y < obj.y) this._y -= Player.WALK_SPEED
                if (this._y > obj.y) this._y += Player.WALK_SPEED
            }
            else if (this.playerInput.move == PlayerMove.UP ||
                    this.playerInput.move == PlayerMove.DOWN) {
                if (this._x < obj.x) this._x -= Player.WALK_SPEED
                if (this._x > obj.x) this._x += Player.WALK_SPEED
            }
        }

        // 実際に移動させる
        if (this._x != oldX || this._y != oldY) {
            this.moveTime += 1 / 60
            if (!this.walkSoundIsPlaying) {
                this.walkSoundIsPlaying = true
                this.walkSoundId = AppResource.sounds.walk.play()
            }
        } else {
            if (this.walkSoundIsPlaying) {
                this.walkSoundIsPlaying = false
                AppResource.sounds.walk.stop(this.walkSoundId)
            }
        }
        this._sprite.x = this._x
        this._sprite.y = this._y
    }

    onNextFrame(): boolean {
        if (this.isDead()) {
            // 死に途中
            if (this.deathState <  Player.TIME_TO_DEATH) {
                this.deathState++
                this._sprite.tint = 0xff0000
                this._sprite.alpha = 1 - this.deathState / Player.TIME_TO_DEATH
                this._sprite.x--
                this._sprite.y--
                this._sprite.width += 2
                this._sprite.height += 2
            }
            return false
        }

        const step = Math.floor(this.moveTime / 0.2) % 3
        this._sprite.currentFrame = this.direction * 3 + step

        // パワーアップアイテムとの当たり判定
        const powerUpItems: Array<PowerUpItem> = this.gameScreen.powerUpItems
        for (let i = powerUpItems.length - 1; i >= 0; i--) {
            const powerUpItem = powerUpItems[i]
            if (Math.abs(powerUpItem.x - this._x) < Constants.CHARACTER_SIZE &&
                    Math.abs(powerUpItem.y - this._y) < Constants.CHARACTER_SIZE) {
                powerUpItems.splice(i, 1)
                powerUpItem.sprite().removeFromParent()
                this.power++
                AppResource.sounds.powerUp.play()
                this.gameScreen.setPlayerText(this.playerNumber)
            }
        }

        // 爆弾の設置
        if (this.playerInput?.fire) {
            const bx = Math.floor((this._x + Constants.CHARACTER_SIZE / 2) / Constants.CHARACTER_SIZE) * Constants.CHARACTER_SIZE
            const by = Math.floor((this._y + Constants.CHARACTER_SIZE / 2) / Constants.CHARACTER_SIZE) * Constants.CHARACTER_SIZE
            let okFlag = true
            for (let i = this.gameScreen.bombs.length - 1; i >= 0; i--) {
                const bomb = this.gameScreen.bombs[i]
                if (bomb.x == bx && bomb.y == by) {
                    okFlag = false
                    break
                }
            }
            if (okFlag) {
                this.gameScreen.bombs.push(new Bomb(this.gameScreen, bx, by, this.power))
                AppResource.sounds.setBomb.play()
            }
        }

        // 爆発との当たり判定
        for (let i = this.gameScreen.explosions.length - 1; i >= 0; i--) {
            const explosion = this.gameScreen.explosions[i]
            if (Math.abs(explosion.x - this._x) < 28 && Math.abs(explosion.y - this._y) < 28) {
                this.deathState = 1
                AppResource.sounds.bgm.stop()
                AppResource.sounds.crash.play()
                if (this.walkSoundIsPlaying) {
                    this.walkSoundIsPlaying = false
                    AppResource.sounds.walk.stop(this.walkSoundId)
                }
                break
            }
        }

        return false
    }

    isDead(): boolean {
        return this.deathState > 0
    }

    pushPosition() {
        this.pushedX = this._x
        this.pushedY = this._y
    }

    popPosition() {
        this._x = this.pushedX
        this._y = this.pushedY
        this._sprite.x = this.pushedX
        this._sprite.y = this.pushedY
    }
}