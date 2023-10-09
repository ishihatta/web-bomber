import { Application, Assets, Sprite, Spritesheet, Text } from "pixi.js";
import { PlayerType } from "../PlayerType";
import { Screen } from "../Screen";
import { sounds, startGame } from "../main";

class MenuItem {
    screenText: string
    playerType1: PlayerType
    playerType2: PlayerType

    constructor(screenText: string, playerType1: PlayerType, playerType2: PlayerType) {
        this.screenText = screenText
        this.playerType1 = playerType1
        this.playerType2 = playerType2
    }
}

export class MainMenuScreen extends Screen {
    private static MENU_ITEM_X = 300
    private static MENU_ITEM_Y_START = 260
    private static MENU_ITEM_Y_STEP = 40

    private static menuItems: MenuItem[] = [
        new MenuItem("HUMAN VS AI", PlayerType.HUMAN, PlayerType.AI),
        new MenuItem("AI VS HUMAN", PlayerType.AI, PlayerType.HUMAN),
        new MenuItem("HUMAN VS HUMAN", PlayerType.HUMAN, PlayerType.HUMAN),
        new MenuItem("AI VS AI", PlayerType.AI, PlayerType.AI),
    ]

    private logoSprite: Sprite|null = null
    private itemText: Text[] = Array(MainMenuScreen.menuItems.length)
    private cursorSprite: Sprite|null = null

    // 選択中のアイテムのインデックス
    private cursor = 0

    private goToGameState = -1

    constructor(app: Application, spritesheet: Spritesheet) {
        super(app)

        // 背景色
        app.renderer.background.color = 0x000000

        // キー入力されていない状態にする
        pressedKeyCode = ''

        // ロゴ
        Assets.load('images/logo.png').then(texture => {
            this.logoSprite = new Sprite(texture)
            this.logoSprite.x = (Screen.WIDTH - this.logoSprite.width) / 2
            this.logoSprite.y = Screen.HEIGHT / 4 - this.logoSprite.height / 2
            this.baseStage.addChild(this.logoSprite)

            // メニューアイテム
            for (let i = 0; i < MainMenuScreen.menuItems.length; i++) {
                const item = MainMenuScreen.menuItems[i]
                this.itemText[i] = new Text(item.screenText, { fontFamily: 'Arial', fontSize: 16, fill: 0xb0b0b0, fontWeight: 'bold' })
                this.itemText[i].x = MainMenuScreen.MENU_ITEM_X
                this.itemText[i].y = MainMenuScreen.MENU_ITEM_Y_START + MainMenuScreen.MENU_ITEM_Y_STEP * i
                this.baseStage.addChild(this.itemText[i])
            }

            // カーソル
            const textureCursor = spritesheet.textures['pl1_1.png']
            this.cursorSprite = new Sprite(textureCursor)
            this.cursorSprite.x = MainMenuScreen.MENU_ITEM_X - 40
            this.setCursorLocation()
            this.baseStage.addChild(this.cursorSprite)

            // キー入力
            window.document.body.addEventListener('keydown', onKeyDown)            
        }, _ => {})
    }

    onClose() {
        super.onClose()
        window.document.body.removeEventListener('keydown', onKeyDown)
    }

    onNextFrame() {
        super.onNextFrame()

        if (this.goToGameState >= 0) {
            this.goToGameState--
            this.itemText[this.cursor].tint = (this.goToGameState % 12) < 6 ? 0xffffff : 0x808080
            if (this.goToGameState < 30) this.baseStage.alpha = this.goToGameState / 30
            if (this.goToGameState <= 0) {
                const item = MainMenuScreen.menuItems[this.cursor]
                startGame(item.playerType1, item.playerType2)
            }
            return
        }

        const keyCode = pressedKeyCode
        pressedKeyCode = ''

        switch (keyCode) {
            case 'ArrowUp':
            case 'KeyW':
                this.cursor--
                if (this.cursor < 0) this.cursor = MainMenuScreen.menuItems.length - 1
                this.setCursorLocation()
                break
            case 'ArrowDown':
            case 'KeyS':
                this.cursor++
                if (this.cursor >= MainMenuScreen.menuItems.length) this.cursor = 0
                this.setCursorLocation()
                break
            case 'Slash':
            case 'Digit1':
            case 'Space':
                this.startGame()
                break
        }
    }

    private setCursorLocation() {
        this.cursorSprite!.y = MainMenuScreen.MENU_ITEM_Y_START + MainMenuScreen.MENU_ITEM_Y_STEP * this.cursor - 8
        for (let i = 0; i < MainMenuScreen.menuItems.length; i++) {
            this.itemText[i].tint = i == this.cursor ? 0xffffff : 0xb0b0b0
        }
    }

    private startGame() {
        this.goToGameState = 204
        sounds.startGame.play()
    }
}

let pressedKeyCode = ''

function onKeyDown(event: KeyboardEvent) {
    pressedKeyCode = event.code
}
