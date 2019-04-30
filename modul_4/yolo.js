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
import $ from 'jquery'
import Webcam from './webcam'
import TinyYoloV3 from 'tfjs-tiny-yolov3'
require('babel-polyfill')


import * as util from './yolo_utils'
const model = new TinyYoloV3({nObject:20})
const webcam = new Webcam($('#webcam-yolo')[0])



$('#load-model-btn').click(async() => {	
	$('#loaded').toggleClass('badge-warning badge-success')	
	$('#loaded').show()
	$('#load-model-btn').prop('disabled', true)	
	try{
		await model.load()
		
		$('#loaded').text('Model Downloaded')
		$('#loaded').toggleClass('badge-warning badge-success')	
		$('#start-yolo-btn').prop('disabled', false)	
		setTimeout(function() {
			$('#loaded').fadeOut()
		}, 1000)
		let ar = model.labels
		util.drawLabel($('#labels1')[0], ar.slice(0,40))
		util.drawLabel($('#labels2')[0], ar.slice(40,80))
	} catch (e) {
		console.log(e)
		alert('cannot load the specified model')
		$('#load-model-btn').prop('disabled', false)	
		$('#loaded').hide()
	}
})

$('#init-webcam-btn').click(async() => {
	try {
		await webcam.setup()
		$('#init-webcam').show()
		$('#start-yolo-btn').show()
		$('#init-webcam-btn').prop('disabled', true)	
		$('#no-webcam').hide()
	} catch (e) {
		console.log(e)
		alert('cannot initiate webcam')
	}
})

let detected = {}
let scale = []
$('#start-yolo-btn').click(async() =>{
	
	$('#loaded').show()
	$('#loaded').text('Detection Started')
	$('#start-yolo-btn').prop('disabled', true)		
	
	const cw = webcam.webcamElement.clientWidth
	const ch = webcam.webcamElement.clientHeight
	const vw = webcam.webcamElement.videoWidth
	const vh = webcam.webcamElement.videoHeight
	console.log(cw, ch, vw, vh)
	scale = [cw/vw, ch/vh]
	
	const wrapper = document.getElementById('webcam-yolo')
	wrapper.style.width = `${cw}px`
	wrapper.style.height = `${ch}px`
	
	detect()
})

async function detect(){
	
	// since images are being fed from a webcam
	const flipHorizontal = true
	
	var boxes = await model.detectAndBox(webcam.webcamElement, flipHorizontal)		
	util.drawBoxes(boxes, $('#output')[0], detected, scale)
	
	let box = [boxes.map((box)=>{return box['label']})]
	$('#labels').text('Detected: '+box.join())
	
	setTimeout(detect, 900)
	
}



// @author ANDITYA ARIFIANTO
// AI LAB - 2019