import { _decorator, Animation, AnimationClip, AnimationState, Color, Component, Label, Node, Sprite } from 'cc';
import { CellModel } from './CellModel';
import { ECELL_CLICK_EFFECT, ECELL_STATE } from '../../Enum/ECell';
import { GridManager } from '../GridManager';
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

    private _shakeState: AnimationState | null = null;

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
            this.up.active = false
            this.down.active = false
        }
        else {
            this.up.active = false
            this.down.active = true
        }

        if (dataCell.value >= GridManager.getInstance().numberMax - 1 && dataCell.value > 7) {
            this.frame.active = true;
        }
        else {
            this.frame.active = false
        }
    }

    PlayAnimationShake() {
        this.node.getComponent(Animation).play();
    }

    PlayAnimationShakeLoop() {
        const anim = this.node.getComponent(Animation);

        this._shakeState = anim.getState(anim.defaultClip.name);

        this._shakeState.wrapMode = AnimationClip.WrapMode.Loop;
        this._shakeState.repeatCount = Infinity;

        this._shakeState.play();
    }

    StopAnimationShake() {
        if (!this._shakeState) return;

        this._shakeState.stop();

        // Đặt thời gian về 0 rồi sample để áp pose khung 0
        this._shakeState.time = 0;
        this._shakeState.sample();   // ← KHÔNG có tham số

        this._shakeState.wrapMode = AnimationClip.WrapMode.Normal;
        this._shakeState.repeatCount = 1;

        this._shakeState = null;
    }
}


