import { _decorator, Component, director, EventTouch, Node } from 'cc';
import { BaseTouch } from '../../../Base/BaseTouch';
const { ccclass, property } = _decorator;

@ccclass('OnOffSound')
export class OnOffSound extends BaseTouch {
    start() {
        super.start();
    }

    TouchStart(event: EventTouch): void {
        director.emit('EventSound', this);

        event.propagationStopped = true;
    }
}


