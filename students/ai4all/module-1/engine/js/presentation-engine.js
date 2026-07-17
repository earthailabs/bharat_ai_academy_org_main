/**
 * Bharat AI Academy — Presentation Engine
 * Navigation, fullscreen, progress, speaker notes
 */

class PresentationEngine {
  constructor(container, data) {
    this.container = container;
    this.data = data;
    this.currentSlide = 0;
    this.notesVisible = false;
    this.slides = data.slides || [];
    this.sections = data.sections || [];
    this.meta = data.meta || {};
    this.totalSlides = this.slides.length;

    this._buildDOM();
    this._bindEvents();
    this._handleHash();
    this.goTo(0);
  }

  _buildDOM() {
    const logo = this.meta.logo || '../../engine/assets/logo.svg';
    const moduleLabel = this.meta.module || 'Module';
    const dayLabel = this.meta.day || 'Day';

    this.container.innerHTML = `
      <div class="presentation" id="presentation">
        <div class="progress-bar"><div class="progress-fill" id="progress-fill"></div></div>
        <div class="section-indicator" id="section-indicator"></div>

        <div class="slide-header">
          <img class="logo" src="${logo}" alt="Bharat AI Academy" onerror="this.alt='Bharat AI Academy'">
          <div class="header-meta">
            <span>${moduleLabel}</span>
            <span>${dayLabel}</span>
            <span class="slide-counter" id="slide-counter">1 / ${this.totalSlides}</span>
          </div>
        </div>

        <div class="slides-container" id="slides-container"></div>

        <div class="slide-footer">© Bharat AI Academy</div>

        <aside class="speaker-notes-panel" id="speaker-notes">
          <h4>Speaker Notes</h4>
          <p id="speaker-notes-text"></p>
        </aside>

        <div class="help-overlay" id="help-overlay">
          <div class="help-content">
            <h3>Keyboard Shortcuts</h3>
            <p><kbd>→</kbd> <kbd>Space</kbd> Next slide</p>
            <p><kbd>←</kbd> <kbd>Shift+Space</kbd> Previous slide</p>
            <p><kbd>F</kbd> Fullscreen</p>
            <p><kbd>N</kbd> Speaker notes</p>
            <p><kbd>?</kbd> This help</p>
            <p><kbd>Esc</kbd> Close / exit fullscreen</p>
          </div>
        </div>
      </div>`;

    this._renderSections();
    this._renderSlides();
  }

  _renderSections() {
    const indicator = this.container.querySelector('#section-indicator');
    if (!this.sections.length) {
      indicator.style.display = 'none';
      return;
    }
    indicator.innerHTML = this.sections.map(s => 
      `<span class="section-dot" data-section="${s.id}">${s.title}</span>`
    ).join('');
  }

  _renderSlides() {
    const container = this.container.querySelector('#slides-container');
    container.innerHTML = this.slides.map((slide, i) => `
      <div class="slide" id="slide-${i}" data-section="${slide.section || ''}" aria-hidden="true">
        <div class="slide-body">
          ${LayoutRenderers.render(slide)}
        </div>
      </div>
    `).join('');
  }

  _bindEvents() {
    document.addEventListener('keydown', (e) => this._onKeydown(e));

    let touchStartX = 0;
    document.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
    document.addEventListener('touchend', (e) => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) diff > 0 ? this.next() : this.prev();
    });

    window.addEventListener('hashchange', () => this._handleHash());

    this.container.querySelector('#help-overlay').addEventListener('click', (e) => {
      if (e.target.id === 'help-overlay') this._toggleHelp(false);
    });
  }

  _onKeydown(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    switch (e.key) {
      case 'ArrowRight':
      case ' ':
      case 'PageDown':
        e.preventDefault();
        this.next();
        break;
      case 'ArrowLeft':
      case 'PageUp':
        e.preventDefault();
        this.prev();
        break;
      case 'Shift':
        break;
      default:
        if (e.shiftKey && e.key === ' ') {
          e.preventDefault();
          this.prev();
        }
    }

    if (!e.shiftKey) {
      switch (e.key) {
        case 'Home': e.preventDefault(); this.goTo(0); break;
        case 'End': e.preventDefault(); this.goTo(this.totalSlides - 1); break;
        case 'f':
        case 'F': e.preventDefault(); this._toggleFullscreen(); break;
        case 'n':
        case 'N': e.preventDefault(); this._toggleNotes(); break;
        case '?': e.preventDefault(); this._toggleHelp(); break;
        case 'Escape':
          this._toggleHelp(false);
          if (this.notesVisible) this._toggleNotes(false);
          break;
      }
    }
  }

  goTo(index) {
    if (index < 0 || index >= this.totalSlides) return;
    
    const slides = this.container.querySelectorAll('.slide');
    slides.forEach((s, i) => {
      s.classList.remove('active', 'prev');
      s.setAttribute('aria-hidden', i !== index);
      if (i === index) s.classList.add('active');
      else if (i < index) s.classList.add('prev');
    });

    this.currentSlide = index;
    this._updateProgress();
    this._updateSection();
    this._updateNotes();
    this._preloadImage(index + 1);

    const hash = `#slide-${index + 1}`;
    if (window.location.hash !== hash) {
      history.replaceState(null, '', hash);
    }
  }

  next() { this.goTo(this.currentSlide + 1); }
  prev() { this.goTo(this.currentSlide - 1); }

  _updateProgress() {
    const pct = ((this.currentSlide + 1) / this.totalSlides) * 100;
    this.container.querySelector('#progress-fill').style.width = `${pct}%`;
    this.container.querySelector('#slide-counter').textContent = 
      `${this.currentSlide + 1} / ${this.totalSlides}`;
  }

  _updateSection() {
    const slide = this.slides[this.currentSlide];
    const sectionId = slide?.section;
    const dots = this.container.querySelectorAll('.section-dot');
    
    let currentSectionIndex = 0;
    this.sections.forEach((s, i) => {
      if (s.id === sectionId) currentSectionIndex = i;
    });

    dots.forEach((dot, i) => {
      dot.classList.remove('active', 'completed');
      if (dot.dataset.section === sectionId) dot.classList.add('active');
      else if (i < currentSectionIndex) dot.classList.add('completed');
    });
  }

  _updateNotes() {
    const slide = this.slides[this.currentSlide];
    const notesEl = this.container.querySelector('#speaker-notes-text');
    if (notesEl && slide) {
      let notes = slide.speakerNotes || '';
      if (slide.discussion) notes += `\n\nDiscussion: ${slide.discussion}`;
      if (slide.activity) notes += `\n\nActivity: ${slide.activity}`;
      notesEl.textContent = notes;
    }
  }

  _toggleNotes(force) {
    this.notesVisible = force !== undefined ? force : !this.notesVisible;
    this.container.querySelector('#speaker-notes').classList.toggle('visible', this.notesVisible);
  }

  _toggleHelp(force) {
    const show = force !== undefined ? force : !this.container.querySelector('#help-overlay').classList.contains('visible');
    this.container.querySelector('#help-overlay').classList.toggle('visible', show);
  }

  _toggleFullscreen() {
    const el = this.container.querySelector('#presentation');
    if (!document.fullscreenElement) {
      el.requestFullscreen?.() || el.webkitRequestFullscreen?.();
    } else {
      document.exitFullscreen?.() || document.webkitExitFullscreen?.();
    }
  }

  _handleHash() {
    const match = window.location.hash.match(/#slide-(\d+)/);
    if (match) {
      const index = parseInt(match[1], 10) - 1;
      if (index >= 0 && index < this.totalSlides) this.goTo(index);
    }
  }

  _preloadImage(nextIndex) {
    if (nextIndex >= this.totalSlides) return;
    const slide = this.slides[nextIndex];
    const imgPath = slide?.content?.image || slide?.image;
    if (imgPath) {
      const img = new Image();
      img.src = imgPath;
    }
  }
}

if (typeof module !== 'undefined') module.exports = PresentationEngine;
