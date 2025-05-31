import { _decorator, Component, instantiate, Layout, Node, Prefab } from 'cc';
import { GameManager } from '../Manager/GameManager';
import { Cell } from './Cell';
import { GridManager } from './GridManager';
const { ccclass, property } = _decorator;

@ccclass('UIManager')
export class UIManager extends Component {
    @property(Prefab)
    containCell: Prefab = null


    @property(Prefab)
    cell: Prefab = null

    @property(Node)
    containNode: Node = null

    @property(Node)
    cellNode: Node = null
    contains = []
    cells = []

    protected start(): void {
        this.InitContainCells()
        this.InitCells()
    }

    InitContainCells() {
        for (let i = 0; i < GameManager.instance.dataGame.json["row"]; i++) {
            let list: Node[] = []
            for (let j = 0; j < GameManager.instance.dataGame.json["col"]; j++) {
                let newContainer = instantiate(this.containCell)
                this.containNode.addChild(newContainer)
                list.push(newContainer)
            }

            this.contains.push(list)
        }

        this.containNode.getComponent(Layout).updateLayout()
    }


    InitCells() {
        for (let i = 0; i < GameManager.instance.dataGame.json["row"]; i++) {
            let list: Node[] = []
            for (let j = 0; j < GameManager.instance.dataGame.json["col"]; j++) {
                let newCell = instantiate(this.cell)
                let dataCell = GameManager.instance.dataCell.json[GridManager.instance.grid[i][j]]
                newCell.getComponent(Cell).SetUp(dataCell)
                this.cellNode.addChild(newCell)
                newCell.worldPosition = this.contains[i][j].worldPosition.clone()
                list.push(newCell)
            }

            this.cells.push(list)
        }
    }
}


