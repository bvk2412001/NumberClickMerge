export class CellModel {
    value: number = 0
    color: string = ""
    row: number = 0
    col: number = 0

    constructor(init: Partial<CellModel>) {
        Object.assign(this, init);
    }
}