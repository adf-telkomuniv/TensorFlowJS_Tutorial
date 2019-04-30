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
 
function gaussianRand(a,b) {
	var rand = 0
	for (var i = 0; i < 6; i++) {
		rand += Math.random()
	}
	return (rand / 6)+(Math.random()*a+b)
}


function toArray(arr){
    var out = []
    for(var i = 0; i < arr.length; i++){
        out.push([arr[i].x,arr[i].y])
    }
    return out
}

export function generateData(numPoints, frac){
	// class proportion
	let nx1 = Math.round(numPoints*frac)
	let nx2 = numPoints - nx1	
	
	// create random 2 dimension data
	let data1 = Array(nx1).fill(0).map(() =>
		{return{'x':gaussianRand(10,7),'y':gaussianRand(10,7)}})
	let class1 = Array(nx1).fill(0)
	
	let data2 = Array(nx2).fill(0).map(() =>
		{return{'x':gaussianRand(9,0),'y':gaussianRand(9,0)}})
	let class2 = Array(nx2).fill(1)
	
	// split 30% for data validation
	let nv1 = Math.round(nx1*.7)	
	let nv2 = Math.round(nx2*.7)
	
	let trainPt = [data1.slice(0,nv1), data2.slice(0,nv2)]
	let valPt = [data1.slice(nv1), data2.slice(nv2)]

	let x_train = toArray(trainPt[0].concat(trainPt[1]))
	let y_train = class1.slice(0,nv1).concat(class2.slice(0,nv2))
	let x_val  = toArray(valPt[0].concat(valPt[1]))
	let y_val  = class1.slice(nv1).concat(class2.slice(nv2))
	
	return {
		x_train, y_train, x_val, y_val, trainPt, valPt
	}
}


// @author ANDITYA ARIFIANTO
// AI LAB - 2019