(function(global){

  var imageUrl;
  var audioUrl;
  var imageEl;
  var audioEl;
  var imageHeight;
  var transformProp;
  var transitionProp;
  var audioNativeSupported;
  var transitionDuration = 200;

  function checkAudioSupport() {
    if(typeof Audio != 'undefined' && new Audio().canPlayType('audio/mpeg')){
      audioNativeSupported = true;
    }
  }

  function play() {
    imageEl.style[transitionProp] = 'all '+transitionDuration+'ms ease-out';
    imageEl.style[transformProp] = 'translateY(0)';
    setTimeout(function() {
      audioEl.play();
    }, transitionDuration);
  }

  function audioPlayed() {
    imageEl.style[transitionProp] = 'all '+transitionDuration+'ms ease-in';
    imageEl.style[transformProp] = 'translateY('+imageHeight+'px)';
  }

  function extractFromParams() {
    var params = {};
    var match = document.currentScript.src.match(/\?(.+)$/);
    if(match) {
      var split = match[1].split('&');
      split.forEach(function(param) {
        var s = param.split('=');
        params[s[0]] = s[1];
      });
    }
    if(params.image) {
      imageUrl = decodeURIComponent(params.image);
    }
    if(params.sound) {
      audioUrl = decodeURIComponent(params.sound);
    }
  }

  function getVendorPrefix(el) {
    var prefixes = [ 'webkit','moz','ms','o' ], prop;
    for (var i = 0, len = prefixes.length; i < len; i++) {
      prop = prefixes[i] + 'Transform';
      if(el.style[prop] !== undefined) {
        transformProp = prop;
        transitionProp = prefixes[i] + 'Transition';
        return;
      }
    }
    transformProp = 'transform';
    transitionProp = 'transition';
  }

  function initialize() {
    var imageLoaded, audioLoaded;
    if(!audioNativeSupported) return;
    extractFromParams();

    function checkLoadFinished() {
      if(imageLoaded && audioLoaded) {
        setTimeout(function() {
          play();
        }, 200);
      }
    }

    imageEl = new Image();
    imageEl.src = imageUrl;
    imageEl.style.display = 'block';
    imageEl.style.position = 'fixed';
    imageEl.style.right = Math.floor(Math.random() * 100) + '%';
    imageEl.style.bottom = '-1000px';
    imageEl.style.zIndex = '50000';
    imageEl.onload = function() {
      imageHeight = imageEl.height;
      imageEl.style.bottom = '0';
      imageEl.style[transformProp] = 'translateY('+imageHeight+'px)';
      imageLoaded = true;
      checkLoadFinished();
    }
    getVendorPrefix(imageEl);
    document.body.appendChild(imageEl);

    audioEl = new Audio();
    audioEl.addEventListener('canplaythrough', function(){
      audioLoaded = true;
      checkLoadFinished();
    });
    audioEl.addEventListener('ended', audioPlayed);
    audioEl.src = audioUrl;
    document.body.appendChild(audioEl);
  }

  checkAudioSupport();
  initialize();

})(this);
