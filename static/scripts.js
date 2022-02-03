const video = document.querySelector('.player');
const canvas = document.querySelector('.photo');
const ctx = canvas.getContext('2d');
const strip = document.querySelector('.strip');
const snap = document.querySelector('.snap');

let leftSide = false;


function getVideo() {
    navigator.mediaDevices.getUserMedia({video: true, audio:false}) // returns promise
        .then(localMediaStream => {
            //console.log(localMediaStream);
            video.srcObject = localMediaStream;
            video.play();
        })
        .catch(err => {
            console.error("You denied access to your webcam :(",err);
        });
}

function paintToCanvas(){
    const width = video.videoWidth;
    const height = video.videoHeight;
    //console.log(width,height)
    canvas.width = width; // set canvas dimensions to webcam 
    canvas.height = height; 
    const interval = 16; // millisec

    setInterval(() => {
        ctx.drawImage(video, 0, 0, width, height);
        let pixels = ctx.getImageData(0, 0, width, height); // getting the image data so  can do stupid shit with it
        // pixels is RGBalpha values for each pixel
        //pixels = redEffect(pixels); // actually messes with red gren and blue data for each
        //pixels = rgbSplit(pixels); 
        //console.log(typeof pixels) // object
        //pixels = inverse(pixels,width,height) 
        if(leftSide){ // invert image if leftSide true
            pixels = inverse(pixels,width,height) 
            }
        pixels = weirddouble(pixels,width,height) 

        //console.log(pixels.data.length) // 1228800
        
        ctx.putImageData(pixels, 0, 0); // put returned pixels back into canvas image
        //ctx.globalAlpha = 0.1; // puts image ontop and it sticks around for 1/value of frames

    }, interval);
}

function takePhoto(){
    snap.currentTime = 0; // resets sound clip to start
    snap.play(); // plays the sound of camera click

    //take data out of the canvas
    const data = canvas.toDataURL('image/pneg');
    //console.log(data) // text based form of photo data
    const link = document.createElement('a'); //anchor link
    link.href = data;
    link.setAttribute('download', 'symmetrical me');
    link.innerHTML = `<img src = "${data}" alt = "An improvement?" />` // displays photo
    strip.insertBefore(link, strip.firstChild); // puts it in the strip (html element) at the bottom

}

function redEffect(pixels) {
    for(let i = 0; i< pixels.data.length; i+=4) { // rgbalpha, got to go through every 4 for all the red starting on 0
        pixels.data[i+0] = pixels.data[i+0] + 100 // RED, making red more red
        pixels.data[i+1] = pixels.data[i+1] -50 // GREEN, making green less grren
        pixels.data[i+2] = pixels.data[i+2] * 0.5 // BLUE, etc
    }
    return pixels;
}

function rgbSplit(pixels) {
    for(let i = 0; i< pixels.data.length; i+=4) { // rgbalpha, got to go through every 4 for all the red starting on 0
        pixels.data[i+0] = pixels.data[i+500] // moving red pixels backwards
        pixels.data[i+150] = pixels.data[i+1]// moving green pixels forwards
        pixels.data[i-450] = pixels.data[i+2] // moving blue back
    }
    return pixels;
}

function inverse(pixels,width,height) {
    let pixels2data = Array.from(pixels.data)//Object.assign({},pixels); // copy whole object without back reference OH that only goes one layer deep
    let row = 0;
    const rowwidth = width*4;
    for(let i = 0; i< pixels.data.length; i+=4) {
        let rem = i % rowwidth; // remainder into
        if(rem==0){row ++} // moving down a row
        pixels.data[i] = pixels2data[row*rowwidth-1-rem-3] // red
        pixels.data[i+1] = pixels2data[row*rowwidth-1-rem-2] // green
        pixels.data[i+2] = pixels2data[row*rowwidth-1-rem-1] // blue
        pixels.data[i+3] = pixels2data[row*rowwidth-1-rem] // alpha
        
    }
    //pixels.data.reverse() // works (reverses rgbalphatoo and flips horiz and vertical)
    return pixels;
}

function weirddouble(pixels,width,height) {
    let pixels2 = Object.assign({},pixels); // copy whole object without back reference
    // same as inverse but because it writes over the original array only half the image gets copied
    let row = 0;
    const rowwidth = width*4;
    for(let i = 0; i< pixels.data.length; i+=4) {
        let rem = i % rowwidth; // remainder into
        if(rem==0){row ++} // moving down a row
        pixels.data[i] = pixels2.data[row*rowwidth-1-rem-3] // red
        pixels.data[i+1] = pixels2.data[row*rowwidth-1-rem-2] // green
        pixels.data[i+2] = pixels2.data[row*rowwidth-1-rem-1] // blue
        pixels.data[i+3] = pixels2.data[row*rowwidth-1-rem] // alpha
    }
    return pixels;
}

function switchLeftRight() {
    leftSide = !leftSide; // flips it to opposite true or false
    //console.log(leftSide);
}

getVideo();

video.addEventListener('canplay', paintToCanvas); // once fetched and can play video
