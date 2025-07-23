const express = require('express')
const send = require('send')
const app = express()

app.get('/',function(req,res){
    res.send('hii')
})

app.get("/next",function(req,res){
    res.send('this is next')
})


app.listen(3000)