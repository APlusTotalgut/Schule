document.addEventListener('DOMContentLoaded' ,() => {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const cols = 7;
    const rows = 6;
    const cellSize = 100;
    const width = cols  * cellSize;
    const height =  rows * cellSize;
    const linewidth = 3;
    canvas.height = height + rows;
    canvas.width = width + cols;
    const verschiebung = linewidth / 2;
    let winner = null;

    const reset = document.getElementById('resetButton');
    const scores = {
        0 : 0,
        1 : 0
    }

    const colors = {
        0 : 'green',
        1 : 'blue',
    }
    const firstPlayer = document.getElementById("player0");
    const secondPlayer = document.getElementById("player1");

    let treffer = [];

    firstPlayer.style.color = colors[0];
    secondPlayer.style.color = colors[1];
    let player = 0;
    let gameStand = {};

    function draw(){
        ctx.strokeStyle = '#555'
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.beginPath();
        ctx.lineWidth = linewidth;
        for (let col = 0; col < cols; col++){
            for (let row = 0; row < rows; row++){
                ctx.rect(cellSize * col + verschiebung,cellSize * row + verschiebung, cellSize, cellSize)
                ctx.stroke();
            }
        }

        Object.entries(gameStand).forEach(([col, colScheiben]) => {
            Object.values(colScheiben).forEach((scheibe) => {
                scheibe.set();
            });
        });

        if (winner){
            drawRounded();
            // console.log('drawROunded');
        }
        // console.log('request');
        // console.log(gameStand)
        requestAnimationFrame(draw)
    }
    function click(e){
        if (winner) return;
        let rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const col = Math.floor(x/cellSize)
        const row = Math.floor(y/cellSize);
        if (gameStand[col]?.length >= rows) return;


        if (gameStand[col] == undefined){
            gameStand[col] = [];
        }

        if (col >= cols) return;

        const position = rows - (gameStand[col].length + 1);
        const scheibeX = col * cellSize + cellSize / 2 + verschiebung;
        const scheibeY = position * cellSize + cellSize / 2 + verschiebung;
        const scheibeRadius = cellSize / 2 * 0.9;
        
        gameStand[col].push(new Scheibe(ctx, scheibeX, scheibeY, scheibeRadius, colors[player]));
        player = player == 0 ? 1 : 0;
        // console.log(gameStand);
        treffer = checkIfEnded(gameStand);
    }

    function checkIfEnded(gameStand){
        let objectCount = 0;
        let winConfig=[];
        Object.entries(gameStand).forEach(([col, colScheiben]) => {
            if (winner) return;
            Object.entries(colScheiben).forEach(([row, scheibe]) => {
                objectCount++;
                if (winner) return;
                // Nach oben
                const horizontTreffer = [];
                const verticalTreffer = [];
                const schraegeTrefferRechts = [];
                const schraegeTrefferLinks = [];
                const currentColor = scheibe.color;
                row = parseInt(row);
                col = parseInt(col);

                // gehe bis zu 3 nach oben
                horizontTreffer.push(scheibe);
                for (let h = row + 1; h <= row + 3; h++){
                    if (colScheiben[h] !== undefined && colScheiben[h].color == currentColor){
                        horizontTreffer.push(colScheiben[h]);
                    }else{
                        break;
                    }
                }
                if (horizontTreffer.length >= 4){
                    win(currentColor);
                    winConfig = horizontTreffer;
                }
                // gehe bis zu 3 nach rechts
                verticalTreffer.push(scheibe);
                for (let w = col + 1; w <= col + 3; w++){
                    const target = gameStand[w]?.[row];
                    if (target !== undefined && target.color == currentColor){
                        verticalTreffer.push(target);
                    }else{
                        break;
                    }
                }
                if (verticalTreffer.length >= 4){
                    win(currentColor);
                    winConfig=verticalTreffer;
                }
                // gehe schräg rechts hoch | i steht für increasement

                schraegeTrefferRechts.push(scheibe);
                for (let i = 1; i <= 3; i++){
                    const newCol = col + i;
                    const newRow = row + i;
                    const target = gameStand[newCol]?.[newRow];
                    if (target !== undefined && target.color == currentColor){
                        schraegeTrefferRechts.push(target);
                    }else{
                        break;
                    }
                }
                if (schraegeTrefferRechts.length >= 4){
                    win(currentColor);
                    winConfig=schraegeTrefferRechts;
                } 

                // gehe schräg links hoch | i steht für increasement bzw. decreasement
                schraegeTrefferLinks.push(scheibe);
                for (let i = 1; i <= 3; i++){
                    const newCol = col + i;
                    const newRow = row - i;
                    const target = gameStand[newCol]?.[newRow];
                    if (target !== undefined && target.color == currentColor){
                        schraegeTrefferLinks.push(target);
                    }else{
                        break;
                    }
                }
                if (schraegeTrefferLinks.length >= 4){
                    win(currentColor);
                    winConfig=schraegeTrefferLinks;
                } 
            });
        });
       
        if (objectCount >= rows * cols){
            unentschieden();
        }
        return winConfig;
    }

    function unentschieden(){
        winner = 'grey';
        const winnerP = document.getElementById('winner');
        winnerP.innerHTML = "unentschieden. Niedmand hat gewonnen!"  
        winnerP.style.color = 'grey';   
        winnerP.style.visibility = 'visible';    
        reset.style.display = 'block';
    }

    function win(currentColor){
        winner = currentColor;
        const winnerP = document.getElementById('winner');
        winnerP.innerHTML = "'" + currentColor + "'" + ' hat gewonnen!'  
        winnerP.style.color = currentColor;   
        winnerP.style.visibility = 'visible';    
        reset.style.display = 'block';
        
        const playerNumber = Object.keys(colors).find(k => colors[k] === currentColor);
        scores[playerNumber]++;
        // console.log(scores);
        document.getElementById('player' + playerNumber).innerHTML = scores[playerNumber];
    }

    function drawRounded(){
        //calculate the length of the rectangle from the distance of the first and last treffer
        first = treffer[0];
        last = treffer[treffer.length - 1];
        length = Math.sqrt((last.x - first.x) ** 2 + (last.y - first.y) ** 2);

        //calculate the angle of rotation with arcsin
        console.log(first,last);
        angle = Math.asin((last.y-first.y)/length);
        console.log(last.y,first.y,length,angle);

        ctx.save(); // Save the current canvas state
        
        // Translate to the center of the first scheibe
        ctx.translate(first.x, first.y);
        ctx.rotate(angle);
        
        ctx.beginPath();
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 5;
        
        r = first.radius;

        // Draw rectangle centered at origin (0,0) after translation
        ctx.roundRect(-r,-r,length + r*2,r*2,r);
        console.log(-r, -r, length + r*2, r * 2, r);
        ctx.stroke();

        //Translate back and rotate back
        ctx.restore(); // Restore the canvas state
    }

    reset.addEventListener('click', () => {
        if (!winner) return;
        winner = null;
        gameStand = {};
        player = 0;

        const winnerP = document.getElementById('winner');
        winnerP.style.visibility = 'hidden';  
        winnerP.innerHTML = "Kein Gewinner da!";
        winnerP.style.color = 'black';
        reset.style.display = 'none';
    })

    canvas.addEventListener('click', click);
    draw();
});
