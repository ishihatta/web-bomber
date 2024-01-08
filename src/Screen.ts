import { Application, Container } from "pixi.js";

export class Screen {
    static readonly WIDTH = 800
    static readonly HEIGHT = 480

    app: Application
    baseStage: Container

    constructor(app: Application) {
        this.app = app
        this.baseStage = new Container()
        app.stage.addChild(this.baseStage)
    }

    onClose(): void {
        this.baseStage.removeFromParent()
    }

    onNextFrame(): void {
        // 画面サイズに合わせてスケールさせる
        this.app.stage.scale.x = window.innerWidth / Screen.WIDTH
        this.app.stage.scale.y = window.innerHeight / Screen.HEIGHT
    }
}