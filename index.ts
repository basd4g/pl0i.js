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

class convertOpecode{
    static string2opecode(opecodeString:string):Opecode{
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
                console.log("Error, invalid opecode.")
                process.exit(1)
        }
    }
    static opecode2string(opecode:Opecode):string{
        switch(opecode){
            case Opecode.LIT:
                return "LIT"
            case Opecode.OPR:
                return "OPR"
            case Opecode.LOD:
                return "LOD"
            case Opecode.STO:
                return "STO"
            case Opecode.CAL:
                return "CAL"
            case Opecode.INT:
                return "INT"
            case Opecode.JMP:
                return "JMP"
            case Opecode.JPC:
                return "JPC"
            case Opecode.CSP:
                return "CSP"
            case Opecode.LAB:
                return "LAB"
            case Opecode.BAD:
                return "BAD"
            case Opecode.RET:
                return "RET"
            default:
                console.log("Error, invalid opecode.")
                process.exit(1)
        }
    }
}

class PL0 {
    str: string
    code: Line[] = []
    constructor(str:string){
        const strs:string[] = str.split('\n')
        strs.forEach((str)=>{
            const splitedStr:string[] = str .replace('(', ',')
                                            .replace(')', ',')
                                            .replace(/ /g, '')
                                            .split(",")
            const opecode:Opecode = convertOpecode.string2opecode(splitedStr[1])
            const l:number = parseInt(splitedStr[2])
            const a:number = parseInt(splitedStr[3])
            this.code.push({opecode,l,a})
        })
    }
    print(){
        this.code.forEach((line)=>{
            console.log(`( ${convertOpecode.opecode2string(line.opecode)},${('    '+line.l).slice(-4)}, ${('    '+line.a).slice(-4)} )`)
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
    pl0.print()

    return 0
}

main()