import { _decorator, Component, Node } from 'cc';
import { Cell } from './Cell';
import { CellModel } from './CellModel';
const { ccclass, property } = _decorator;

@ccclass('CellCollection')
export class CellCollection extends Array<Cell> {

    constructor() {
        super();
        // Fix prototype chain issue for extending Array in TypeScript
        Object.setPrototypeOf(this, CellCollection.prototype);
    }


    public CreateCell(cellData: CellModel): Cell {
        let newCell = new Cell(cellData)
        this.push(newCell)
        return newCell
    }
}


