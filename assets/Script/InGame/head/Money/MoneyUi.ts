import { _decorator, Component, Label, Node, tween } from 'cc';
import { AutoComponent } from '../../../Base/AutoComponent';
import { EventBus } from '../../../Utils/EventBus';
import { EventGame } from '../../../Enum/EEvent';
const { ccclass, property } = _decorator;

@ccclass('MoneyUi')
export class MoneyUi extends AutoComponent {

    @property({ type: Label })
    gold: Label = null;

    SetCoin(gold: number) {
        this.gold.string = gold.toString();
    }

    public AnimationScoreChange(oldGold: number, newGold: number, label: Label) {
        if (oldGold === newGold) {
            label.string = `${newGold}`;
            return;
        }

        const goldsTweenObj = { value: oldGold };
        const delta = newGold - oldGold;

        // Tính thời gian tween theo độ chênh lệch (tối đa 1.5s, tối thiểu 0.3s)
        const duration = Math.min(1.5, Math.max(0.3, delta * 0.02));

        tween(goldsTweenObj)
            .to(duration, { value: newGold }, {
                onUpdate: () => {
                    // Cập nhật label hiển thị điểm (làm tròn xuống)
                    label.string = `${Math.floor(goldsTweenObj.value)}`;
                }
            })
            .start();
    }
}


