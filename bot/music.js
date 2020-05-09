let youtubeStream;
let bot;
let log;
let config;
let global;
let servId;

const youtubeFetcher = require('youtube-info');
const EventEmitter = require('events').EventEmitter;
const TimeFormat = require('hh-mm-ss');

let connectedVoiceChannel = null;
let _connection = null;
let _dispacher = null;
let _queue = [];
let volume = 1;
let currentPlayingInQueue = 0;
let currentUrl = null;
let songEvent = new EventEmitter();
let stream;
let isQueuePLaying = false;
let loop = 0;

module.exports = {
  _instanciate: function(_bot, _log, _config, _global, _stream) {
    bot = _bot;
    log = _log;
    global = _global;
    config = _config;
    youtubeStream = _stream;
    log.info('[START] Music sub-module OK');
    console.log('[START] Music sub-module OK');
  },
  management: async function(message, args) {
    servId = message.guild.id;


    switch (args[1]) {
      case 'join':

        if (connectedVoiceChannel === null) {
          connectedVoiceChannel = message.member.voice.channel;
          if (connectedVoiceChannel !== null) {
            connectedVoiceChannel.join().then(connection => {
              _connection = connection;
            }).catch(error => console.log(error));
          } else {
            message.channel.send('```diff\n- You are not connected to a voice channel```');
          }
        } else {
          message.channel.send('```diff\n- Bot already connected to a voice channel```');
        }

        break;

      case 'play':
        if (_connection !== null) {
          if (args[2] != undefined) {
            songEvent.emit('play', args[2]);
            let vidId = youtubeStream.getURLVideoID(args[2]);
            let metadata = (await youtubeFetcher(vidId));
            message.channel.send('```css\n#Music now playing:\nTitle: ' + metadata.title + '```');

          } else {
            message.channel.send('```diff\n- Missing parameters```');
          }
        } else {
          message.channel.send('```diff\n- Bot not connected in a voice channel```');
        }


        break;

      case 'playQueue':
        if (_connection !== null) {
          songEvent.emit('playQueue');
        } else {
          message.channel.send('```diff\n- Bot not connected in a voice channel```');
        }
        break;

      case 'leave':
        if (connectedVoiceChannel !== null) {
          connectedVoiceChannel.leave();
          connectedVoiceChannel = null;
          _connection = null;
         if (_dispacher !== null){
           _dispacher.destroy();
         }
        } else {
          message.channel.send('```diff\n- Bot not connected to a voice channel```');
        }
        break;

      case 'stop':
        _dispacher.destroy();
        message.channel.send('```diff\n- Music stopped```');
        break;

      case 'pause':
        _dispacher.pause();
        message.channel.send('```fix\n- Music paused```');
        break;

      case 'resume':
        _dispacher.resume();
        message.channel.send('```fix\n+ Music resumed```');
        break;

      case 'addToQueue':
        if (args[2] !== undefined) {
          let vidId = youtubeStream.getURLVideoID(args[2]);
          try {
            let metadata = (await youtubeFetcher(vidId));
          } catch (e) {
            message.channel.send('```diff\n- Error```');
          }

          var song = {'name': metadata.title, 'url': args[2]};
          _queue.push(song);
          message.channel.send('```diff\n+ Song successfully added! \n```');

        } else {
          message.channel.send('```diff\n- Missing parameters```');
        }
        break;


      case 'removeFromQueue':
        if (_queue.length !== 0) {
          if (args[2] !== null && Number.isInteger(parseInt(args[2], 10))) {
            if (0 <= parseInt(args[2], 10) < _queue.length) {
              if (isQueuePLaying && currentPlayingInQueue === parseInt(args[2], 10)) {
                songEvent.emit('skip');
              }
              let removed = _queue[parseInt(args[2], 10)];
              _queue.splice(parseInt(args[2], 10), 1);
              message.channel.send('```fix\n+ Song ' + removed.title + ' successfully removed from queue```');
            } else {
              message.channel.send('```diff\n- Index out of range!```');
            }
          } else {
            message.channel.send('```diff\n- Invalid argument\nNumber needed!```');
          }
        } else {
          message.channel.send('```diff\n- Queue is empty!```');
        }

        break;

      case 'skip':
        if (_connection !== null && _dispacher !== null) {
          if (isQueuePLaying) {
            songEvent.emit('skip');
            message.channel.send('```css\n#Music now playing:\nTitle: ' + _queue[currentPlayingInQueue].title + '```');
          } else {
            message.channel.send('```diff\n- You are not playing the queue !```');
          }
        } else {
          message.channel.send('```diff\n- Bot not connected in a voice channel```');
        }
        break;

      case 'previous':
        if (_connection !== null && _dispacher !== null) {
          if (isQueuePLaying) {
            songEvent.emit('previous');
            message.channel.send('```css\n#Music now playing:\nTitle: ' + _queue[currentPlayingInQueue].title + '```');
          } else {
            message.channel.send('```diff\n- You are not playing the queue !```');
          }
        } else {
          message.channel.send('```diff\n- Bot not connected in a voice channel```');
        }
        break;

      case 'clearQueue':
        _queue = [];
        message.channel.send('```fix\n+ Queue successfully cleared! \n```');
        break;

      case 'showQueue':
        if (_queue.length !== 0) {
          text = '```css\n#Music Queue\n';

          for (let i = 0; i < _queue.length; i++) {
            song = '[' + i + '] ' + _queue[i].name + '\n';
            text += song;
          }
          text += ' \n```';
          message.channel.send(text);
        } else {
          message.channel.send('```diff\n- Empty queue```');
        }


        break;

      case 'setVolume':
        let vol = args[2];
        if (0 <= vol <= 200) {
          volume = vol / 200;
          if (_dispacher !== null) {
            _dispacher.setVolume(volume);
          }
          message.channel.send('```fix\n+ Volume set to ' + vol + '% \n```');
        } else {
          message.channel.send('```diff\n- Volume out of range [0-200]```');
        }

        break;

      case 'current':
        if (_connection !== null && _dispacher !== null) {
          let vidId = youtubeStream.getURLVideoID(currentUrl);
          let metadata = (await youtubeFetcher(vidId));
          message.channel.send('```css\n#Music currently playing:\nTitle: ' + metadata.title + '\nDuration: ' + TimeFormat.fromS(metadata.duration) + '\nPublication date: ' + metadata.datePublished + ' \n```');
        } else {
          message.channel.send('```diff\n- Bot currently doing nothing!```');
        }
        break;

      case 'loop':
        loop++;
        if (loop > 2) {
          loop = 0;
        }
        let text;
        switch (loop) {
          case 0:
            text = '```diff\n- Loop set on: No-Repeat```';
            break;

          case 1:
            text = '```fix\n- Loop set on: Repeat-All```';
            break;

          case 2:
            text = '```diff\n+ Loop set on: Repeat-One```';
            break;
        }
        message.channel.send(text);
        break;
      case 'help':
        musicHelp(args,message);
        break;
    }

  },

};
songEvent.on('play', function(url, meta) {
  currentUrl = url;
  try {
    stream = youtubeStream(url, {
      filter: 'audioonly',
      quality: 'highestaudio',
      highWaterMark: 1 << 45,
    });
  } catch (e) {
    console.log(e);
  }
  _dispacher = _connection.play(stream);
  _dispacher.setVolume(volume);
  _dispacher.on('finish', function() {

    switch (loop) {
      case 0:
        if (isQueuePLaying === true) {
          currentPlayingInQueue++;
          if (currentPlayingInQueue < _queue.length) {
            songEvent.emit('play', _queue[currentPlayingInQueue].url);
          } else {
            isQueuePLaying = false;
            _dispacher.destroy();
          }
        } else {
          _dispacher.destroy();
        }
        break;
      case 1:
        if (isQueuePLaying === true) {
          currentPlayingInQueue++;
          if (currentPlayingInQueue < _queue.length) {

          } else {
            currentPlayingInQueue = 0;
          }
          songEvent.emit('play', _queue[currentPlayingInQueue].url);
        } else {
          songEvent.emit('play', currentUrl);
        }
        break;

      case 2:
        songEvent.emit('play', currentUrl);
        break;
    }


  });
});

songEvent.on('playQueue', function() {
  isQueuePLaying = true;
  songEvent.emit('play', _queue[currentPlayingInQueue].url);

});

songEvent.on('skip', function() {
  switch (loop) {
    case 0:
      if (currentPlayingInQueue++ >= _queue.length) {
        _dispacher.destroy();
        currentPlayingInQueue = 0;
      } else {
        songEvent.emit('play', _queue[currentPlayingInQueue].url);
      }

      break;

    case 1:
      if (currentPlayingInQueue++ >= _queue.length) {
        currentPlayingInQueue = 0;
      }
      songEvent.emit('play', _queue[currentPlayingInQueue].url);
      break;

    case 2:
      songEvent.emit('play', _queue[currentPlayingInQueue].url);
      break;
  }
});

songEvent.on('previous', function() {
  switch (loop) {
    case 0:
      if (currentPlayingInQueue-- <= 0) {
        currentPlayingInQueue = 0;
      } else {
        songEvent.emit('play', _queue[currentPlayingInQueue].url);
      }

      break;

    case 1:
      if (currentPlayingInQueue-- <= 0) {
        currentPlayingInQueue = _queue.length - 1;
      }
      songEvent.emit('play', _queue[currentPlayingInQueue].url);
      break;

    case 2:
      songEvent.emit('play', _queue[currentPlayingInQueue].url);
      break;
  }
});



function musicHelp(args, message) {

  if (args[2] != undefined) {
    switch (args[2]) {
      case 'join':
        message.channel.send( '```css\n#Music This command will connect the bot to your voice channel```');
        break;
      case 'leave':
        message.channel.send( '```css\n#Music This command will disconnect the bot from your voice channel```');
        break;
      case 'play':
        message.channel.send( '```css\n#Music This command will play a youtube video as a song. \nExample: !music play video_url```');
        break;
      case 'playQueue':
        message.channel.send( '```css\n#Music This command will play a song queue```');
        break;
      case 'addToQueue':
        message.channel.send( '```css\n#Music This command will add a youtube video as a song into the queue. \nExample: !music addToQueue video_url```');
        break;
      case 'skip':
        message.channel.send('```css\n#Music This command will skip to the next song in the queue```');
        break;
      case 'previous':
        message.channel.send( '```css\n#Music This command will skip to the previous song in the queue```');
        break;
      case 'pause':
        message.channel.send( '```css\n#Music This command will pause the current listening song.```');
        break;
      case 'resume':
        message.channel.send( '```css\n#Music This command will resume the current listening song.```');
        break;
      case 'stop':
        message.channel.send( '```css\n#Music This command  will stop the current listening song.```');
        break;
      case 'showQueue':
        message.channel.send( '```css\n#Music This command  will display the song list in the queue```');
        break;
      case 'clearQueue':
        message.channel.send( '```css\n#Music This command will delete all the songs in the queue```');
        break;
      case 'removeFromQueue':
        message.channel.send( '```css\n#Music This command will delete a song from the queue. \nExample: !music removeFromQueue 1 [where 1 is the song\'s index in the queue]```');
        break;
      case 'current':
        message.channel.send( '```css\n#Music This command will display  the current listening song\'s informations.```');
        break;
      case 'loop':
        message.channel.send( '```css\n#Music This command will toggle the loop. \n1 time -> no loop\n2 time -> repeat all\n3 time -> repeat one ```');
        break;

      case 'help':
        message.channel.send( 'https://tenor.com/view/hopeless-disappointed-ryan-reynolds-facepalm-embarrassed-gif-5436796');
        break;


    }
  } else {
    message.channel.send( '```css\n !music join : connect the bot' +
      '\n !music leave : disconnect the bot' +
      '\n !music play : play a song' +
      '\n !music playQueue : play the song queue' +
      '\n !music addToQueue : add a song to the queue' +
      '\n !music removeFromQueue : remove a song from the queue' +
      '\n !music clearQueue : reset all the queue' +
      '\n !music showQueue : display all the queue' +
      '\n !music skip : skip to the next song' +
      '\n !music previous : skip to the previous song' +
      '\n !music pause : pause the song' +
      '\n !music resume : resume the song' +
      '\n !music stop : stop the song' +
      '\n !music current : display current playing song' +
      '\n !music loop : toggle loop ```');

  }


}
