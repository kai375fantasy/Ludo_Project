const config = {
    type: Phaser.AUTO,
    width: 1000,
    height: 600,
    backgroundColor: '#ffffff',
    scene: [BootScene, MainMenuScene, PlayScene, GameOverScene],
};

const game = new Phaser.Game(config);
