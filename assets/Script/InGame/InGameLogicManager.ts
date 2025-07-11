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
import { PopupManager } from '../Manager/PopupManager';
const { ccclass, property } = _decorator;

@ccclass('InGameLogicManager')
export class InGameLogicManager extends BaseSingleton<InGameLogicManager> {

    public cellCollection: CellCollection = null
    public cellContainColllection: Node[] = []

    contains = []
    cells = []

    isUpLevel = false

    private isProcessing: boolean = false;

    private consecutiveMerges: number = 0;

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
        this.consecutiveMerges = 0;
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

    AddScoreAfterMerge(rootModel: CellModel, matched: { row: number, col: number }[]) {
        const value = rootModel.value; // Lấy giá trị của ô (trước khi tăng)
        const groupSize = matched.length; // Lấy số lượng ô trong nhóm
        const score = value * groupSize * this.consecutiveMerges; // Áp dụng công thức
        EventBus.emit(EventGame.UPGRADE_SCORE, score);
    }

    private RewardGoldByCombo() {
        const chance = Math.random();
        log('change: ', chance);
        if (chance > 0.3) return; // 70% không nhận
        if (this.consecutiveMerges < 3) return; // chỉ từ combo 3

        const gold = 10 * (this.consecutiveMerges - 2) + 10;

        // DataManager.getInstance().Gold += gold;
        EventBus.emit(EventGame.UPDATE_COIN_UI, gold);
    }


    ResetGrid(matched: { row: number, col: number }[]) {

        this.consecutiveMerges++; // Tăng biến đếm combo

        const root = matched[0]; // ô đầu tiên là gốc
        const gridMgr = GridManager.getInstance();
        const rootModel = gridMgr.grid[root.row][root.col];

        // Bắt đầu logic tính điểm
        this.AddScoreAfterMerge(rootModel, matched);

        const newValue = rootModel.value + 1;

        this.RewardGoldByCombo();

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
        if (GridManager.getInstance().CheckUpdateMaxCurrent(newValue) == true) {
            this.isUpLevel = true
        }
        this.scheduleOnce(() => {
            this.checkAllMatchingGroupsLoop();

        }, 0.25)
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

        this.UpdateAllFrames();
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
            console.error("Không còn ô nào match.");

            if (this.isUpLevel == true) {
                PopupManager.getInstance().ShowPopupUnlockMax()
                this.isUpLevel = false
            }

            return;
        }

        let cellRoot = matchGroups[0];
        let rootRow = cellRoot.root.row;
        let rootCol = cellRoot.root.col;
        let matched = cellRoot.cells

        this.fillIntheBlank();
        GridManager.getInstance().FillIntheValue();
        this.scheduleOnce(() => {
            this.processAllMatchGroups(rootRow, rootCol, matched);
        }, 0.3)
        log('this.cells: ', this.cells)
    }

    private processAllMatchGroups(rootRow: number, rootCol: number, matched: { row: number, col: number }[]) {

        this.moveMatchedCellsToRoot(rootRow, rootCol, matched);
    }

    //#region UpdateAllFrame
    public UpdateAllFrames(): void {
        const rows = GameManager.getInstance().dataGame.json["row"];
        const cols = GameManager.getInstance().dataGame.json["col"];

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                const cell = this.cells[i][j];
                if (cell) {
                    cell.cellUI.UpdateUICell(cell.cellData, cell.clickEffect, cell.cellState);
                }
            }
        }
    }

    //#region xoá tất cả min
    /** Xoá toàn bộ ô min rồi rơi & fill lại, min này khi tăng số ô lên mới đúng */
    public removeAllMinCells(): void {

        if (this.isProcessing) return;

        const gridMgr = GridManager.getInstance();
        const rows = GameManager.getInstance().dataGame.json["row"];
        const cols = GameManager.getInstance().dataGame.json["col"];
        const minVal = gridMgr.numberMin - 1; // chưa hiểu vì sao trừ 1

        log('minVal: ', minVal)

        const cellsToRemove: { row: number, col: number }[] = [];

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                if (gridMgr.grid[i][j].value === minVal) {
                    cellsToRemove.push({ row: i, col: j });
                }
            }
        }

        if (cellsToRemove.length === 0) {
            console.warn("[removeAllMinCells] Không có ô min nào để xoá.");
            return;
        }

        gridMgr.ResetDataMatch(cellsToRemove);

        for (const c of cellsToRemove) {
            if (this.cells[c.row][c.col]) {
                this.cells[c.row][c.col].cellUI.PlayAnimationShakeLoop();
                this.isProcessing = true;

                this.scheduleOnce(() => {
                    this.cells[c.row][c.col].cellUI.StopAnimationShake();
                    this.cells[c.row][c.col].Dispose();
                    this.cells[c.row][c.col] = null;
                }, 1)
            }
        }

        this.scheduleOnce(() => {
            this.isProcessing = true;
            this.fillIntheBlank();
            gridMgr.FillIntheValue();

            this.scheduleOnce(() => {
                this.checkAllMatchingGroupsLoop();
            }, 0.3);
        }, 1.1)
    }

    //#region xoá tất cả min khi dùng tools
    public removeAllMinCellsTools(): void {
        if (this.isProcessing) return;

        const gridMgr = GridManager.getInstance();
        const rows = GameManager.getInstance().dataGame.json["row"];
        const cols = GameManager.getInstance().dataGame.json["col"];

        const collectCells = (value: number) => {
            const list: { row: number, col: number }[] = [];
            for (let i = 0; i < rows; i++) {
                for (let j = 0; j < cols; j++) {
                    if (gridMgr.grid[i][j].value === value) list.push({ row: i, col: j });
                }
            }
            return list;
        };

        let targetVal = 1; // lấy min là 1 luôn cho bao quát trường hợp
        let cellsToRemove: { row: number, col: number }[] = [];

        while (targetVal <= gridMgr.numberMax) {
            cellsToRemove = collectCells(targetVal);
            if (cellsToRemove.length > 0) break;     // đã tìm được
            targetVal++;                             // thử giá trị kế tiếp
        }

        if (cellsToRemove.length === 0) {
            console.warn(`[removeAllMinCells] Không tìm thấy ô nào trong khoảng ${gridMgr.numberMin}…${gridMgr.numberMax}.`);
            return;
        }

        gridMgr.ResetDataMatch(cellsToRemove);

        for (const c of cellsToRemove) {
            const cellRef = this.cells[c.row][c.col];
            if (cellRef) {
                cellRef.cellUI.PlayAnimationShakeLoop();
            }
        }

        this.isProcessing = true;

        this.scheduleOnce(() => {
            EventBus.emit(EventGame.TOOL_FINISHED);

            for (const c of cellsToRemove) {
                const cellRef = this.cells[c.row][c.col];
                if (cellRef) {
                    cellRef.cellUI.StopAnimationShake();
                    cellRef.Dispose();
                    this.cells[c.row][c.col] = null;
                }
            }

            this.fillIntheBlank();
            gridMgr.FillIntheValue();

            this.scheduleOnce(() => {
                this.checkAllMatchingGroupsLoop();   // tự mở khoá click khi xong
            }, 0.3);
        }, 1);
    }

    //#region Hammer tools
    public async HandleHammerAt(row: number, col: number) {
        if (this.isProcessing) return;

        EventBus.emit(EventGame.TOOL_FINISHED);

        this.isProcessing = true;

        const gridMgr = GridManager.getInstance();

        const targetCell = this.cells[row][col];
        if (!targetCell) {
            this.isProcessing = false;
            return;
        }

        targetCell.cellUI.PlayAnimationShakeLoop();

        await new Promise(r => setTimeout(r, 1000)); // chờ rung 1 s

        targetCell.cellUI.StopAnimationShake();

        // Xoá dữ liệu logic
        gridMgr.grid[row][col].value = -1;
        this.cells[row][col].Dispose();
        this.cells[row][col] = null;

        // Rơi và fill
        await this.FillAfterHammer();

        // Tự check merge
        this.checkAllMatchingGroupsLoop();
    }

    /** Cho cell rơi xuống và fill lại sau khi dùng búa */
    private async FillAfterHammer(): Promise<void> {
        this.fillIntheBlank();
        GridManager.getInstance().FillIntheValue();

        return new Promise(resolve => {
            this.scheduleOnce(() => {
                resolve();
            }, 0.3);
        });
    }

    //#region Upgrade tools
    public HandleUpgradeAt(row: number, col: number): void {
        if (this.isProcessing) return;

        EventBus.emit(EventGame.TOOL_FINISHED);

        const gridMgr = GridManager.getInstance();
        const cell = this.cells[row][col];
        if (!cell) return;

        const maxUpgradeVal = gridMgr.numberMax - 1;
        const cellModel = cell.cellData;

        // Không nâng cấp nếu đã >= max
        if (cellModel.value >= maxUpgradeVal) {
            cell.cellUI.PlayAnimationShake();
            return;
        }

        // Cập nhật model
        cellModel.value = maxUpgradeVal;
        cellModel.color = gridMgr.GetColorByValue(maxUpgradeVal);

        // Cập nhật UI
        cell.cellUI.UpdateUICell(cellModel, cell.clickEffect, cell.cellState);

        this.UpdateAllFrames();

        // Nếu chạm mốc max, cập nhật unlock max
        if (gridMgr.CheckUpdateMaxCurrent(maxUpgradeVal)) {
            this.isUpLevel = true;
        }

        // Tự check merge
        this.checkAllMatchingGroupsLoop();
    }

    //#region Swap tools
    public swapCallback: ((row: number, col: number) => void) = null;

    public EnableSwapMode(callback: ((row: number, col: number) => void) | null) {
        this.swapCallback = callback;
    }

    public async HandleSwap(a: { row: number, col: number }, b: { row: number, col: number }) {
        if (this.isProcessing) return;
        this.isProcessing = true;

        const cellA = this.cells[a.row][a.col];
        const cellB = this.cells[b.row][b.col];

        if (!cellA || !cellB) {
            this.isProcessing = false;
            return;
        }

        // Hoán đổi logic
        const tempModel = GridManager.getInstance().grid[a.row][a.col];
        GridManager.getInstance().grid[a.row][a.col] = GridManager.getInstance().grid[b.row][b.col];
        GridManager.getInstance().grid[b.row][b.col] = tempModel;

        // Cập nhật vị trí model
        GridManager.getInstance().grid[a.row][a.col].row = a.row;
        GridManager.getInstance().grid[a.row][a.col].col = a.col;

        GridManager.getInstance().grid[b.row][b.col].row = b.row;
        GridManager.getInstance().grid[b.row][b.col].col = b.col;

        // Hoán đổi UI
        const posA = this.contains[a.row][a.col].position.clone();
        const posB = this.contains[b.row][b.col].position.clone();

        const nodeA = cellA.GetCellUI();
        const nodeB = cellB.GetCellUI();

        this.cells[a.row][a.col] = cellB;
        this.cells[b.row][b.col] = cellA;

        // Di chuyển node
        const tweenA = new Promise(resolve => {
            tween(nodeA).to(0.2, { position: posB }).call(resolve).start();
        });
        const tweenB = new Promise(resolve => {
            tween(nodeB).to(0.2, { position: posA }).call(resolve).start();
        });

        await Promise.all([tweenA, tweenB]);

        // Cập nhật UI sau khi swap
        this.UpdateValueCellBeforeTween(a.row, a.col, this.cells[a.row][a.col]);
        this.UpdateValueCellBeforeTween(b.row, b.col, this.cells[b.row][b.col]);

        // Check match
        const matchA = GridManager.getInstance().findConnectedCells(a.row, a.col);
        const matchB = GridManager.getInstance().findConnectedCells(b.row, b.col);

        const matched = matchA.length >= 3 ? matchA : matchB.length >= 3 ? matchB : null;

        if (matched) {
            this.scheduleOnce(() => {
                this.processAllMatchGroups(matched[0].row, matched[0].col, matched);
            }, 0.1);
        } else {
            this.isProcessing = false;
        }
    }

}


