
const version = require('./version')
const fs = require('fs')
const path = './public/version.json'
const content = JSON.stringify({version})

fs.writeFile(path, content, 'utf8', function (errw) {
    if (errw) {
        console.log('ERROR', errw)
    } else {
        console.log('Version json DONE!')
    }
})
