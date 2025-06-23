import { _decorator, Component, error, log, Node, tween } from 'cc';
import { CellCollection } from './Cell/CellCollection';
import { GameManager } from '../Manager/GameManager';
import { PoolObjectManager } from '../Manager/PoolObjectManager';
import { PrefabManager } from '../Manager/PrefabManager';
import { InGameUIManager } from './InGameUIManager';
import { GridManager } from './GridManager';
import { CellModel } from './Cell/CellModel';
import { Cell } from './Cell/Cell';
import { BaseSingleton } from '../Base/BaseSingleton';
import { EventBus } from '../Utils/EventBus';
import { EventGame } from '../Enum/EEvent';
const { ccclass, property } = _decorator;

@ccclass('InGameLogicManager')
export class InGameLogicManager extends BaseSingleton<InGameLogicManager> {

    public cellCollection: CellCollection = null
    public cellContainColllection: Node[] = []

    contains = []
    cells = []

    private isProcessing: boolean = false;

    public get IsProcessing() {
        return this.isProcessing;
    }

    public set IsProcessing(value: boolean) {
        this.isProcessing = value;
    }

    protected start(): void {
        this.init()
        this.InitContainCells()
        this.InitCells()

        EventBus.on(EventGame.GRID_CELL_UPDATED_EVENT, this.OnUpdateUi, this);
    }

    DestroyEvent() {
        EventBus.off(EventGame.GRID_CELL_UPDATED_EVENT, this.OnUpdateUi);
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
        log('moveMatchedCellsToRoot')
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

    async ResetGrid(matched: { row: number, col: number }[]) {
        log('ResetGrid')

        const root = matched[0]; // ô đầu tiên là gốc
        const gridMgr = GridManager.getInstance();
        const rootModel = gridMgr.grid[root.row][root.col];
        const newValue = rootModel.value + 1;

        // Gán -1 cho toàn bộ ô matched (bao gồm root)
        gridMgr.ResetDataMatch(matched);

        // Tạo ô mới với value tăng +1
        const newCellModel = new CellModel({
            value: newValue,
            color: gridMgr.GetColorByValue(newValue),
            row: root.row,
            col: root.col,
        });
        gridMgr.grid[root.row][root.col] = newCellModel;

        // 👉 Xoá hết cell matched UI (kể cả gốc)
        for (const cell of matched) {
            if (this.cells[cell.row][cell.col]) {
                await this.cells[cell.row][cell.col].Dispose();
                this.cells[cell.row][cell.col] = null;
            }
        }

        // Tạo lại node UI cho ô gốc mới
        const nodeCell = this.CreateCells(newCellModel);
        const spawnPos = this.contains[root.row][root.col].position.clone();

        nodeCell.GetCellUI().setPosition(spawnPos);

        this.cells[root.row][root.col] = nodeCell;
        this.UpdateValueCellBeforeTween(root.row, root.col, nodeCell);

        // Fill tiếp và check match tiếp theo
        await this.fillIntheBlank();
        await gridMgr.FillIntheValue();

        // await this.checkAllMatchingGroupsLoop();
    }

    async fillIntheBlank() {
        const rows = GameManager.getInstance().dataGame.json["row"];
        const cols = GameManager.getInstance().dataGame.json["col"];

        for (let col = 0; col < cols; col++) {
            let dest = -1;                               // hàng trống

            for (let row = 0; row < rows; row++) {       // vẫn từ trên xuống
                if (this.cells[row][col] === null) {
                    if (dest === -1) dest = row;         // ghi nhận ô trống
                } else if (dest !== -1) {
                    // Có cell ở dưới 1 ô trống ⇒ kéo xuống
                    const fallingCell = this.cells[row][col];
                    this.TweenFillNode(
                        fallingCell.GetCellUI(),
                        this.contains[dest][col]         // tween tới vị trí trống
                    );

                    this.cells[dest][col] = fallingCell; // cập nhật mảng
                    this.cells[row][col] = null;

                    // this.UpdateValueCellBeforeTween(dest, col, fallingCell);
                    dest++;                              // trống kế tiếp
                }
            }
        }
    }

    private OnUpdateUi(payload: { row: number; col: number; cell: CellModel }): void {
        const { row, col, cell } = payload; // Destructure payload
        if (this.cells[row][col]) {
            const existingCell = this.cells[row][col];
            existingCell.cellData = cell;
            this.UpdateValueCellBeforeTween(row, col, existingCell);
            this.TweenFillNode(existingCell.GetCellUI(), this.contains[row][col]);
        } else {
            const nodeCell = this.CreateCells(cell);
            const startPos = this.contains[GameManager.getInstance().dataGame.json["row"] - 1][col].position.clone();
            startPos.y += 150;
            nodeCell.GetCellUI().setPosition(startPos);
            this.TweenFillNode(nodeCell.GetCellUI(), this.contains[row][col]);
            this.cells[row][col] = nodeCell;
            this.UpdateValueCellBeforeTween(row, col, nodeCell);
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

    private UpdateValueCellBeforeTween(row: number, col: number, cell: Cell) {
        const model = GridManager.getInstance().grid[row][col];

        model.row = row;
        model.col = col;

        cell.cellData = model;

        cell.cellUI.UpdateUICell(model, cell.clickEffect, cell.cellState);
    }

    private findAllMatchedGroups() {
        const rows = GameManager.getInstance().dataGame.json["row"];
        const cols = GameManager.getInstance().dataGame.json["col"];
        const grid = GridManager.getInstance().grid;
        const visited = new Set<string>();
        const matchGroups: { root: { row: number, col: number }, cells: { row: number, col: number }[] }[] = [];

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                const key = `${i},${j}`;
                if (visited.has(key) || grid[i][j].value <= 0) continue;

                const matched = GridManager.getInstance().findConnectedCells(i, j);
                if (matched.length >= 3) {
                    matched.forEach(c => visited.add(`${c.row},${c.col}`));
                    matchGroups.push({ root: { row: i, col: j }, cells: matched });
                }
            }
        }

        return matchGroups;
    }

    public async checkAllMatchingGroupsLoop() {
        this.isProcessing = true;

        while (true) {
            const matchGroups = this.findAllMatchedGroups();
            if (matchGroups.length === 0) {
                this.isProcessing = false; // cho phép click lại
                error("Không còn ô nào match.");
                break;
            }

            log(`Có ${matchGroups.length} nhóm match`);

            await this.processAllMatchGroups(matchGroups);

            await this.fillIntheBlank();
            await GridManager.getInstance().FillIntheValue();
        }
    }

    private async processAllMatchGroups(groups: { root: { row: number, col: number }, cells: { row: number, col: number }[] }[]) {
        for (const group of groups) {
            this.tweenMatchedGroup(group.root, group.cells); // chỉ tween
        }

        await this.delay(500);

        for (const group of groups) {
            await this.ResetGroupAfterTween(group.root, group.cells);
        }
    }

    private tweenMatchedGroup(root: { row: number, col: number }, matched: { row: number, col: number }[]) {
        const rootNode = this.cells[root.row][root.col].GetCellUI();
        const rootPos = rootNode.getPosition();

        for (const cell of matched) {
            if (cell.row === root.row && cell.col === root.col) continue;

            const node = this.cells[cell.row][cell.col].GetCellUI();
            const diffX = root.col - cell.col;
            const diffY = root.row - cell.row;
            const isDiagonal = diffX !== 0 && diffY !== 0;

            if (isDiagonal) {
                let middleCell = matched.find(c =>
                    (c.row === cell.row && c.col === root.col) ||
                    (c.col === cell.col && c.row === root.row)
                );

                if (middleCell) {
                    const midNode = this.cells[middleCell.row][middleCell.col].GetCellUI();
                    const midPos = midNode.getPosition();

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
    }


    private delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }


    private async ResetGroupAfterTween(root: { row: number, col: number }, matched: { row: number, col: number }[]) {
        const gridMgr = GridManager.getInstance();
        const rootModel = gridMgr.grid[root.row][root.col];
        const newValue = rootModel.value + 1;

        gridMgr.ResetDataMatch(matched);

        const newCellModel = new CellModel({
            value: newValue,
            color: gridMgr.GetColorByValue(newValue),
            row: root.row,
            col: root.col,
        });

        gridMgr.grid[root.row][root.col] = newCellModel;

        for (const cell of matched) {
            if (this.cells[cell.row][cell.col]) {
                await this.cells[cell.row][cell.col].Dispose();
                this.cells[cell.row][cell.col] = null;
            }
        }

        const nodeCell = this.CreateCells(newCellModel);
        const spawnPos = this.contains[root.row][root.col].position.clone();
        spawnPos.y += 150;
        nodeCell.GetCellUI().setPosition(spawnPos);
        this.TweenFillNode(nodeCell.GetCellUI(), this.contains[root.row][root.col]);

        this.cells[root.row][root.col] = nodeCell;
        this.UpdateValueCellBeforeTween(root.row, root.col, nodeCell);
    }


}


