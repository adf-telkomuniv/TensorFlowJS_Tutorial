/**
 * @license
 * Copyright 2019 AI Lab - Telkom University. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License")
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */ 
 
import 'bootstrap/dist/css/bootstrap.css'
import * as tf from '@tensorflow/tfjs'
import * as tfvis from '@tensorflow/tfjs-vis'
import Chart from 'chart.js'
import $ from 'jquery'

import {generateData} from './data'
require('babel-polyfill')


const dataset = generateData(100, 0.6)
const x_train = tf.tensor2d(dataset.x_train, [dataset.x_train.length, 2])
const y_train = tf.tensor2d(dataset.y_train, [dataset.y_train.length, 1])
const x_val  = tf.tensor2d(dataset.x_val,  [dataset.x_val.length, 2])
const y_val  = tf.tensor2d(dataset.y_val,  [dataset.y_val.length, 1])


// CHART.JS VIS
var ctx = $('#trainset')
var scatter_train = new Chart(ctx, {
    type: 'scatter',
    data: {
        datasets: [{
            data: dataset.trainPt[0],
            label: 'class 0',
            backgroundColor: 'black'
        },{
            data: dataset.trainPt[1],
            label: 'class 1',
            backgroundColor: 'red'
        }]
    },
    options: {
        responsive: false
    }
})

var ctx = $('#valset')
var scatter_val = new Chart(ctx, {
    type: 'scatter',
    data: {
        datasets: [{
            data: dataset.valPt[0],
            label: 'class 0',
            backgroundColor: 'black'
        },{
            data: dataset.valPt[1],
            label: 'class 1',
            backgroundColor: 'red'
        },{
            type: 'bubble',
            data: [],
            label: 'new data',
            backgroundColor: '#32fa32',
            borderColor: 'green',
        }]
    },
    options: {
        responsive: false
    }
})


let model
$('#init-btn').click(function() {    
    var num_h = parseInt($('#num-hid').val())
    var lr = parseFloat($('#lr').val())
    
    model = tf.sequential()    
    model.add(tf.layers.dense({units: num_h,
        activation: 'sigmoid', inputShape: [2]}))
    model.add(tf.layers.dense({units: 1, activation: 'sigmoid'}))
    const mySGD = tf.train.sgd(lr)
    model.compile({loss: 'binaryCrossentropy',
        optimizer: mySGD, metrics:['accuracy']})

    $('#train-btn').prop('disabled', false)
})


$('#train-btn').click(async() => {    
    var msg = $('#is-training')
    msg.toggleClass('badge-warning')    
    msg.text('Training, please wait...')    
    
    const trainLogs = []
    const loss = $('#loss-graph')[0]
    const acc = $('#acc-graph')[0]
    var epoch = parseInt($('#epoch').val())
    
    const history = await model.fit(x_train, y_train, {
        epochs: epoch,
        validationData: [x_val, y_val],
        callbacks: {
            onEpochEnd: async (epoch, logs) => {
                trainLogs.push(logs)
                tfvis.show.history(loss, trainLogs, ['loss', 'val_loss'], { width: 400, height: 250 })
                tfvis.show.history(acc, trainLogs, ['acc', 'val_acc'], { width: 400, height: 250 })
            },
        },
    })
    
    let eval_train = model.evaluate(x_train, y_train)
    let eval_val = model.evaluate(x_val, y_val)
    
    msg.toggleClass('badge-warning badge-success')    
    msg.text('Training Done')
    
    let round = (num) => parseFloat(num*100).toFixed(2)
    $('#eval-train').text('Trainset Accuracy : '+ round(eval_train[1].dataSync())+'%')
    $('#eval-val').text( 'Validation Accuracy : '+ round(eval_val[1].dataSync())+'%')    
    $('#predict-btn').prop('disabled', false)
})

$('#predict-btn').click(function() {
    var x = parseFloat($('#input-x').val())
    var y = parseFloat($('#input-y').val())
        
    let new_dt = {'x':x,'y':y, 'r':5}
    scatter_val.data.datasets[2].data[0] = new_dt
    scatter_val.update()    
    
    let y_pred = model.predict(tf.tensor2d([[x,y]], [1,2]))
    let class_pred = 'Predicted Class: '+Math.round(y_pred.dataSync())
    $('#class-pred').text(class_pred)
})


// @author ANDITYA ARIFIANTO
// AI LAB - 2019