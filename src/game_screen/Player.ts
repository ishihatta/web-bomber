import { LightSprite } from "./LightSprite";
import { GameScreen } from "./GameScreen";
import { PowerUpItem } from "./PowerUpItem";
import { Constants } from "./Constants";
import { Bomb } from "./Bomb";
import { Wall } from "./Wall";
import { PlayerInput, PlayerMove, PlayerOperation } from "./PlayerOperation";
import { AnimatedSprite, Sprite } from "pixi.js";

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

        // 壁との当たり判定
        const detectWalls = Array<Wall>()
        this.gameScreen.walls.forEach(wall => {
            if (Math.abs(wall.x - this._x) < Constants.CHARACTER_SIZE && Math.abs(wall.y - this._y) < Constants.CHARACTER_SIZE) {
                detectWalls.push(wall)
            }
        })
        if (detectWalls.length > 0) {
            this._x = oldX
            this._y = oldY
        }
        if (detectWalls.length == 1) {
            const wall = detectWalls[0]
            if (this.playerInput.move == PlayerMove.LEFT ||
                    this.playerInput.move == PlayerMove.RIGHT) {
                if (this._y < wall.y) this._y -= Player.WALK_SPEED
                if (this._y > wall.y) this._y += Player.WALK_SPEED
            }
            else if (this.playerInput.move == PlayerMove.UP ||
                    this.playerInput.move == PlayerMove.DOWN) {
                if (this._x < wall.x) this._x -= Player.WALK_SPEED
                if (this._x > wall.x) this._x += Player.WALK_SPEED
            }
        }

        // 爆弾との当たり判定
        // 32で割り切れる場所からそうでない場所に移動しようとした場合は、移動先に爆弾があったら動かさない
        if (this._x != oldX && oldX % Constants.CHARACTER_SIZE == 0) {
            const bx = this._x > oldX ? oldX + Constants.CHARACTER_SIZE : oldX - Constants.CHARACTER_SIZE
            for (let i = this.gameScreen.bombs.length - 1; i >= 0; i--) {
                const bomb = this.gameScreen.bombs[i]
                if (bomb.x == bx && bomb.y == this._y) {
                    this._x = oldX
                    break
                }
            }
        } else if (this._y != oldY && oldY % Constants.CHARACTER_SIZE == 0) {
            const by = this._y > oldY ? oldY + Constants.CHARACTER_SIZE : oldY - Constants.CHARACTER_SIZE
            for (let i = this.gameScreen.bombs.length - 1; i >= 0; i--) {
                const bomb = this.gameScreen.bombs[i]
                if (bomb.y == by && bomb.x == this._x) {
                    this._x = oldX
                    break
                }
            }
        }
        // 32で割り切れない場所から移動しようとした場合は、一番近いマス以外のマスに移動しようとしている場合、移動先に爆弾があったら動かさない
        else if (this._x != oldX) {
            let bx = 0
            if (oldX % Constants.CHARACTER_SIZE < Constants.CHARACTER_SIZE / 2) {
                if (this._x > oldX) {
                    bx = Math.floor(oldX / Constants.CHARACTER_SIZE + 1) * Constants.CHARACTER_SIZE
                }
            } else {
                if (this._x < oldX) {
                    bx = Math.floor(oldX / Constants.CHARACTER_SIZE) * Constants.CHARACTER_SIZE
                }
            }
            if (bx != 0) {
                for (let i = this.gameScreen.bombs.length - 1; i >= 0; i--) {
                    const bomb = this.gameScreen.bombs[i]
                    if (bomb.x == bx && bomb.y == this._y) {
                        this._x = oldX
                        break
                    }
                }
            }
        } else if (this._y != oldY) {
            let by = 0
            if (oldY % Constants.CHARACTER_SIZE < Constants.CHARACTER_SIZE / 2) {
                if (this._y > oldY) {
                    by = Math.floor(oldY / Constants.CHARACTER_SIZE + 1) * Constants.CHARACTER_SIZE
                }
            } else {
                if (this._y < oldY) {
                    by = Math.floor(oldY / Constants.CHARACTER_SIZE) * Constants.CHARACTER_SIZE
                }
            }
            if (by != 0) {
                for (let i = this.gameScreen.bombs.length - 1; i >= 0; i--) {
                    const bomb = this.gameScreen.bombs[i]
                    if (bomb.x == this._x && bomb.y == by) {
                        this._y = oldY
                        break
                    }
                }
            }
        }

        // 実際に移動させる
        if (this._x != oldX || this._y != oldY) {
            this.moveTime += 1 / 60
            if (!this.walkSoundIsPlaying) {
                this.walkSoundIsPlaying = true
                this.walkSoundId = this.gameScreen.walkSound.play()
            }
        } else {
            if (this.walkSoundIsPlaying) {
                this.walkSoundIsPlaying = false
                this.gameScreen.walkSound.stop(this.walkSoundId)
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
                this.gameScreen.powerUpSound.play()
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
                this.gameScreen.setBombSound.play()
            }
        }

        // 爆発との当たり判定
        for (let i = this.gameScreen.explosions.length - 1; i >= 0; i--) {
            const explosion = this.gameScreen.explosions[i]
            if (Math.abs(explosion.x - this._x) < 28 && Math.abs(explosion.y - this._y) < 28) {
                this.deathState = 1
                this.gameScreen.bgmMusic.stop()
                this.gameScreen.crashSound.play()
                if (this.walkSoundIsPlaying) {
                    this.walkSoundIsPlaying = false
                    this.gameScreen.walkSound.stop(this.walkSoundId)
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