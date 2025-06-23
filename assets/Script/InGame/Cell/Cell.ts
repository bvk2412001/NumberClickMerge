import { _decorator, Component, Input, log, Node, randomRange } from 'cc';
import { CellModel } from './CellModel';
import { CellUI } from './CellUI';
import { ECELL_CLICK_EFFECT, ECELL_STATE } from '../../Enum/ECell';
import { PrefabManager } from '../../Manager/PrefabManager';
import { PoolObjectManager } from '../../Manager/PoolObjectManager';
import { InGameLogicManager } from '../InGameLogicManager';
import { InGameUIManager } from '../InGameUIManager';
import { Action } from '../../Utils/EventWrapper';
import { GridManager } from '../GridManager';
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
        this.RegisterEventClick()
    }

    public CreateCellUI(): void {
        let cellNode = PoolObjectManager.getInstance().Spawn(PrefabManager.getInstance().cellPrefab, InGameUIManager.getInstance().cellNode)
        this.cellUI = cellNode.getComponent(CellUI)
        this.cellUI.UpdateUICell(this.cellData, this.clickEffect, this.cellState)
    }


    RegisterEventClick() {
        this.GetCellUI().on(Input.EventType.TOUCH_END, this.onClick.bind(this))
    }
    RemoveEventClick() {
        this.GetCellUI().off(Input.EventType.TOUCH_END, this.onClick.bind(this))
    }

    onClick() {
        if (InGameLogicManager.getInstance().IsProcessing) {
            log("Đang xử lý tự động, không cho click.");
            return;
        }

        console.table(GridManager.getInstance().grid.map(r => r.map(c => c.value)));

        this.UpdateCellWhenClick();

        const matched = GridManager.getInstance().findConnectedCells(this.cellData.row, this.cellData.col);
        if (matched == null || matched == undefined) return;
        log('matched: ', matched);
        if (matched.length < 3) return;
        console.log(matched)
        InGameLogicManager.getInstance().moveMatchedCellsToRoot(this.cellData.row, this.cellData.col, matched);
    }

    UpdateCellWhenClick() {
        if (this.clickEffect == ECELL_CLICK_EFFECT.Up) {
            if (this.cellData.value == GridManager.getInstance().numberMax - 1) return;
            this.cellData.value++
        }
        else {
            if (this.cellData.value == GridManager.getInstance().numberMin) return;
            this.cellData.value--
        }
        this.cellData.color = GridManager.getInstance().GetColorByValue(this.cellData.value)
        this.cellUI.UpdateUICell(this.cellData, this.clickEffect, this.cellState)

    }

    GetCellUI() {
        return this.cellUI.node
    }

    RandomEffectClick(): ECELL_CLICK_EFFECT {
        let random = randomRange(0, 1)

        return random > 0.5 ? ECELL_CLICK_EFFECT.Up : ECELL_CLICK_EFFECT.Down
    }

    Dispose() {
        this.RemoveEventClick();

        // add cellUi vào pooling
        PoolObjectManager.getInstance().RecycleObject(this.GetCellUI(), PrefabManager.getInstance().cellPrefab);
    }

}


