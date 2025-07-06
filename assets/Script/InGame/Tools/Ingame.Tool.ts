import { _decorator, CCInteger, Component, Enum, Label, Node } from 'cc';
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


    protected start(): void {
        this.txtCoin.string = this.coin.toString()
    }

    RecordTool: Record<TYPE_TOOL, CallableFunction> = {
        [TYPE_TOOL.HAMMER]: this.OnHammer.bind(this),
        [TYPE_TOOL.SWAP]: this.OnSwap.bind(this),
        [TYPE_TOOL.DESTROY]: this.OnDestroyCell.bind(this),
        [TYPE_TOOL.UPGRADE]: this.OnUpGrade.bind(this),
    }


    OnClick() {
        this.RecordTool[this.type]()
    }

    OnHammer() {

    }

    OnSwap() {

    }

    OnDestroyCell() {

    }

    OnUpGrade() {

    }

}


