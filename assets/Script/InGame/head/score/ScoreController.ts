import { _decorator, Component, Node } from 'cc';
import { ScoreUi } from './ScoreUi';
import { DataManager } from '../../../Manager/DataManager';
import { EventBus } from '../../../Utils/EventBus';
import { EventGame } from '../../../Enum/EEvent';
const { ccclass, property } = _decorator;

@ccclass('ScoreController')
export class ScoreController extends Component {

    @property({ type: ScoreUi })
    scoreUiCpn: ScoreUi = null;

    start() {
        this.scoreUiCpn = this.node.getComponent(ScoreUi);

        this.updateScore();
        this.updateScoreMax();

        this.ResGisterEvent();
    }

    onDestroy() {
        this.UnResGisterEvent();
    }

    ResGisterEvent() {
        EventBus.on(EventGame.UPGRADE_SCORE, this.OnScoreUpgraded, this);
    }

    UnResGisterEvent() {
        EventBus.off(EventGame.UPGRADE_SCORE, this.OnScoreUpgraded);
    }

    OnScoreUpgraded(plusScore: number) {
        // Cộng điểm vào CoreInPlayGame
        const dataManager = DataManager.getInstance();

        const previousScore = dataManager.CoreInPlayGame;
        const updatedScore = previousScore + plusScore;

        // Cập nhật điểm trong DataManager
        dataManager.CoreInPlayGame = updatedScore;

        // Cập nhật high score
        if (updatedScore > dataManager.highScore) {
            dataManager.highScore = updatedScore;
        }

        // Gọi hàm tween tăng điểm mượt mà
        this.scoreUiCpn.AnimationScoreChange(previousScore, updatedScore, this.scoreUiCpn.scoreLabel);

        // Cập nhật hiệu ứng + điểm
        this.scoreUiCpn.updateScorePlus(plusScore);

        // Cập nhật highScore trên UI
        this.scoreUiCpn.SetValueMaxScore(dataManager.highScore);
    }

    public updateScore() {
        let score = DataManager.getInstance().CoreInPlayGame;
        if (score) {
            this.scoreUiCpn.SetValueScore(score);
            return;
        }

        DataManager.getInstance().CoreInPlayGame = 0;
        score = 0;
        this.scoreUiCpn.SetValueScore(score);
    }

    public updateScoreMax() {
        const score = DataManager.getInstance().highScore;

        this.scoreUiCpn.SetValueMaxScore(score);
    }
}


