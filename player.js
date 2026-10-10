const tracks = [
  {
    title: 'SoundHelix Song 1',
    artist: 'SoundHelix',
    collection: 'Open Sessions',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    artwork: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1000&q=85',
    alt: 'Artist performing under warm stage lights',
  },
  {
    title: 'SoundHelix Song 2',
    artist: 'SoundHelix',
    collection: 'Open Sessions',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    artwork: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1000&q=85',
    alt: 'Crowd gathered in front of a concert stage',
  },
  {
    title: 'SoundHelix Song 3',
    artist: 'SoundHelix',
    collection: 'Open Sessions',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    artwork: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1000&q=85',
    alt: 'Outdoor music festival at sunset',
  },
];

const audio = document.querySelector('#audio');
const playButton = document.querySelector('#play-button');
const progress = document.querySelector('#progress');
const volume = document.querySelector('#volume');
const autoplayButton = document.querySelector('#autoplay-button');
const shuffleButton = document.querySelector('#shuffle-button');
const trackList = document.querySelector('#track-list');
const miniAlbumList = document.querySelector('#mini-album-list');
let currentTrack = 0;
let autoplay = false;
let shuffle = false;

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '--:--';
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${remainder}`;
}

function renderPlaylist() {
  trackList.innerHTML = tracks.map((track, index) => `
    <li>
      <button class="track-row" type="button" data-track-index="${index}" aria-current="${index === currentTrack}" aria-label="Play ${track.title} by ${track.artist}">
        <span class="track-number"><span class="track-number-text">${String(index + 1).padStart(2, '0')}</span><span class="row-playing" aria-hidden="true"><i></i><i></i><i></i></span></span>
        <img src="${track.artwork.replace('w=1000', 'w=160')}" alt="" loading="lazy">
        <span class="track-row-copy"><span class="track-row-title">${track.title}</span><span class="track-row-artist">${track.artist} · ${track.collection}</span></span>
        <span class="track-duration" data-duration-index="${index}">--:--</span>
      </button>
    </li>`).join('');

  miniAlbumList.innerHTML = tracks.map((track, index) => `
    <button class="mini-album" type="button" data-track-index="${index}" aria-label="Play ${track.title}">
      <img src="${track.artwork.replace('w=1000', 'w=120')}" alt="" loading="lazy">
      <span class="mini-album-caption">${track.title}<small>${track.artist}</small></span>
    </button>`).join('');
}

function updateTrackDisplay() {
  const track = tracks[currentTrack];
  document.querySelector('#song-title').textContent = track.title;
  document.querySelector('#song-artist').innerHTML = `${track.artist} <span class="artist-separator">·</span> ${track.collection}`;
  const artwork = document.querySelector('#album-art');
  artwork.src = track.artwork;
  artwork.alt = track.alt;
  document.querySelector('#track-index').textContent = `${String(currentTrack + 1).padStart(2, '0')} / ${String(tracks.length).padStart(2, '0')}`;
  document.querySelectorAll('.track-row').forEach((row, index) => {
    row.setAttribute('aria-current', String(index === currentTrack));
    row.classList.toggle('is-playing', index === currentTrack && !audio.paused);
  });
  document.querySelector('#duration').textContent = formatTime(audio.duration);
}

function updatePlayState(isPlaying) {
  playButton.classList.toggle('is-playing', isPlaying);
  playButton.setAttribute('aria-label', isPlaying ? 'Pause' : 'Play');
  playButton.title = isPlaying ? 'Pause' : 'Play';
  document.querySelectorAll('.track-row').forEach((row, index) => {
    row.classList.toggle('is-playing', isPlaying && index === currentTrack);
  });
  document.querySelector('#playback-status').textContent = isPlaying ? 'NOW PLAYING' : 'READY WHEN YOU ARE';
}

function loadTrack(index, shouldPlay = false) {
  currentTrack = (index + tracks.length) % tracks.length;
  audio.src = tracks[currentTrack].src;
  audio.load();
  progress.value = '0';
  progress.style.setProperty('--range-fill', '0%');
  document.querySelector('#current-time').textContent = '0:00';
  updateTrackDisplay();
  updatePlayState(false);
  if (shouldPlay) playTrack();
}

async function playTrack() {
  try {
    await audio.play();
  } catch {
    updatePlayState(false);
    document.querySelector('#playback-status').textContent = 'AUDIO COULD NOT BE LOADED';
  }
}

function moveTrack(direction) {
  let nextIndex = currentTrack + direction;
  if (shuffle && tracks.length > 1) {
    do {
      nextIndex = Math.floor(Math.random() * tracks.length);
    } while (nextIndex === currentTrack);
  }
  loadTrack(nextIndex, true);
}

renderPlaylist();
audio.volume = Number(volume.value);
updateTrackDisplay();

document.querySelector('#play-button').addEventListener('click', () => {
  if (audio.paused) playTrack();
  else audio.pause();
});
document.querySelector('#previous-button').addEventListener('click', () => moveTrack(-1));
document.querySelector('#next-button').addEventListener('click', () => moveTrack(1));
trackList.addEventListener('click', (event) => {
  const button = event.target.closest('[data-track-index]');
  if (button) loadTrack(Number(button.dataset.trackIndex), true);
});
miniAlbumList.addEventListener('click', (event) => {
  const button = event.target.closest('[data-track-index]');
  if (button) loadTrack(Number(button.dataset.trackIndex), true);
});

audio.addEventListener('play', () => updatePlayState(true));
audio.addEventListener('pause', () => updatePlayState(false));
audio.addEventListener('loadedmetadata', () => {
  document.querySelector('#duration').textContent = formatTime(audio.duration);
  const duration = document.querySelector(`[data-duration-index="${currentTrack}"]`);
  if (duration) duration.textContent = formatTime(audio.duration);
});
audio.addEventListener('timeupdate', () => {
  document.querySelector('#current-time').textContent = formatTime(audio.currentTime);
  if (Number.isFinite(audio.duration) && audio.duration > 0) {
    const percentage = (audio.currentTime / audio.duration) * 100;
    progress.value = String(percentage);
    progress.style.setProperty('--range-fill', `${percentage}%`);
  }
});
audio.addEventListener('ended', () => {
  if (autoplay) moveTrack(1);
  else {
    progress.value = '0';
    progress.style.setProperty('--range-fill', '0%');
    document.querySelector('#current-time').textContent = '0:00';
  }
});
audio.addEventListener('error', () => {
  if (audio.currentSrc) {
    updatePlayState(false);
    document.querySelector('#playback-status').textContent = 'AUDIO COULD NOT BE LOADED';
  }
});

progress.addEventListener('input', () => {
  const percentage = Number(progress.value);
  progress.style.setProperty('--range-fill', `${percentage}%`);
  if (Number.isFinite(audio.duration)) audio.currentTime = (percentage / 100) * audio.duration;
});
volume.addEventListener('input', () => {
  audio.volume = Number(volume.value);
  document.querySelector('#volume-value').textContent = `${Math.round(audio.volume * 100)}%`;
  volume.style.setProperty('--range-fill', `${audio.volume * 100}%`);
});
autoplayButton.addEventListener('click', () => {
  autoplay = !autoplay;
  autoplayButton.setAttribute('aria-pressed', String(autoplay));
  autoplayButton.setAttribute('aria-label', `Autoplay ${autoplay ? 'on' : 'off'}`);
  autoplayButton.title = `Autoplay ${autoplay ? 'on' : 'off'}`;
});
shuffleButton.addEventListener('click', () => {
  shuffle = !shuffle;
  shuffleButton.setAttribute('aria-pressed', String(shuffle));
});
document.querySelector('#like-button').addEventListener('click', (event) => {
  const button = event.currentTarget;
  const liked = button.getAttribute('aria-pressed') !== 'true';
  button.setAttribute('aria-pressed', String(liked));
  button.setAttribute('aria-label', liked ? 'Unlike this track' : 'Like this track');
  button.innerHTML = `<span aria-hidden="true">${liked ? '♥' : '♡'}</span>`;
});

volume.style.setProperty('--range-fill', `${audio.volume * 100}%`);
