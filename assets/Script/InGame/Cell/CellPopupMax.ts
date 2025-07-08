import { _decorator, Animation, Color, Component, Label, Node, Sprite, tween, Vec3 } from 'cc';
import { GridManager } from '../GridManager';
const { ccclass, property } = _decorator;

export enum CellPopupState {
    PRE = 0,
    CURRENT = 1,
    NEXT = 2
}

@ccclass('CellPopupMax')
export class CellPopupMax extends Component {
    @property(Label)
    index: Label = null

    @property(Sprite)
    bg: Sprite = null

    @property(Node)
    mask: Node = null

    @property(Node)
    frame: Node = null


    currentState: CellPopupState
    valueCurrent: number = 0
    setUp(value: number, state: CellPopupState) {
        this.valueCurrent = value
        this.index.string = value.toString()
        let color: Color = new Color()
        Color.fromHEX(color, GridManager.getInstance().GetColorByValue(value))
        this.bg.color = color
        this.updateState(state, false)


    }


    updateState(state: CellPopupState, unlock = true) {
        this.currentState = state
        switch (state) {
            case CellPopupState.CURRENT:
                if (unlock == false) {
                    this.UpdateUICurrent()
                }
                else {
                    this.node.getComponent(Animation).play()
                    tween(this.node).to(1, { scale: new Vec3(1.4, 1.4, 1.4) }).start()
                    this.scheduleOnce(() => {
                        this.node.getComponent(Animation).stop()
                        this.UpdateUICurrent()
                    }, 1)
                }

                break;
            case CellPopupState.PRE:
            case CellPopupState.NEXT:
                tween(this.node).to(0.2, { scale: new Vec3(1, 1, 1) }).start()
                this.frame.active = false
                this.mask.active = true
                break;

        }
    }

    UpdateUICurrent() {
        tween(this.node).to(0.2, { scale: new Vec3(1.2, 1.2, 1.2) }).start()
        if (this.valueCurrent > 7)
            this.frame.active = true
        this.mask.active = false
    }

}


