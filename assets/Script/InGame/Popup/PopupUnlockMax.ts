import { _decorator, Component, instantiate, Layout, Node, PageView, Prefab, tween, Vec2, Vec3 } from 'cc';
import { GridManager } from '../GridManager';

import { InGameLogicManager } from '../InGameLogicManager';
import { CellPopupMax, CellPopupState } from '../Cell/CellPopupMax';
const { ccclass, property } = _decorator;

@ccclass('PopupUnlockMax')
export class PopupUnlockMax extends Component {
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
        this.pageView.scrollToPage(1, 0)
        tween(this.node).to(0.5, { scale: new Vec3(1, 1, 1) }, { easing: "backOut" })
            .call(() => {
                this.scheduleOnce(() => {
                    this.pageView.scrollToPage(2, 1)
                }, 0.5)
            })
            .start()


    }


    init() {

        let numberMax = GridManager.getInstance().numberMax - 1
        this.CreateCell(numberMax - 2, CellPopupState.PRE)
        this.CreateCell(numberMax - 1, CellPopupState.CURRENT)
        this.CreateCell(numberMax, CellPopupState.NEXT)
        this.CreateCell(numberMax + 1, CellPopupState.NEXT)

    }


    CreateCell(value, state) {
        let cell = instantiate(this.cellPrefab)
        this.pageView.addPage(cell)
        cell.getComponent(CellPopupMax).setUp(value, state)
    }


    onScrollEvent() {
        this.pageView.content.children.forEach((e, index) => {
            if (index == this.pageView.curPageIdx) {
                e.getComponent(CellPopupMax).updateState(CellPopupState.CURRENT)
            }
            if (index < this.pageView.curPageIdx) {
                e.getComponent(CellPopupMax).updateState(CellPopupState.PRE)
            }

            if (index > this.pageView.curPageIdx) {
                e.getComponent(CellPopupMax).updateState(CellPopupState.NEXT)
            }
        })
    }

    btnClaim() {
        this.node.active = false

        GridManager.getInstance().CheckUpDateMinCurrent();
        InGameLogicManager.getInstance().UpdateAllFrames();
    }

}


