import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('AutoComponent')
export class AutoComponent extends Component {
    resetInEditor(didResetToDefault?: boolean): void {
        this.LoadComponent()
        this.SetValue()
    }

    protected onLoad(): void {
        this.LoadComponent()
        this.SetValue()
    }

    protected LoadComponent(): void {

    }

    protected SetValue(): void {

    }
}


