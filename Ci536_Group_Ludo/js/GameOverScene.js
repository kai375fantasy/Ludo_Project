class GameOverScene extends Phaser.Scene {
    constructor() {
        super('GameOverScene');
    }


  init(data) {
    this.winnerColor = data.winnerColor || 'red';
    this.roundCount = data.roundCount || 1;
    this.mode = data.mode || 'single';
    this.playerColor = data.playerColor || 'red';
  }

  create() {
    this.add.rectangle(400, 300, 800, 600, 0xf8f8f8);
    this.add.text(400, 150, '🎉 GameOver 🎉', {
      fontSize: '42px',
      color: '#2c3e50'
    }).setOrigin(0.5);

    const emojiMap = {
      red: '🔴',
      yellow: '🟡',
      blue: '🔵',
      green: '🟢'
    };

    const winText = this.winnerColor === this.playerColor
      ? 'You Win！'
      : `${this.winnerColor} Win！`;

    this.add.text(400, 230, `${emojiMap[this.winnerColor]} ${winText}`, {
      fontSize: '32px',
      color: '#27ae60'
    }).setOrigin(0.5);

    this.add.text(400, 300, `Total ${this.roundCount} RoundCount`, {
      fontSize: '24px',
      color: '#7f8c8d'
    }).setOrigin(0.5);

    this.add.text(400, 380, '🏠 Back To HomePage', {
      fontSize: '24px',
      color: '#fff',
      backgroundColor: '#2980b9',
      padding: { x: 16, y: 10 }
    })
      .setOrigin(0.5)
      .setInteractive()
      .on('pointerdown', () => this.scene.start('MainMenuScene'));

    this.add.text(400, 440, '🔁 Replay', {
      fontSize: '24px',
      color: '#fff',
      backgroundColor: '#27ae60',
      padding: { x: 16, y: 10 }
    })
      .setOrigin(0.5)
      .setInteractive()
      .on('pointerdown', () => {
        this.scene.start('PlayScene', {
          mode: this.mode,
          playerColor: this.playerColor
        });
      });
  }
}

