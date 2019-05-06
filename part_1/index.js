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
import $ from 'jquery'
import * as tf from '@tensorflow/tfjs'
import * as tfvis from '@tensorflow/tfjs-vis'
import Chart from 'chart.js'


//PART 1
const arr_x = [-1, -2,  0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 4, 5, 6]
const arr_y = [-1, -2, -1, 1, 1, 0, 2, 3, 1, 3, 2, 4, 3, 6, 5]

let zip = (arr1, arr2) => arr1.map((x, i) => { return {'x':x, 'y':arr2[i]}})
const toy_data = zip(arr_x, arr_y)
const label = 'toy data'

//TFJS-VIS
let data = { values: [toy_data], series: [label] }
const container = $('#scatter-tfjs')[0]
tfvis.render.scatterplot(container, data, { width: 500, height: 400 })

//TFJS-VIS VISOR
const surface = tfvis.visor().surface({ name: 'Scatterplot-tfjs', tab: 'Charts'})
tfvis.render.scatterplot(surface, data)

// CHART.JS VIS
var ctx = $('#scatter-chartjs')
var scatterChart = new Chart(ctx, {
    type: 'bubble',
    data: {
        datasets: [{
            data : toy_data,
            label: label,
            backgroundColor: 'blue'}]
    },
    options: {
        responsive: false
    }
})


// @author ANDITYA ARIFIANTO
// AI LAB - 2019