$("#resetPainting").click(function() {
	if (!options[2]) {
		clearInterval(timerId);
		random_reset();
		clear_and_fill();
		options = [1,0,1,0];
		zoiBool = false;
	}
});

$("#stopPainting").click(function() {
	if (!options[0]) {
		var canvasData = ctx.getImageData(0,0,width,height);
		copiedCanvas.getContext("2d").putImageData(canvasData,0,0);
		clearInterval(timerId);
		options = [1,0,0,0];
	}
});

$("#continuePainting").click(function() {
	if (!options[1]) {
		//clearInterval(timerId);
		ctx.resetTransform();
		clear_and_fill();
		if (!options[2]) ctx.drawImage(copiedCanvas,0,0);
		zeroPt = generate_tuple(0,0);
		options = [0,1,0,0];
		timerId = setInterval(stochastic_draw,TR);
	}

});

$("#goToAboutPage").click(function() {
	window.location.href = "aboutPage.html";
}); 


$("#myCanvas").click(function(e) {
	if (options[0] && !options[3]) {
		offsetX = e.offsetX, offsetY = e.offsetY;
		ctx.beginPath();
		canvas_makeover(1,0);
		ctx.closePath();
	}
});

var zoiBool = false;
$("#toggleZOI").click(function() {
	if (options[0]) {
		clearInterval(timerId);
		clear_and_fill();
		for (var i = 0; i < ctxBuildings.length; i++) {
			draw_circle(ctxBuildings[i]);
			draw_line2(ctxHighways[i]);
		}
		if (!zoiBool) {
			for (var i = 0; i < ctxZOI.length; i++) draw_zoi(ctxZOI[i]);
		}
		zoiBool = !zoiBool;
		options[0] = 0;
		timerId = setInterval(stochastic_draw,TR);
	}
});

$(document).keydown(function(e) {
	if (options[0]) {
		switch (e.which) {
			case 38:
				scale += scaleIncr;
				options[3] = 1;
				ctx.beginPath();
				canvas_makeover(0,1);
				ctx.closePath();
				break;
			case 40:
				ctx.beginPath();
				if (scale <= startScale) {
					ctx.resetTransform();
					clear_and_fill();
					ctx.drawImage(copiedCanvas,0,0);
					zeroPt = generate_tuple(0,0);
					options[3] = 0;
				} else {
					scale -= scaleIncr;
					canvas_makeover(0,1);
				}
				ctx.closePath();
				break;
			 // case 37:
			 // 	var canvasData = ctx.getImageData(0,0,width,height);
				// copiedCanvas.getContext("2d").putImageData(canvasData,0,0);
			 // 	break;
			 // case 39:
			 // 	var canvasData = ctx.getImageData(0,0,width,height);
				// copiedCanvas.getContext("2d").putImageData(canvasData,0,0);
			 // 	break;
			case 87:
				if (!options[3]) kp_translate(0,8);
				break;
			case 83:
				if (!options[3]) kp_translate(0,-8);
				break;
			case 68:
				if (!options[3]) kp_translate(-8,0);
				break;
			case 65:
				if (!options[3]) kp_translate(8,0);
				break;
			default: return;
		}
	}
});


// $("#myCanvas").mousedown(function(e) {
// 	if (options[0]) {
// 		offsetX = e.offsetX;
// 		offsetY = e.offsetY;
// 		zoomId = setInterval(function() {
// 			if (!numZooms) {
// 				canvas_makeover(1,0);
// 			} else {
// 				scale += scaleIncr;
// 				canvas_makeover(0,1);
// 			};
// 			numZooms += 1;
// 		},100);
// 	}
// });


// $("#myCanvas").mouseup(function(e) {
// 	if (options[0]) {
// 		clearInterval(zoomId);
// 		zoomId = setInterval(function () {
// 			if (scale <= startScale) {
// 				clearInterval(zoomId);
// 				ctx.resetTransform();
// 				if (numZooms > 1) {
// 					clear_and_fill();
// 					ctx.drawImage(copiedCanvas,0,0);
// 					zeroPt = generate_tuple(0,0);
// 				}
// 				numZooms = 0;
// 			} else {
// 				scale -= scaleIncr;
// 				canvas_makeover(0,1);
// 			}
// 		}, 100);
// 	}
// });

function kp_translate(dx,dy) {
	ctx.beginPath();
	clear_and_fill();
	ctx.translate(dx, dy);
	ctx.drawImage(copiedCanvas,0,0);
	ctx.closePath();
}

function leap_raindrop(a,b,dx_flip,dy_flip) {
	a = a - 1;
	b = b + 1;

	var dix = Math.random(), diy = Math.random(); 
	var dx = random_int(a,b), dy = random_int(a,b);

	if (diy < dy_flip) dy *= -1;
	if (dix < dx_flip) dx *= -1;

	return generate_tuple(dx,dy);
}

function draw_line(pCentroid,cCentroid, lw, lcolor) {

	if (!connect) return;

	ctx.beginPath();
	ctx.moveTo(pCentroid.x,pCentroid.y);
	ctx.lineTo(cCentroid.x,cCentroid.y);
	var lstroke = "blue";
	
	if (lcolor == 1) {
		lstroke = "green";
	} else if (lcolor == 2) {
		lstroke = "orange";
	} else if (lcolor == 3) {
		lstroke = "red";
	} else if (lcolor == 4) {
		lstroke = "white";
	} else {
		lstroke = "rgba(255,255,255,.10)";
	}
	ctx.lineWidth = lw;
	ctx.strokeStyle = lstroke; 
	ctx.stroke();
	ctx.closePath();

	var highwayObject = new Object();
		highwayObject.from = pCentroid;
		highwayObject.to = cCentroid;
		highwayObject.lineWidth = lw;
		highwayObject.strokeStyle = lstroke;
	ctxHighways.push(highwayObject);

}

function draw_line2(highwayObject) {
	ctx.beginPath();
	ctx.moveTo(highwayObject.from.x,highwayObject.from.y);
	ctx.lineTo(highwayObject.to.x,highwayObject.to.y);
	ctx.lineWidth = highwayObject.lineWidth;
	ctx.strokeStyle = highwayObject.strokeStyle;
	ctx.stroke();
	ctx.closePath();
}

function find_centroid(coords) {
	if (!connect) return new Object();

	var avg_x = 0, avg_y = 0;
	for (var i = 0; i < coords.length; i++) {
		avg_x += coords[i].x;
		avg_y += coords[i].y;
	}
	avg_x = Math.floor(avg_x / coords.length);
	avg_y = Math.floor(avg_y / coords.length);
	return generate_tuple(avg_x,avg_y);
}

function clean_centroids() {
	pc_xy = [];
	for (var i = 0; i < cc_xy.length; i++) pc_xy.push(cc_xy[i]);
	cc_xy = [];
	connect += 1;
}

function randn_bm() {
    var u = 0, v = 0;
    while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while(v === 0) v = Math.random();
    return Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
}

function random_int(min,max) {
	return Math.floor(Math.random()*(max-min)) + min;
}

function random_num(min,max) {
	return Math.random() * (max - min) + min;
}

function random_color() {
	var r = 255 * Math.random() | 0;
	var g = 255 * Math.random() | 0;
	var b = 255 * Math.random() | 0;
	return 'rgb(' + r + ',' + g + ',' + b + ')';
}

function random_reset() {
	x = random_int(0,width);
	y = random_int(0,height);
	cc_xy = [];
	connect = 0;
}

function clear_and_fill() {
	ctx.save();
	ctx.clearRect(0,0,width,height);
	ctx.fillStyle = "black";
	ctx.fillRect(0,0,width,height);
	ctx.restore();
}

function canvas_makeover(bT,bS) {
	ctx.save();
	clear_and_fill();
	if (bT) translate_canvas(offsetX,offsetY);
	if (bS) scale_canvas();	
	ctx.drawImage(copiedCanvas,0,0);
	ctx.restore();
}

function scale_canvas() {
	var newWidth = width * scale;
	var newHeight = height * scale;	
	ctx.translate(zeroPt.x-(newWidth-width)/2, zeroPt.y-(newHeight-height)/2);
	ctx.scale(scale,scale);	
}

function translate_canvas(mX,mY) {
	var newZeroPt = generate_tuple(-(mX-width/2-zeroPt.x),-(mY-height/2-zeroPt.y));
	ctx.translate(newZeroPt.x, newZeroPt.y);
	zeroPt = newZeroPt;
}

function generate_tuple(x,y) {
	var xy = new Object();
		xy.x = x;
		xy.y = y;
	return xy;
}

function draw_zoi(zoiO) {
		if (!zoiO) return;
		console.log(zoiO);
		ctx.beginPath();
		ctx.arc(zoiO.center.x,zoiO.center.y,zoiO.radius,0,Math.PI*2);
		ctx.lineWidth = zoiO.lineWidth;
		ctx.strokeStyle = zoiO.rimRGBA;
		ctx.stroke();
		ctx.fillStyle = zoiO.zoiColor;
		ctx.fill();
		ctx.closePath();
}

function draw_circle(bldgObject) {
	ctx.beginPath();
	ctx.arc(bldgObject.x,bldgObject.y,bldgObject.radius,0,Math.PI*2);
	ctx.fillStyle = bldgObject.color;
	ctx.fill();
	ctx.closePath();
}

function stochastic_draw() {

	if (x > width || x < 0) random_reset();
	if (y > height || y < 0) random_reset();
	cc_xy.push(generate_tuple(x,y));

	var bldgObject = new Object();
		bldgObject.x = x;
		bldgObject.y = y;
		bldgObject.radius = radius;
		bldgObject.color = color;

	ctxBuildings.push(bldgObject);
	draw_circle(bldgObject);

	var rjump = randn_bm();
	var can_leap = true;
	var dxy = new Object();
	var lcolor = 0;

	var dxflip = .5, dyflip = .5;
	if (rjump >= 4 || rjump <= -4) {
		dxy = leap_raindrop(256,256,dxflip,dyflip);
		lcolor = 4;
	} else if (rjump >= 3 || rjump <= -3) {
		dxy = leap_raindrop(64,64,dxflip,dyflip);
		lcolor = 3;
	} else if (rjump >= 2 || rjump <= -2) {
		dxy = leap_raindrop(32,32,dxflip,dyflip);
		lcolor = 2;
	} else if (rjump >= 1.5 || rjump <= -1.5) {
		dxy = leap_raindrop(16,16,dxflip,dyflip);
		lcolor = 1;
	} else {
		can_leap = false;
		dxy = leap_raindrop(4,4,dxflip,dyflip);
	}

	y += dxy.y;
	x += dxy.x;
	leapDistribution[lcolor] += 1;

	if (can_leap) {
		var cc_centroid = find_centroid(cc_xy);
		draw_line(find_centroid(pc_xy), cc_centroid, lineWidth, plc);
		var lw_pollution = lineWidth * cc_xy.length / Math.sqrt(2) / 2;
		for (var i = 0; i < cc_xy.length; i++) {
			draw_line(cc_centroid,cc_xy[i],lw_pollution,-1);
		}
		var zoiObject = new Object();
			zoiObject.center = cc_centroid;
			zoiObject.radius = cc_xy.length;
			zoiObject.zoiColor = color.slice(0,3) + "a" + color.slice(3,color.length-1) + ",.20)";
			zoiObject.lineWidth = 1;
			zoiObject.rimRGBA = zoiObject.zoiColor.slice(0,zoiObject.zoiColor.length-4) + ",.1)";	
		ctxZOI.push(zoiObject);

		clean_centroids();
		plc = lcolor;
		color = random_color();
	}
	if (zoiBool) draw_zoi(zoiObject);	
}

var ctx = $("#myCanvas")[0].getContext("2d");
ctx.imageSmoothingQuality = "high";
var width = ctx.canvas.width;
var height = ctx.canvas.height;
var copiedCanvas = $("#mockCanvas")[0];

var ctxZOI = []
var ctxBuildings = [];
var ctxHighways = [];

// Init random cluster color and position 
var color = random_color();
var x = random_int(0,width);
var y = random_int(0,height);

var cc_xy= []; // current cluster coordinates
var pc_xy = []; // previous cluster coordinates
var leapDistribution = [0,0,0,0,0];

var plc = 0; // previous line color
var radius = 1; // circle raidus
var lineWidth = 1; // width of line connecting cluster centroids
var connect = 0;
// var currIter = 0;
// var maxIter = 5000;

var zeroPt = generate_tuple(0,0);
var offsetX, offsetY;
var startScale = 1;
var scaleIncr = 0.1;
var scale = startScale;


ctx.fillStyle = "black";
ctx.fillRect(0,0,width,height);
var timerId, zoomId; 
var TR = 25;
var options = [0,1,0,0];
var numZooms = 0;
var wasd_io = false;

timerId = setInterval(stochastic_draw,TR);


// var myAsyncCalculation = function( x, cb ) {

// 	// Do stuff with x
// 	var y = 2.0 * x;

// 	// Asynchronous bullshit

// 	// ... Some time later ...

// 	if ( y < 0.0 ) {
// 		cb( "ERR: result is negative!", null );
// 		return;
// 	}

// 	cb( null, y );

// };

// function test () {
// 	var factor = 100.0;

// 	myAsyncCalculation( 4.0, function( err, result ) {

// 		if ( err ) {
// 			console.log( err );
// 			return;
// 		}

// 		console.log( "The result of the compuation is " + result );
// 		console.log( "The final value is " + result * factor );

// 	} );
	
// 	factor = 200.0;
// };


// var myPromiseMaker = function() {

// 	return new Promise( function( resolve, reject ) {

// 		var r = Math.random();

// 		if ( r < (1.0 / 3.0 ) ) {
// 			resolve( true );
// 			return;
// 		}

// 		if ( r < (2.0 / 3.0 ) ) {
// 			resolve( false );
// 			return;
// 		}

// 		reject( "FUCK YOU." );

// 	} );

// };

// myPromiseMaker().then( function( result ) {
// 							return new Promise( function( resolve, reject ) {
// 								if ( result ) {
// 									resolve( "We had a true result!" );
// 									return;
// 								}
// 								reject( "False result." );
// 							} );
// 						} )
// 				.then( function( result ) {
// 							console.log( result );
// 						} )
// 				.catch( function( reason ) {
// 							console.log( reason );
// 						} );

// ZOI toggle - some lines not being created
