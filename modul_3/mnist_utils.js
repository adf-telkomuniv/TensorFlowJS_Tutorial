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
import $ from 'jquery'
require('babel-polyfill')

export function getModel(name){
	var model = `model = tf.sequential( ) \n`
	if (name=='ANN'){
		model +=`model.add( tf.layers.flatten( { inputShape: [28, 28, 1] } ) ) \n`
		model +=`model.add( tf.layers.dense( { units: 42, activation: 'relu' } ) ) \n`
		model +=`model.add( tf.layers.dense( { units: 10, activation: 'softmax' } ) ) \n`	
	}else{
		model +=`model.add( tf.layers.conv2d( { kernelSize: 3, filters: 16, activation: 'relu' , inputShape: [28, 28, 1]} ) ) \n`
		model +=`model.add( tf.layers.conv2d( { kernelSize: 3, filters: 16, activation: 'relu' } ) ) \n`
		model +=`model.add( tf.layers.maxPooling2d( { poolSize: 2, strides: 2 } ) ) \n`
		model +=`model.add( tf.layers.flatten( { } ) ) \n`
		model +=`model.add( tf.layers.dense( { units: 10, activation: 'softmax' } ) ) \n`
	}
	model +=`\n`
	model +=`const myOptim = 'rmsprop' \n`		
	model +=`model.compile( { loss: 'categoricalCrossentropy', optimizer: myOptim, metrics:['accuracy'] } ) \n`	
	return model
}

export function showExample(elementId, data, labels, predictions=null ){
	const imgElement = document.getElementById(elementId)
	const testExamples = data.shape[0]
	imgElement.innerHTML = ''
	for (let i = 0; i < testExamples; i++) {
		const img = data.slice([i, 0], [1, data.shape[1]])

		const div = document.createElement('div')
		div.className = 'pred-container'

		const canvas = document.createElement('canvas')
		canvas.className = 'prediction-canvas'
		tf.browser.toPixels (img.reshape([28, 28, 1]), canvas)
		const pred = document.createElement('div')

		const label = labels[i]
		if(predictions == null){
			pred.innerText = `label: ${label}`
		}else{
			const prediction = predictions[i]
			const correct = prediction === label

			pred.className = `pred ${(correct ? 'pred-correct' : 'pred-incorrect')}`
			pred.innerText = `pred: ${prediction}`
		}

		div.appendChild(pred)
		div.appendChild(canvas)

		imgElement.appendChild(div)
	}
}

export function cropImage(img, width=140){
	img = img.slice([0,0,3])
	var mask_x = tf.greater(img.sum(0), 0).reshape([-1])
	var mask_y = tf.greater(img.sum(1), 0).reshape([-1])
	var st = tf.stack([mask_x,mask_y])
	var v1 = tf.topk(st)
	var v2 = tf.topk(st.reverse())
	
	var [x1, y1] = v1.indices.dataSync()
	var [y2, x2] = v2.indices.dataSync()
	y2 = width-y2-1
	x2 = width-x2-1
	var crop_w = x2-x1
	var crop_h = y2-y1
	
	if (crop_w > crop_h) {
		y1 -= (crop_w - crop_h) / 2
		crop_h = crop_w
	}
	if (crop_h > crop_w) {
		x1 -= (crop_h - crop_w) / 2
		crop_w = crop_h
	}
	
	img = img.slice([y1,x1],[crop_h,crop_w ])
	img = img.pad([[6,6],[6,6],[0,0]])
	var resized = tf.image.resizeNearestNeighbor(img,[28, 28])
	
	for(let i = 0; i < 28*28; i++) {
		resized[i] = 255 - resized[i]
	}
	return resized
}

export function firefoxSave(model){
	const handler = tf.io.getSaveHandlers("downloads://")[0]
	model.save(handler)
	const defer = f => new Promise(resolve => setTimeout(resolve)).then(f)
	handler.save = async function(modelArtifacts) {
		const weightsURL = window.URL.createObjectURL(
			new Blob([modelArtifacts.weightData], {type: 'application/octet-stream'}))

		if (modelArtifacts.modelTopology instanceof ArrayBuffer) {
			throw new Error('BrowserDownloads.save() does not support saving model topology in binary formats yet.')
		} else {
			const weightsManifest = [{
				paths: ['./' + this.weightDataFileName],
				weights: modelArtifacts.weightSpecs
			}]
			const modelTopologyAndWeightManifest = {
				modelTopology: modelArtifacts.modelTopology,
				format: modelArtifacts.format,
				generatedBy: modelArtifacts.generatedBy,
				convertedBy: modelArtifacts.convertedBy,
				weightsManifest
			}
			const modelTopologyAndWeightManifestURL = window.URL.createObjectURL(
				new Blob([JSON.stringify(modelTopologyAndWeightManifest)],{type: 'application/json'}))

			await defer(() => {
				// If anchor elements are not provided, create them without attaching them
				// to parents, so that the downloaded file names can be controlled.
				const jsonAnchor = this.jsonAnchor == null ? document.createElement('a') : this.jsonAnchor
				jsonAnchor.download = this.modelTopologyFileName
				jsonAnchor.href = modelTopologyAndWeightManifestURL
				// Trigger downloads by calling the `click` methods on the download
				// anchors.
				jsonAnchor.dispatchEvent(new MouseEvent("click"))
			})

			if (modelArtifacts.weightData != null) {
				await defer(() => {
					const weightDataAnchor = this.weightDataAnchor == null ? document.createElement('a') : this.weightDataAnchor
					weightDataAnchor.download = this.weightDataFileName
					weightDataAnchor.href = weightsURL
					weightDataAnchor.dispatchEvent(new MouseEvent("click"))
				})
			}

			// return {modelArtifactsInfo: getModelArtifactsInfoForJSON(modelArtifacts)};
		}
	}
}


// @author ANDITYA ARIFIANTO
// AI LAB - 2019