import { _decorator, Color, Component, Label, Node, Sprite } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Cell')
export class Cell extends Component {
    @property(Label)
    index: Label

    @property(Sprite)
    bg: Sprite

    SetUp(data) {
        this.index.string = data["index"]
        let color = new Color()
        Color.fromHEX(color, data["color"])
        this.bg.color = color
    }
}


