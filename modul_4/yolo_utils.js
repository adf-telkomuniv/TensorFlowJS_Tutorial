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

export function drawBoxes(boxes, outputId, detectedList, scale) {
	outputId.innerHTML = ''
	
	boxes.map((box) => {
		if (!(box['label'] in detectedList)) {
			detectedList[box['label']] = '#' + Math.floor(Math.random() * 16777200).toString(16)
		}

		const rect = document.createElement('div')
		rect.className = 'detect'
		rect.style.top = `${box['top'] * scale[1]}px`
		rect.style.left = `${box['left'] * scale[0]}px`
		rect.style.width = `${box['width'] * scale[0] - 4}px`
		rect.style.height = `${box['height'] * scale[1] - 4}px`
		rect.style.borderColor = detectedList[box['label']]

		const text = document.createElement('div')
		text.className = 'text'
		text.innerText = `${box['label']} ${box['score'].toFixed(2)}`
		text.style.color = detectedList[box['label']]

		rect.appendChild(text)
		outputId.appendChild(rect)
	})
}

export function drawLabel(outputId, labels){
	var tb = $(`<table class="table table-sm" style="text-align:center; vertical-align: middle;">`).appendTo(outputId)
	let id = 0
	for(let i=0; i<10; i++){
		var tr = $(`<tr/>`).appendTo(tb);
		for(let j=0; j<4; j++){		
			tr.append(`<td>`+labels[id]+`</td>`)
			id++
		}
	}
	tb.append(`</table>`)
}
