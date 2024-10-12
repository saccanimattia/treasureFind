const express = require("express")

const app = express()


app.use("/public" , express.static("./public"))

const dimensione = 10;

let users = [];

const map = [];

const veryCloseMap = [];

const mapDistances = [
    {code : "VERY_CLOSE", mess : "the treasure is very close!", distance : dimensione/10},
    {code : "CLOSE", mess : "the treasure is  close!", distance : dimensione/5},
    {code : "FAR_AWAY", mess : "the treasure is far away!", distance : dimensione}
]


app.get("/signup", (req, res) =>{
    const team = req.query.team
    const password = req.query.password
    var i = isPresente(team)
    if(team && i==-1){
        team.toLowerCase
        password.toLowerCase
        users.push({t : team, p : password, punti : 0, lastDigTime : new Date().getTime()})
        res.send("utente registrato ");
    } else{
        res.send("utente già presente").status(401);
    }
})

app.get("/leaderboard", (req, res) =>{
    users.sort((a,b) => a.punti - b.punti)
    var classifica = "";
    for(let i=0; i<users.length; i++){
        classifica += (i+1) + " " + users[i].t + " punti : " + users[i].punti + "  ";
    }
    res.send(classifica)
})

app.get("/map", (req, res) =>{
    const mapWithoutAttributes = JSON.parse(JSON.stringify(map));

   
    mapWithoutAttributes.forEach(row => {
        row.forEach(cell => {
            removeAttributes(cell);
        });
    });

    res.send(mapWithoutAttributes);
})

const removeAttributes = (obj) => {
    for (const key in obj) {
        if (key === 'code' || key === 'mess' || key === 'treasure') {
            delete obj[key];
        } else if (key === 'dug' && obj[key] === false && 'hint' in obj) {
            delete obj['hint'];
        } else if (typeof obj[key] === 'object') {
            removeAttributes(obj[key]);
        }
    }
};

app.get("/displayMap", (req, res) =>{
    let tableHTML = '<html><head><style>';
    tableHTML += `
        .cell {
            width: 30px;
            height: 30px;
            border: 1px solid black;
            display: inline-block;
            margin: 1px;
        }
        .red {
            background-image: url('/public/terraVerde.jpg');
            background-size: cover;
        }
        .green {
            background-image: url('/public/tesoro.jpg');
            background-size: cover;
        }
        .purple {
            background-image: url('/public/terraScavata.jpg');
            background-size: cover;
        }
    `;
    tableHTML += '</style></head><body>';

    map.forEach(row => {
        tableHTML += '<div>';
        row.forEach(cell => {
            const className = cell.dug ? (cell.treasure ? 'green' : 'purple') : 'red';
            tableHTML += `<div class="cell ${className}"></div>`;
        });
        tableHTML += '</div>';
    });

    tableHTML += '</body></html>';

    res.send(tableHTML);
})




app.get("/", (req, res) =>{
    
    res.status(200);
})


app.get("/dig", (req, res) =>{
    
    var team = req.query.team
    var password = req.query.password
    var x = req.query.x
    var y = req.query.y
    var i = isPresente(team)
    const time = new Date().getTime()

    
    

    if(i=>0 && users[i].p == password.toLowerCase){
        if (time - users[i].lastDigTime < 2000) {
            res.status(429).json({ message: "You are digging too fast. Wait for 2 seconds", code: "TOO_FAST" })
            return
          }
        
        users[i].lastDigTime = time
        if(x<0 || x>dimensione || y<0 || y>dimensione){
            users[i].punti -= 10
            req.send("hai scavato fuori!!")
        }
        else{
            if(map[x][y].dug == true){
                res.status(400).json({ message: "already dug", code: "ALREADY_DUG" })
                users[i].punti -= 10
            }
                
            if(map[x][y].treasure == true){
                res.status(200).json({ message: "You found a TREASURE!", code: "TREASURE_FOUND" })
                hintFix(x,y,0)
                map[x][y].dug = true;
                map[x][y].dugBy = users[i].t
                users[i].punti += 100
            }
                
            else{
                if(map[x][y].hint){
                    res.status(200).json({ message: map[x][y].mess, code: map[x][y].code, hint: map[x][y].hint})
                    map[x][y].dug = true;
                    map[x][y].dugBy = users[i].t
                }
                else{
                    res.status(200).json({ message: map[x][y].mess, code: map[x][y].code })
                    map[x][y].dug = true;
                    map[x][y].dugBy = users[i].t
                }

            }
                

        }
    }
    else{
        res.status(403).json({ error: "errore" });
    }
})






app.listen(8080, ()=>{
    console.log("server running on port 8080")
    createMap();
})

isPresente = (team) =>{
    console.log(users)
    for(let i = 0; i<users.length; i++){
        if(users[i].t == team)
            return i
    }
    return -1
}

createMap = () =>{

    for(let i=0; i<dimensione; i++){
        const row = []
        for(let j=0; j<dimensione; j++){
            row.push({x : i, y : j, dug: false, treasure: false, dugBy: null })
        }
        map.push(row);
    }


    inserisciTesori();
    inserisciIndizi();


}

inserisciTesori = () =>{
    const nTesori = dimensione*2;
    var x =0;
    var y =0;
    for(let i=0; i<nTesori; i++){
         x = Math.floor (Math.random ( ) * (dimensione))
         y = Math.floor (Math.random ( ) * (dimensione))
         console.log(x,y)
        if(map[x][y].treasure === true)
            i--
        else{
            map[x][y].treasure = true
            
            veryClose(x,y,0)
        }
            
    }

    farAway();
    
    
}

veryClose = (x,y,g) =>{

    var i = x - mapDistances[g].distance
    var j = y - mapDistances[g].distance

    var imax = x + mapDistances[g].distance
    var jmax = y + mapDistances[g].distance

    if(i<0)
        i = 0;
    if(j<0)
        j = 0;
    if(imax > dimensione)
        imax = dimensione
    if(jmax > dimensione)
        jmax = dimensione

    for(let ii = i; ii<imax; ii++){
        for(let jj = j; jj<jmax; jj++){
           
            if(map[ii][jj].treasure != true){
                map[ii][jj].code = mapDistances[0].code
                map[ii][jj].mess = mapDistances[0].mess
                veryCloseMap.push(ii)
                veryCloseMap.push(jj)
                close(ii,jj)
            }
        }
    }

    

}

close = (x,y) =>{

    var i = x - mapDistances[0].distance
    var j = y - mapDistances[0].distance

    var imax = x + mapDistances[0].distance
    var jmax = y + mapDistances[0].distance

    if(i<0)
        i = 0;
    if(j<0)
        j = 0;
    if(imax > dimensione)
        imax = dimensione
    if(jmax > dimensione)
        jmax = dimensione

    for(let ii = i; ii<imax; ii++){
        for(let jj = j; jj<jmax; jj++){
            if(map[ii][jj].treasure != true && map[ii][jj].code != "VERY_CLOSE"){
                map[ii][jj].code = mapDistances[1].code
                map[ii][jj].mess = mapDistances[1].mess
                
            }
        }
    }

}

farAway = () =>{
    for(let i = 0; i<dimensione; i++){
        for(let j = 0; j<dimensione; j++){
            if(map[i][j].treasure != true && map[i][j].code==null){
                map[i][j].code = mapDistances[2].code
                map[i][j].mess = mapDistances[2].mess
             
            }
        }
    }
    
}

inserisciIndizi = () =>{
    for(var i = 0; i<dimensione*2; i+=2){
        x = Math.floor (Math.random ( ) * (dimensione))
        y = Math.floor (Math.random ( ) * (dimensione))
        
        if(map[x][y].treasure == false && map[x][y].code != "VERY_CLOSE"){
            map[x][y].hint = veryCloseMap[i] + " " + veryCloseMap[i+1]
            console.log("hint")
            console.log(x + " " + y)
            console.log(veryCloseMap[i] + " " + veryCloseMap[i+1])
        }
            
    }
}

hintFix = (x,y,g) =>{

    var i = x - mapDistances[g].distance
    var j = y - mapDistances[g].distance

    var imax = x + mapDistances[g].distance
    var jmax = y + mapDistances[g].distance

    if(i<0)
        i = 0;
    if(j<0)
        j = 0;
    if(imax > dimensione)
        imax = dimensione
    if(jmax > dimensione)
        jmax = dimensione

    for(let ii = i; ii<imax; ii++){
        for(let jj = j; jj<jmax; jj++){
           
            if(map[ii][jj].hint){
                map[ii][jj].hint += " OLD!!!!!"
                
            }
        }
    }

    

}




