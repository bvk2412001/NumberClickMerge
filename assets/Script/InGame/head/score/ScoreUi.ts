import { _decorator, Component, Label, Node, tween, Animation } from 'cc';
import { AutoComponent } from '../../../Base/AutoComponent';
const { ccclass, property } = _decorator;

@ccclass('ScoreUi')
export class ScoreUi extends AutoComponent {

    @property({ type: Node })
    scoreNode: Node = null;
    @property({ type: Label })
    scoreLabel: Label = null;
    @property({ type: Node })
    maxScoreNode: Node = null;
    @property({ type: Label })
    maxScoreLabel: Label = null;
    @property({ type: Label })
    labelScorePlus: Label = null;
    
    LoadScoreNode() {
        if (this.scoreNode) return;
        this.scoreNode = this.node.getChildByName('score');
    }

    LoadScoreLabel() {
        if (this.scoreLabel) return;
        this.scoreLabel = this.node.getChildByPath('score/value').getComponent(Label);
    }

    LoadMaxScoreNode() {
        if (this.maxScoreNode) return;
        this.maxScoreNode = this.node.getChildByName('maxScore');
    }

    LoadMaxScoreLabel() {
        if (this.maxScoreLabel) return;
        this.maxScoreLabel =  this.node.getChildByPath('maxScore/value').getComponent(Label);
    }

    LoadLabelScorePlus() {
        if (this.labelScorePlus) return;
        this.labelScorePlus = this.node.getChildByPath('score/plus').getComponent(Label);
    }
    
    LoadComponent(): void {
        this.LoadScoreNode();
        this.LoadScoreLabel();
        this.LoadMaxScoreNode();
        this.LoadMaxScoreLabel();
        this.LoadLabelScorePlus();
    }

    protected onLoad(): void {
        super.onLoad();
        this.LoadComponent();
    }

    SetValueScore(value: Number) {
        this.scoreLabel.string = value.toString();
    }

    SetValueMaxScore(value: Number) {
        this.maxScoreLabel.string = value.toString();
    }

    public AnimationScoreChange(oldScore: number, newScore: number, label: Label) {
        if (oldScore === newScore) {
            label.string = `${newScore}`;
            return;
        }

        const scoreTweenObj = { value: oldScore };
        const delta = newScore - oldScore;

        // Tính thời gian tween theo độ chênh lệch (tối đa 1.5s, tối thiểu 0.3s)
        const duration = Math.min(1.5, Math.max(0.3, delta * 0.02));

        tween(scoreTweenObj)
            .to(duration, { value: newScore }, {
                onUpdate: () => {
                    // Cập nhật label hiển thị điểm (làm tròn xuống)
                    label.string = `${Math.floor(scoreTweenObj.value)}`;
                }
            })
            .start();
    }

    public updateScorePlus(score: number) {
        this.labelScorePlus.node.active = true;
        
        this.labelScorePlus.string = `+${score}`;

        this.labelScorePlus.node.getComponent(Animation).play();
    }
}


