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
 
import * as tf from '@tensorflow/tfjs'
import 'bootstrap/dist/css/bootstrap.css'
import $ from 'jquery'
import * as tfvis from '@tensorflow/tfjs-vis'
import Chart from 'chart.js'


//PART 1
const arr_x = [-1, 0, 1, 2, 3, 4]
const arr_y = [-3, -1, 1, 3, 5, 7]

const x = tf.tensor2d(arr_x, [6, 1])
const y = tf.tensor2d(arr_y, [6, 1])

//VISUALISASI
let zip = (arr1, arr2) => arr1.map((x, i) => { return {'x':x, 'y':arr2[i],}})

const data_train = zip(arr_x, arr_y)
const label_train = ['trainset']

// CHART.JS VIS
var ctx = $('#scatter-chartjs')
var color = Chart.helpers.color
var scatterChart = new Chart(ctx, {
    type: 'scatter',
    data: {
        datasets: [{
            data: data_train,
            label: label_train,
			backgroundColor: 'red'
        }]
    },
	options: {
		responsive: false
	}
})

function viewPrediction(scatterDt, lineDt ){	
	scatterChart.destroy()
	scatterChart = new Chart(ctx, {
		type: 'line',
		data: {
			labels: arr_x,
			datasets: [{
				type: 'line',
				label: 'prediction',
				data: lineDt,
				fill: false,
				borderColor: 'blue',
				pointRadius: 0
			}, {
				type: 'bubble',
				label: 'training data',
				data: scatterDt,
				backgroundColor: 'red',
				borderColor: 'transparent'
			}]
		},
		options: { responsive: false }
	})
}

let model = tf.sequential()

$('#init-btn').click(function() {
	model.add(tf.layers.dense({units: 1, inputShape: [1]}))
	model.compile({loss: 'meanSquaredError', optimizer: 'sgd'})	
	//const mySGD = tf.train.sgd(0.1)
	//model.compile({loss: 'meanSquaredError', optimizer: mySGD})

	let t_pred = model.predict(x)
	let y_pred = t_pred.dataSync()
	let data_pred = zip(arr_x, y_pred)
	
	viewPrediction(data_train, data_pred)
    $('#train-btn').prop('disabled', false)
})

$('#train-btn').click(function() {	

	var msg = $('#is-training')
	msg.toggleClass('badge-warning')	
	msg.text('Training, please wait...')	
	
	model.fit(x, y, {epochs: 20}).then((hist) => {
		
		let t_pred = model.predict(x)
		let y_pred = t_pred.dataSync()
		let data_pred = zip(arr_x, y_pred)
		let mse = model.evaluate(x, y)
		
		viewPrediction(data_train, data_pred )
		msg.removeClass('badge-warning').addClass('badge-success')
		msg.text('MSE: '+mse.dataSync())	
		$('#predict').show()
		
		const surface = tfvis.visor().surface({ name: 'Training History', tab: 'MSE' })		
		tfvis.show.history(surface, hist, ['loss'])      

	})
})

$('#predict-btn').click(function() {
    var num = parseFloat($('#inputValue').val())
	let y_pred = model.predict(tf.tensor2d([num], [1,1]))
    $('#output').text(y_pred.dataSync())
})

$('#output').text('Hello World') 


// @author ANDITYA ARIFIANTO
// AI LAB - 2019