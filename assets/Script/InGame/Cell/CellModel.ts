export class CellModel {
    value: number = 0
    color: string = ""
    constructor(init: Partial<CellModel>) {
        Object.assign(this, init);
    }

}


