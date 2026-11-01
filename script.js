const pageContainer = document.querySelector('#pages');
const intro = document.querySelector('#intro');
const beginButton = document.querySelector('#begin-button');
const resumeButton = document.querySelector('#resume-button');
const ambience = document.querySelector('#ambience');
const soundToggle = document.querySelector('#sound-toggle');
const progressBar = document.querySelector('#reading-progress');
const storageKey = 'balarion-reader-position-v1';
let savedPageIndex = 0;
let saveFrame;
const pageObserver = 'IntersectionObserver' in window
  ? new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      pageObserver.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -4% 0px', threshold: 0.01 })
  : null;

function loadPages() {
  // pages.js is a local script rather than a fetched JSON file, so opening
  // index.html directly also works in browsers that block file:// fetches.
  if (!Array.isArray(window.MANGA_PAGES)) {
    pageContainer.innerHTML = '<p>Pages could not be loaded. Please run the page-list generator.</p>';
    return;
  }

  window.MANGA_PAGES.forEach((src, index) => {
    const image = document.createElement('img');
    image.className = 'page';
    image.src = src;
    image.alt = `Page ${index + 1}`;
    image.loading = index < 2 ? 'eager' : 'lazy';
    image.decoding = 'async';
    image.addEventListener('load', () => image.classList.add('is-loaded'), { once: true });
    image.addEventListener('error', () => image.classList.add('is-unavailable', 'is-loaded'), { once: true });
    pageContainer.append(image);
    if (image.complete) image.classList.add('is-loaded');
    if (pageObserver) pageObserver.observe(image);
    else image.classList.add('is-visible');
  });
}

function updateProgress() {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0;
  progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
}

function getSavedPageIndex() {
  try {
    const value = Number.parseInt(localStorage.getItem(storageKey), 10);
    return Number.isInteger(value) && value > 0 ? value : 0;
  } catch {
    return 0;
  }
}

function saveCurrentPage() {
  if (!document.body.classList.contains('is-reading')) return;

  const pages = [...pageContainer.querySelectorAll('.page')];
  const currentIndex = pages.findIndex((page) => page.getBoundingClientRect().bottom > window.innerHeight * 0.35);
  if (currentIndex < 1) return;

  try {
    localStorage.setItem(storageKey, String(currentIndex));
  } catch {
    // Reading remains available when a device does not allow local storage.
  }
}

function recordReadingPosition() {
  updateProgress();
  cancelAnimationFrame(saveFrame);
  saveFrame = requestAnimationFrame(saveCurrentPage);
}

function waitForImage(image) {
  if (image.complete) return Promise.resolve();
  return new Promise((resolve) => {
    image.addEventListener('load', resolve, { once: true });
    image.addEventListener('error', resolve, { once: true });
  });
}

async function resumeReading() {
  const pages = [...pageContainer.querySelectorAll('.page')];
  const targetIndex = Math.min(savedPageIndex, pages.length - 1);
  const imagesToPrepare = pages.slice(0, targetIndex + 1);

  imagesToPrepare.forEach((image) => { image.loading = 'eager'; });
  await Promise.all(imagesToPrepare.map(waitForImage));
  pages[targetIndex]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function beginReading(shouldResume = false) {
  document.body.classList.add('is-reading');
  intro.setAttribute('aria-hidden', 'true');
  soundToggle.hidden = false;

  try {
    await ambience.play();
    soundToggle.classList.remove('is-muted');
    soundToggle.setAttribute('aria-label', 'Mute audio');
  } catch (error) {
    // The chapter remains readable if a browser or device declines audio playback.
    soundToggle.classList.add('is-muted');
    soundToggle.setAttribute('aria-label', 'Unmute audio');
  }

  if (shouldResume) resumeReading();
}

function toggleSound() {
  ambience.muted = !ambience.muted;
  const isMuted = ambience.muted;
  soundToggle.classList.toggle('is-muted', isMuted);
  soundToggle.setAttribute('aria-label', isMuted ? 'Unmute audio' : 'Mute audio');

  if (!isMuted && ambience.paused) ambience.play().catch(() => {});
}

savedPageIndex = getSavedPageIndex();
if (savedPageIndex > 0) resumeButton.hidden = false;

beginButton.addEventListener('click', () => beginReading(false), { once: true });
resumeButton.addEventListener('click', () => beginReading(true), { once: true });
soundToggle.addEventListener('click', toggleSound);
window.addEventListener('scroll', recordReadingPosition, { passive: true });
window.addEventListener('resize', updateProgress);

loadPages();
updateProgress();
