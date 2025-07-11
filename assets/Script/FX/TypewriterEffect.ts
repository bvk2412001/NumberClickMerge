import { _decorator, Component, Label, Node } from 'cc';
// import { GameplayManager } from '../Manager/GameplayManager';
const { ccclass, property } = _decorator;

@ccclass('TypewriterEffect')
export class TypewriterEffect extends Component {

    @property(Label)
    label: Label = null;

    @property
    fullText: string = 'Xin chào! Đây là hiệu ứng nhập chữ.';

    @property
    duration: number = 1.2; // Thời gian toàn bộ chữ chạy xong (giây)

    private currentIndex: number = 0;
    private timer: number = 0;
    private isPlaying: boolean = false;
    private charInterval: number = 0;

    // start() {
    //     this.playEffect();
    // }

    playEffect(fulltext: string) {
        this.label.string = '';
        this.currentIndex = 0;
        this.timer = 0;
        this.isPlaying = true;
        this.fullText = fulltext;

        // Tính thời gian giữa mỗi ký tự
        this.charInterval = this.fullText.length > 0
            ? this.duration / this.fullText.length
            : 0;
    }

    update(deltaTime: number) {
        if (!this.isPlaying) return;

        this.timer += deltaTime;

        while (this.timer >= this.charInterval && this.currentIndex < this.fullText.length) {
            this.label.string += this.fullText[this.currentIndex];
            this.currentIndex++;
            this.timer -= this.charInterval;
        }

        if (this.currentIndex >= this.fullText.length) {
            this.isPlaying = false;

            // GameplayManager.getInstance().DestroyNodeHideEvent();
        }
    }
}


