import { _decorator, Component, instantiate, Layout, Node, PageView, Prefab, tween, Vec2, Vec3 } from 'cc';
import { GridManager } from '../GridManager';
import { CellPopup, CellPopupState } from '../Cell/CellPopup';
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

        let numberMax = GridManager.getInstance().numberMax
        this.CreateCell(numberMax - 2, CellPopupState.PRE)
        this.CreateCell(numberMax - 1, CellPopupState.CURRENT)
        this.CreateCell(numberMax, CellPopupState.NEXT)
        this.CreateCell(numberMax + 1, CellPopupState.NEXT)

    }


    CreateCell(value, state) {
        let cell = instantiate(this.cellPrefab)
        this.pageView.addPage(cell)
        cell.getComponent(CellPopup).setUp(value, state)
    }


    onScrollEvent() {
        this.pageView.content.children.forEach((e, index) => {
            if (index == this.pageView.curPageIdx) {
                e.getComponent(CellPopup).updateState(CellPopupState.CURRENT)
            }
            if (index < this.pageView.curPageIdx) {
                e.getComponent(CellPopup).updateState(CellPopupState.PRE)
            }

            if (index > this.pageView.curPageIdx) {
                e.getComponent(CellPopup).updateState(CellPopupState.NEXT)
            }
        })
    }

    btnClaim() {
        this.node.active = false
    }

}


