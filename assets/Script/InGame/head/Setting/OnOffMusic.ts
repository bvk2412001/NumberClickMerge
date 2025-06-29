import { _decorator, Component, director, EventTouch, Node } from 'cc';
import { BaseTouch } from '../../../Base/BaseTouch';
const { ccclass, property } = _decorator;

@ccclass('OnOffMusic')
export class OnOffMusic extends BaseTouch {

    start() {
        super.start();
    }

    TouchStart(event: EventTouch): void {
        director.emit('EventMusic', this);

        event.propagationStopped = true;
    }
}


