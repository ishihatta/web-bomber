import { Application, Text } from "pixi.js";
import { Screen } from "../Screen";
import { startMainMenu } from "../main";
import * as AppResource from "../AppResource";

export class LoadingScreen extends Screen {
    text: Text

    constructor(app: Application) {
        super(app)

        // 背景色
        app.renderer.background.color = 0x000000

        // テキスト
        this.text = new Text("LOADING: 0%", { fontFamily: 'Arial', fontSize: 32, fill: 0xe0e0e0, fontWeight: 'bold' })
        this.text.x = (Screen.WIDTH - this.text.width) / 2 
        this.text.y = Screen.HEIGHT / 2 - 16
        this.baseStage.addChild(this.text)
        this.setText(1, 0)

        AppResource.load((allCount, finishCount) => {
            this.setText(allCount, finishCount)
            if (allCount == finishCount) {
                startMainMenu()
            }
        })
    }

    private setText(allCount: number, finishCount: number) {
        const p = Math.floor(finishCount * 100 / allCount + 0.5)
        this.text.text = `LOADING: ${p}%`
    }
}
