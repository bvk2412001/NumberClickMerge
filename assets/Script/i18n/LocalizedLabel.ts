import { _decorator, Component, Label, Node } from 'cc';
import { LanguageManager } from './LanguageManager';
const { ccclass, property } = _decorator;

@ccclass('LocalizedLabel')
export class LocalizedLabel extends Component {
    @property
    key: string = '';

    start() {
        this.updateText();
    }

    updateText() {
        const label = this.getComponent(Label);
        if (label) {
            label.string = LanguageManager.getInstance().t(this.key);
        }
    }
}


