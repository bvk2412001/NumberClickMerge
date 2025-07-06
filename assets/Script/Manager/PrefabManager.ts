import { _decorator, Component, Node, Prefab } from 'cc';
import { BaseSingleton } from '../Base/BaseSingleton';
const { ccclass, property } = _decorator;

@ccclass('PrefabManager')
export class PrefabManager extends BaseSingleton<PrefabManager> {
    @property({ type: Prefab, group: { name: "INGAME" } })
    cellPrefab: Prefab = null

    @property({ type: Prefab, group: { name: "INGAME" } })
    cellContainPrefab: Prefab = null

    @property({ type: Prefab, group: { name: "POPUP" } })
    popupUnlockMax: Prefab = null

    @property({ type: Prefab, group: { name: "POPUP" } })
    popupUnlockMin: Prefab = null



}


