import { _decorator, Component, EventTouch, Node } from 'cc';
import { BaseTouch } from '../../../Base/BaseTouch';
const { ccclass, property } = _decorator;

@ccclass('Hammer')
export class Hammer extends BaseTouch {

    TouchStart(event: EventTouch): void {

    }
}


