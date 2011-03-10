var charlieSheenPath;

(function($){

  var sounds = [
    'addicted',
    'bingo',
    'bi-winning',
    'blood',
    'boom',
    'brain',
    'bring',
    'cant',
    'disease',
    'droopy',
    'drug',
    'drugs',
    'dying',
    'enjoy',
    'f18',
    'fires',
    'free',
    'gift',
    'gnarly',
    'going',
    'items',
    'job',
    'live',
    'love',
    'math',
    'medicine',
    'no',
    'orca',
    'pee',
    'remember',
    'rocks',
    'trolls',
    'underwear',
    'view',
    'violently',
    'withme'
  ];

  var images = [
    'bueller',
    'clean',
    'crazy',
    'duh',
    'interview',
    'normal',
    'shots'
  ];

  var imageData = {};
  var timer;
  var charlie;
  var imagePreload;
  var playing;
  var ready;

  function winning(options){
    if(!ready || playing) return;
    options = options || {};
    charlie.stop(true, true);

    var image = getOptionalOrRandom(images, options.image);
    var sound = getOptionalOrRandom(sounds, options.sound);
    var right = options.right || 10;
    var height = imageData[image].height;

    charlie.attr('src', getImage(image)).css({ right: right+'%', bottom: -height }).show();
    charlie.animate({ bottom: 0 }, { duration: 300 });
    clearTimeout(timer);

    $.playAudio(getSound(sound), function(){
      timer = setTimeout(function(){
        charlie.animate({ bottom: -height }, { duration: 300 });
        playing = false;
      }, 500);
    });

    playing = true;
  }

  function getImage(file){
    return charlieSheenPath + 'images/' + file + '.png';
  }

  function getSound(file){
    return charlieSheenPath + 'sounds/' + file + '.mp3';
  }

  function preloadAll(){
    var loaded = 0;
    $.each(images, function(i, url){
      var img = $('<img src="'+getImage(url)+'" />');
      imageData[url] = {};
      img.load(function(){
        imageData[url].height = img.height();
        imageData[url].width = img.width();
        if(loaded == images.length) ready = true;
      });
      imagePreload.append(img);
    });
    $.each(sounds, function(i, url){
      $.loadAudio(getSound(url));
    });
  }


  function getOptionalOrRandom(arr, name){
    if(name && $.inArray(name, arr) !== -1){
      return name;
    } else {
      return arr[Math.floor(Math.random() * arr.length)];
    }
  }

  function getPath(){
    var src = $('script[src$=charlie.js]').attr('src');
    var match = src.match(/(?:\/\/.*?\/)?(.*)charlie\.js/);
    if(match){
      charlieSheenPath = match[1];
    } else {
      charlieSheenPath = '';
    }
  }

  function initialize(){
    imagePreload = $('<div id="charlie_preload"/>').appendTo(document.body).css({ position: 'fixed', left: -20000 });
    charlie = $('<img id="charlie_sheen_winning"/>').appendTo(document.body).css({ display: 'block', position: 'fixed', bottom: -1000, zIndex: 50000 });
    $.winning = winning;
    $.winning.images = images;
    $.winning.sounds = sounds;
  }

  $(document).ready(initialize);
  $(document).bind('sound_player_ready', function(){
    preloadAll();
    ready = true;
  })

  getPath();


})(jQuery);


(function($){

  var method;
  var supported;
  var player;
  var sounds;
  var callbacks;
  var timer;

  function checkAudioSupport(){
    if(typeof Audio != 'undefined' && new Audio().canPlayType('audio/mpeg')){
      method = 'native';
      sounds = {};
      $(document).ready(soundPlayerReady);
    } else if(checkFlashSupport()){
      method = 'flash';
      embedFlashDOM();
      callbacks = {};
      $(document).bind('audio_played', function(event, url){
        if(callbacks[url]) callbacks[url](url);
      });
      $(document).ready(function(){
        timer = setInterval(checkForFlashPlayer, 500);
      });
    } else {
      supported = false;
    }
  }

  function checkForFlashPlayer(){
    player = $('#sound_player')[0];
    if(player && player.playAudio){
      clearInterval(timer);
      soundPlayerReady();
    }
  }

  function soundPlayerReady(){
    supported = true;
    $(document).trigger('sound_player_ready');
  }

  function checkFlashSupport(){
    if(typeof ActiveXObject !== 'undefined'){
      try {
        var obj = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
      } catch(e){ return true; }
      return obj && !obj.activeXError;
    } else {
      return navigator.mimeTypes["application/x-shockwave-flash"];
    }
  }

  function embedFlash(){
    var clsid = 'clsid:D27CDB6E-AE6D-11cf-96B8-444553540000';
    var swfURL = charlieSheenPath + 'sound.swf';
    var html = (typeof ActiveXObject === 'undefined')
    ? '<object id="sound_player" width="1" height="1" type="application/x-shockwave-flash" data="'+swfURL+'">' +
      '<param name="allowscriptaccess" value="always" />' +
      '</object>'
    : '<object id="sound_player" width="1" height="1" type="application/x-shockwave-flash" classid="'+clsid+'" data="'+swfURL+'">' +
      '<param name="allowscriptaccess" value="always" />' +
      '<param name="movie" value="'+swfURL+'" />' +
      '</object>';
    document.write(html);
  }

  function embedFlashDOM(){
    var clsid = 'clsid:D27CDB6E-AE6D-11cf-96B8-444553540000';
    var swfURL = charlieSheenPath + 'sound.swf';
    var html = (typeof ActiveXObject === 'undefined')
    ? '<object id="sound_player" width="1" height="1" type="application/x-shockwave-flash" data="'+swfURL+'">' +
      '<param name="allowscriptaccess" value="always" />' +
      '</object>'
    : '<object id="sound_player" width="1" height="1" type="application/x-shockwave-flash" classid="'+clsid+'" data="'+swfURL+'">' +
      '<param name="allowscriptaccess" value="always" />' +
      '<param name="movie" value="'+swfURL+'" />' +
      '</object>';
    $(document.body).append(html);
  }

  function playAudio(url, callback){
    if(!supported) return;
    if(method == 'native'){
      var audio = sounds[url] ? sounds[url] : loadAudio(url);
      audio.play();
      if(callback){
        audio.addEventListener('ended', callback);
      }
    } else {
      callbacks[url] = callback;
      player.playAudio(url, { played: 'soundPlayed' });
    }
  }

  function loadAudio(url){
    if(!supported) return;
    if(method == 'native'){
      var audio = new Audio();
      audio.src = url;
      audio.load();
      sounds[url] = audio;
      return audio;
    } else {
      player.loadAudio(url);
    }
  }

  checkAudioSupport();
  $.playAudio = playAudio;
  $.loadAudio = loadAudio;

})(jQuery);

function soundPlayed(url){
  $(document).trigger('audio_played', url);
}

