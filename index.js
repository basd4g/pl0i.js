"use strict";
// const str:string = "hello,world!"
// console.log(str)
var fs = require('fs');
var PL0 = /** @class */ (function () {
    function PL0(str) {
        this.str = str;
    }
    PL0.prototype.print = function () {
        console.log(this.str);
    };
    return PL0;
}());
var main = function () {
    if (process.argv.length < 3) {
        return -1;
    }
    var str = fs.readFileSync(process.argv[2], { encoding: "utf-8" });
    var pl0 = new PL0(str);
    pl0.print();
    return 0;
};
main();
