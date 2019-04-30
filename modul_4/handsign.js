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
import $ from 'jquery'
import Webcam from './webcam'
require('babel-polyfill')

var model
const webcam = new Webcam(document.getElementById('webcam'))

$('#load-model-btn').click(async() => {	
	var modelPath = $('#input-model').val()
	try{
		$('#load-model-btn').prop('disabled', true)	
		$('#load-model-btn').text('Loading Model...')	
		model = await tf.loadLayersModel(modelPath)
		
		$('#loaded').show()
		setTimeout(function() {
			$('#loaded').fadeOut()
		}, 1000)
		
		$('#load-model-btn').text('Model Loaded')	
		$('#init-webcam-btn').prop('disabled', false)		
	} catch (e) {
		console.log(e)
		alert('cannot load the specified model')
		$('#load-model-btn').prop('disabled', false)	
		$('#load-model-btn').text('Load Model')	
	}
})

$('#upload-btn').click(async() => {	
	$('#img-upload').click()
})

var imgTensor
$('#img-upload').change(async(evt) => {
	var canvas = $('#predict-canvas')[0]
	var context = canvas.getContext("2d") 
	var img = new Image()
	
	var file = evt.target.files[0]
	if(file.type.match('image.*')) {
		var reader = new FileReader()
		reader.readAsDataURL(file)
		reader.onload = function(evt){
			if( evt.target.readyState == FileReader.DONE) {
				img.src = evt.target.result
				img.onload = () => {					
					context.clearRect(0, 0, canvas.width, canvas.height)
					context.drawImage(img, 0, 0)
					imgTensor = tf.browser.fromPixels(img)
				}
			}
		}		
		$('#predict-btn').prop('disabled', false)
		$('#prediction').text( 'Predicted: ')	
	} else {
		alert("not an image")
	}
})

$('#predict-btn').click(async() => {
	try{
		$('#predict-btn').prop('disabled', true)		
		const img = imgTensor.div(tf.scalar(255))

		var x_data = tf.cast(img.reshape([1, 64, 64, 3]), 'float32')
		var y_pred = await model.predict(x_data)
		var predictions = Array.from(y_pred.argMax(1).dataSync())

		$('#prediction').text( 'Predicted: '+ predictions)	
	} catch (e) {
		console.log(e)
		alert('failed to predict image')
	}
	
})

async function predictWebcam(){
	var preview = $('#test-canvas')[0]
	while (true) {
		const predictedClass = tf.tidy(() => {
			// Capture the frame from the webcam.
			var img = webcam.capture(64,64)
			var preprocessed = img.toFloat().div(tf.scalar(255))
			
			var y_pred = model.predict(preprocessed)
			var predictions = y_pred.argMax(1).dataSync()
			
			return predictions
		})
		$('#prediction-webcam').text( 'Predicted: '+ predictedClass)	
		await tf.nextFrame()
	}
}

$('#init-webcam-btn').click(async() => {
	try {
		await webcam.setup()
		$('#init-webcam').show()
		$('#no-webcam').hide()
		predictWebcam()
	} catch (e) {
		console.log(e)
		alert('cannot initiate webcam')
	}
})


// @author ANDITYA ARIFIANTO
// AI LAB - 2019