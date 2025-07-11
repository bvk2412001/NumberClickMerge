import { _decorator, Component, Label, log, Node, tween } from 'cc';
import { AutoComponent } from '../../Base/AutoComponent';
import { DataManager } from '../../Manager/DataManager';
import { FXShadow } from '../../FX/FXShadow';
const { ccclass, property } = _decorator;

@ccclass('Lose')
export class Lose extends AutoComponent {

    @property({ type: Label, tooltip: '' })
    scoreGame: Label = null;
    @property({ type: Label, tooltip: '' })
    maxScoreGame: Label = null;
    @property({ type: FXShadow, tooltip: '' })
    fxShadow: FXShadow = null;
    @property({ type: Node, tooltip: '' })
    box: Node = null;

    protected LoadScoreGame() {
        if (this.scoreGame == null) return;
        this.scoreGame = this.node.getChildByPath('box/score/maxScore/value').getComponent(Label);
    }
    protected LoadMaxScoreGame() {
        if (this.maxScoreGame == null) return;
        this.maxScoreGame = this.node.getChildByPath('box/score/score/value').getComponent(Label);
    }

    protected override LoadComponent(): void {
        this.LoadScoreGame();
        this.LoadMaxScoreGame();
    }

    protected onEnable(): void {
        this.ShowFXLose();
    }

    protected onDestroy(): void {
        this.HideFXLose();
    }

    async ShowFXLose() {
        this.box.active = false;

        await this.fxShadow.ShowFxShadow();

        await this.fxShadow.ShowFxBox(this.box);
    }

    async HideFXLose() {
        await this.fxShadow.HideFxBox(this.box);

        await this.fxShadow.HideFXShadow();
    }

    GetScoreGamePlay() {
        let score = DataManager.getInstance().CoreInPlayGame;

        this.AnimationScoreChange(0, score, this.scoreGame);

        let maxScore = DataManager.getInstance().highScore;

        this.AnimationScoreChange(0, maxScore, this.maxScoreGame);
    }

    public AnimationScoreChange(oldScore: number = 0, newScore: number, labelText: Label) {

        const scoreTweenObj = { value: oldScore };
        const delta = newScore - oldScore;

        // Tính thời gian tween theo độ chênh lệch (tối đa 1.5s, tối thiểu 0.3s)
        const duration = Math.min(1.5, Math.max(0.3, delta * 0.02));

        tween(scoreTweenObj)
            .to(duration, { value: newScore }, {
                onUpdate: () => {
                    // Cập nhật label hiển thị điểm (làm tròn xuống)
                    labelText.string = `${Math.floor(scoreTweenObj.value)}`;
                }
            })
            .start();
    }
}