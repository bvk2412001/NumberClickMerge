import { _decorator, Color, Component, Label, Node, Sprite } from 'cc';
import { CellModel } from './CellModel';
import { ECELL_CLICK_EFFECT, ECELL_STATE } from '../../Enum/ECell';
const { ccclass, property } = _decorator;

@ccclass('CellUI')
export class CellUI extends Component {
    @property(Label)
    index: Label = null

    @property(Sprite)
    bg: Sprite = null

    @property(Node)
    up: Node = null


    @property(Node)
    down: Node = null


    @property(Node)
    frame: Node = null

    SetUp(data) {
        this.index.string = data["index"]
        let color = new Color()
        Color.fromHEX(color, data["color"])
        this.bg.color = color
    }

    UpdateUICell(dataCell: CellModel, clickEffect: ECELL_CLICK_EFFECT, cellState: ECELL_STATE) {
        let color: Color = new Color()
        Color.fromHEX(color, dataCell.color)
        this.bg.color = color
        this.index.string = dataCell.value.toString()

        if (clickEffect == ECELL_CLICK_EFFECT.Up) {
            this.up.active = true
            this.down.active = false
        }
        else {
            this.up.active = false
            this.down.active = true
        }


        if (dataCell.value > 7) {
            this.frame.active = true
        }
        else {
            this.frame.active = false
        }
    }


}


