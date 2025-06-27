import { _decorator, Component, log, Node } from 'cc';
import { DataManager } from '../../Manager/DataManager';
import { EventBus } from '../../Utils/EventBus';
import { EventGame } from '../../Enum/EEvent';
import { Utils } from '../../Utils/Utils';
const { ccclass, property } = _decorator;

@ccclass('HeartUi')
export class HeartUi extends Component {

    listHeart: Node[] = [];

    protected onLoad(): void {
        Utils.getInstance().LoadHeartGameDefault();
        this.LoadListHeart();
    }

    start() {
        this.UpdateUiheart();
        this.RegisterEvent();
    }

    RegisterEvent() {
        EventBus.on(EventGame.UPDATE_HEARt_UI, this.UpdateUiheart, this);
    }

    UnRegisterEvent() {
        EventBus.off(EventGame.UPDATE_HEARt_UI, this.UpdateUiheart);
    }

    LoadListHeart() {
        this.listHeart = this.node.children.filter(element => element.name === 'itemHeat');
    }

    UpdateUiheart() {
        let myHeart = DataManager.getInstance().MyHeart;
        for (let i = 0; i < myHeart; i++) {
            let heartNode = this.listHeart[i];
            let ActiveHeartNode = heartNode.getChildByName('heatActive');

            ActiveHeartNode.active = true;
        }

        for (let j = myHeart; j < this.listHeart.length; j++) {
            let heartNode = this.listHeart[j];
            let ActiveHeartNode = heartNode.getChildByName('heatActive');

            ActiveHeartNode.active = false;
        }
    }
}


