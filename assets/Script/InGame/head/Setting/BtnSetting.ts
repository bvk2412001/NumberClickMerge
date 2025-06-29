import { _decorator, Component, EventTouch, Node, tween, UIOpacity } from 'cc';
import { BaseTouch } from '../../../Base/BaseTouch';
const { ccclass, property } = _decorator;

@ccclass('BtnSetting')
export class BtnSetting extends BaseTouch {
    @property({ type: Node })
    settingScene: Node = null;

    TouchStart(event: EventTouch): void {
        this.settingScene.active = true;

        let shadow = this.settingScene.getChildByName('shadow');
        let box = this.settingScene.getChildByName('box');

        let ActiveBox = () => {
            box.active = true;
        }

        this.FXShadow(shadow, ActiveBox);

    }

    FXShadow(node: Node, callBack?: CallableFunction) {
        node.active = true;
        let opa = node.getComponent(UIOpacity);
        opa.opacity = 127;
        tween(opa)
            .to(0.2, { opacity: 255 })
            .call(() => {
                if (typeof callBack === 'function') {
                    callBack();
                }
            })
            .start();
    }
}


