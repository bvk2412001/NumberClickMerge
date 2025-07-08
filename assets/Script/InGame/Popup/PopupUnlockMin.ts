import { _decorator, Component, instantiate, Layout, Node, PageView, Prefab, tween, Vec3 } from 'cc';
import { InGameLogicManager } from '../InGameLogicManager';
import { CellPopupMin } from '../Cell/CellPopupMin';
import { CellPopupState } from '../Cell/CellPopupMax';
import { GridManager } from '../GridManager';
const { ccclass, property } = _decorator;

@ccclass('PopupUnlockMin')
export class PopupUnlockMin extends Component {
    @property(PageView)
    pageView: PageView = null

    @property(Prefab)
    cellPrefab: Prefab = null

    protected start(): void {
        // this.show()
    }

    show() {
        this.pageView.removeAllPages()
        this.pageView.content.getComponent(Layout).updateLayout()
        this.init()
        this.node.active = true
        this.node.setScale(0, 0, 0)
        this.pageView.scrollToPage(0, 0)
        tween(this.node).to(0.5, { scale: new Vec3(1, 1, 1) }, { easing: "backOut" })
            .call(() => {

            })
            .start()
    }


    init() {

        let numberMin = GridManager.getInstance().numberMin - 1
        this.CreateCell(numberMin, CellPopupState.CURRENT)
        this.CreateCell(numberMin + 1, CellPopupState.NEXT)
    }


    CreateCell(value, state) {
        let cell = instantiate(this.cellPrefab)
        this.pageView.addPage(cell)
        cell.getComponent(CellPopupMin).setUp(value, state)
    }


    onScrollEvent() {

    }

    btnClose() {
        this.node.active = false;

        InGameLogicManager.getInstance().removeAllMinCells();
        GridManager.getInstance().numberMin++;
    }
}


