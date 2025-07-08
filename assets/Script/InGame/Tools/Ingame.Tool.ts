import { _decorator, CCInteger, Component, Enum, Label, log, Node } from 'cc';
import { InGameLogicManager } from '../InGameLogicManager';
const { ccclass, property } = _decorator;

export enum TYPE_TOOL {
    HAMMER = 0,
    SWAP = 1,
    DESTROY = 2,
    UPGRADE = 3
}

Enum(TYPE_TOOL)

@ccclass('Ingame_Tool')
export class Ingame_Tool extends Component {
    @property({ type: TYPE_TOOL })
    type: TYPE_TOOL = TYPE_TOOL.HAMMER

    @property(Label)
    txtCoin: Label = null

    @property(CCInteger)
    coin: number = 0;

    isClick: boolean = false;

    protected start(): void {
        this.txtCoin.string = this.coin.toString();

        this.RegisterEvent();
    }

    RecordTool: Record<TYPE_TOOL, CallableFunction> = {
        [TYPE_TOOL.HAMMER]: this.OnHammer.bind(this),
        [TYPE_TOOL.SWAP]: this.OnSwap.bind(this),
        [TYPE_TOOL.DESTROY]: this.OnDestroyCell.bind(this),
        [TYPE_TOOL.UPGRADE]: this.OnUpGrade.bind(this),
    }

    RegisterEvent() {
        this.node.on(Node.EventType.TOUCH_START, this.OnClick, this);
    }

    DestriyEvent() {
        this.node.off(Node.EventType.TOUCH_START, this.OnClick, this);
    }

    OnClick() {
        this.RecordTool[this.type]()
    }


    //#region tool hammer
    OnHammer() {

    }

    //#region tool swap
    OnSwap() {

    }

    //#region destroy cell
    OnDestroyCell() {
        InGameLogicManager.getInstance().removeAllMinCellsTools(); // xoá nhỏ nhất
    }

    //#region up grade
    OnUpGrade() {

    }

}


