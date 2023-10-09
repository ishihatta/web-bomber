import { isKeyDownPressing, isKeyFirePressing, isKeyLeftPressing, isKeyRightPressing, isKeyUpPressing } from "./KeyInput";
import { PlayerInput, PlayerMove, PlayerOperation } from "./PlayerOperation";

export class UserPlayerOperation implements PlayerOperation {
    playerNumber: number

    constructor(playerNumber: number) {
        this.playerNumber = playerNumber
    }

    getPlayerInput(): PlayerInput {
        let move: PlayerMove
        if (isKeyLeftPressing(this.playerNumber)) {
            move = PlayerMove.LEFT
        } else if (isKeyRightPressing(this.playerNumber)) {
            move = PlayerMove.RIGHT
        } else if (isKeyUpPressing(this.playerNumber)) {
            move = PlayerMove.UP
        } else if (isKeyDownPressing(this.playerNumber)) {
            move = PlayerMove.DOWN
        } else {
            move = PlayerMove.NONE
        }
        return new PlayerInput(move, isKeyFirePressing(this.playerNumber))
    }

    free(): void {
        // Do nothing
    }
}

