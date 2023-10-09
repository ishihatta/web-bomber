import { Constants } from "./Constants";
import { GameScreen } from "./GameScreen";
import { LightSprite } from "./LightSprite";
import { PlayerInput, PlayerMove, PlayerOperation } from "./PlayerOperation";
import { AIPlayer } from 'bomber-ai';

export class AIPlayerOperation implements PlayerOperation {
    playerNumber: number
    gameScreen: GameScreen
    aiPlayer: AIPlayer = AIPlayer.new()

    constructor(gameScreen: GameScreen, playerNumber: number) {
        this.gameScreen = gameScreen
        this.playerNumber = playerNumber
    }

    free(): void {
        this.aiPlayer.free()
    }

    getPlayerInput(): PlayerInput {
        const player = this.gameScreen.players[this.playerNumber]
        const opponent = this.gameScreen.players[1 - this.playerNumber]
        const walls = AIPlayerOperation.createItemArray(this.gameScreen.walls, w =>
            (w.isBreakable ? 0x10000 : 0) | (w.isMelting() ? 0x20000 : 0)
        )
        const powerUpItems = AIPlayerOperation.createItemArray(this.gameScreen.powerUpItems, _ => 0)
        const bombs = AIPlayerOperation.createItemArray(this.gameScreen.bombs, b => 
            (b.power << 10) | (b.remainTime << 18)
        )
        const explosions = AIPlayerOperation.createItemArray(this.gameScreen.explosions, _ => 0)
        const operation = this.aiPlayer.get_player_input(
            walls,
            powerUpItems,
            bombs,
            explosions,
            player.x,
            player.y,
            opponent.x,
            opponent.y,
            player.power,
            opponent.isDead()
        )
        let move: PlayerMove
        if (operation & 2) {
            move = PlayerMove.LEFT
        } else if (operation & 1) {
            move = PlayerMove.RIGHT
        } else if (operation & 4) {
            move = PlayerMove.UP
        } else if (operation & 8) {
            move = PlayerMove.DOWN
        } else {
            move = PlayerMove.NONE
        }
        return new PlayerInput(move, (operation & 16) != 0)
    }

    private static createItemArray<T extends LightSprite>(items: T[], transform: (item: T) => number): Int32Array {
        const ret = new Int32Array(items.length)
        for (let i = 0; i < ret.length; i++) {
            const item = items[i]
            ret[i] = (item.x / Constants.CHARACTER_SIZE) | ((item.y / Constants.CHARACTER_SIZE) << 5) | transform(item)
        }
        return ret
    }
}

