import { _decorator, Component, EventTouch, Node } from 'cc';
import { AutoComponent } from './AutoComponent';
const { ccclass, property } = _decorator;

@ccclass('BaseTouch')
export class BaseTouch extends AutoComponent {

    start() {
        this.RegisterButton();
    }

    RegisterButton() {
        this.node.on(Node.EventType.TOUCH_START, this.TouchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.TouchMove, this);
        this.node.on(Node.EventType.TOUCH_END, this.TouchEnd, this);
    }

    UnRegisterButton() {
        this.node.off(Node.EventType.TOUCH_START, this.TouchStart, this);
        this.node.off(Node.EventType.TOUCH_MOVE, this.TouchMove, this);
        this.node.off(Node.EventType.TOUCH_END, this.TouchEnd, this);
    }

    TouchStart(event: EventTouch) {

    }

    TouchMove(event: EventTouch) {

    }

    TouchEnd(event: EventTouch) {

    }
}