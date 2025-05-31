import { _decorator, Component, JsonAsset, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
    @property(JsonAsset)
    dataGame: JsonAsset = null;

    @property(JsonAsset)
    dataCell: JsonAsset = null;

    public static instance: GameManager = null

    protected start(): void {
        GameManager.instance = this
    }
}


