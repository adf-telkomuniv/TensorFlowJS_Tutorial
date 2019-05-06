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
require('babel-polyfill')

import * as posenet from '@tensorflow-models/posenet'
import * as util from './posenet_utils'

const webcam = new Webcam(document.getElementById('webcam'))
const videoWidth = 600
const videoHeight = 450


var isChromium = window.chrome;
var winNav = window.navigator;
var vendorName = winNav.vendor;
var isOpera = typeof window.opr !== "undefined";
var isIEedge = winNav.userAgent.indexOf("Edge") > -1;
var isIOSChrome = winNav.userAgent.match("CriOS");



var model = {
    algorithm: 'multi-pose',
    input: {
        mobileNetArchitecture: '0.75',
        outputStride: 16,
        imageScaleFactor: 0.5,
    },
    multiPoseDetection: {
        maxPoseDetections: 5,
        minPoseConfidence: 0.15,
        minPartConfidence: 0.1,
        nmsRadius: 30.0,
    },
    output: {
        showSkeleton: true,
        showPoints: true,
    },
    net: null,
}


$('#load-model-btn').click(async() => {    
    $('#loaded').toggleClass('badge-warning badge-success')    
    $('#loaded').show()
    $('#load-model-btn').prop('disabled', true)    
    try{
        model.net = await posenet.load(0.75)
        $('#loaded').text('Model Downloaded')
        $('#loaded').toggleClass('badge-warning badge-success')    
        $('#start-posenet-btn').prop('disabled', false)    
        setTimeout(function() {
            $('#loaded').fadeOut()
        }, 1000)
    } catch (e) {
        console.log(e)
        alert('cannot load the specified model')
    }
})

$('#init-webcam-btn').click(async() => {
    try {
        await webcam.setup()
        $('#init-webcam').show()
        $('#start-posenet-btn').show()
        $('#init-webcam-btn').prop('disabled', true)    
        $('#no-webcam').hide()
    } catch (e) {
        console.log(e)
        alert('cannot initiate webcam')
    }
})

$('#start-posenet-btn').click(async() =>{    
    detectPoseInRealTime(webcam.webcamElement, model.net)
    $('#output').show()
    $('#loaded').show()
    $('#loaded').text('Posenet Started')
    $('#start-posenet-btn').prop('disabled', true)    
    
    
    if (isIOSChrome) {
       // is Google Chrome on IOS
        $('#webcam-outer').addClass("row")
        $('#output').addClass("col")
        $('#webcam-posenet').addClass("col")
    } else if(
      isChromium !== null &&
      typeof isChromium !== "undefined" &&
      vendorName === "Google Inc." &&
      isOpera === false &&
      isIEedge === false
    ) {
       // is Google Chrome
        $('#webcam-outer').addClass("row")
        $('#output').addClass("col")
        $('#webcam-posenet').addClass("col")
    } else { 
       $('#webcam-posenet').hide()
    }
    
    
})


function detectPoseInRealTime(video, net) {
    const canvas = $('#output')[0]
    const ctx = canvas.getContext('2d')

    // since images are being fed from a webcam
    const flipHorizontal = true

    canvas.width = videoWidth
    canvas.height = videoHeight

    async function poseDetectionFrame() {

        // Scale an image down to a certain factor. Too large of an image will slow
        // down the GPU
        const imageScaleFactor = model.input.imageScaleFactor
        const outputStride = +model.input.outputStride

        let poses = []
        let minPoseConfidence
        let minPartConfidence
        poses = await model.net.estimateMultiplePoses(
            video, imageScaleFactor, flipHorizontal, outputStride,
            model.multiPoseDetection.maxPoseDetections,
            model.multiPoseDetection.minPartConfidence,
            model.multiPoseDetection.nmsRadius)

        minPoseConfidence = +model.multiPoseDetection.minPoseConfidence
        minPartConfidence = +model.multiPoseDetection.minPartConfidence


        ctx.clearRect(0, 0, videoWidth, videoHeight)

        ctx.save()
        ctx.scale(-1, 1)
        ctx.translate(-videoWidth, 0)
        ctx.drawImage(video, 0, 0, videoWidth, videoHeight)
        ctx.restore()


        // For each pose (i.e. person) detected in an image, loop through the poses
        // and draw the resulting skeleton and keypoints if over certain confidence
        // scores
        poses.forEach(({score, keypoints}) => {
            if (score >= minPoseConfidence) {
                if (model.output.showPoints) {
                    util.drawKeypoints(keypoints, minPartConfidence, ctx)
                }
                if (model.output.showSkeleton) {
                    util.drawSkeleton(keypoints, minPartConfidence, ctx)
                }
                if (model.output.showBoundingBox) {
                    util.drawBoundingBox(keypoints, ctx)
                }
            }
        })

        requestAnimationFrame(poseDetectionFrame)
    }
    poseDetectionFrame()
}


// @author ANDITYA ARIFIANTO
// AI LAB - 2019