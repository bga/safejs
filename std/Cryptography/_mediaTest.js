navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.getUserMedia
navigator.getUserMedia({ video: true, audio: true }, function(stream) {
  //# [http://webreflection.blogspot.ru/2013/02/the-difficult-road-to-vine-via-web.html]
  function attachStream(media, stream) {
    try {
      // Canary likes like this
      media.src = window.URL.createObjectURL(stream);
    } catch(_) {
      // FF and Opera prefer this
      // I actually prefer this too
      media.src = stream;
    }
    try {
      // FF prefers this
      // I think it should not be needed if the video is autoplay
      // ... never mind
      media.play();
    } catch(_) {}
  }
  
  setTimeout(function() {
    plot.width = v.videoWidth
    plot.height = v.videoHeight
    setInterval(function() {
      var ctx = plot.getContext("2d")
      ctx.drawImage(v, 0, 0, plot.width, plot.height)
      var pixels = ctx.getImageData(0, 0, plot.width, plot.height)
      var i = plot.width * plot.height; while(i--) {
        var p =4 * i
        pixels.data[p] = pixels.data[p + 1] = pixels.data[p + 2] = 0 | 0.2126 * pixels.data[p] + 0.7152 * pixels.data[p + 1] + 0.0722 * pixels.data[p + 2]
      }
      ctx.putImageData(pixels, 0, 0)
    }, 1000 / 25)
  }, 1000)
  
  attachStream(v, stream)
  
}, function(err) {  })