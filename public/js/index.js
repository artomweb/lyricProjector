let current_track = "";
let currentPlaybackTime = 0;
let lyricsIndex = 0;
let playbackTimer;
let isPlaying = false;
let currentStateTimer;
let lyrics = [];
let currentLyric = "";
let songName = "";
let artistName = "";

function align() {
  var a = $(".highlighted").height();
  var c = $(".content").height();
  var d =
    $(".highlighted").offset().top - $(".highlighted").parent().offset().top;
  var e = d + a / 2 - c / 2;
  $(".content").animate(
    { scrollTop: e + "px" },
    { easing: "swing", duration: 250 }
  );
}

function alignLyrics() {
  if ($(".lyrics").height() != lyricHeight) {
    //Either width changes so that a line may take up or use less vertical space or the window height changes, 2 in 1
    lyricHeight = $(".lyrics").height();
    align();
  }
}

var lyricHeight = $(".lyrics").height();
$(window).on("resize", () => {
  if ($(".lyrics").height() != lyricHeight) {
    //Either width changes so that a line may take up or use less vertical space or the window height changes, 2 in 1
    lyricHeight = $(".lyrics").height();
    align();
  }
});

function showLyrics() {
  let $cont = $(".lyrics");
  $cont.empty();
  for (let i = 0; i < lyrics.length; i++) {
    let $elem = $("<div></div>");
    if (i === 0) {
      $elem.addClass("highlighted");
    }
    $elem.text(lyrics[i].words);
    $cont.append($elem);
  }

  let $songDetails = $(".songDetails");
  $songDetails.empty();

  let $songNameElem = $("<div></div>").addClass("songName").text(songName);
  let $songArtistElem = $("<div></div>")
    .addClass("songArtist")
    .text(artistName);

  $songDetails.append($songNameElem).append($songArtistElem);
  align();
}

function updateLyrics() {
  const pastLyrics = lyrics.filter(
    (lyric) => lyric.startTimeMs < currentPlaybackTime
  );

  if (pastLyrics[pastLyrics.length - 1] !== currentLyric) {
    currentLyric = pastLyrics[pastLyrics.length - 1];
    $(".lyrics div").removeClass("highlighted");
    $(`.lyrics div:nth-child(${pastLyrics.length})`).addClass("highlighted");
    align();
  }
}

function updatePlaybackTime() {
  currentPlaybackTime += 50; // Increment by 100 milliseconds (adjust as needed)

  // console.log("updating playback time", currentPlaybackTime);

  updateLyrics();
  // align();
}

window.onSpotifyWebPlaybackSDKReady = () => {
  const player = new Spotify.Player({
    name: "Lyric Projector",
    getOAuthToken: (cb) => {
      cb(TOKEN);
    },
    volume: 0.5,
  });

  // Ready
  player.addListener("ready", ({ device_id }) => {
    console.log("Ready with Device ID", device_id);
  });

  // Not Ready
  player.addListener("not_ready", ({ device_id }) => {
    console.log("Device ID has gone offline", device_id);
  });

  player.addListener("initialization_error", ({ message }) => {
    console.error(message);
  });

  player.addListener("authentication_error", async ({ message }) => {
    console.log("Authentication error");
    console.log(player);
    const data = await fetch("/api/refresh_token").then((response) =>
      response.json()
    );
    console.log("data", data);
    TOKEN = data.access_token;
  });

  player.addListener("account_error", ({ message }) => {
    console.log("Account Error");
    console.error(message);
  });

  function getCurrentState() {
    player.getCurrentState().then((state) => {
      if (!state) {
        console.error("User is not playing music through the Web Playback SDK");
        return;
      }
      processStateUpdate(state);
    });
  }

  async function processStateUpdate(data) {
    console.log(data);

    const URI = data.track_window.current_track.id;

    if (URI !== current_track) {
      // If song has changed
      const response = await fetch("/lyrics/" + URI);
      lyrics = await response.json();
      console.log(lyrics);
      current_track = URI;
      songName = data.track_window.current_track.name;
      artistName = data.track_window.current_track.artists[0].name;
      showLyrics();
    }

    currentPlaybackTime = data.position; // Updata playback time

    const pausedVar = data.paused;

    if (pausedVar) {
      // If paused then stop counting time
      clearInterval(playbackTimer);
      playbackTimer = null;
      clearInterval(currentStateTimer);
      currentStateTimer = null;
      isPlaying = false;
    } else {
      if (!isPlaying) {
        isPlaying = true;

        playbackTimer = setInterval(updatePlaybackTime, 50);
        currentStateTimer = setInterval(getCurrentState, 1000);
      }
    }

    updateLyrics();

    // console.log("currentPlaybackTime", currentPlaybackTime);
  }

  player.addListener("player_state_changed", async (state) => {
    processStateUpdate(state);
  });

  player.connect();
  document.body.click();
  player.togglePlay();
  player.togglePlay();
  // document.getElementById("togglePlay").onclick = function () {
  //   player.togglePlay();
  // };
};
