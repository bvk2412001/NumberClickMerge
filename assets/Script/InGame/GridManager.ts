import { _decorator, Component, Node, randomRangeInt } from 'cc';
import { CellModel } from './Cell/CellModel';
const { ccclass, property } = _decorator;

@ccclass('GridManager')
export class GridManager extends Component {
    private GRID_ROWS = 6;
    private GRID_COLS = 5;
    public grid: CellModel[][] = [];
    private numberMax = 7

    public static instance: GridManager

    public colors: string[] = ["#8C37E4", "#31DA28", "#FF963D", "#12D5C6", "#F54444", "#1592DD", "#DA36B3", "#4449DE", "#8C37E4"]

    protected onLoad(): void {
        GridManager.instance = this
        this.initGrid()
        this.CreateBoard()
    }


    // Khởi tạo lưới
    private initGrid() {
        this.grid = [];
        for (let i = 0; i < this.GRID_ROWS; i++) {
            this.grid[i] = [];
            for (let j = 0; j < this.GRID_COLS; j++) {
                this.grid[i][j] = this.GetDataCellRandom(this.numberMax);
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
                        success = false;
                    }
                }
            }
        }

        console.log(this.grid);
    }

    private isMatched(i: number, j: number): boolean {
        const val = this.grid[i][j];

        // Pattern ngang: [i][j], [i][j+1], [i][j+2]
        if (j + 2 < this.GRID_COLS &&
            this.grid[i][j + 1] === val && this.grid[i][j + 2] === val) {
            return true;
        }

        // Pattern dọc: [i][j], [i+1][j], [i+2][j]
        if (i + 2 < this.GRID_ROWS &&
            this.grid[i + 1][j] === val && this.grid[i + 2][j] === val) {
            return true;
        }

        // Pattern L góc trên trái: [i][j], [i+1][j], [i][j+1]
        if (i + 1 < this.GRID_ROWS && j + 1 < this.GRID_COLS &&
            this.grid[i + 1][j] === val && this.grid[i][j + 1] === val) {
            return true;
        }

        // Pattern L góc trên phải: [i][j], [i+1][j], [i][j-1]
        if (i + 1 < this.GRID_ROWS && j - 1 >= 0 &&
            this.grid[i + 1][j] === val && this.grid[i][j - 1] === val) {
            return true;
        }

        // Pattern L góc dưới trái: [i][j], [i-1][j], [i][j+1]
        if (i - 1 >= 0 && j + 1 < this.GRID_COLS &&
            this.grid[i - 1][j] === val && this.grid[i][j + 1] === val) {
            return true;
        }

        // Pattern L góc dưới phải: [i][j], [i-1][j], [i][j-1]
        if (i - 1 >= 0 && j - 1 >= 0 &&
            this.grid[i - 1][j] === val && this.grid[i][j - 1] === val) {
            return true;
        }

        return false;
    }


    private GetDataCellRandom(maxRandom: number) {
        let index = randomRangeInt(0, maxRandom) + 1
        let color = this.GetColorByValue(index)
        return new CellModel({ value: index, color: color })
    }

    private GetDifferentDataCell(numberCurrent: number) {
        let random: CellModel = null
        do {
            random = this.GetDataCellRandom(this.numberMax)
        }
        while (random.value == numberCurrent)
        return random;
    }


    GetColorByValue(index: number): string {
        let i = index % this.colors.length
        return this.colors[i]
    }

}


