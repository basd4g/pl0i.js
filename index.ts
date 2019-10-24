"use strict"

import { type } from "os";

// const str:string = "hello,world!"
// console.log(str)
enum Opecode{
    LIT,
    OPR,
    LOD,
    STO,
    CAL,
    INT,
    JMP,
    JPC,
    CSP,
    LAB,
    BAD,
    RET
}
// "LIT"|"OPR"|"LOD"|"STO"|"CAL"|"INT"|"JMP"|"JPC"|"CSP"|"LAB"|"BAD"|"RET"
enum ArithmeticOperand { // CSP
    RETURN,
    NEGATIVE,
    ADD,
    SUBSTITUTE,
    MULTIPLE,
    DEVIDE,
    ODD, //%=2
    DUMMY,
    EQUAL,
    NOT_EQUAL,
    LESS_THAN,
    GREATER_THAN_OR_EQUAL,
    GREATER_THAN,
    LESS_THAN_OR_EQUAL 
} 
enum InterfaceOperand { // OPR
    READ,
    BREAK_LINE,
    WRITE
}
interface Line {
    opecode:Opecode,
    l:number,
    a:number
}

const fs = require('fs');

class PL0 {
    str: string
    code: Line[] = []
    constructor(str:string){
        this.str = str
    }
    constructCode():void{
        const strs:string[] = this.str.split('\n')
        const returnOpecode = (opecodeString:string):Opecode=>{
            switch(opecodeString){
                case "LIT":
                    return Opecode.LIT
                case "OPR":
                    return Opecode.OPR
                case "LOD":
                    return Opecode.LOD
                case "STO":
                    return Opecode.STO
                case "CAL":
                    return Opecode.CAL
                case "INT":
                    return Opecode.INT
                case "JMP":
                    return Opecode.JMP
                case "JPC":
                    return Opecode.JPC
                case "CSP":
                    return Opecode.CSP
                case "LAB":
                    return Opecode.LAB
                case "BAD":
                    return Opecode.BAD
                case "RET":
                    return Opecode.RET
                default:
                    console.log("Error, read file is incorrect syntax.")
                    process.exit(1)
            }
        }
        
        strs.forEach((str)=>{
            const splitedStr:string[] = str .replace('(', ',')
                                            .replace(')', ',')
                                            .replace(/ /g, '')
                                            .split(",")
            const opecode:Opecode = returnOpecode(splitedStr[1])
            const l:number = parseInt(splitedStr[2])
            const a:number = parseInt(splitedStr[3])
            this.code.push({opecode,l,a})
        })
    }
    print(){
        console.log(this.str)
    }
    printCode(){
        this.code.forEach((line)=>{
            console.log(`(${line.opecode},${line.l},${line.a})`)
        })
    }
}

const main = ()=>{
    if(process.argv.length <3){
        console.log("need command line argument of file name\n")
        return -1
    }
    const str:string = fs.readFileSync(process.argv[2], {encoding: "utf-8"});

    const pl0 = new PL0(str)
    pl0.constructCode()
//    pl0.print()
    pl0.printCode()

    return 0
}

main()