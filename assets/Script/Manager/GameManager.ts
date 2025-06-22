import { _decorator, Component, JsonAsset, Node } from 'cc';
import { BaseSingleton } from '../Base/BaseSingleton';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends BaseSingleton<GameManager> {
    @property(JsonAsset)
    dataGame: JsonAsset = null;

    @property(JsonAsset)
    dataCell: JsonAsset = null;


    protected start(): void {

    }
}


