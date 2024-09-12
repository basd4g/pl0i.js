"use strict"

import { type } from "os";
import { isAbsolute } from "path";
import { runInThisContext } from "vm";
const STACK_SIZE = 500

const readlineSync = require('readline-sync');
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
    WRITE,
    BREAK_LINE
}
interface Instruction {
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
    s:number[] = []
    p:number // p // program counter
    t:number // t // top of stack
    b:number // b // pointer to stack
    code: Instruction[] = []
    constructor(str:string){
        // コードを文字列から型:Instruction[]に変換
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

        // stackを初期化
        for(let i=0;i<STACK_SIZE;i++){
            this.s.push(0)
        }
    }
    print(){
        this.code.forEach((line)=>{
            console.log(`( ${convertOpecode.opecode2string(line.opecode)}(${line.opecode}),${('    '+line.l).slice(-4)}, ${('    '+line.a).slice(-4)} )`)
        })
    }
    run(){
        let isFirst:boolean = true
        const lIsNotZero = (l:number)=>{
            if(l!==0) console.log(`Caution: l is not Zero`)/*process.exit(1)*/}
        let i: Instruction | undefined
        this.t = 0
        this.b = 1
        this.p = 0
        this.s[1] = 0 // static link
        this.s[2] = 0 // dynamic link
        this.s[3] = 0 // ret. addr. of main
        while(this.p>=0 ||isFirst){
            isFirst = false
            i = this.code[this.p++]
            this.debugPrintRegister(i)

            switch(i.opecode){
                case Opecode.LIT: // 定数aをメモリから読み込み, スタックにpushする(l=0)
                    lIsNotZero(i.l)
                    this.s[++this.t] = i.a
                    break
                case Opecode.OPR: // 演算する (l=0)
                    lIsNotZero(i.l)
                    switch(i.a){
                        case ArithmeticOperand.RETURN:
//                            this.t = this.b - 1
//                            this.p = this.s[this.t+3]
//                            this.b = this.s[this.t+2]
                            return
                            break
                        case ArithmeticOperand.SUBSTITUTE:
                            this.t -=1
                            this.s[this.t] = this.s[this.t] - this.s[this.t+1]
                            break
                        case ArithmeticOperand.MULTIPLE:
                            this.t -=1
                            this.s[this.t] = this.s[this.t] * this.s[this.t+1]
                            break
                        case ArithmeticOperand.LESS_THAN:
                            this.t -=1
                            this.s[this.t] = this.s[this.t] <= this.s[this.t+1] ? 1:0
                            break

                        // 未実装
                        default:
                            break

                    }
                    break
                case Opecode.LOD: // レベル差l, オフセットaの変数の値をメモリから読み込み,スタックにpushする
                    this.s[++this.t] = this.s[ this.base(i.l) + i.a ]
                    break
                case Opecode.STO: // スタックのトップにある値をpopして,レベル差l, オフセットaのメモリ位置に格納する.
                    this.s[ this.base(i.l) + i.a ] = this.s[this.t--]
                    break
                case Opecode.CAL: // レベル差がl, コードの先頭番地がaの手続きを呼び出す
                    this.s[this.t+1] = this.base(i.l) // static link
                    this.s[this.t+2] = this.b // dynamic link
                    this.s[this.t+3] = this.p // ret. addr.
                    this.b = this.t + 1
                    this.p = i.a
                    this.jump2label(i)
                    break
                case Opecode.INT: // スタック上に必要なメモリをaだけ確保する (l=0)
                    lIsNotZero(i.l)
                    this.t += i.a
                    break
                case Opecode.JMP: // a番地へ飛ぶ(l=0)
                    lIsNotZero(i.l)
                    this.jump2label(i)
                    break
                case Opecode.JPC: // スタックトップをpopし、その値が0(偽)ならa番地へ飛ぶ(l=0)
                    lIsNotZero(i.l)
                    if(this.s[this.t--]===0){
                        this.jump2label(i)
                    }
                    // 未実装
                    break
                case Opecode.CSP: // aで指定した標準手続きを呼び出す(l=0) (本来のPL0にない)
                    lIsNotZero(i.l)
                    if(i.a===InterfaceOperand.READ){
                        const inputedNumber = parseInt(readlineSync.question(''))
                        if(isNaN(inputedNumber)){
                            console.log("Error: Need number")
                            process.exit(1)
                        }
                        this.s[++this.t] = inputedNumber
                    }else if(i.a===InterfaceOperand.WRITE){
                        console.log(this.s[this.t--])
                    }else if(i.a===InterfaceOperand.BREAK_LINE){
                        console.log("")
                    }else {
                        console.log(`Error: unknown operand'${i.a}' of CSP`)
                    }
                    break
                case Opecode.LAB: // aというラベルを建てる(l=0) (本来のPL0にない)
                    lIsNotZero(i.l)
                    // 未実装
                    break
                case Opecode.BAD:
                    break
                case Opecode.RET: // aは引数の個数を表す a個の引数を持って呼び出されて、呼び出し元に戻る際に返り血を呼び出し元のスタックトップにpushする(l=0)
                    lIsNotZero(i.l)
                    const tmp = this.s[this.t]
                    this.t = this.b - 1
                    this.p = this.s[this.t+3]
                    this.b = this.s[this.t+2]
                    this.t -= i.a
                    this.s[++this.t] = tmp
                    // 未実装
                    break
            }
 
        }
    }
    private base(l:number):number{
        let b:number = this.b
        while (l>0){
            b = this.s[b]
            l--
        }
        return b

    }
    private jump2label(i:Instruction){
        const findedIdx = this.code.findIndex((ist)=>{return ist.opecode===Opecode.LAB && ist.a===i.a})
        if(findedIdx===-1){
            console.log(`Error LAB ${i.a} is undefined`)
            process.exit(1)
        }
        this.p = findedIdx
    }

    private debugPrintRegister(ist:Instruction){
        //debug
        console.log(`t:${this.t}, b:${this.b},p:${this.p} ,i:(${convertOpecode.opecode2string(ist.opecode)}, ${ist.l}, ${ist.a})`)
        let str = '['
        for(let i=0;i<= this.t;i++){
            if(i!==0) str += ','
                str += this.s[i]
        }
       str += ']'
       console.log(str)

       if(readlineSync.question('continue...enter:' )!==""){
           process.exit(0)
       }
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

    pl0.run()
    return 0
}

main()