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
import * as toxicity from '@tensorflow-models/toxicity'

let model, labels

$('#load-model-btn').click(async() => {	
	$('#loaded').show()
	$('#load-model-btn').prop('disabled', true)	
	try{
		model = await toxicity.load().then( post =>{
			$('#loaded').text('Model Downloaded')
			$('#loaded').toggleClass('badge-warning badge-success')	
			$('#sample-btn').show()
			
			return post
		})
		labels = model.model.outputNodes.map(d => d.split('/')[0])
		setTimeout(function() {
			$('#loaded').fadeOut()
		}, 1000)
		
		const table = $('#table-results')[0]
		const predictionDom = 
		`<tr>
			<th>Input Text</th>
			${labels.map(label => { return `
				<th>${label.replace('_', ' ')}</th>
			`}).join('')}
		</tr>`
		table.insertAdjacentHTML('beforeEnd', predictionDom)
	} catch (e) {
		console.log(e)
		alert('cannot load the specified model')
		$('#load-model-btn').prop('disabled', false)	
	}
})

$('#sample-btn').click(async() => {
	$('#sample-btn').prop('disabled', true)	
	$('#loaded').text('Processing Sample. Please Wait...')
	$('#loaded').show()
	await classify(samples.map(d => d.text)).then(d =>{
		addPredictions(d)
	})
	$('#loaded').fadeOut()
})

$('#classify-btn').click(async() => {
	$('#classify').show()
	try{
		const new_txt = $('#input-text').val()
		await classify([new_txt]).then(d =>{
			addPredictions(d)
		})
	} catch (e) {
		console.log(e)
		alert('cannot classify input')
	}
	$('#classify').fadeOut()
})

const samples = [
	{
		'id': '002261b0415c4f9d',
		'text':
		'We\'re dudes on computers, moron.  You are quite astonishingly stupid.'
	},{
		'id': '0027160ca62626bc',
		'text':
		'Please stop. If you continue to vandalize Wikipedia, as you did to Kmart, you will be blocked from editing.'
	},{
		'id': '002fb627b19c4c0b',
		'text':
		'I respect your point of view, and when this discussion originated on 8th April I would have tended to agree with you.'
	}
]

const classify = async (inputs) => {
	const results = await model.classify(inputs)
	return inputs.map((d, i) => {
		const obj = {'text': d}
		results.forEach((classification) => {
			obj[classification.label] = classification.results[i].match
		})
		return obj
	})
}

const addPredictions = (predictions) => {
	const table = $('#table-results')[0]

	predictions.forEach(d => {
		const predictionDom = 
		`<tr>
			<td>${d.text}</td>
			${labels.map(label => { 
				let outLabel = d[label]
				let outClass = ''
				if(d[label]== true){
					outClass = ' positive'
					outLabel = 'yes'
				}else if(d[label]== false){
					outClass = ''
					outLabel = 'no'
				}else{
					outClass = ' slightly'
					outLabel = 'minor'
				}
				return `
				<td class="${'label' + outClass}">
					${outLabel}
				</td>
			`}).join('')}
		</tr>`
		table.insertAdjacentHTML('beforeEnd', predictionDom)
	})
}


// @author ANDITYA ARIFIANTO
// AI LAB - 2019