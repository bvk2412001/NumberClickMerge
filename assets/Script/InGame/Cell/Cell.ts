import { _decorator, Component, EventTouch, Input, log, Node, randomRange } from 'cc';
import { CellModel } from './CellModel';
import { CellUI } from './CellUI';
import { ECELL_CLICK_EFFECT, ECELL_STATE } from '../../Enum/ECell';
import { PrefabManager } from '../../Manager/PrefabManager';
import { PoolObjectManager } from '../../Manager/PoolObjectManager';
import { InGameLogicManager } from '../InGameLogicManager';
import { InGameUIManager } from '../InGameUIManager';
import { Action } from '../../Utils/EventWrapper';
import { GridManager } from '../GridManager';
import { Utils } from '../../Utils/Utils';
import { HeartUi } from '../Heart/HeartUi';
import { EventBus } from '../../Utils/EventBus';
import { EventGame } from '../../Enum/EEvent';
import { AudioManager } from '../../Manager/AudioManager';
import { SFXType } from '../../Enum/Enum';
import { DataManager } from '../../Manager/DataManager';
const { ccclass, property } = _decorator;

@ccclass('Cell')
export class Cell {
    private clickHandler: (e: EventTouch) => void;

    public cellData: CellModel = null
    public cellUI: CellUI = null
    clickEffect: ECELL_CLICK_EFFECT = ECELL_CLICK_EFFECT.Up
    cellState: ECELL_STATE = ECELL_STATE.None

    private readonly MAX_DOWN = 6;

    constructor(cellData: CellModel) {
        this.cellData = cellData
        this.clickEffect = this.RandomEffectClick()
        this.CreateCellUI()

        // chỉ bind MỘT lần rồi lưu lại
        this.clickHandler = this.onClick.bind(this);
        this.RegisterEventClick();
    }

    public CreateCellUI(): void {
        let cellNode = PoolObjectManager.getInstance().Spawn(PrefabManager.getInstance().cellPrefab, InGameUIManager.getInstance().cellNode)
        this.cellUI = cellNode.getComponent(CellUI)
        this.cellUI.UpdateUICell(this.cellData, this.clickEffect, this.cellState)
    }


    RegisterEventClick() {
        this.GetCellUI().on(Input.EventType.TOUCH_END, this.clickHandler)
    }
    RemoveEventClick() {
        this.GetCellUI().off(Input.EventType.TOUCH_END, this.clickHandler)
    }

    onClick() {
        if (InGameLogicManager.getInstance().IsProcessing) {
            log("Đang xử lý tự động, không cho click.");
            return;
        }

        AudioManager.getInstance().playSFX(SFXType.Spawn);

        // console.table(GridManager.getInstance().grid.map(r => r.map(c => c.value)));

        log('onclick ---')

        this.UpdateCellWhenClick();

        const matched = GridManager.getInstance().findConnectedCells(this.cellData.row, this.cellData.col);
        if (matched == null || matched == undefined) {
            //lose
            return;
        }
        log('matched: ', matched);
        if (matched.length < 3) return;

        InGameLogicManager.getInstance().ClickCheckToMove(this.cellData.row, this.cellData.col, matched); // match khi click
    }

    UpdateCellWhenClick() {
        if (this.clickEffect == ECELL_CLICK_EFFECT.Up) {
            if (this.cellData.value >= GridManager.getInstance().NumberMax - 1) return;
            this.cellData.value++
        }
        else {
            if (this.cellData.value == GridManager.getInstance().NumberMin) return;
            this.cellData.value--
        }
        this.cellData.color = GridManager.getInstance().GetColorByValue(this.cellData.value)
        this.cellUI.UpdateUICell(this.cellData, this.clickEffect, this.cellState);

        Utils.getInstance().UpdateHeart(-1); // trừ đi 1 heart

        EventBus.emit(EventGame.UPDATE_HEARt_UI);
    }

    UpDateWhenMerge() {
        this.cellData.value++;
        this.cellData.color = GridManager.getInstance().GetColorByValue(this.cellData.value);
        this.cellUI.UpdateUICell(this.cellData, this.clickEffect, this.cellState);
    }

    GetCellUI() {
        return this.cellUI.node
    }

    RandomEffectClick(): ECELL_CLICK_EFFECT {

        const gridMgr = GridManager.getInstance();
        const minValue = DataManager.getInstance().NumberMin;

        // ❶ Nếu ô đang ở giá trị nhỏ nhất → luôn Up
        if (this.cellData.value === minValue) return ECELL_CLICK_EFFECT.Up;

        let dataCountDown = this.GetDataCountDown();
        if (dataCountDown == this.MAX_DOWN) return ECELL_CLICK_EFFECT.Up;

        let random = randomRange(0, 1)

        return random > 0.2 ? ECELL_CLICK_EFFECT.Up : ECELL_CLICK_EFFECT.Down
    }

    GetDataCountDown() {
        let cellCollection = InGameLogicManager.getInstance().cellCollection;
        let listCellDown = cellCollection.filter(cell => cell.clickEffect == ECELL_CLICK_EFFECT.Down);

        return listCellDown.length;
    }

    Dispose() {
        this.RemoveEventClick();

        // add cellUi vào pooling
        PoolObjectManager.getInstance().RecycleObject(this.GetCellUI(), PrefabManager.getInstance().cellPrefab);
    }


}


