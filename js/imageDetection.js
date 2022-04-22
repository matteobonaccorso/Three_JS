//functions to manage image detection

// Check if webcam access is supported.
function getUserMediaSupported() {
    return !!(navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia);
}

function detectImages(source) {
  // Now let's start classifying a frame in the stream.
  model.detect(source).then(function (predictions) {

    squares.splice(0);

    // Now lets loop through predictions and draw them to the live view if
    // they have a high confidence score.
    for (let n = 0; n < predictions.length; n++) {
      // If we are over 66% sure we are sure we classified it right, draw it!
      if (predictions[n].score > 0.66) {
        const p = document.createElement('p');
        p.innerText = predictions[n].class  + ' - with ' 
            + Math.round(parseFloat(predictions[n].score) * 100) 
            + '% confidence.';
        p.style = 'margin-left: ' + predictions[n].bbox[0] + 'px; margin-top: '
            + (predictions[n].bbox[1] - 10) + 'px; width: ' 
            + (predictions[n].bbox[2] - 10) + 'px; top: 0; left: 0;';

        const highlighter = document.createElement('div');
        highlighter.setAttribute('class', 'highlighter');
        highlighter.style = 'left: ' + predictions[n].bbox[0] + 'px; top: '
            + predictions[n].bbox[1] + 'px; width: ' 
            + predictions[n].bbox[2] + 'px; height: '
            + predictions[n].bbox[3] + 'px;';

        // document.body.appendChild(highlighter);
        // document.body.appendChild(p);
        squares.push(highlighter);
        squares.push(p);
      } 
    }  
  });
}

