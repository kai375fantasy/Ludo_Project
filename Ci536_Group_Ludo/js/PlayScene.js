// Junkai Qian
class PlayScene extends Phaser.Scene {
    constructor() {
        super('PlayScene');
    }

    init(data) {
    this.playerColor = data.playerColor || 'red';
    this.gameMode = data.mode || 'single';
  }

    create() {
    this.boardSize = 600;
    this.gridCount = 35;
    this.gridSize = this.boardSize / this.gridCount;
    this.boardOffsetX = (800 - this.boardSize) / 2;
    this.boardOffsetY = 0;
    this.cameras.main.setBackgroundColor('#eee');

    // Determine colour current player's camp
    this.colorOrder = ['red', 'yellow', 'blue', 'green'];
    this.currentTurnIndex = 0;
    this.currentPlayerColor = this.colorOrder[this.currentTurnIndex];
    this.roundCount = 1;
    this.aiColors = this.colorOrder.filter(c => c !== this.playerColor);

    this.diceValue = 0;
    this.extraSteps = null;
    this.awaitingSelection = false;
    this.awaitingExtraRoll = false;
    this.consecutiveSixes = 0;

    this.spawnPoints = {
      red: [[2, 29], [2, 32], [5, 29], [5, 32]],
      yellow: [[30, 29], [30, 32], [33, 29], [33, 32]],
      blue: [[30, 2], [30, 5], [33, 2], [33, 5]],
      green: [[2, 2], [2, 5], [5, 2], [5, 5]]
    };
    this.startPoints = {
      red: [1, 25],
      yellow: [26, 33],
      blue: [34, 8],
      green: [8, 1]
    };
    this.colorStartIndex = {
      red: 0,
      yellow: 13,
      blue: 26,
      green: 39
    };
    this.endEntryIndex = {
      red: 49,
      yellow: 10,
      blue: 23,
      green: 36
    };
    this.finalPath = {
      red: [[4, 17], [6, 17], [8, 17], [10, 17], [12, 17], [15, 17]],
      yellow: [[17, 29], [17, 27], [17, 25], [17, 23], [17, 21], [17, 19]],
      blue: [[29, 17], [27, 17], [25, 17], [23, 17], [21, 17], [19, 17]],
      green: [[17, 4], [17, 6], [17, 8], [17, 10], [17, 12], [17, 15]]
    };
    this.flyPoints = {
      red: [24, 23],
      yellow: [23, 9],
      blue: [9, 10],
      green: [10, 25]
    };
    this.flyDestIndex = {
      red: 29,
      yellow: 42,
      blue: 3,
      green: 16
    };
    this.colorSequence = ['green', 'red', 'yellow', 'blue'];

    this.bgm = this.sound.add('bgm', { loop: true, volume: 0.5 });
    this.bgm.play();

    this.pawns = [];
    this.createMap();
    this.createPath();
    this.createAllPawns();
    this.createDice();
    this.createLogBox();
    this.createDebugButtons();

   // this.drawDebugGrid();
    //this.drawDebugPath();

    this.logEvent(`🌀 Round ${this.roundCount} begins, it's ${this.getColorEmoji(this.currentPlayerColor)} ${this.currentPlayerColor}'s turn`);
    }

    createMap() {
        this.add.image(400, 300, 'board');
    }

    createPath() {
        this.path = [
            [2, 23], [4, 24], [6, 24], [9, 23], [10, 25], [9, 27], [9, 29], [10, 31],
            [12, 32], [14, 32], [17, 32], [19, 32], [21, 32], [23, 32], [24, 29],
            [24, 27], [23, 25], [24, 23], [27, 24], [29, 24], [31, 24], [32, 21],
            [32, 19], [32, 17], [32, 15], [32, 13], [32, 10], [29, 9], [27, 9],
            [25, 10], [23, 9], [24, 7], [24, 5], [23, 2], [21, 1], [19, 1], [17, 1],
            [15, 1], [13, 1], [10, 2], [9, 4], [9, 6], [10, 8], [9, 10], [6, 9],
            [4, 9], [2, 10], [1, 13], [1, 15], [1, 17], [1, 19], [1, 21]
        ];
    }

    createAllPawns() {
    for (let color of this.colorOrder) {
      this.spawnPoints[color].forEach((pos, index) => {
        const [y, x] = pos;
        const pawn = this.add.image(
          this.boardOffsetX + x * this.gridSize + this.gridSize / 2,
          this.boardOffsetY + y * this.gridSize + this.gridSize / 2,
          'pawn_' + color
        ).setDisplaySize(this.gridSize * 3, this.gridSize * 3);

        pawn.setData({
          id: index,
          color: color,
          inPath: false,
          pathIndex: -1,
          finalIndex: -1
        });

        if (color === this.playerColor) {
          pawn.setInteractive();
          pawn.on('pointerdown', () => {
            if (this.awaitingSelection && this.diceValue > 0) {
              this.awaitingSelection = false;
              const steps = this.extraSteps !== null ? this.extraSteps : this.diceValue;
              this.extraSteps = null;
              this.movePawn(pawn, steps);
            }
          });
        }

        this.pawns.push(pawn);
      });
    }
  }

    createDice() {
        this.diceText = this.add.text(700, 20, '🎲', { fontSize: '28px', fill: '#000' });
    }

    createLogBox() {
        this.logMessages = [];
        this.logTexts = [];
        
        for (let i = 0; i < 8; i++) {
            const text = this.add.text(10, 20 + i * 16, '', { fontSize: '12px', fill: '#000' });
            this.logTexts.push(text);
        }
    }

    logEvent(msg) {
        this.logMessages.push(msg);
        if (this.logMessages.length > 8) this.logMessages.shift();
        this.logMessages.forEach((m, i) => this.logTexts[i].setText(m));
    }

    endTurn() {
        this.currentTurnIndex = (this.currentTurnIndex + 1) % this.colorOrder.length;
        this.currentPlayerColor = this.colorOrder[this.currentTurnIndex];

        if (this.currentTurnIndex === 0) {
            this.roundCount++;
            this.logEvent(`🌀 Round ${this.roundCount} begins`);
        }

        this.logEvent(`🎯 It's now ${this.getColorEmoji(this.currentPlayerColor)} ${this.currentPlayerColor}'s turn`);

        this.consecutiveSixes = 0;
        this.diceValue = 0;
        this.extraSteps = null;

        if (this.currentPlayerColor !== this.playerColor) {
            this.time.delayedCall(600, () => this.rollDice(), [], this);
        }
    }

   // Player rolls the dice
   // AI rolls the dice
rollDice(forcedValue = null) {
  if (this.awaitingTween || this.awaitingSelection) return;

  const dice = forcedValue !== null ? forcedValue : Phaser.Math.Between(1, 6);
  this.diceValue = dice;
  this.sound.play('dice'); // play dice sound
  this.diceText.setText('🎲 ' + dice);
  this.logEvent(`🎲 ${this.getColorEmoji(this.currentPlayerColor)} ${this.currentPlayerColor} rolled a ${dice} `);

  if (this.currentPlayerColor === this.playerColor) {
    // Play
    if (dice === 6) {
      this.consecutiveSixes++;
      if (this.consecutiveSixes >= 3) {
        this.returnAllToBase();
        this.endTurn();
        return;
      }
      this.awaitingExtraRoll = true;
    } else {
      this.awaitingExtraRoll = false;
      this.consecutiveSixes = 0;
    }

    // Check for moveable pawns
    const hasMovable = this.pawns.some(p => {
      const color = p.data.get('color');
      if (color !== this.playerColor) return false;
      if (p.data.get('finalIndex') >= this.finalPath[color].length - 1) return false;

      return (
        (!p.data.get('inPath') && dice >= 5) ||
        (p.data.get('inPath') && p.data.get('pathIndex') === -1) ||
        (p.data.get('inPath') && p.data.get('pathIndex') >= 0) ||
        (p.data.get('finalIndex') >= 0)
      );
    });

    if (!hasMovable) {
      this.logEvent(`❌ ${this.getColorEmoji(this.playerColor)} has no movable pawns, skipping turn`);
      this.endTurn();
      return;
    }

    // wait for player to select a pawn
    this.awaitingSelection = true;

  } else {
    // Ai rolls the dice
    this.logEvent(`🤖 ${this.getColorEmoji(this.currentPlayerColor)} AI takes action`);
    this.aiTakeTurn(this.currentPlayerColor, dice);

    if (dice === 6) {
      const extra = Phaser.Math.Between(1, 6);
      this.logEvent(`🤖 ${this.getColorEmoji(this.currentPlayerColor)} rolls again and gets ${extra} `);
      this.time.delayedCall(500, () => this.aiTakeTurn(this.currentPlayerColor, extra));
    }
  }
}




movePawn(pawn, steps) {
  const data = pawn.data.getAll();
  const color = data.color;

  // attempt to move the pawn
  if (!data.inPath) {
    if (steps < 5) {
      this.logEvent(`❌ ${this.getColorEmoji(color)} ${color}pawn  #${data.id} cannot take off, at least 5 steps are required`);
      return;
    }

    const [sy, sx] = this.startPoints[color];
    pawn.setPosition(
      this.boardOffsetX + sx * this.gridSize + this.gridSize / 2,
      this.boardOffsetY + sy * this.gridSize + this.gridSize / 2
    );
    pawn.setData('inPath', true);
    pawn.setData('pathIndex', -1);
    this.logEvent(`🚀 ${this.getColorEmoji(color)} ${color}pawn #${data.id} takes off to the starting point`);

    if (steps === 6) {
      this.extraSteps = Phaser.Math.Between(1, 6);
      this.diceText.setText('🎲 ' + this.extraSteps + '（extra roll）');
      this.logEvent(`🎲 Extra roll is ${this.extraSteps} click the pawn to continue`);
      this.awaitingSelection = true;
    }
    return;
  }

  // entering the path (color offset)
  if (data.pathIndex === -1) {
    const startIndex = this.colorStartIndex[color];
    let targetIndex = startIndex + (steps - 1);

    if (targetIndex >= this.path.length) {
      targetIndex = targetIndex % this.path.length;
    }

    pawn.setData('pathIndex', targetIndex);
    this.logEvent(`🚗 ${this.getColorEmoji(color)} ${color}pawn #${data.id} enters the path from the starting point → index ${targetIndex}`);
    this.tweenMove(pawn, targetIndex);
    return;
  }

  // final path
  if (data.finalIndex >= 0) {
    let newFinalIndex = data.finalIndex + steps;
    const final = this.finalPath[color];
    if (newFinalIndex >= final.length) newFinalIndex = final.length - 1;
    const [fy, fx] = final[newFinalIndex];
    this.logEvent(`🏁 ${this.getColorEmoji(color)} ${color}pawn #${data.id} advances on the final stretch to tile ${newFinalIndex + 1}`);
    this.tweenToFinal(pawn, [fy, fx], newFinalIndex);
    return;
  }

  // main path (color offset)
  // surround the path
  const startIndex = data.pathIndex;
  const endEntry = this.endEntryIndex[color];
  const stepsToFinal = startIndex + steps;

  // determine if the pawn is in the final stretch
  if (startIndex <= endEntry && stepsToFinal > endEntry) {
    const finalStep = stepsToFinal - endEntry - 1;
    const path = this.finalPath[color];
    const [fy, fx] = path[finalStep] || path[path.length - 1];
    this.logEvent(`🏁 ${this.getColorEmoji(color)} ${color}pawn #${data.id} enters the final stretch at tile ${finalStep + 1} `);
    pawn.setData('finalIndex', finalStep);
    this.tweenToFinal(pawn, [fy, fx], finalStep);
    return;
  }

  // round the path 51-0
  let target = startIndex + steps;
  if (target >= this.path.length) {
    target = target % this.path.length;
  }

  this.logEvent(`🎯 ${this.getColorEmoji(color)} ${color}pawn #${data.id} moves forward ${steps} steps`);
  this.tweenMove(pawn, target);
}




    tweenMove(pawn, targetIndex, isFollowUp = false, callback = null) {
        const [ty, tx] = this.path[targetIndex];
        this.awaitingTween = true;
       // this.sound.play('move');
        this.tweens.add({
            targets: pawn,
            x: this.boardOffsetX + tx * this.gridSize + this.gridSize / 2,
            y: this.boardOffsetY + ty * this.gridSize + this.gridSize / 2,
            duration: 300,
            onComplete: () => {
                pawn.setData('pathIndex', targetIndex);
                this.checkCollisionsAt(targetIndex, pawn); //  check collisions
                this.awaitingTween = false;

                if (!isFollowUp) {
                    this.checkFlyOrJump(pawn);
                } else if (callback) {
                    callback();
                }
            }
        });
    }

    tweenToFinal(pawn, [y, x], finalIndex) {
        this.awaitingTween = true;
        this.tweens.add({
            targets: pawn,
            x: this.boardOffsetX + x * this.gridSize + this.gridSize / 2,
            y: this.boardOffsetY + y * this.gridSize + this.gridSize / 2,
            duration: 300,
            onComplete: () => {
                pawn.setData('finalIndex', finalIndex);
                this.awaitingTween = false; 
                this.checkVictory(pawn.data.get('color')); // check Victory
                this.handlePostMove();
            }
        });
    }

    checkFlyOrJump(pawn) {
        const color = pawn.data.get('color');
        const index = pawn.data.get('pathIndex');
        const [y, x] = this.path[index];

        const flyStart = this.flyPoints[color];
        if (flyStart && flyStart[0] === y && flyStart[1] === x) {
            const dest = this.flyDestIndex[color];
            this.logEvent(`✈️ pawn #${pawn.data.get('id')} flies 12 steps！`);
            this.tweenMove(pawn, dest, true, () => this.handlePostMove());
            return;
        }

        const tileColor = this.colorSequence[index % 4];
        if (tileColor === color) {
            const next = this.findNextSameColor(color, index + 1);
            if (next !== -1) {
                this.logEvent(`🟩 pawn #${pawn.data.get('id')} jumps to the next red tile！`);
                this.tweenMove(pawn, next, true, () => this.handlePostMove());
                return;
            }
        }

        this.handlePostMove();
    }

    

    findNextSameColor(color, startIndex) {
        for (let i = startIndex; i < this.path.length; i++) {
            if (this.colorSequence[i % 4] === color) {
                return i;
            }
        }
        return -1;
    }
    // draw the grid
    drawDeDebugGrid() {
        for (let y = 0; y < this.gridCount; y++) {
            for (let x = 0; x < this.gridCount; x++) {
                this.add.rectangle(
                    this.boardOffsetX + x * this.gridSize + this.gridSize / 2,
                    this.boardOffsetY + y * this.gridSize + this.gridSize / 2,
                    this.gridSize,
                    this.gridSize,
                    0xffffff,
                    0.01
                ).setStrokeStyle(1, 0x888888);
            }
        }
    }
    // draw the path
    drawDebugPath() {
        this.path.forEach((pos, i) => {
            const [y, x] = pos;
            this.add.rectangle(
                this.boardOffsetX + x * this.gridSize + this.gridSize / 2,
                this.boardOffsetY + y * this.gridSize + this.gridSize / 2,
                this.gridSize,
                this.gridSize,
                0xff0000,
                0.15
            );
            this.add.text(
                this.boardOffsetX + x * this.gridSize + 2,
                this.boardOffsetY + y * this.gridSize + 2,
                i.toString(),
                { fontSize: '10px', fill: '#000' }
            );
        });
    }

    returnAllToBase() {
        this.logEvent('⚠️ Rolled three consecutive 6, all pawns return to base！');
    }

    getColorEmoji(color) {
        switch (color) {
            case 'red': return '🔴';
            case 'yellow': return '🟡';
            case 'blue': return '🔵';
            case 'green': return '🟢';
            default: return '❓';
        }
    }

    aiTakeTurn(color, dice) {
  const pawns = this.pawns.filter(p => p.data.get('color') === color);

  // Filtering out pieces that have reached the end of the line
  const activePawns = pawns.filter(p => p.data.get('finalIndex') < this.finalPath[color].length - 1);

  // priority (no take-off and dice >= 5)
  for (let pawn of activePawns) {
  if (
    (!pawn.data.get('inPath') && dice >= 5) ||  // Take-off
    (pawn.data.get('inPath') && pawn.data.get('pathIndex') === -1) // Taxi
  ) {
      const [sy, sx] = this.startPoints[color];
      pawn.setPosition(
        this.boardOffsetX + sx * this.gridSize + this.gridSize / 2,
        this.boardOffsetY + sy * this.gridSize + this.gridSize / 2
      );
      pawn.setData('inPath', true);
      pawn.setData('pathIndex', -1);
      this.logEvent(`🚀 🤖 ${this.getColorEmoji(color)} ${color}pawn #${pawn.data.get('id')} takes off`);

      // extra roll
      if (dice === 6) {
        this.extraSteps = Phaser.Math.Between(1, 6);
        this.diceText.setText('🎲 ' + this.extraSteps + '(extra roll)）');
        this.logEvent(`🎲 Extra roll is ${this.extraSteps} `);
        this.time.delayedCall(300, () => this.movePawn(pawn, this.extraSteps));
      } else {
        this.endTurn();
      }
      return;
    }
  }

  // Main path
  for (let pawn of activePawns) {
    if (pawn.data.get('inPath') && pawn.data.get('pathIndex') >= 0) {
      this.logEvent(`🤖 ${this.getColorEmoji(color)} ${color}pawn #${pawn.data.get('id')} moves ${dice} steps`);
      this.movePawn(pawn, dice);
      return;
    }
  }

  // On the final stretch but not yet finished
  for (let pawn of activePawns) {
    if (pawn.data.get('finalIndex') >= 0 && pawn.data.get('finalIndex') < this.finalPath[color].length - 1) {
      this.logEvent(`🤖 ${this.getColorEmoji(color)} ${color}pawn #${pawn.data.get('id')} advances ${dice} steps`);
      this.movePawn(pawn, dice);
      return;
    }
  }

  // no moveable pawns
  this.logEvent(`🤖 ${this.getColorEmoji(color)} ${color}has no movable pawns, skipping turn`);
  this.endTurn();
    }
    
    handlePostMove() {
        if (this.awaitingExtraRoll) {
            this.awaitingExtraRoll = false;
            this.time.delayedCall(300, () => this.rollDice(), [], this);
        } else {
            this.time.delayedCall(400, () => this.endTurn(), [], this);
        }
    }

    checkCollisionsAt(pathIndex, movingPawn) {
    const color = movingPawn.data.get('color');
    const pos = this.path[pathIndex];

    // get all pawns at the same position
    const others = this.pawns.filter(p => {
        const pIndex = p.data.get('pathIndex');
        return (
        pIndex === pathIndex &&
        p !== movingPawn &&
        p.data.get('finalIndex') < this.finalPath[p.data.get('color')].length - 1
        );
    });

    const allies = others.filter(p => p.data.get('color') === color);
    const enemies = others.filter(p => p.data.get('color') !== color);

    // Only allies: stacking is allowed
    if (enemies.length === 0) return;

    // Only 1 enemy → knock it back to base
    if (enemies.length === 1) {
        const enemy = enemies[0];
        this.sendToBase(enemy);
        this.logEvent(`💥 ${this.getColorEmoji(color)} ${color}pawn #${movingPawn.data.get('id')} knocks back enemy pawn #${enemy.data.get('id')}`);
        return;
    }

    // Multiple enemies (stacking ≥ 2) → send all enemies back to base, keep own pawn
    if (enemies.length >= 2) {
        enemies.forEach(e => this.sendToBase(e));
        this.logEvent(`💥 ${this.getColorEmoji(color)} ${color}pawn #${movingPawn.data.get('id')} destroys enemy stack（${enemies.length} pawns）`);
  }
    }

    sendToBase(pawn) {
    const color = pawn.data.get('color');
    const id = pawn.data.get('id');
    const [y, x] = this.spawnPoints[color][id];

    pawn.setPosition(
        this.boardOffsetX + x * this.gridSize + this.gridSize / 2,
        this.boardOffsetY + y * this.gridSize + this.gridSize / 2
    );

    pawn.setData('pathIndex', -1);
    pawn.setData('inPath', false);
    pawn.setData('finalIndex', -1);
    }

    checkVictory(color) {
    const finished = this.pawns.filter(p => 
        p.data.get('color') === color && 
        p.data.get('finalIndex') === this.finalPath[color].length - 1
    );
    if (finished.length >= 4) {
        this.logEvent(`🏆 ${this.getColorEmoji(color)} ${color}wins the game!`);
        this.sound.play('win'); // win sound
        this.time.delayedCall(1000, () => {
        this.scene.start('GameOverScene', {
            winnerColor: color,
            roundCount: this.roundCount,
            mode: this.gameMode,
            playerColor: this.playerColor
        });
        });
    }
    }

    //  debug
    // roll the dice
    createDebugButtons() {
  this.add.text(705, 490, '🎲 Roll Dice', { fontSize: '16px', fill: '#000' })
    .setInteractive()
    .on('pointerdown', () => {
      if (this.currentPlayerColor === this.playerColor && !this.awaitingSelection && this.extraSteps === null) {
        this.rollDice();
      }
    });
    // next turn
  this.add.text(705, 520, '➡️ Next Turn', { fontSize: '14px', fill: '#000' })
    .setInteractive()
    .on('pointerdown', () => this.endTurn());
    // force player turn
  this.add.text(705, 550, '🔁 Force Player Turn', { fontSize: '14px', fill: '#000' })
    .setInteractive()
    .on('pointerdown', () => {
      this.currentTurnIndex = 0;
      this.currentPlayerColor = 'red';
      this.logEvent('🛠️  Forced switch to 🔴 Red(Player)');
    });
    // force player turn with 6
  this.add.text(705, 580, '🎯 force player turn with 6', { fontSize: '14px', fill: '#000' })
    .setInteractive()
    .on('pointerdown', () => {
      this.currentTurnIndex = 0;
      this.currentPlayerColor = 'red';
      this.logEvent('🛠️ Forced switch to 🔴 Red + Set to 6');
      this.rollDice(6);
    });
    }

}

window.PlayScene = PlayScene;
