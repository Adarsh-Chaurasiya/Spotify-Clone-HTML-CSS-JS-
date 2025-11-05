// Search Button 
document.getElementById("searchToggle").addEventListener("click", function () {
  const form = document.getElementById("SearchForm");
  const input = document.getElementById("SearchInput");
  const searchText = input.value.trim().toLowerCase();


  form.classList.toggle("active");

  if (form.classList.contains("active")) {
    input.focus();
  } else {
    input.value = "";
    clearHighlights();
    removeMessage();
  }

  // Input Search 
  if (searchText !== "") {
    searchCard(searchText);
  }
});

// Live Search on typing
let debounceTimer;
document.getElementById("SearchInput").addEventListener("keyup", function () {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    const searchText = this.value.trim().toLowerCase();
    if (searchText !== "") {
      searchCard(searchText);
    } else {
      clearHighlights();
      removeMessage();
    }
  }, 300); // wait 300ms after typing stops
});


// Main Search function 
function searchCard(text) {
  const cards = document.querySelectorAll(".card");
  let found = false;

  cards.forEach(card => {
    const songEl = card.querySelector(".song-title");
    const artistEl = card.querySelector(".song-artist");

    if (!songEl || !artistEl) return;

    const song = songEl.textContent;
    const artist = artistEl.textContent;

    // Reset previous highlights
    songEl.innerHTML = song;
    artistEl.innerHTML = artist;

    const lowerText = text.toLowerCase();
    const lowerSong = song.toLowerCase();
    const lowerArtist = artist.toLowerCase();

    let songMatched = lowerSong.includes(lowerText);
    let artistMatched = lowerArtist.includes(lowerText);

    if (songMatched || artistMatched) {
      if (songMatched) {
        const markedSong = song.replace(new RegExp(`(${text})`, "ig"), `<mark>$1</mark>`);
        songEl.innerHTML = markedSong;
      }

      if (artistMatched) {
        const markedArtist = artist.replace(new RegExp(`(${text})`, "ig"), `<mark>$1</mark>`);
        artistEl.innerHTML = markedArtist;
      }

      card.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      found = true;
    }
  });

  // Message handling
  if (!found) {
    showMessage("No Matching Found");
  } else {
    hideMessage();
  }
}



// remove Highlight 
function clearHighlights() {

  const cards = document.querySelectorAll(".card");

  cards.forEach(card => {
    const songEl = card.querySelector(".song-title");
    const artistEl = card.querySelector(".song-artist");

    if (!songEl || !artistEl) return;

    songEl.innerHTML = songEl.textContent;
    artistEl.innerHTML = artistEl.textContent;
  });
}

//  Show error in search box itself
function showMessage(msg) {
  const msgDiv = document.getElementById("searchMessage");
  msgDiv.textContent = msg;
  msgDiv.style.display = "block";
}

function hideMessage() {
  const msgDiv = document.getElementById("searchMessage");
  msgDiv.style.display = "none";
}










// playlist 
// let currentSong = new Audio();
let songs;
let CrrFolder;

async function getSongs(folder) {
  CrrFolder = folder;
  

  // Load songs.json file
  const res = await fetch("songs.json");
  const data = await res.json();

  // Combine all song arrays (trending + popular)
  const allSongs = [...data.trending, ...data.popular];

  // Filter songs that match the folder
  songs = allSongs
    .filter(song => song.folder.toLowerCase() === folder.toLowerCase())
    .map(song => song.filename);

  // Show all songs in playlist
  const songUL = document.querySelector(".songlist ul");
  songUL.innerHTML = "";

  songs.forEach(song => {
    songUL.innerHTML += `
      <li onclick="playMusic('${song}')">  
        <img src="Assets/Musiccccccccc.png" class="invert music" alt="">
        <div class="artist">
          <div>${song.replaceAll("%20", " ")}</div>
        </div>
        <div class="playnow">
          <span>Play Now</span>
          <img src="Assets/play.png" width="18px" class="play-bttn invert" alt="">
        </div>
      </li>`;
  });

  // Add click event for each <li>
  Array.from(songUL.getElementsByTagName("li")).forEach(e => {
    e.addEventListener("click", () => {
      playMusic(e.querySelector(".artist").firstElementChild.innerHTML.trim());
    });
  });
}




let currentSong = new Audio();


function formatTime(seconds) {
  let minutes = Math.floor(seconds / 60);
  let remainingSeconds = seconds % 60;

  // Pad with leading zeros
  let formattedMinutes = String(minutes).padStart(2, '0');
  let formattedSeconds = String(remainingSeconds).padStart(2, '0');

  return `${formattedMinutes}:${formattedSeconds}`;
}





const playMusic = (track) => {
  currentSong.src = `${CrrFolder}/` + track

  currentSong.play();

  // show info on UI 
  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";

  document.getElementById("play-song").style.display = "none";
  document.getElementById("pause").style.display = "block";



}

async function main() {

  // Get the  list of All songs 
  await getSongs("Songs/trending");

  document.querySelector(".songinfo").innerHTML = decodeURI(songs[0]);
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";




  // Attach an event listen to play, next and previous 
  let playBtn = document.getElementById("play-song");
  let pauseBtn = document.getElementById("pause");

  playBtn.addEventListener("click", () => {
    if (!currentSong.src) {
      playMusic(songs[0]);

      document.querySelectorAll(".songlist li").forEach(li => {
        li.classList.remove("playing"); // remove old
      });

      document.querySelector(".songlist li").classList.add("playing"); // add to first
    } else {
      currentSong.play();
    }

    playBtn.style.display = "none";     // hide play button
    pauseBtn.style.display = "block";  // show pause button
  });

  pauseBtn.addEventListener("click", () => {
    currentSong.pause();
    pauseBtn.style.display = "none";    // hide pause button
    playBtn.style.display = "block";   // show play button
  });


  // listen to timepass event 
  function secondsToMinutesSeconds(seconds) {
    let mins = Math.floor(seconds / 60);
    let secs = Math.floor(seconds % 60);

    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  // Listen to timeupdate event
  currentSong.addEventListener("timeupdate", () => {

    if (!isNaN(currentSong.duration)) {
      let current = secondsToMinutesSeconds(currentSong.currentTime);
      let total = secondsToMinutesSeconds(currentSong.duration);
      document.querySelector(".songtime").innerHTML = `${current} / ${total}`;
      document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";

    }
  });


  // add an event listerner to seekbar 
  document.querySelector(".seekbar").addEventListener("click", e => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = ((currentSong.duration) * percent) / 100
  })

  // add on event listener for humburgerm andd CloseBtn
  const hamburger = document.querySelector(".humburger");
  const slidebar = document.querySelector(".left");
  const CloseBtn = document.querySelector(".close");


  hamburger.addEventListener("click", () => {
    slidebar.style.left = "0";
  });

  CloseBtn.addEventListener("click", () => {
    slidebar.style.left = "-2000%";

  });


  // add an event Listener to previous
  previous.addEventListener("click", () => {
    currentSong.pause()
    console.log("previous clicked")

    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index > 0) {
      playMusic(songs[index - 1]);

    }

  })

  // add an event Listener to Next 
  next.addEventListener("click", () => {
    currentSong.pause()
    console.log("Next clicked");

    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);

    }

  })

  document.querySelectorAll(".card").forEach(card => {
    card.addEventListener("click", async () => {
      const song = card.dataset.song;
      const folder = card.dataset.folder;

      if (!song || !folder) {
        console.warn("Card missing data-song or data-folder", card);
        return;
      }

      await getSongs(folder);
      playMusic(song);

    });
  });


  // Volume Control Logic
  document.querySelector(".range").addEventListener("input", (e) => {
    currentSong.volume = parseInt(e.target.value) / 100;
  });

  // Add event listener to Mute Volume 
document.querySelector(".volume > img").addEventListener("click", e => {
  const volIcon = e.target;
  const volumeSlider = document.querySelector("input.range");

  console.log(volIcon);
  console.log("changing", volIcon.src);

  const isMuted = volIcon.src.includes("volume.png");

  volIcon.src = volIcon.src.replace(isMuted ? "volume.png" : "mute.png", isMuted ? "mute.png" : "volume.png");
  volIcon.style.width = isMuted ? "22px" : "";
  currentSong.volume = isMuted ? 0 : 0.5;
  volumeSlider.value = isMuted ? 0 : 50;
});





// Load songs.json and render cards
fetch("songs.json")
  .then(res => res.json())
  .then(data => {
    renderSongs(data.trending, "trending-container");
    renderSongs(data.popular, "Popular-container");
  })
  .catch(err => {
    console.error("Error loading songs.json", err);
  });

// Render cards into container
function renderSongs(songArray, containerId) {
  const container = document.getElementById(containerId);

  if (!container) {
    console.warn(`Container #${containerId} not found`);
    return;
  }

  songArray.forEach(song => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.dataset.folder = song.folder;
    card.dataset.song = song.filename;

card.innerHTML = `
  <div class="song-card">
    <div class="card-img-wrap">
      <img src="${song.cover}" alt="${song.title}" class="song-cover">
      <img src="Assets/play-icon.png" class="play-btn"/>
    </div>
    <div class="song-info">
      <h3 class="song-title">${song.title}</h3>
      <p class="song-artist">${song.artist}</p>
    </div>
  </div>
`;

    card.addEventListener("click", async () => {
      await getSongs(song.folder);
      playMusic(song.filename);
    });

    container.appendChild(card);
  });
}







}
window.addEventListener("DOMContentLoaded", () => {
  main();

  // Image optimizations
  document.querySelectorAll("img").forEach(img => {
    if (!img.hasAttribute("decoding")) img.setAttribute("decoding", "async");
    if (!img.hasAttribute("loading")) img.setAttribute("loading", "lazy");
  });
});
