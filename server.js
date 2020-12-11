const { response } = require('express');
const express = require('express');
const { request } = require('http');
const lowdb = require('lowdb');
const Filesync = require('lowdb/adapters/FileSync');
const adapter = new Filesync('database.json');
const database = new lowdb(adapter);
const app = express();
const port = 8000;

app.use(express.static('server'));

app.use((request, response, next) => {
    response.setHeader('Access-Control-Allow-Origin', 'http://192.168.1.14:5501');
    next();
  });

// Function to fetch all products
app.get('/api/products', (request, response) => {
    const data = database.get('products').value();
    response.send(data);
});

// Function to fetch items in cart
app.get('/api/cart', (request, response) => {
    const data = database.get('cart').value();
    response.send(data);
});

// Function to push something in to the cart
app.post('/api/cart', (request, response) => {
    const queryId = Number(request.query.id);
    const product = database.get('products').find({id: queryId}).value();
    const productInCart = database.get('cart').find({id: queryId}).value();
    console.log(productInCart);
    if (product === undefined) {
        response.json({success: false, message: 'Product not in database'}); 
    } else {
        if (productInCart !== undefined) {
            response.json({success: false, message: 'Product already in cart'});
        } else {
            database.get('cart').push(product).write();
            response.json({success: true, message: 'Product added'});
        }  
    } 
});

// Function to remove something from the cart
app.delete('/api/cart', (request, response) => { 
    const queryId = Number(request.query.id); 
    const product = database.get('cart').find({id: queryId}).write();
    console.log(product);
    if (product === undefined) {
        response.json({success: false, message: 'Product not in cart'}); 
    } else {
        database.get('cart').remove({id: queryId}).write();
        response.json({success: true, message: 'Product removed'});
    } 
});

app.listen(port);
