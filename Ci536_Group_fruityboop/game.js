document.addEventListener('DOMContentLoaded', () => 
{
    const gridDisplay = document.querySelector('.grid');
    const scoreDisplay = document.querySelector('.score');
    
    const resetButton = document.querySelector('#reset');
    const popup = document.querySelector('.gameover-popup');
    const popupMessage = document.querySelector('#popup-message');
    const restartButton = document.querySelector('#restart');

    const boardWidth = 4;
    let squares = [];
    let score = 0;
    
    var popSound;

    //assets
    const fruitImages = 
    {
        2: 'assets/Blueberry.png',
        4: 'assets/Grape.png',
        8: 'assets/Strawberry.png',
        16: 'assets/Cherry.png',
        32: 'assets/Orange.png',
        64: 'assets/Peach.png',
        128: 'assets/Mango.png',
        256: 'assets/Coconut.png',
        512: 'assets/Watermelon.png',
        1024: 'assets/Pineapple.png',
        2048: 'assets/Dragonfruit.png'
    }


   function resetGame() 
    {
    //reset game state
    score = 0;
    scoreDisplay.textContent = score;
    
    
    //clear squares
    squares.forEach(square => {
        square.setAttribute('data-value', 0);
    });

    hidePopup();
    
    //restart game
    setAssets();
    generate();
    document.addEventListener('keydown', control);
    }


    resetButton.addEventListener('click', resetGame);


    // make board
  function createBoard() 
{
    gridDisplay.innerHTML = '';

        for (let i = 0; i < boardWidth * boardWidth; i++) 
        {
            const square = document.createElement('div');
            square.setAttribute('data-value', 0);
            gridDisplay.appendChild(square);
            
            squares.push(square);
        }
        setAssets();
}
    


    //generate 
   function generate() 
   {

    const emptyCells = squares.filter(square => 
        parseInt(square.getAttribute('data-value')) === 0
    );

     if (emptyCells.length === 0)
        {
            gameOver();
            return;
        } 


        const randIndex = Math.floor(Math.random() * squares.length);
        if (parseInt(squares[randIndex].getAttribute('data-value')) === 0) 
            {
            squares[randIndex].setAttribute('data-value', 2);
            setAssets();
            } 
        else 
        {
            generate();
        }
        gameOver();
    }
    
   


    // gameover
function gameOver() 
{
   
   //win 
    for (let i = 0; i < squares.length; i++) 
        {
            if (parseInt(squares[i].getAttribute('data-value')) === 2048) 
            {
                showPopup('Congrats You Win!');
                return;
            }
    }

    //lose
    if (!canMove()) 
    {
        showPopup('Game Over!');
        console.log('gameover2');
    }
}

function canMove() 
{
    //check for empty cells first
    if (squares.some(square => parseInt(square.getAttribute('data-value')) === 0)) 
    {
        return true;
    }

    //check if it can merge
    for (let i = 0; i < 4; i++) 
    {
        for (let j = 0; j < 4; j++) 
        {
            const current = parseInt(squares[i * 4 + j].getAttribute('data-value'));
            
            //check right 
            if (j < 3 && current === parseInt(squares[i * 4 + (j + 1)].getAttribute('data-value'))) 
            {
                return true;
            }
            
            //check bottom 
            if (i < 3 && current === parseInt(squares[(i + 1) * 4 + j].getAttribute('data-value'))) 
            {
                return true;
            }
        }
    }
    return false;
}

    //Taken from W3 schools function for making sound
function sound(src) 
{
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.play = function(){
        this.sound.play();
    }
    this.stop = function(){
        this.sound.pause();
    }
}


    
   //set assets
   function setAssets() 
   {
        for (let i = 0; i < squares.length; i++) 
        {
            const value = parseInt(squares[i].getAttribute('data-value'));
            if (value === 0) 
            {
                squares[i].innerHTML = '';
            } 
            else if (fruitImages[value]) 
            {
                squares[i].innerHTML = `<img src="${fruitImages[value]}" alt="${value}" style="width: 100%; height: 100%;">`;
            } 
            else 
            {
                squares[i].innerHTML = value;
            }
        }

        popSound = new sound("assets/pop.mp3");
    }

   function move(direction) 
   {
    for (let i = 0; i < 4; i++) 
    {
        const line = [];
        //read line based on direction
        for (let j = 0; j < 4; j++) 
        {
            let index;
            if (direction === 'left') index = i * 4 + j;
            if (direction === 'right') index = i * 4 + (3 - j);
            if (direction === 'up') index = j * 4 + i;
            if (direction === 'down') index = (3 - j) * 4 + i;
            line.push(parseInt(squares[index].getAttribute('data-value')));
        }

        let filtered = line.filter(num => num !== 0);
        let missing = 4 - filtered.length;
        let zeros = Array(missing).fill(0);
        let newLine = filtered.concat(zeros); 
      
        for (let j = 0; j < 4; j++) {
        let index;
        if (direction === 'left') index = i * 4 + j;
        if (direction === 'right') index = i * 4 + (3 - j);
        if (direction === 'up') index = j * 4 + i;
        if (direction === 'down') index = (3 - j) * 4 + i;
        squares[index].setAttribute('data-value', newLine[j]);
        }
  }
}


function combine(direction) 
{
        for (let i = 0; i < 4; i++) 
            {
                for (let j = 0; j < 3; j++) 
                    {
                        let currentIdx, nextIdx;
                        if (direction === 'left') 
                        {
                            currentIdx = i * 4 + j;
                            nextIdx = currentIdx + 1;
                        } 
                        else if (direction === 'right') 
                        {
                            currentIdx = i * 4 + (3 - j);
                            nextIdx = currentIdx - 1;
                        } 
                        else if 
                        (direction === 'up')
                        {
                            currentIdx = j * 4 + i;
                            nextIdx = currentIdx + 4;
                        } 
                        else if (direction === 'down') 
                        {
                            currentIdx = (3 - j) * 4 + i;
                            nextIdx = currentIdx - 4;
                        }

                        let current = parseInt(squares[currentIdx].getAttribute('data-value'));
                        let next = parseInt(squares[nextIdx].getAttribute('data-value'));

                        if (current === next && current !== 0) 
                        {
                            const combined = current + next;
                            squares[currentIdx].setAttribute('data-value', combined);
                            squares[nextIdx].setAttribute('data-value', 0);
                            score += combined;
                            scoreDisplay.textContent = score;
                            popSound.play();
                        }
                    }
            }
}


// popup
function showPopup(message) 
  {
        popupMessage.textContent = message;
        document.getElementById('final-score').textContent = 'Score: ' + score;
        popup.classList.add('active');
    
        document.removeEventListener('keydown', control);
    }



function hidePopup() 
{
    popup.classList.remove('active');
}

restartButton.addEventListener('click', () => 
{
    hidePopup();
    resetGame();
});

    //keys
    function control(e) 
    {
        if (e.key === 'ArrowLeft') keyHandler('left');
        else if (e.key === 'ArrowRight') keyHandler('right');
        else if (e.key === 'ArrowUp') keyHandler('up');
        else if (e.key === 'ArrowDown') keyHandler('down');
    }

    document.addEventListener('keydown', control);

     function keyHandler(direction) {
        move(direction);
        combine(direction);
        move(direction);
        generate();
        setAssets();
        scoreDisplay.textContent = score;
    }

    createBoard();
    generate();
}
)
