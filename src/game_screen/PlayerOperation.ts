import { PlayerType } from "../PlayerType";
import { AIPlayerOperation } from "./AIPlayerOperation";
import { GameScreen } from "./GameScreen";
import { UserPlayerOperation } from "./UserPlayerOperation";

export enum PlayerMove {
    NONE, LEFT, UP, RIGHT, DOWN
}

export class PlayerInput {
    move: PlayerMove
    fire: boolean;

    constructor(move: PlayerMove, fire: boolean) {
        this.move = move
        this.fire = fire
    }
}

export interface PlayerOperation {
    getPlayerInput(): PlayerInput
    free(): void
}

export function getPlayerOperation(playerType: PlayerType, playerNumber: number, gameScreen: GameScreen): PlayerOperation {
    switch (playerType) {
        case PlayerType.HUMAN:
            return new UserPlayerOperation(playerNumber)
        case PlayerType.AI:
            return new AIPlayerOperation(gameScreen, playerNumber)
    }
}
