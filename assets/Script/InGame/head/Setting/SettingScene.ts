import { _decorator, Component, director, EventTouch, Label, log, Node, Sprite, SpriteFrame, tween, Vec3 } from 'cc';
import { BaseTouch } from '../../../Base/BaseTouch';
import { AudioManager } from '../../../Manager/AudioManager';
import { DataManager } from '../../../Manager/DataManager';
const { ccclass, property } = _decorator;

@ccclass('SettingScene')
export class SettingScene extends BaseTouch {

    @property(Node)
    musicNode: Node = null;

    @property(Node)
    soundNode: Node = null;

    @property(Node)
    onOffMusicNode: Node = null;

    @property(Node)
    onOffSoundNode: Node = null;

    @property(Node)
    exit: Node = null;

    @property(SpriteFrame)
    spriteOn: SpriteFrame = null;
    @property(SpriteFrame)
    spriteOff: SpriteFrame = null;

    isEventMusic: boolean = false;
    isEventSound: boolean = false;

    LoadMusicNode() {
        if (this.musicNode != null) return;
        this.musicNode = this.node.getChildByPath('setting/boxSound/Music');
    }

    LoadSoundNode() {
        if (this.soundNode != null) return;
        this.soundNode = this.node.getChildByPath('setting/boxSound/Sound');
    }
    LoadOnOffMusicNode() {
        if (this.onOffMusicNode != null) return;
        this.onOffMusicNode = this.musicNode.getChildByName('onOff');
    }

    LoadOnOffSoundNode() {
        if (this.onOffSoundNode != null) return;
        this.onOffSoundNode = this.soundNode.getChildByName('onOff');
    }
    LoadExit() {
        if (this.exit != null) return;
        this.exit = this.node.getChildByPath('setting/exit');
    }

    LoadDataAudio() {
        this.LoadDataMusic();
        this.LoadDataSound();
    }

    SetUIOnOff(status: boolean, btn: Sprite, effNode: Sprite) {
        if (status) {
            effNode.spriteFrame = this.spriteOn;

            btn.node.setPosition(-50, 0, 0);
        } else {
            effNode.spriteFrame = this.spriteOff;

            btn.node.setPosition(50, 0, 0);
        }

        log('status: ', status, btn, effNode)
    }

    LoadDataMusic() {
        let status = AudioManager.getInstance().getMusicStatus();
        let btn = this.onOffMusicNode.getChildByName('btn').getComponent(Sprite);
        let effNode = this.onOffMusicNode.getComponent(Sprite);

        this.SetUIOnOff(status, btn, effNode);
    }

    LoadDataSound() {
        let status = AudioManager.getInstance().getSFXStatus();
        let btn = this.onOffSoundNode.getChildByName('btn').getComponent(Sprite);
        let effNode = this.onOffSoundNode.getComponent(Sprite);

        this.SetUIOnOff(status, btn, effNode);
    }

    protected LoadComponent(): void {
        // this.LoadMusicNode();
        // this.LoadSoundNode();
        // this.LoadOnOffMusicNode();
        // this.LoadOnOffSoundNode();
        // this.LoadExit();
        this.LoadDataAudio();
    }

    start() {
        super.start();
    }

    protected onEnable(): void {
        // this.RegisterButton();
        this.RegisterEventMusic();
        this.RegisterEventSound();
    }

    protected onDisable(): void {
        // this.UnRegisterButton();
        this.UnRegisterEventMusic();
        this.UnRegisterEventSound();
    }

    protected onDestroy(): void {
        this.UnRegisterButton();
        this.UnRegisterEventMusic();
        this.UnRegisterEventSound();
    }

    update(deltaTime: number) {

    }

    TouchStart(event: EventTouch) {
        this.node.active = false;

        this.node.children.forEach(element => {
            element.active = false;
        })

        event.propagationStopped = true;
    }

    RegisterEventMusic() {
        director.on('EventMusic', this.EventMusic, this)
    }

    UnRegisterEventMusic() {
        director.off('EventMusic', this.EventMusic, this)
    }

    EventMusic() {
        const status = !AudioManager.getInstance().getMusicStatus();
        AudioManager.getInstance().setMusicStatus(status);
        this.updateOnOffButton(this.onOffMusicNode, status);
    }

    RegisterEventSound() {
        director.on('EventSound', this.EventSound, this)
    }

    UnRegisterEventSound() {
        director.off('EventSound', this.EventSound, this)
    }

    EventSound() {
        const status = !AudioManager.getInstance().getSFXStatus();
        AudioManager.getInstance().setSFXStatus(status);
        this.updateOnOffButton(this.onOffSoundNode, status);
    }

    updateOnOffButton(parentNode: Node, status: boolean) {

        const btn = parentNode.getChildByName('btn')?.getComponent(Sprite);

        if (!btn) {
            console.warn('Không tìm thấy btn hoặc label');
            return;
        }

        const posBtn = status ? new Vec3(-50, 0, 0) : new Vec3(50, 0, 0);
        const posNode = status ? new Vec3(30, 0, 0) : new Vec3(-30, 0, 0);
        const onOrOff = status ? `on` : `off`;
        const SpriteOnOrOff = status ? this.spriteOn : this.spriteOff;

        this.TweenBtnOnOff(btn.node, posNode, posBtn, onOrOff, SpriteOnOrOff);
    }

    TweenBtnOnOff(btn: Node, posnode: Vec3, posBtn: Vec3, onOrOff: string, SpriteOnOrOff: SpriteFrame) {

        tween(btn)
            .to(0.2, { position: new Vec3(posBtn.x, 0, 0) })
            .call(() => {
                btn.parent.getComponent(Sprite).spriteFrame = SpriteOnOrOff;
            })
            .start();
    }

    BtnExit() {
        // Xóa trạng thái game cũ
        DataManager.getInstance().clearGameState();
        // DataManager.getInstance()._scenePlay = false; // đang không trong game

        this.node.active = false
        // HomeManager.instance.ShowHome();
    }
}


