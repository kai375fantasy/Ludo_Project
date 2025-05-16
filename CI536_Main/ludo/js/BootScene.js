class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        this.load.image('board', 'assets/images/001_Ludo_Board_600.png');
        this.load.image('dice', 'assets/images/dice.png'); 
        this.load.image('pawn_red', 'assets/images/001_pawn_red.png');
        this.load.image('pawn_blue', 'assets/images/001_pawn_blue.png');
        this.load.image('pawn_green', 'assets/images/001_pawn_green.png');
        this.load.image('pawn_yellow', 'assets/images/001_pawn_yellow.png');

        
        // MUSIC
        this.load.audio('bgm', 'assets/audio/BGM_A1.mp3');
        this.load.audio('dice', 'assets/audio/dice.mp3');
        this.load.audio('move', 'assets/audio/Rise03.mp3');
        this.load.audio('win', 'assets/audio/8-bit-victory-sound.mp3');
    }

    create() {
        this.scene.start('MainMenuScene');
    }
}
