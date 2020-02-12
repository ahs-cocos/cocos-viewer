
const fs = require('fs')

const src = 'build/index.html'
const target = 'build/index.php'
fs.rename(src, target, function (errw) {
    if (errw) {
        console.log('ERROR', errw)
    } else {
        console.log('File rename successfull! ' + src  + ' >> ' + target)
    }
})