import { _decorator, Component, instantiate, Node, Prefab } from 'cc';
import { BaseSingleton } from '../Base/BaseSingleton';
const { ccclass, property } = _decorator;

@ccclass('PoolObjectManager')
export class PoolObjectManager extends BaseSingleton<PoolObjectManager> {
    public pools: Map<Prefab, Node[]> = new Map<Prefab, Node[]>();


    Spawn(prefab: Prefab, parent) {
        let listPrefab = this.pools.get(prefab)
        if (listPrefab == null) {
            listPrefab = []
            this.pools.set(prefab, listPrefab)
        }
        let newNode: Node = null;
        if (listPrefab.length > 0) {
            newNode = listPrefab.splice(0, 1)[0]
        }

        if (newNode == null) {
            newNode = instantiate(prefab)
        }

        parent.addChild(newNode)
        newNode.active = true;

        return newNode;
    }

    RecycleObject(obj: Node, key: Prefab) {
        this.pools.get(key).push(obj);

        obj.active = false;
    }
}


