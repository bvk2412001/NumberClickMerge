import { _decorator, Component, Node, randomRange } from 'cc';
import { CellModel } from './CellModel';
import { CellUI } from './CellUI';
import { ECELL_CLICK_EFFECT, ECELL_STATE } from '../../Enum/ECell';
import { PrefabManager } from '../../Manager/PrefabManager';
import { PoolObjectManager } from '../../Manager/PoolObjectManager';
import { InGameLogicManager } from '../InGameLogicManager';
import { InGameUIManager } from '../InGameUIManager';
const { ccclass, property } = _decorator;

@ccclass('Cell')
export class Cell {
    public cellData: CellModel = null
    public cellUI: CellUI = null
    clickEffect: ECELL_CLICK_EFFECT = ECELL_CLICK_EFFECT.Up
    cellState: ECELL_STATE = ECELL_STATE.None

    constructor(cellData: CellModel) {
        this.cellData = cellData
        this.clickEffect = this.RandomEffectClick()
        this.CreateCellUI()
    }

    public CreateCellUI(): void {
        let cellNode = PoolObjectManager.getInstance().Spawn(PrefabManager.getInstance().cellPrefab, InGameUIManager.getInstance().cellNode)
        this.cellUI = cellNode.getComponent(CellUI)
        this.cellUI.UpdateUICell(this.cellData, this.clickEffect, this.cellState)
    }


    GetCellUI() {
        return this.cellUI.node
    }

    RandomEffectClick(): ECELL_CLICK_EFFECT {
        let random = randomRange(0, 1)

        return random > 0.5 ? ECELL_CLICK_EFFECT.Up : ECELL_CLICK_EFFECT.Down
    }


}


