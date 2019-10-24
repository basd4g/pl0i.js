"use strict"

// const str:string = "hello,world!"
// console.log(str)

const fs = require('fs');

class PL0 {
    str: string;
    constructor(str:string){
        this.str = str
    }
    print(){
        console.log(this.str)
    }
}

const main = ()=>{
    if(process.argv.length <3){
        return -1
    }
    const str:string = fs.readFileSync(process.argv[2], {encoding: "utf-8"});

    const pl0 = new PL0(str)
    pl0.print()

    return 0
}

main()