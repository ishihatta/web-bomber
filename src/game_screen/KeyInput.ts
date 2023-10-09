class KeyMap {
    keyCode: string
    pressed: boolean = false
    constructor(keyCode: string) {
        this.keyCode = keyCode
    }
}

const keyMaps: KeyMap[] = [
    new KeyMap('KeyW'),
    new KeyMap('KeyD'),
    new KeyMap('KeyS'),
    new KeyMap('KeyA'),
    new KeyMap('Digit1'),
    new KeyMap('ArrowUp'),
    new KeyMap('ArrowRight'),
    new KeyMap('ArrowDown'),
    new KeyMap('ArrowLeft'),
    new KeyMap('Slash'),
    new KeyMap('Space'),
    new KeyMap('Escape'),
]

export function initKeyInput() {
    keyMaps.forEach(map => { map.pressed = false })
    window.document.body.addEventListener('keydown', onKeyDown)
    window.document.body.addEventListener('keyup', onKeyUp)
}

export function deinitKeyInput() {
    window.document.body.removeEventListener('keydown',onKeyDown)
    window.document.body.removeEventListener('keyup',onKeyUp)
}

function onKeyDown(event: KeyboardEvent) {
    for (let i = 0; i < keyMaps.length; i++) {
        const keyMap = keyMaps[i]
        if (event.code === keyMap.keyCode) {
            keyMap.pressed = true
            break
        }
    }
}

function onKeyUp(event: KeyboardEvent) {
    for (let i = 0; i < keyMaps.length; i++) {
        const keyMap = keyMaps[i]
        if (event.code === keyMap.keyCode) {
            keyMap.pressed = false
            break
        }
    }
}

export function isKeyUpPressing(playerNumber: number): boolean {
    return keyMaps[playerNumber * 5].pressed
}

export function isKeyRightPressing(playerNumber: number): boolean {
    return keyMaps[1 + playerNumber * 5].pressed
}

export function isKeyDownPressing(playerNumber: number): boolean {
    return keyMaps[2 + playerNumber * 5].pressed
}

export function isKeyLeftPressing(playerNumber: number): boolean {
    return keyMaps[3 + playerNumber * 5].pressed
}

export function isKeyFirePressing(playerNumber: number): boolean {
    return keyMaps[4 + playerNumber * 5].pressed
}

export function isKeySpacePressing(): boolean {
    return keyMaps[10].pressed
}

export function isKeyEscapePressing(): boolean {
    return keyMaps[11].pressed
}
