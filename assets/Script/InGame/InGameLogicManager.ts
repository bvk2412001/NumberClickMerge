import { _decorator, Component, log, Node, tween } from 'cc';
import { CellCollection } from './Cell/CellCollection';
import { GameManager } from '../Manager/GameManager';
import { PoolObjectManager } from '../Manager/PoolObjectManager';
import { PrefabManager } from '../Manager/PrefabManager';
import { InGameUIManager } from './InGameUIManager';
import { GridManager } from './GridManager';
import { CellModel } from './Cell/CellModel';
import { Cell } from './Cell/Cell';
import { BaseSingleton } from '../Base/BaseSingleton';
const { ccclass, property } = _decorator;

@ccclass('InGameLogicManager')
export class InGameLogicManager extends BaseSingleton<InGameLogicManager> {



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
        this.cellCollection = new CellCollection();
    }

    InitContainCells() {
        for (let i = 0; i < GameManager.getInstance().dataGame.json["row"]; i++) {
            let list: Node[] = []
            for (let j = 0; j < GameManager.getInstance().dataGame.json["col"]; j++) {
                let newContainer = PoolObjectManager.getInstance().Spawn(PrefabManager.getInstance().cellContainPrefab, InGameUIManager.getInstance().containNode)
                this.cellContainColllection.push(newContainer)
                list.push(newContainer)
            }
            this.contains.push(list)

            InGameUIManager.getInstance().UpdateLayoutContainCell()
        }

        log('this.contains: ', this.contains)
    }


    InitCells() {
        for (let i = 0; i < GameManager.getInstance().dataGame.json["row"]; i++) {
            let list: Cell[] = []
            for (let j = 0; j < GameManager.getInstance().dataGame.json["col"]; j++) {
                // let dataCell = 
                let cell = this.CreateCells(GridManager.getInstance().grid[i][j])
                cell.GetCellUI().setPosition(this.contains[i][j].position)
                list.push(cell)
            }

            this.cells.push(list)
        }
    }

    CreateCells(dataCell: CellModel): Cell {

        let newCell = this.cellCollection.CreateCell(dataCell)
        return newCell
    }


    public moveMatchedCellsToRoot(rootRow: number, rootCol: number, matched: { row: number, col: number }[]) {
        const rootNode = this.cells[rootRow][rootCol].GetCellUI();
        const rootPos = rootNode.getPosition();

        for (const cell of matched) {
            if (cell.row === rootRow && cell.col === rootCol) continue;

            const node = this.cells[cell.row][cell.col].GetCellUI();
            // const startPos = node.getPosition();

            const diffX = rootCol - cell.col;
            const diffY = rootRow - cell.row;

            const isDiagonal = diffX !== 0 && diffY !== 0;

            if (isDiagonal) {
                let middleCell = matched.find(c =>
                    (c.row === cell.row && c.col === rootCol) || // cùng hàng với node hiện tại và cột gốc
                    (c.col === cell.col && c.row === rootRow)    // cùng cột với node hiện tại và hàng gốc
                );

                if (middleCell) {
                    const midNode = this.cells[middleCell.row][middleCell.col].GetCellUI();
                    const midPos = midNode.getPosition();
                    console.log(midNode, midPos)
                    tween(node)
                        .to(0.15, { position: midPos })
                        .to(0.15, { position: rootPos })
                        .start();
                }
            } else {
                tween(node)
                    .to(0.25, { position: rootPos })
                    .start();
            }

        }

        this.scheduleOnce(() => {

            // matched.splice(0, 1)
            this.ResetGrid(matched);
        }, 0.3)
    }

    ResetGrid(matched: { row: number, col: number }[]) {
        for (const cell of matched) {
            // const node = this.cells[cell.row][cell.col].GetCellUI();
            // node.removeFromParent();
            // node.destroy();

            this.cells[cell.row][cell.col].Dispose(); // return pool

            this.cells[cell.row][cell.col] = null; // reset node trong mảng

            GridManager.getInstance().ResetDataMatch(matched); // reset data trong mảng
        }

        GridManager.getInstance().FillIntheValue();
        this.fillIntheBlank();
        log(GridManager.getInstance().grid)
    }

    async fillIntheBlank() {
        const rows = GameManager.getInstance().dataGame.json["row"];
        const cols = GameManager.getInstance().dataGame.json["col"];

        for (let col = 0; col < cols; col++) {
            for (let row = 0; row < rows; row++) {
                if (this.cells[row][col] === null) {
                    let bigRow = row + 1;
                    while (bigRow < rows && this.cells[bigRow][col] === null) {
                        bigRow++;
                    }

                    if (bigRow < rows) {
                        this.TweenFillNode(this.cells[bigRow][col].GetCellUI(), this.contains[row][col]);
                        this.cells[row][col] = this.cells[bigRow][col];
                        this.cells[bigRow][col] = null;

                        this.UpdateValueCellBeforeTween(row, col, this.cells[row][col]);
                    }
                }
            }
        }
    }

    TweenFillNode(node: Node, targetNode: Node) {
        if (!node || !targetNode) {
            return;
        }

        tween(node)
            .to(0.2, { position: targetNode.position.clone() })
            .start();
    }

    UpdateValueCellBeforeTween(row: number, col: number, cell: Node) {
        // let dataCell = GameManager.getInstance().dataCell.json[GridManager.getInstance().grid[row][col]]
        // cell.getComponent(Cell).SetUp(dataCell);

        // const func = cell.getComponent(CellFunction);
        // if (func) {
        //     func.row = row;
        //     func.col = col;
        // }
    }

}


