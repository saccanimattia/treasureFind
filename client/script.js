const axios = require('axios');
const team = "bs";
const password = "tito12";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const registrazione = async(team, password) =>{
    

    const url = `http://10.131.0.14:8080/signup?team=${team}&password=${password}`;
    
    const res = await axios.get(url);
    
}

const scavo = async(x, y) =>{

    const url = `http://10.131.0.14:8080/dig?team=${team}&password=${password}&x=${x}&y=${y}`;
    
    try{
        console.log("scava")
        const res = await axios.get(url);
        console.log("x: " + y + " | y: " + x + " = " + res.data.message);
        return res.data.code
    }catch(err){
        console.log(err.data)
        return err.data;
    }  

    

}

const mappa = async() =>{

    const url = `http://10.131.0.14:8080/map`;
    
    const res = await axios.get(url);
   
    return res.data;
}

const scavare = async(altezza, larghezza) =>{

    
    const x = Math.floor (Math.random ( ) * (altezza));
    const y = Math.floor (Math.random ( ) * (larghezza));

    const xTesoro = x;
    const yTesoro = y;
    
    var res = "";
    
    const map = await mappa();
    
    if(map[y][x].dug == false){
        console.log(map[y][x])

        res = await scavo(x, y);
        await sleep(2000);
    }
    
    if(res == "VERY_CLOSE"){
        await scavaVicino(xTesoro, yTesoro, altezza, larghezza)
    }

    scavare(altezza, larghezza);
    
}

const scavaVicino = async(xTesoro, yTesoro, altezza, larghezza) =>{

    const quadrato1 = [-1, -1, 0, -1, 1, -1, 1, 0, 1, 1, 0, 1, -1, 1, -1, 0];
    const quadrato2 = [-2, -2, -1, -2, 0, -2, 1, -2, 2, -2, 2, -1, 2, 0, 2, 1, 2, 2, 1, 2, 0, 2, -1, 2, -2, 2, -2, 1, -2, 0, -2, -1];
    var r;
    var map;
    var x;
    var y;

    
    
    for(let i=0; i<quadrato1.length && r != "TREASURE_FOUND"; i+=2){
        map = await mappa();
        x = xTesoro+quadrato1[i];
        y = yTesoro+quadrato1[i+1];
       

        if(map[y][x].dug == false && y<altezza && x<larghezza &&  y>=0 && x>=0){
            console.log(map[y][x])
            r = await scavo(x, y);
            await sleep(2000);

        }
        
         
    }
    
    for(let i=0; i<quadrato2.length && r != "TREASURE_FOUND"; i+=2){
        map = await mappa();
        x = xTesoro+quadrato2[i];
        y = yTesoro+quadrato2[i+1];
        

        if(map[y][x].dug == false && y<altezza && x<larghezza &&  y>=0 && x>=0){
            console.log(map[y][x])
            r = await scavo(x, y);
            await sleep(2000);

        }
    }
        
    
        


}


const main = async() =>{

    

   
    //await registrazione(team, password);
    const map = await mappa();

    const altezza = map.length;
    const larghezza = map[0].length;

    


    
    scavare(altezza, larghezza);

}

main()