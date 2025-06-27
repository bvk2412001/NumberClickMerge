import { _decorator, AudioClip, AudioSource, Component, director, game, Node } from 'cc';
import { BaseSingleton } from '../Base/BaseSingleton';
import { DataManager } from './DataManager';
import { SFXType } from '../Enum/Enum';
const { ccclass, property } = _decorator;

@ccclass('AudioManager')
export class AudioManager extends BaseSingleton<AudioManager> {
    @property(AudioSource)
    musicSource: AudioSource = null;

    @property(AudioSource)
    sfxSource: AudioSource = null;

    @property([AudioClip])
    sfxClips: AudioClip[] = [];

    LoadMusicSource() {
        if (this.musicSource != null) return;
        this.musicSource = this.node.getChildByName('MusicSource').getComponent(AudioSource);
    }

    LoadSfxSource() {
        if (this.sfxSource != null) return;
        this.sfxSource = this.node.getChildByName('SfxSource').getComponent(AudioSource);
    }

    protected LoadComponent(): void {

    }

    protected onLoad(): void {
        super.onLoad();

        director.addPersistRootNode(this.node) // giữ lại khi đổi scene
    }

    start() {
        this.playMusic();
    }

    playMusic() {
        if (DataManager.getInstance().DataMusic) {
            this.musicSource?.play();
        }
    }

    stopMusic() {
        this.musicSource?.stop();
    }

    setMusicStatus(on: boolean) {
        DataManager.getInstance().DataMusic = on;
        on ? this.playMusic() : this.stopMusic();
    }

    getMusicStatus(): boolean {
        return DataManager.getInstance().DataMusic;
    }

    setSFXStatus(on: boolean) {
        DataManager.getInstance().DataSound = on;
    }

    getSFXStatus(): boolean {
        return DataManager.getInstance().DataSound;
    }

    playSFX(type: SFXType) {
        if (!DataManager.getInstance().DataSound) return;

        const clip = this.sfxClips[type];
        if (clip) {
            this.sfxSource?.playOneShot(clip);
        }
    }

    StopEffMusic() {
        this.setMusicStatus(false);
        this.setSFXStatus(false);
    }

    ResumeEffMusic() {
        this.setMusicStatus(true);
        this.setSFXStatus(true);
        this.playSFX(SFXType.Spawn);
    }
}


