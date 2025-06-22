import { _decorator, Component, Node } from 'cc';
import { CellCollection } from './Cell/CellCollection';
import { GameManager } from '../Manager/GameManager';
import { PoolObjectManager } from '../Manager/PoolObjectManager';
import { PrefabManager } from '../Manager/PrefabManager';
import { InGameUIManager } from './InGameUIManager';
import { GridManager } from './GridManager';
import { CellModel } from './Cell/CellModel';
import { Cell } from './Cell/Cell';
const { ccclass, property } = _decorator;

@ccclass('InGameLogicManager')
export class InGameLogicManager extends Component {



    public cellCollection: CellCollection = null
    public cellContainColllection: Node[] = []

    contains = []
    cells = []

    protected start(): void {
        this.init()
        this.InitContainCells()
        this.InitCells()
    }


    init() {
        this.cellCollection = new CellCollection()
    }

    InitContainCells() {
        for (let i = 0; i < GameManager.instance.dataGame.json["row"]; i++) {
            let list: Node[] = []
            for (let j = 0; j < GameManager.instance.dataGame.json["col"]; j++) {
                let newContainer = PoolObjectManager.getInstance().Spawn(PrefabManager.getInstance().cellContainPrefab, InGameUIManager.getInstance().containNode)
                this.cellContainColllection.push(newContainer)
                list.push(newContainer)
            }
            this.contains.push(list)

            InGameUIManager.getInstance().UpdateLayoutContainCell()
        }
    }


    InitCells() {
        for (let i = 0; i < GameManager.instance.dataGame.json["row"]; i++) {
            let list: Node[] = []
            for (let j = 0; j < GameManager.instance.dataGame.json["col"]; j++) {
                let dataCell = GridManager.instance.grid[i][j]
                let cell = this.CreateCells(dataCell)
                cell.GetCellUI().setPosition(this.contains[i][j])
                list.push(cell.GetCellUI())
            }

            this.cells.push(list)
        }
    }

    CreateCells(dataCell: any): Cell {
        let newDataCell = new CellModel(dataCell)
        let newCell = this.cellCollection.CreateCell(newDataCell)
        return newCell
    }




}


