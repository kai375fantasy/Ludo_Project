class MainMenuScene extends Phaser.Scene {
  constructor() {
    super('MainMenuScene');
    this.selectedColor = 'red';  // 默认选中颜色
    this.gameMode = 'single';    // 默认游戏模式
  }

  create() {
    this.selectedMode = 'single';
    this.selectedColor = 'red';

    this.add.rectangle(400, 300, 800, 600, 0xf2f2f2);
    this.add.text(400, 100, 'Ludo', { fontSize: '40px', color: '#2c3e50' }).setOrigin(0.5);

    // 模式选择按钮
    const singleBtn = this.add.text(300, 180, 'Single Player with AI', {
      fontSize: '22px',
      color: '#000',
      backgroundColor: '#ecf0f1',
      padding: { x: 10, y: 5 }
    }).setInteractive().on('pointerdown', () => {
      this.selectedMode = 'single';
      singleBtn.setStyle({ backgroundColor: '#3498db' });
      multiBtn.setStyle({ backgroundColor: '#ecf0f1' });
    });

    // const multiBtn = this.add.text(450, 180, '||Local Dou-Player(cant Play)', {
    //   fontSize: '22px',
    //   color: '#000',
    //   backgroundColor: '#ecf0f1',
    //   padding: { x: 10, y: 5 }
    // }).setInteractive().on('pointerdown', () => {
    //   this.selectedMode = 'multi';
    //   singleBtn.setStyle({ backgroundColor: '#ecf0f1' });
    //   multiBtn.setStyle({ backgroundColor: '#3498db' });
    // });

    // 玩家颜色选择按钮
    const colors = [
      { x: 260, value: 'red' },
      { x: 340, value: 'yellow' },
      { x: 420, value: 'blue' },
      { x: 500, value: 'green' }
    ];

    const colorIndicators = [];

    colors.forEach(color => {
      const btn = this.add.circle(color.x, 240, 20, this.getColorHex(color.value))
        .setStrokeStyle(2, 0x2c3e50)
        .setInteractive();

      const indicator = this.add.circle(color.x, 240, 10, 0xffffff).setVisible(false);

      colorIndicators.push({ color: color.value, indicator });

      btn.on('pointerdown', () => {
        this.selectedColor = color.value;
        colorIndicators.forEach(c => c.indicator.setVisible(c.color === color.value));
      });

      if (color.value === 'red') indicator.setVisible(true);
    });

    this.add.text(400, 320, 'Start Game', {
      fontSize: '28px',
      color: '#fff',
      backgroundColor: '#27ae60',
      padding: { x: 20, y: 10 }
    })
      .setOrigin(0.5)
      .setInteractive()
      .on('pointerdown', () => {
        this.scene.start('PlayScene', {
          mode: this.selectedMode,
          playerColor: this.selectedColor
        });
      });

      //
      this.add.text(400, 380, '⚠️ Tset to GG Scene', {
        fontSize: '20px',
        color: '#fff',
        backgroundColor: '#e67e22',
        padding: { x: 12, y: 6 }
        })
        .setOrigin(0.5)
        .setInteractive()
        .on('pointerdown', () => {
            this.scene.start('GameOverScene', {
            winnerColor: 'yellow',
            roundCount: 8,
            mode: 'single',
            playerColor: this.selectedColor
            });
        });

  }

  getColorHex(color) {
    const map = {
      red: 0xe74c3c,
      yellow: 0xf1c40f,
      blue: 0x3498db,
      green: 0x2ecc71
    };
    return map[color];
  }
}