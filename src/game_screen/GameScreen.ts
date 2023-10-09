import { Application, Spritesheet, Container, Text } from 'pixi.js'
import { Player } from './Player'
import { Wall } from './Wall'
import { Bomb } from './Bomb'
import { Explosion, ExplosionPosition } from './Explosion'
import { PowerUpItem } from './PowerUpItem'
import { Constants } from './Constants'
import { LightSprite } from './LightSprite'
import { Screen } from '../Screen'
import { deinitKeyInput, initKeyInput, isKeyEscapePressing, isKeySpacePressing } from './KeyInput'
import { sounds, startMainMenu } from '../main'
import { PlayerType } from '../PlayerType'
import { PlayerOperation, getPlayerOperation } from './PlayerOperation'

enum State {
    PLAYING,
    PLAYER1_WON,
    PLAYER2_WON,
    DRAW_GAME,
}

export class GameScreen extends Screen {
    static MAP_WIDTH = 25
    static MAP_HEIGHT = 15

    private state: State = State.PLAYING
    private startUpTimer: number = 30

    private playerOperation1: PlayerOperation
    private playerOperation2: PlayerOperation

    // プレイヤーのスプライトを入れるコンテナ
    playerContainer = new Container()
    // プレイヤー以外のスプライトを入れるコンテナ
    itemContainer = new Container()

    spritesheet: Spritesheet|null = null

    // スプライトの配列
    players = Array<Player>()
    walls = Array<Wall>()
    bombs = Array<Bomb>()
    explosions = Array<Explosion>()
    powerUpItems = Array<PowerUpItem>()

    // 画面上部の各プレイヤーの状態のテキスト
    playerTexts: Text[] = [
        new Text('', { fontFamily: 'monospace', fontSize: 28, fill: 0xd00000, fontWeight: 'bold' }),
        new Text('', { fontFamily: 'monospace', fontSize: 28, fill: 0x0000ff, fontWeight: 'bold' }),
    ]

    // ゲーム終了時のテキスト
    gameEndText: Text = new Text('', { fontFamily: 'Arial', fontSize: 32, fill: 0xffffff, fontWeight: 'bold' })

    frameCount = 0

    constructor(app: Application, spritesheet: Spritesheet, playerType1: PlayerType, playerType2: PlayerType) {
        super(app)

        this.playerOperation1 = getPlayerOperation(playerType1, 0, this)
        this.playerOperation2 = getPlayerOperation(playerType2, 1, this)

        // キー入力初期化
        initKeyInput()

        // 背景色
        app.renderer.background.color = 0x009900

        this.spritesheet = spritesheet
        this.baseStage.addChild(this.itemContainer)
        this.baseStage.addChild(this.playerContainer)

        this.playerTexts[0].x = 2
        this.playerTexts[0].y = 2
        this.playerTexts[1].x = 800 - 256
        this.playerTexts[1].y = 2
        this.baseStage.addChild(this.playerTexts[0])
        this.baseStage.addChild(this.playerTexts[1])

        this.gameEndText.x = 400
        this.gameEndText.y = (480 - 32) / 2
        this.baseStage.addChild(this.gameEndText)

        this.startGame()
    }

    onClose(): void {
        super.onClose()
        deinitKeyInput()
        sounds.explosion.stop()
        sounds.setBomb.stop()
        sounds.walk.stop()
        sounds.powerUp.stop()
        sounds.crash.stop()
        sounds.bgm.stop()
        this.playerOperation1.free()
        this.playerOperation2.free()
    }

    private startGame() {
        this.state = State.PLAYING
        
        this.playerContainer.removeChildren()
        this.itemContainer.removeChildren()

        // Playerの生成
        this.players.splice(0)
        this.players.push(new Player(
            this,
            0,
            this.playerOperation1,
            Constants.CHARACTER_SIZE,
            Constants.CHARACTER_SIZE
        ))
        this.players.push(new Player(
            this,
            1,
            this.playerOperation2,
            800 - Constants.CHARACTER_SIZE * 2,
            480 - Constants.CHARACTER_SIZE * 2
        ))

        // 外壁の生成
        this.walls.splice(0)
        for (let x = 0; x < GameScreen.MAP_WIDTH; x++) {
            const xf = x * Constants.CHARACTER_SIZE
            this.walls.push(new Wall(this, xf, 0, false))
            this.walls.push(new Wall(this, xf, 14 * Constants.CHARACTER_SIZE, false))
        }
        for (let y = 1; y < GameScreen.MAP_HEIGHT - 1; y++) {
            const yf = y * Constants.CHARACTER_SIZE;
            this.walls.push(new Wall(this, 0, yf, false))
            this.walls.push(new Wall(this, 24 * Constants.CHARACTER_SIZE, yf, false))
        }

        // 壁の生成
        for (let y = 1; y < GameScreen.MAP_HEIGHT - 1; y++) {
            const yf = y * Constants.CHARACTER_SIZE
            for (let x = 1; x < GameScreen.MAP_WIDTH - 1; x++) {
                const xf = x * Constants.CHARACTER_SIZE
                if (x % 2 == 0 && y % 2 == 0) {
                    // 壊せない壁
                    this.walls.push(new Wall(this, xf, yf, false))
                } else {
                    // 壊せる壁
                    if (x < 3 && y < 3 || x > GameScreen.MAP_WIDTH - 4 && y > GameScreen.MAP_HEIGHT - 4) {
                        // プレイヤー出現位置の近くには壁は作らない
                    } else if (Math.random() < 0.5) {
                        this.walls.push(new Wall(this, xf, yf, true))
                    }
                }
            }
        }

        // その他のオブジェクトの初期化
        this.bombs.splice(0)
        this.explosions.splice(0)
        this.powerUpItems.splice(0)

        // 画面上部の各プレイヤーの状態表示
        this.setPlayerText(0)
        this.setPlayerText(1)

        // ゲーム終了時のテキスト
        this.gameEndText.text = ''

        // 効果音の初期化
        sounds.explosion.stop()
        sounds.setBomb.stop()
        sounds.walk.stop()
        sounds.powerUp.stop()
        sounds.crash.stop()

        // // BGMの再生
        sounds.bgm.play()

        this.startUpTimer = 30
    }

    onNextFrame() {
        super.onNextFrame()

        if (this.startUpTimer > 0) {
            this.startUpTimer--
            return
        }

        // プレイヤーの移動処理
        this.players.forEach(player => {
            player.pushPosition()
            player.moveForNextFrame()
        })

        // プレイヤー同士の衝突回避
        this.playersCollisionDetect()

        // プレイヤー、パワーアップアイテム、壁、爆発の状態変化
        this.nextFrame(this.players)
        this.nextFrame(this.powerUpItems)
        this.nextFrame(this.walls)
        this.nextFrame(this.explosions)

        // 爆弾の状態変化
        const newExplodeBomb = new Array<Bomb>()
        for (let i = this.bombs.length - 1; i >= 0; i--) {
            const bomb = this.bombs[i]
            if (bomb.onNextFrame()) {
                // 爆発した
                this.bombs.splice(i, 1)
                bomb.sprite().removeFromParent()
                // 爆発した爆弾をリストに入れておく
                newExplodeBomb.push(bomb)
            }
        }

        // 爆発の生成
        if (newExplodeBomb.length > 0) {
            sounds.explosion.play()
            newExplodeBomb.forEach(bomb => {
                this.explosions.push(new Explosion(this, bomb.x, bomb.y, ExplosionPosition.CENTER))
                this.expandExplosion(bomb, -1, 0)
                this.expandExplosion(bomb, 1, 0)
                this.expandExplosion(bomb, 0, -1)
                this.expandExplosion(bomb, 0, 1)
            })
        }

        // ゲーム状態の変化
        if (this.state == State.PLAYING) {
            if (this.players[0].isDead() && this.players[1].isDead()) {
                this.state = State.DRAW_GAME
                this.gameEndText.text = 'DRAW GAME'
                this.gameEndText.tint = 0xffffff
            } else if (this.players[0].isDead()) {
                this.state = State.PLAYER2_WON
                this.gameEndText.text = 'PLAYER 2 WIN'
                this.gameEndText.tint = 0x0000ff
            } else if (this.players[1].isDead()) {
                this.state = State.PLAYER1_WON
                this.gameEndText.text = 'PLAYER 1 WIN'
                this.gameEndText.tint = 0xd00000
            }
            this.gameEndText.x = 400 - this.gameEndText.width / 2
        } else {
            // ゲームが終わっている状態でスペースキーが押されると最初からになる
            if (isKeySpacePressing()) {
                this.startGame()
            }
        }

        // メインメニューに戻る
        if (isKeyEscapePressing()) {
            startMainMenu()
        }
    }

    private nextFrame(sprites: LightSprite[]) {
        for (let i = sprites.length - 1; i >= 0; i--) {
            const sprite = sprites[i]
            if (sprite.onNextFrame()) {
                sprites.splice(i, 1)
            }
        }
    }

    /**
     * プレイヤー同士の衝突回避
     * 1. 移動後の位置が重なっていなければどちらも移動できる
     * 2. 重なっている場合、片方の移動をキャンセルすることで重なりがなくなり、かつもう片方の移動をキャンセルしても重なりがなくならない場合は
     *    重なりがなくなる方の移動をキャンセルする
     * 3. 1、2 どちらでもない場合は両方の移動をキャンセルする
     */
    private playersCollisionDetect() {
        const pl0 = this.players[0]
        const pl1 = this.players[1]

        if (pl0.isDead() || pl1.isDead()) return
        if (Math.abs(pl0.x - pl1.x) < Constants.CHARACTER_SIZE &&
                Math.abs(pl0.y - pl1.y) < Constants.CHARACTER_SIZE) {
            const player0IsNotCancelable = Math.abs(pl0.pushedX - pl1.x) < Constants.CHARACTER_SIZE && Math.abs(pl0.pushedY - pl1.y) < Constants.CHARACTER_SIZE
            const player1IsNotCancelable = Math.abs(pl0.x - pl1.pushedX) < Constants.CHARACTER_SIZE && Math.abs(pl0.y - pl1.pushedY) < Constants.CHARACTER_SIZE
            if (!player0IsNotCancelable && player1IsNotCancelable) {
                pl0.popPosition()
            } else if (player0IsNotCancelable && !player1IsNotCancelable) {
                pl1.popPosition()
            } else {
                pl0.popPosition()
                pl1.popPosition()
            }
        }
    }

    /**
     * 指定した爆弾位置から指定した方向に爆発を生成する
     */
    private expandExplosion(bomb: Bomb, xx: number, yy: number) {
        for (let n = 1; n <= bomb.power; n++) {
            const px = bomb.x + xx * n * Constants.CHARACTER_SIZE
            const py = bomb.y + yy * n * Constants.CHARACTER_SIZE

            // 壁があるか？
            for (let i = this.walls.length - 1; i >= 0; i--) {
                const wall = this.walls[i]
                if (wall.x == px && wall.y == py) {
                    // 壁の破壊
                    if (wall.isBreakable) {
                        wall.startMelting()
                    }
                    return
                }
            }
            // 爆弾があったら誘爆する
            for (let i = this.bombs.length - 1; i >= 0; i--) {
                const b = this.bombs[i]
                if (b.x == px && b.y == py) {
                    b.remainTime = 1
                    return
                }
            }
            // パワーアップアイテムがあったら破壊する
            for (let i = this.powerUpItems.length - 1; i >= 0; i--) {
                const item = this.powerUpItems[i]
                if (item.x == px && item.y == py) {
                    this.powerUpItems.splice(i, 1)
                    item.sprite().removeFromParent()
                    return
                }
            }
            // 新しい爆発を生成する
            let position: ExplosionPosition
            if (xx == 0) {
                if (n == bomb.power) {
                    if (yy > 0) position = ExplosionPosition.BOTTOM; else position = ExplosionPosition.TOP
                } else {
                    position = ExplosionPosition.VERTICAL
                }
            } else {
                if (n == bomb.power) {
                    if (xx > 0) position = ExplosionPosition.RIGHT; else position = ExplosionPosition.LEFT
                } else {
                    position = ExplosionPosition.HORIZONTAL
                }
            }
            this.explosions.push(new Explosion(this, px, py, position))
        }
    }

    setPlayerText(playerNumber: number) {
        this.playerTexts[playerNumber].text = `PLAYER ${playerNumber + 1} POWER ${this.players[playerNumber].power}`
    }
}