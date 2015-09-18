'use strict';

import express from 'express';
import path from 'path';
import fs from 'fs';
import compression from 'compression';
import morgan from 'morgan';
import Primus from 'primus';
import UglifyJS from 'uglify-js';
import send from './send';

const app = express();

//Express middlewares
app.use(morgan(app.get('env') === 'production' ? 'combined' : 'dev'));
app.use(compression());
app.use(express.static(path.join(__dirname, '../public/')));

app.get('/', (req, res, next) => {
    res.status(200).send('Welcome to WebSockets');
});

// Generic server errors
app.use((err, req, res, next) => { //eslint-disable-line no-unused-vars
    console.error('Error on request %s %s', req.method, req.url);
    console.error(err.stack);
    res.status(404).send(err.stack);
});

const server = require('http').createServer(app);

// Use Engine.io
const primus = new Primus(server, {
    transformer: 'engine.io'
});

// Save library
const minifiedLibrary = UglifyJS.minify(primus.library(), {
    fromString: true
});
fs.writeFileSync(path.join(__dirname, '../public/assets/primus.js'), minifiedLibrary.code, 'utf-8');

primus.on('connection', spark => {
    console.log('client ' + spark.id + ' has connected to the server');
});

send.events(primus);

primus.on('error', err => {
    console.error('Something horrible has happened', err.stack);
});

// Start the server
server.listen(process.env.PORT || 3000);
