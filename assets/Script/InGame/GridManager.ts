import { _decorator, Component, log, Node, randomRangeInt } from 'cc';
import { CellModel } from './Cell/CellModel';
import { BaseSingleton } from '../Base/BaseSingleton';
import { GameManager } from '../Manager/GameManager';
import { EventBus } from '../Utils/EventBus';
import { EventGame } from '../Enum/EEvent';
import { PopupManager } from '../Manager/PopupManager';

const { ccclass, property } = _decorator;

@ccclass('GridManager')
export class GridManager extends BaseSingleton<GridManager> {
    private GRID_ROWS = 6;
    private GRID_COLS = 5;
    public grid: CellModel[][] = [];
    public numberMax = 8

    public numberMin = 1

    public colors: string[] = ["#CDC958", "#31DA28", "#FF963D", "#12D5C6", "#F54444", "#1592DD", "#DA36B3", "#4449DE", "#8C37E4"]


    protected onLoad(): void {
        this.initGrid();
        this.CreateBoard();
    }

    // Khởi tạo lưới
    private initGrid() {
        this.grid = [];
        for (let i = 0; i < this.GRID_ROWS; i++) {
            this.grid[i] = [];
            for (let j = 0; j < this.GRID_COLS; j++) {
                this.grid[i][j] = this.GetDataCellRandom();
                this.grid[i][j].row = i
                this.grid[i][j].col = j
            }
        }

    }


    private CreateBoard() {
        let success = false;

        while (!success) {
            success = true;

            for (let i = 0; i < this.GRID_ROWS; i++) {
                for (let j = 0; j < this.GRID_COLS; j++) {
                    if (this.isMatched(i, j)) {
                        this.grid[i][j] = this.GetDifferentDataCell(this.grid[i][j].value);
                        this.grid[i][j].row = i
                        this.grid[i][j].col = j
                        success = false;
                    }
                }
            }
        }

        console.table(this.grid.map(r => r.map(c => c.value)));
    }

    private isMatched(i: number, j: number): boolean {
        const val = this.grid[i][j].value;

        // Pattern ngang: [i][j], [i][j+1], [i][j+2]
        if (j + 2 < this.GRID_COLS &&
            this.grid[i][j + 1].value === val && this.grid[i][j + 2].value === val) {
            return true;
        }

        // Pattern dọc: [i][j], [i+1][j], [i+2][j]
        if (i + 2 < this.GRID_ROWS &&
            this.grid[i + 1][j].value === val && this.grid[i + 2][j].value === val) {
            return true;
        }

        // Pattern L góc trên trái: [i][j], [i+1][j], [i][j+1]
        if (i + 1 < this.GRID_ROWS && j + 1 < this.GRID_COLS &&
            this.grid[i + 1][j].value === val && this.grid[i][j + 1].value === val) {
            return true;
        }

        // Pattern L góc trên phải: [i][j], [i+1][j], [i][j-1]
        if (i + 1 < this.GRID_ROWS && j - 1 >= 0 &&
            this.grid[i + 1][j].value === val && this.grid[i][j - 1].value === val) {
            return true;
        }

        // Pattern L góc dưới trái: [i][j], [i-1][j], [i][j+1]
        if (i - 1 >= 0 && j + 1 < this.GRID_COLS &&
            this.grid[i - 1][j].value === val && this.grid[i][j + 1].value === val) {
            return true;
        }

        // Pattern L góc dưới phải: [i][j], [i-1][j], [i][j-1]
        if (i - 1 >= 0 && j - 1 >= 0 &&
            this.grid[i - 1][j].value === val && this.grid[i][j - 1].value === val) {
            return true;
        }

        return false;
    }


    private GetDataCellRandom() {
        let index = randomRangeInt(this.numberMin, this.numberMax)
        let color = this.GetColorByValue(index)
        return new CellModel({ value: index, color: color })
    }

    private GetDifferentDataCell(numberCurrent: number) {
        let random: CellModel = null
        do {
            random = this.GetDataCellRandom()
        }
        while (random.value == numberCurrent)
        return random;
    }


    GetColorByValue(index: number): string {
        let i = index % this.colors.length
        return this.colors[i]
    }


    public findConnectedCells(startRow: number, startCol: number): { row: number, col: number }[] {
        const targetValue = this.grid[startRow][startCol].value;

        if (targetValue <= 0) return;

        const visited = new Set<string>();
        const matchedCells: { row: number, col: number }[] = [];

        const directions = [
            { row: 0, col: 1 },   // Phải
            { row: 1, col: 0 },   // Xuống
            { row: 0, col: -1 },  // Trái
            { row: -1, col: 0 },  // Lên
        ];

        const stack: [number, number][] = [[startRow, startCol]]; // ngắn xếp search theo chiều sâu
        visited.add(`${startRow},${startCol}`);

        while (stack.length > 0) {
            const [currentRow, currentCol] = stack.pop()!;
            matchedCells.push({ row: currentRow, col: currentCol });

            for (const { row: rowOffset, col: colOffset } of directions) {
                const nextRow = currentRow + rowOffset;
                const nextCol = currentCol + colOffset;

                if (
                    nextRow >= 0 && nextRow < this.GRID_ROWS &&
                    nextCol >= 0 && nextCol < this.GRID_COLS &&
                    !visited.has(`${nextRow},${nextCol}`) &&
                    this.grid[nextRow][nextCol].value === targetValue
                ) {
                    visited.add(`${nextRow},${nextCol}`);
                    stack.push([nextRow, nextCol]);
                }
            }
        }

        return matchedCells.length >= 3 ? matchedCells : [];
    }

    ResetDataMatch(matched: { row: number, col: number }[]) {
        for (const cells of matched) {
            this.grid[cells.row][cells.col].value = - 1;
        }
    }

    FillIntheValue() {
        const rows = GameManager.getInstance().dataGame.json["row"];
        const cols = GameManager.getInstance().dataGame.json["col"];

        this.SwapValue(rows, cols);

        this.FillNewValue(rows, cols);

        console.table(this.grid.map(r => r.map(c => c.value)));
    }

    SwapValue(rows: number, cols: number) {
        for (let col = 0; col < cols; col++) {
            let dest = -1;                          // chưa có ô trống

            for (let row = 0; row < rows; row++) {  // ❶ QUÉT TỪ TRÊN XUỐNG
                if (this.grid[row][col].value === -1) {
                    // tìm ra ô trống đầu tiên
                    if (dest === -1) dest = row;
                } else if (dest !== -1) {
                    // ❷ KÉO Ô CÓ GIÁ TRỊ XUỐNG VỊ TRÍ dest
                    let temp = this.grid[dest][col];
                    this.grid[dest][col] = this.grid[row][col];
                    this.grid[dest][col].row = dest;          // cập nhật toạ độ
                    this.grid[dest][col].col = col;

                    this.grid[row][col] = temp;

                    dest++; // vị trí trống kế tiếp
                }
            }

        }
    }

    FillNewValue(rows: number, cols: number) {
        for (let col = 0; col < cols; col++) {
            for (let row = 0; row < rows; row++) {
                if (this.grid[row][col].value === -1) {
                    const data = this.GetDataCellRandom(); // TẠO MỚI CELL
                    data.row = row;
                    data.col = col;
                    this.grid[row][col] = data;

                    EventBus.emit(EventGame.GRID_CELL_UPDATED_EVENT, { row, col, cell: data });
                }
            }
        }
    }

    CheckUpdateMaxCurrent(value: number) {
        if (value == this.numberMax) {

            this.numberMax++
            return true
        }

        return false

    }

    CheckUpDateMinCurrent() {
        if (this.numberMax + 1 < 9) return
        const diff = this.numberMax + 1 - 9;
        if (diff % 2 !== 0) return
        this.numberMin = (diff / 2) + 1
        PopupManager.getInstance().ShowPopupUnlockMin()

    }
}


