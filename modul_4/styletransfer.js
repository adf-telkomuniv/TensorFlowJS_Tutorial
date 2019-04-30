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
require('babel-polyfill')

import wikiarts from './wikiarts'
import * as util from './styletransfer_utils'

let styleModel, transformModel

util.addOptions('#content-select', 'content')
util.addOptions('#style-select', 'style')

var loadedStyle = false 
var loadedTransformer = false 
$('#load-style-btn').click(async(e) => {	
	try{
		$('#load-style-btn').prop('disabled', true)	
		let modelPath = $('#input-style').val()
		styleModel = await tf.loadGraphModel(modelPath)
		$('#loaded-style').show()
		setTimeout(function() {
			$('#loaded-style').fadeOut()
		}, 1000)
		loadedStyle = true 
	} catch (e) {
		console.log(e)
		alert('cannot load the specified model')
		$('#load-style-btn').prop('disabled', false)	
	}
		
	if(loadedStyle && loadedTransformer){
		$('#stylize-btn').prop('disabled', false)	
	}
})
	
$('#load-transformer-btn').click(async(e) => {
	try{
		$('#load-transformer-btn').prop('disabled', true)	
		let modelPath = $('#input-transformer').val()
		transformModel = await tf.loadGraphModel(modelPath)
		$('#loaded-transformer').show()
		setTimeout(function() {
			$('#loaded-transformer').fadeOut()
		}, 1000)
		loadedTransformer = true
	} catch (e) {
		console.log(e)
		alert('cannot load the specified model')
		$('#load-transformer-btn').prop('disabled', false)	
	}
	
	if(loadedStyle && loadedTransformer){
		$('#stylize-btn').prop('disabled', false)	
	}
})

$('#content-select').change(function(evt){	
	if (evt.target.value === 'file') {
		console.log('file selected')
		$('#file-select').click()
	}  else {
		$('#content-img')[0].src = evt.target.value
	}
	$('#content-slider').prop('disabled', false)
	$('#content-slider').val(200)
	$('#content-slider').change()
})

$('#file-select').change(function(evt){
	const f = evt.target.files[0]
	var fileReader = new FileReader()
	fileReader.onload = ((e) => {
		$('#content-img')[0].src = e.target.result
	})
	fileReader.readAsDataURL(f)
	$('#file-select').value = ''
})

$('#style-select').change(function(evt){
	$('#style-img')[0].src = evt.target.value
	$('#style-slider').prop('disabled', false)
	$('#style-slider').val(150)
	$('#style-slider').change()
	
})

$('#random-btn').click(function(){
	$('#style-img')[0].src = ''
	const randomNumber = Math.floor(Math.random()*wikiarts.length)
	$('#style-img')[0].src = wikiarts[randomNumber]
	console.log(randomNumber)
	$('#style-select').val('')
	$('#style-slider').prop('disabled', false)
	$('#style-slider').val(150)
	$('#style-slider').change()
})

$('#content-slider').change(function(){
	$('#content-img')[0].height = this.value
})

$('#style-slider').change(function(){
	$('#style-img')[0].height = this.value
	if($('#style-check').is(':checked')){
		$('#style-img')[0].style.width = $('#style-img')[0].height
	}
})

$('#style-check').click(function(){	
	if($('#style-check').is(':checked')){
		$('#style-img')[0].style.width = $('#style-img')[0].height
	}else{
		$('#style-img')[0].style.width  = ''
	}
})

let styleRatio = 1.0
$('#stylized-slider').change(function(){
	styleRatio = this.value/100.
})

// credit: @reiinakano
$('#stylize-btn').click(async(e) => {
	$('#stylize-btn').prop('disabled', true)
	try{
		
		await tf.nextFrame()
		$('#stylize-btn').text('Generating Style')
		await tf.nextFrame()
		let bottleneck = await tf.tidy(() => {
			return styleModel.predict(tf.browser.fromPixels($('#style-img')[0]).toFloat().div(tf.scalar(255)).expandDims())
		})
		if (styleRatio !== 1.0) {
			$('#stylize-btn').text('Generating Identity Style')
			await tf.nextFrame()
			const identityBottleneck = await tf.tidy(() => {
				return styleModel.predict(tf.browser.fromPixels($('#content-img')[0]).toFloat().div(tf.scalar(255)).expandDims())
			})
			const styleBottleneck = bottleneck
			bottleneck = await tf.tidy(() => {
				const styleBottleneckScaled = styleBottleneck.mul(tf.scalar(styleRatio))
				const identityBottleneckScaled = identityBottleneck.mul(tf.scalar(1.0-styleRatio))
				return styleBottleneckScaled.addStrict(identityBottleneckScaled)
			})
			styleBottleneck.dispose()
			identityBottleneck.dispose()
		}
		
		$('#stylize-btn').text('Stylizing Image...')
		await tf.nextFrame()
		const stylized = await tf.tidy(() => {
			return transformModel.predict([tf.browser.fromPixels($('#content-img')[0]).toFloat().div(tf.scalar(255)).expandDims(), bottleneck]).squeeze()
		})
		
		await tf.browser.toPixels(stylized, $('#stylized-img')[0])
		bottleneck.dispose()
		stylized.dispose()
		
		$('#stylize-btn').text('Done. Stylize Again')
	
	} catch (e) {
		console.log(e)
		alert('Error when Stylizing', e.message)
		$('#stylize-btn').text('Stylize Image')
	}
	
	$('#stylize-btn').prop('disabled', false)	
})


// @author ANDITYA ARIFIANTO
// AI LAB - 2019