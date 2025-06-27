import { _decorator, Component, EventTouch, Node } from 'cc';
import { BaseTouch } from '../../Base/BaseTouch';
import { Utils } from '../../Utils/Utils';
const { ccclass, property } = _decorator;

@ccclass('btnAddHeart')
export class btnAddHeart extends BaseTouch {

    TouchStart(event: EventTouch): void {

        Utils.getInstance().ShowAdsReward(() => {

        })
    }


}


