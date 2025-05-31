import { _decorator, Component, Node, randomRangeInt } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GridManager')
export class GridManager extends Component {
    private GRID_ROWS = 6;
    private GRID_COLS = 5;
    public grid: number[][] = [];
    private numberMax = 7

    public static instance: GridManager

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
                this.grid[i][j] = this.GetNumberRandom(this.numberMax);
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
                        this.grid[i][j] = this.GetDifferentNumber(this.grid[i][j]);
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


    private GetNumberRandom(maxRandom: number) {
        return randomRangeInt(0, maxRandom) + 1
    }

    private GetDifferentNumber(numberCurrent: number) {
        let random = -1
        do {
            random = this.GetNumberRandom(this.numberMax)
        }
        while (random == numberCurrent)
        return random;
    }


    public Get() {
        for (let i = 0; i < this.GRID_ROWS; i++) {
            for (let j = 0; j < this.GRID_COLS - 2; j++) {
                if (this.grid[i][j] == this.grid[i][j + 1] && this.grid[i][j] == this.grid[i][j + 2]) {

                }
            }
        }
    }

}


