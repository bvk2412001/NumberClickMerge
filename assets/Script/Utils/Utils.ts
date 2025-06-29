import { _decorator, Component, log, Node } from 'cc';
import { BaseSingleton } from '../Base/BaseSingleton';
import { DataManager } from '../Manager/DataManager';
const { ccclass, property } = _decorator;

@ccclass('Utils')
export class Utils extends BaseSingleton<Utils> {


    //#region Heart
    LoadHeartGameDefault() {
        let heart = DataManager.getInstance().MyHeart;

        DataManager.getInstance().MyHeart = heart;
    }

    UpdateHeart(subtraction: number) { // subtraction là hiệu (cộng hoặc trừ)
        let heart = DataManager.getInstance().MyHeart;
        let newHeart = heart + subtraction;
        if (newHeart < 0 || newHeart > 5) return;

        DataManager.getInstance().MyHeart = newHeart;
    }

    //#region AdsManager
    ShowAdsReward(call?: CallableFunction) {

        log('ads');

        if (typeof call === 'function') {
            call();
        }
    }
}


