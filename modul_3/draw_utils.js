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
 
import $ from 'jquery'

export function initCanvas(id, size=8, color="#000000"){
	var context = document.getElementById(id).getContext("2d")
	var canvas = document.getElementById(id)
	context.strokeStyle =color
	context.lineJoin = "round"
	context.lineWidth = size

	var clickX = []
	var clickY = []
	var clickDrag = []
	var paint

	function addClick(x, y, dragging) {
		clickX.push(x - $(canvas).parent().offset().left)
		clickY.push(y - $(canvas).parent().offset().top)
		clickDrag.push(dragging)
	}

	function drawNew(context) {
		var i = clickX.length - 1
		if (!clickDrag[i]) {
			if (clickX.length == 0) {
				context.beginPath()
				context.moveTo(clickX[i], clickY[i])
				context.stroke()
			} else {
				context.closePath()

				context.beginPath()
				context.moveTo(clickX[i], clickY[i])
				context.stroke()
			}
		} else {
			context.lineTo(clickX[i], clickY[i])
			context.stroke()
		}
		context.stroke()
	}

	function mouseDownEventHandler(e) {
		paint = true
		var x = e.pageX - canvas.offsetLeft
		var y = e.pageY - canvas.offsetTop
		if (paint) {
			addClick(x, y, false)
			drawNew(context)
		}
	}
	
	function mouseUpEventHandler(e) {
		context.closePath()
		paint = false
	}

	function mouseMoveEventHandler(e) {
		var x = e.pageX - canvas.offsetLeft
		var y = e.pageY - canvas.offsetTop
		if (paint) {
			addClick(x, y, true)
			drawNew(context)
		}
	}

	function setUpHandler(detectEvent) {
			canvas.addEventListener('mouseup', mouseUpEventHandler)
			canvas.addEventListener('mousemove', mouseMoveEventHandler)
			canvas.addEventListener('mousedown', mouseDownEventHandler)
			mouseDownEventHandler(detectEvent)
	}

	canvas.addEventListener('mousedown', setUpHandler )
}


// @author ANDITYA ARIFIANTO
// AI LAB - 2019