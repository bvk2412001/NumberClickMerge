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
import { DataManager } from '../Manager/DataManager';
import { AudioManager } from '../Manager/AudioManager';
import { SFXType } from '../Enum/Enum';
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

    ClickCheckToMove(rootRow: number, rootCol: number, matched: { row: number, col: number }[]) {
        this.moveMatchedCellsToRoot(rootRow, rootCol, matched);

        // this.scheduleOnce(() => {

        // }, 0.3)
    }

    public moveMatchedCellsToRoot(
        rootRow: number,
        rootCol: number,
        matched: { row: number, col: number }[]
    ) {
        this.isProcessing = true;

        const rootNode = this.cells[rootRow][rootCol].GetCellUI();
        const rootPos = rootNode.getPosition();

        let finished = 0;
        const needFinish = matched.length - 1;      // bỏ gốc

        //  Nếu chỉ có 1 ô trong matched → reset ngay
        if (needFinish === 0) {
            this.ResetAfterTween(matched);
            return;
        }

        //   Tween từng ô */
        for (const cell of matched) {
            if (cell.row === rootRow && cell.col === rootCol) continue; // bỏ gốc

            const node = this.cells[cell.row][cell.col].GetCellUI();

            /*        Ô đang chéo              */
            if (cell.row !== rootRow && cell.col !== rootCol) {
                // Hai giao‑điểm, góc vuông đúng
                const corner1 = { row: cell.row, col: rootCol }; // ( cell.row , rootCol)
                const corner2 = { row: rootRow, col: cell.col }; // ( rootRow , cell.col)

                // Kiểm xem giao‑điểm nào nằm trong matched
                const hasCorner1 = matched.some(
                    c => c.row === corner1.row && c.col === corner1.col
                );
                const hasCorner2 = matched.some(
                    c => c.row === corner2.row && c.col === corner2.col
                );

                // Chọn góc vuông ưu tiên có trong matched
                const midRow = hasCorner1 || !hasCorner2 ? corner1.row : corner2.row;
                const midCol = hasCorner1 || !hasCorner2 ? corner1.col : corner2.col;

                const midPos = this.contains[midRow][midCol].position.clone();

                tween(node)
                    .to(0.15, { position: midPos })   // chặng 1
                    .to(0.15, { position: rootPos })  // chặng 2
                    .call(() => ++finished)
                    .start();
            } else {
                // Đã thẳng hàng/cột
                tween(node)
                    .to(0.25, { position: rootPos })
                    .call(() => ++finished)
                    .start();
            }
        }

        const watcher = () => {
            if (finished === needFinish) {
                this.unschedule(watcher);
                this.ResetAfterTween(matched);
            }
        };
        this.schedule(watcher);
    }

    private ResetAfterTween(matched: { row: number, col: number }[]) {
        this.ResetGrid(matched);
        this.isProcessing = false;

        DataManager.getInstance().MyHeart += 1;
        EventBus.emit(EventGame.UPDATE_HEARt_UI);

        AudioManager.getInstance().playSFX(SFXType.Merge);
    }



    ResetGrid(matched: { row: number, col: number }[]) {
        const root = matched[0]; // ô đầu tiên là gốc
        const gridMgr = GridManager.getInstance();
        const rootModel = gridMgr.grid[root.row][root.col];
        const newValue = rootModel.value + 1;

        GridManager.getInstance().NumberMax = newValue + 1;

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
                this.cells[cell.row][cell.col].Dispose();
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
        this.fillIntheBlank();
        gridMgr.FillIntheValue();

        this.scheduleOnce(() => {
            this.checkAllMatchingGroupsLoop();
        })
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

            const startPos = this.contains[GameManager.getInstance().dataGame.json["row"] - 1][col].position.clone();
            startPos.y += 250;
            existingCell.GetCellUI().setPosition(startPos);

            existingCell.cellData = cell;
            this.UpdateValueCellBeforeTween(row, col, existingCell);
            this.TweenFillNode(existingCell.GetCellUI(), this.contains[row][col]);
        } else {
            const nodeCell = this.CreateCells(cell);
            const startPos = this.contains[GameManager.getInstance().dataGame.json["row"] - 1][col].position.clone();
            startPos.y += 250;
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

    public checkAllMatchingGroupsLoop() {
        this.isProcessing = true;

        var matchGroups = this.findAllMatchedGroups();
        if (matchGroups.length === 0) {
            this.isProcessing = false; // cho phép click lại
            error("Không còn ô nào match.");
            return;
        }

        let cellRoot = matchGroups[0];
        let rootRow = cellRoot.root.row;
        let rootCol = cellRoot.root.col;
        let matched = cellRoot.cells

        this.processAllMatchGroups(rootRow, rootCol, matched);

        this.fillIntheBlank();
        GridManager.getInstance().FillIntheValue();

        log(this.cells)
    }

    private processAllMatchGroups(rootRow: number, rootCol: number, matched: { row: number, col: number }[]) {

        this.moveMatchedCellsToRoot(rootRow, rootCol, matched);
    }

}


