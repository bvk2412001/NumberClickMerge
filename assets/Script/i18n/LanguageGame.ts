import { _decorator, Component, director, find, log, Node, sys } from 'cc';
import { LanguageManager } from './LanguageManager';
import { DataManager } from '../Manager/DataManager';
const { ccclass, property } = _decorator;

@ccclass('LanguageGame')
export class LanguageGame extends Component {


    protected async onLoad() {

        director.addPersistRootNode(this.node) // giữ lại khi đổi scene

        let lang = DataManager.getInstance().Language;
        await LanguageManager.getInstance().init();
    }
}


