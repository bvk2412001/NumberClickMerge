import { _decorator, Component, instantiate, Node } from 'cc';
import { PopupUnlockMax } from '../InGame/Popup/PopupUnlockMax';
import { PrefabManager } from './PrefabManager';
import { BaseSingleton } from '../Base/BaseSingleton';
const { ccclass, property } = _decorator;

@ccclass('PopupManager')
export class PopupManager extends BaseSingleton<PopupManager> {


    private _popupUnlockMax: PopupUnlockMax = null

    get popupUnlockMax() {
        if (this._popupUnlockMax == null) {
            this._popupUnlockMax = instantiate(PrefabManager.getInstance().popupUnlock).getComponent(PopupUnlockMax)
            this.node.addChild(this._popupUnlockMax.node)
        }
        return this._popupUnlockMax
    }

    ShowPopupUnlockMax() {
        this.popupUnlockMax.show()
    }
}


