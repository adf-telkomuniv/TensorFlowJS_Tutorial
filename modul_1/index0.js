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

import * as tfvis from '@tensorflow/tfjs-vis'
import Chart from 'chart.js'
import $ from 'jquery'


//PART 1
const arr_x = [-1, 0, 1, 2, 3, 4]
const arr_y = [-3, -1, 1, 3, 5, 7]

const x = tf.tensor2d(arr_x, [6, 1])
const y = tf.tensor2d(arr_y, [6, 1])

//VISUALISASI
let zip = (arr1, arr2) => arr1.map((x, i) => { return {'x':x, 'y':arr2[i]}})

const data_train = zip(arr_x, arr_y)
const label_train = ['trainset']

//TFJS-VIS
let data = { values: [data_train], series: label_train }
const container = $('#scatter-tfjs')[0]
tfvis.render.scatterplot(container, data, { width: 500, height: 400 })

//TFJS-VIS VISOR
const surface = tfvis.visor().surface({ name: 'Scatterplot-tfjs', tab: 'Charts'})
tfvis.render.scatterplot(surface, data)

// CHART.JS VIS
var ctx = $('#scatter-chartjs')
var scatterChart = new Chart(ctx, {
    type: 'scatter',
    data: {
        datasets: [{
            data: data_train,
            label: label_train,
			backgroundColor: 'blue'}]
    },
	options: {
		responsive: false
	}
})

$('#output').text('Hello World') 


// @author ANDITYA ARIFIANTO
// AI LAB - 2019