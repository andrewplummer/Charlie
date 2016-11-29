var audioPlayerPath;

(function($){

  var method;
  var supported;
  var player;
  var sounds;
  var callbacks;
  var timer;

  function getPath(){
    var src = $('script[src$="audio.js"]').attr('src');
    var match = src.match(/(?:\/\/.*?\/)?(.*)audio\.js/);
    if(match){
      audioPlayerPath = match[1];
    } else {
      audioPlayerPath = '';
    }
  }

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

  function embedFlashDOM(){
    var clsid = 'clsid:D27CDB6E-AE6D-11cf-96B8-444553540000';
    var swfURL = audioPlayerPath + 'sound.swf';
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

  $.playAudio = playAudio;
  $.loadAudio = loadAudio;
  getPath();
  checkAudioSupport();

})(jQuery);

function soundPlayed(url){
  $(document).trigger('audio_played', url);
}



