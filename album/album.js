'use strict';

(() => {
  const $ = id => document.getElementById(id);
  const items = Array.isArray(window.PANDA_ALBUM_ITEMS) ? window.PANDA_ALBUM_ITEMS : [];
  const embedded = window.parent !== window;
  const localFile = location.protocol === 'file:';
  const parentOrigin = localFile ? '*' : location.origin;
  const state = { photo: 0, returnFocus: null, playRequest: 0 };
  const video = $('largeVideo');
  const photo = $('largePhoto');
  const viewer = $('photoOverlay');
  const stage = $('mediaStage');
  const playButton = $('playVideo');
  let touch = null, suppressClickUntil = 0;

  function notifyParent(type) {
    if (embedded) window.parent.postMessage({ type }, parentOrigin);
  }

  function releaseVideo() {
    state.playRequest += 1;
    video.pause();
    video.removeAttribute('src');
    video.removeAttribute('poster');
    video.load();
    playButton.hidden = true;
  }

  function closeAlbum() {
    releaseVideo();
    if (embedded) notifyParent('panda-album:close');
    else location.href = $('closeAlbum').href;
  }

  function closePhoto() {
    releaseVideo();
    photo.removeAttribute('src');
    $('photoOverlay').hidden = true;
    $('albumOverlay').hidden = false;
    (state.returnFocus?.isConnected ? state.returnFocus : $('closeAlbum')).focus();
  }

  function showPhoto(index, open = false) {
    if (!items.length) return;
    state.photo = (index + items.length) % items.length;
    const item = items[state.photo];
    const isVideo = item.type === 'video';
    releaseVideo();
    photo.removeAttribute('src');
    video.hidden = !isVideo;
    photo.hidden = isVideo;
    playButton.hidden = !isVideo;
    playButton.textContent = '点击播放';
    $('mediaStatus').hidden = true;
    $('photoTitle').textContent = item.title;
    $('photoDate').textContent = item.date === '原声可开关' ? '' : item.date || '';
    $('photoCount').textContent = `${state.photo + 1} / ${items.length}`;

    if (isVideo) {
      if (item.poster) video.poster = item.poster;
      video.src = item.src;
    } else {
      photo.alt = item.title;
      photo.src = item.src;
    }

    if (open) {
      state.returnFocus = document.activeElement;
      $('albumOverlay').hidden = true;
      $('photoOverlay').hidden = false;
      $('closePhoto').focus();
    }
  }

  function playVideo() {
    if (viewer.hidden || video.hidden || performance.now() < suppressClickUntil) return;
    const request = ++state.playRequest;
    playButton.hidden = true;
    $('mediaStatus').hidden = true;
    video.play().catch(() => {
      if (request !== state.playRequest || viewer.hidden || video.hidden) return;
      playButton.hidden = false;
      $('mediaStatus').textContent = '录像暂时没能播放，请再点一次播放。';
      $('mediaStatus').hidden = false;
    });
  }

  if (embedded) $('closeAlbum').setAttribute('aria-label', '关闭相册');
  else document.documentElement.dataset.standalone = 'true';

  items.forEach((item, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'photo-tile';
    const image = document.createElement('img');
    image.loading = 'lazy';
    image.decoding = 'async';
    image.src = item.poster || item.src;
    image.alt = item.title;
    const label = document.createElement('span');
    label.textContent = item.type === 'video'
      ? `▶ ${item.title}${Number.isFinite(item.duration) ? ` · ${Math.round(item.duration)}秒` : ''}`
      : item.title;
    button.append(image, label);
    button.addEventListener('click', () => showPhoto(index, true));
    $('albumGrid').append(button);
  });
  if (!items.length) {
    $('albumHint').textContent = Array.isArray(window.PANDA_ALBUM_ITEMS)
      ? '相册里暂时还没有照片或录像。'
      : '相册暂时没能打开，请关闭后再试一次。';
  }

  $('closeAlbum').addEventListener('click', event => { event.preventDefault(); closeAlbum(); });
  $('closePhoto').addEventListener('click', closePhoto);
  playButton.addEventListener('click', playVideo);
  video.addEventListener('play', () => { playButton.hidden = true; });
  video.addEventListener('pause', () => {
    if (!viewer.hidden && !video.hidden && video.hasAttribute('src')) playButton.hidden = false;
  });
  video.addEventListener('ended', () => {
    if (!viewer.hidden && !video.hidden) { playButton.textContent = '重新播放'; playButton.hidden = false; }
  });
  for (const media of [photo, video]) {
    media.addEventListener('error', () => {
      if (media.hidden || !media.hasAttribute('src')) return;
      $('mediaStatus').textContent = media === video
        ? '这段录像暂时没能播放，可以先翻看其他照片。'
        : '这张照片暂时没能打开，可以先翻看其他照片。';
      $('mediaStatus').hidden = false;
    });
  }

  stage.addEventListener('touchstart', event => {
    touch = null;
    if (event.touches.length !== 1) return;
    const point = event.touches[0];
    // Leave the native video's bottom control strip to play, mute and seeking.
    if (!video.hidden && point.clientY >= video.getBoundingClientRect().bottom - 72) return;
    touch = { x: point.clientX, y: point.clientY };
  }, { passive: true });
  stage.addEventListener('touchmove', event => {
    if (!touch || event.touches.length !== 1) { touch = null; return; }
    const dx = event.touches[0].clientX - touch.x, dy = event.touches[0].clientY - touch.y;
    if (Math.abs(dy) > 15 && Math.abs(dy) >= Math.abs(dx)) { touch = null; return; }
    if (Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy) && event.cancelable) event.preventDefault();
  }, { passive: false });
  stage.addEventListener('touchcancel', () => { touch = null; }, { passive: true });
  stage.addEventListener('touchend', event => {
    if (!touch || event.touches.length || !event.changedTouches.length) return;
    const dx = event.changedTouches[0].clientX - touch.x;
    const dy = event.changedTouches[0].clientY - touch.y;
    touch = null;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) {
      suppressClickUntil = performance.now() + 500;
      showPhoto(state.photo + (dx < 0 ? 1 : -1));
    }
  }, { passive: true });

  for (const overlay of [$('albumOverlay'), $('photoOverlay')]) {
    overlay.addEventListener('click', event => {
      if (event.target === overlay) overlay.id === 'photoOverlay' ? closePhoto() : closeAlbum();
    });
  }
  document.addEventListener('keydown', event => {
    const viewing = !$('photoOverlay').hidden;
    if (event.key === 'Escape') {
      event.preventDefault();
      viewing ? closePhoto() : closeAlbum();
      return;
    }
    if (viewing && event.target !== video && ['ArrowLeft', 'ArrowRight'].includes(event.key)) {
      event.preventDefault();
      showPhoto(state.photo + (event.key === 'ArrowRight' ? 1 : -1));
    }
    if (event.key === 'Tab') {
      const active = viewing ? $('photoOverlay') : $('albumOverlay');
      const controls = [...active.querySelectorAll('button,a[href],video[controls]')]
        .filter(node => !node.disabled && !node.closest('[hidden]'));
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  window.addEventListener('message', event => {
    if (!embedded || event.source !== window.parent) return;
    // Local files have opaque origins; browsers serialize them differently.
    if (localFile ? !['null', 'file://'].includes(event.origin) : event.origin !== location.origin) return;
    if (event.data?.type === 'panda-album:focus') {
      ($('photoOverlay').hidden ? $('closeAlbum') : $('closePhoto')).focus();
    }
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) video.pause(); });
  window.addEventListener('pagehide', releaseVideo);
  notifyParent('panda-album:ready');
})();
