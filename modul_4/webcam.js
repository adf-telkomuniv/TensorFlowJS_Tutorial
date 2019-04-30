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
require('babel-polyfill')

/**
* A class that wraps webcam video elements to capture Tensor4Ds.
*/
export default class Webcam {
	/**
	* @param {HTMLVideoElement} webcamElement A HTMLVideoElement representing the webcam feed.
	*/
	constructor(webcamElement) {
		this.webcamElement = webcamElement
	}

	/**
	* Captures a frame from the webcam
	* Returns a batched image (1-element batch) of shape [1, w, h, c].
	*/
	capture(width, height) {
		return tf.tidy(() => {
			// Reads the image as a Tensor from the webcam <video> element.
			const webcamImage = tf.browser.fromPixels(this.webcamElement)

			// Resize Image to desired width and height
			const resized = tf.image.resizeNearestNeighbor(webcamImage,[width, height])

			// Crop the image so we're using the center square of the rectangular
			// webcam.
			const croppedImage = this.cropImage(resized)

			// Expand the outer most dimension so we have a batch size of 1.
			const batchedImage = croppedImage.expandDims(0)

			return batchedImage
		})
	}

	/**
	* Crops an image tensor so we get a square image with no white space.
	* @param {Tensor4D} img An input image Tensor to crop.
	*/
	cropImage(img) {
		const size = Math.min(img.shape[0], img.shape[1])
		const centerHeight = img.shape[0] / 2
		const beginHeight = centerHeight - (size / 2)
		const centerWidth = img.shape[1] / 2
		const beginWidth = centerWidth - (size / 2)
		return img.slice([beginHeight, beginWidth, 0], [size, size, 3])
	}

	/**
	* Adjusts the video size so we can make a centered square crop without
	* including whitespace.
	* @param {number} width  The real width of the video element.
	* @param {number} height The real height of the video element.
	*/
	adjustVideoSize(width, height) {
		const aspectRatio = width / height
		if (width >= height) {
			this.webcamElement.width = aspectRatio * this.webcamElement.height
		} else if (width < height) {
			this.webcamElement.height = this.webcamElement.width / aspectRatio
		}
	}

	async setup() {
		return new Promise((resolve, reject) => {
			const navigatorAny = navigator
			var constraints = { audio: false, video: true }
			navigator.getUserMedia = navigator.getUserMedia ||
			navigatorAny.webkitGetUserMedia || navigatorAny.mozGetUserMedia ||
			navigatorAny.msGetUserMedia
			if (navigator.getUserMedia) {
				navigator.getUserMedia(
					{video: true},
					stream => {
						this.webcamElement.srcObject = stream
						this.webcamElement.addEventListener('loadeddata', async () => {
							this.adjustVideoSize(this.webcamElement.videoWidth, this.webcamElement.videoHeight)
							resolve()
						}, false)
					},
					error => { reject() }
				)
			} else {
				reject()
			}
		})
	}
}


// @author ANDITYA ARIFIANTO
// AI LAB - 2019