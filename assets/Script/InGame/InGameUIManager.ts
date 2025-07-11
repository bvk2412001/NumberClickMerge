import { _decorator, Component, instantiate, Layout, Node, Prefab } from 'cc';
import { GameManager } from '../Manager/GameManager';
import { GridManager } from './GridManager';
import { CellUI } from './Cell/CellUI';
import { BaseSingleton } from '../Base/BaseSingleton';
import { Lose } from './Lose/Lose';

const { ccclass, property } = _decorator;

@ccclass('InGameUIManager')
export class InGameUIManager extends BaseSingleton<InGameUIManager> {

    @property(Node)
    containNode: Node = null

    @property(Node)
    cellNode: Node = null

    @property(Lose)
    lose: Lose = null

    UpdateLayoutContainCell() {
        this.containNode.getComponent(Layout).updateLayout();
    }

}


