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

const content_imgs = {
	"beach" 			: "https://i.ibb.co/k40Gqk3/beach.jpg",
	"chicago" 			: "https://i.ibb.co/YRbhwHR/chicago.jpg",
	"diana" 			: "https://i.ibb.co/rGJqYK4/diana.jpg",
	"golden gate" 		: "https://i.ibb.co/HT9fBKT/golden-gate.jpg",
	"stata" 			: "https://i.ibb.co/2n8JyJh/stata.jpg",
	"statue of liberty" : "https://i.ibb.co/rH2Xv1N/statue-of-liberty.jpg",
}

const style_imgs = {
	"bricks" 		: "https://i.ibb.co/dk8zWRg/bricks.jpg",
	"clouds" 		: "https://i.ibb.co/ZzS1xhN/clouds.jpg",
	"red circles" 	: "https://i.ibb.co/gRP27fJ/red-circles.jpg",
	"seaport" 		: "https://i.ibb.co/m0xW1DT/seaport.jpg",
	"sketch"		: "https://i.ibb.co/S0Cvc6F/sketch.png",
	"stripes" 		: "https://i.ibb.co/f82BQB1/stripes.jpg",
	"towers" 		: "https://i.ibb.co/XXRd8R3/towers.jpg",
	"udnie" 		: "https://i.ibb.co/jrHxXNL/udnie.jpg",
	"zigzag" 		: "https://i.ibb.co/qyG3Rhc/zigzag.jpg",
}

export function addOptions(selectId, opt){
	let imgs
	if(opt=='content'){
		imgs = content_imgs
	}else{
		imgs = style_imgs
	}
	
	for(var img in imgs){
		var opt = document.createElement('option')
		opt.textContent = img
		opt.value = imgs[img]
		$(selectId)[0].add(opt)
	}
}


// @author ANDITYA ARIFIANTO
// AI LAB - 2019