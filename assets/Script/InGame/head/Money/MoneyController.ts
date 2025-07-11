import { _decorator, Component, log, Node } from 'cc';
import { MoneyUi } from './MoneyUi';
import { EventBus } from '../../../Utils/EventBus';
import { EventGame } from '../../../Enum/EEvent';
import { DataManager } from '../../../Manager/DataManager';
const { ccclass, property } = _decorator;

@ccclass('MoneyController')
export class MoneyController extends Component {

    @property({ type: MoneyUi })
    moneyUi: MoneyUi = null;

    protected start(): void {
        this.updateGold();
        this.RegisterEvent();
    }

    onDestroy() {
        this.UnRegisterEvent();
    }

    RegisterEvent() {
        EventBus.on(EventGame.UPDATE_COIN_UI, this.UpdateUiCoin, this)
    }

    UnRegisterEvent() {
        EventBus.off(EventGame.UPDATE_COIN_UI, this.UpdateUiCoin)
    }

    UpdateUiCoin(gold: number) {
        // Cộng điểm vào Gold
        const dataManager = DataManager.getInstance();

        const previousGold = dataManager.Gold;
        const updatedGold = previousGold + gold;

        // Cập nhật điểm trong DataManager
        dataManager.Gold = updatedGold;

        // Gọi hàm tween tăng điểm mượt mà
        this.moneyUi.AnimationScoreChange(previousGold, updatedGold, this.moneyUi.gold);
    }

    public updateGold() {
        let gold = DataManager.getInstance().Gold;
        if (gold) {
            this.moneyUi.SetCoin(gold);
            return;
        }

        DataManager.getInstance().Gold = 0;
        gold = 0;
        this.moneyUi.SetCoin(gold);
    }
}


