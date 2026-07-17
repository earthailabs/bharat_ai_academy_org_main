/**
 * Bharat AI Academy — Slide Layout Renderers
 * Maps slide data → HTML for each layout type
 */

const LayoutRenderers = {

  hero(slide) {
    const c = slide.content || {};
    const badges = (c.badges || []).map(b => `<span class="badge">${b}</span>`).join('');
    const imagePath = c.image || slide.image;
    return `
      <div class="layout-hero">
        <div class="hero-content animate-fade-up">
          <div class="hero-badges">${badges}</div>
          <h1 class="slide-title">${slide.title}</h1>
          <p class="slide-subtitle">${slide.subtitle}</p>
          ${c.tagline ? `<p class="text-electric" style="font-size:1.2rem;font-weight:500">${c.tagline}</p>` : ''}
        </div>
        <div class="hero-image">
          ${imagePath ? this._image(imagePath, slide.title) : '<div class="image-placeholder">Hero Image</div>'}
        </div>
      </div>`;
  },

  title(slide) {
    const c = slide.content || {};
    const icon = (slide.icons && slide.icons[0]) || c.icon || '✨';
    return `
      <div class="layout-title-center">
        <div class="title-icon animate-fade-in">${this._emoji(icon)}</div>
        <h1 class="slide-title">${slide.title}</h1>
        <p class="slide-subtitle">${slide.subtitle}</p>
        ${c.points ? `<ul class="content-list" style="max-width:600px;margin-top:24px">${c.points.map(p => `<li><span class="list-icon">${this._emoji(p.icon || '•')}</span>${p.text || p}</li>`).join('')}</ul>` : ''}
      </div>`;
  },

  cards(slide) {
    const cards = (slide.content && slide.content.cards) || [];
    const cols = cards.length <= 2 ? 2 : cards.length <= 3 ? 3 : 4;
    return `
      <div>
        <h1 class="slide-title">${slide.title}</h1>
        <p class="slide-subtitle">${slide.subtitle}</p>
        <div class="grid-${cols} stagger" style="margin-top:32px">
          ${cards.map(card => `
            <div class="card" style="text-align:center">
              ${card.image ? `<img class="card-avatar" src="${card.image}" alt="${card.title}" loading="lazy">` : ''}
              ${card.icon ? `<div class="icon" style="margin:0 auto 12px">${this._emoji(card.icon)}</div>` : ''}
              <div class="card-title">${card.title}</div>
              <div class="card-text">${card.text || card.role || ''}</div>
            </div>
          `).join('')}
        </div>
      </div>`;
  },

  split(slide) {
    const c = slide.content || {};
    const imagePath = c.image || slide.image;
    return `
      <div class="layout-split">
        <div class="animate-fade-up">
          <h1 class="slide-title">${slide.title}</h1>
          <p class="slide-subtitle">${slide.subtitle}</p>
          ${c.items ? `<ul class="content-list" style="margin-top:24px">${c.items.map(item => `<li><span class="list-icon">${this._emoji(item.icon || '→')}</span><div><strong>${item.title || ''}</strong> ${item.text || item}</div></li>`).join('')}</ul>` : ''}
          ${c.source ? `<p class="text-source" style="margin-top:16px">${c.source}</p>` : ''}
        </div>
        <div>
          ${imagePath ? this._image(imagePath, slide.title) : '<div class="image-placeholder">Image</div>'}
        </div>
      </div>`;
  },

  timeline(slide) {
    const items = (slide.content && slide.content.items) || [];
    const vertical = slide.content && slide.content.vertical;
    if (vertical) {
      return `
        <div>
          <h1 class="slide-title">${slide.title}</h1>
          <p class="slide-subtitle">${slide.subtitle}</p>
          <div class="timeline-vertical stagger" style="margin-top:32px;max-width:700px">
            ${items.map((item, i) => `
              <div class="timeline-item">
                <div class="timeline-dot ${item.active ? 'active' : ''}"></div>
                <div>
                  <div class="timeline-label">${item.label || item.time}</div>
                  <div class="timeline-desc">${item.desc || item.text || ''}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>`;
    }
    return `
      <div>
        <h1 class="slide-title">${slide.title}</h1>
        <p class="slide-subtitle">${slide.subtitle}</p>
        <div class="timeline stagger" style="margin-top:32px">
          ${items.map((item, i) => `
            <div class="timeline-item">
              <div class="timeline-dot ${item.active ? 'active' : ''}"></div>
              <div class="timeline-label">${item.label}</div>
              <div class="timeline-desc">${item.desc || ''}</div>
            </div>
          `).join('')}
        </div>
      </div>`;
  },

  roadmap(slide) {
    const weeks = (slide.content && slide.content.weeks) || [];
    return `
      <div>
        <h1 class="slide-title">${slide.title}</h1>
        <p class="slide-subtitle">${slide.subtitle}</p>
        <div class="roadmap stagger" style="margin-top:40px">
          ${weeks.map((w, i) => `
            <div class="roadmap-week ${w.active ? 'active' : ''}">
              <div class="roadmap-week-number">Week ${i + 1}</div>
              <div class="roadmap-week-title">${w.title}</div>
              <div class="roadmap-week-desc">${w.desc || ''}</div>
            </div>
          `).join('')}
        </div>
      </div>`;
  },

  comparison(slide) {
    const c = slide.content || {};
  const left = c.left || {};
    const right = c.right || {};
    return `
      <div>
        <h1 class="slide-title">${slide.title}</h1>
        <p class="slide-subtitle">${slide.subtitle}</p>
        <div class="comparison stagger" style="margin-top:32px">
          <div class="comparison-side">
            <h3>${left.title || 'Left'}</h3>
            <ul class="comparison-list">${(left.items || []).map(i => `<li>${i}</li>`).join('')}</ul>
          </div>
          <div class="comparison-divider">vs</div>
          <div class="comparison-side">
            <h3>${right.title || 'Right'}</h3>
            <ul class="comparison-list">${(right.items || []).map(i => `<li>${i}</li>`).join('')}</ul>
          </div>
        </div>
      </div>`;
  },

  grid(slide) {
    const items = (slide.content && slide.content.items) || [];
    const cols = slide.content && slide.content.columns || (items.length > 12 ? 5 : items.length > 8 ? 4 : 3);
    return `
      <div>
        <h1 class="slide-title">${slide.title}</h1>
        <p class="slide-subtitle">${slide.subtitle}</p>
        <div class="grid-${cols} stagger" style="margin-top:24px">
          ${items.map(item => `
            <div class="grid-item">
              <div class="icon icon-sm">${this._emoji(item.icon || '•')}</div>
              <div class="grid-item-label">${item.label || item}</div>
            </div>
          `).join('')}
        </div>
      </div>`;
  },

  list(slide) {
    const items = (slide.content && slide.content.items) || [];
    return `
      <div>
        <h1 class="slide-title">${slide.title}</h1>
        <p class="slide-subtitle">${slide.subtitle}</p>
        <ul class="content-list stagger" style="margin-top:32px;max-width:800px">
          ${items.map(item => `<li><span class="list-icon">${this._emoji(item.icon || '✓')}</span>${item.text || item}</li>`).join('')}
        </ul>
      </div>`;
  },

  stats(slide) {
    const stats = (slide.content && slide.content.stats) || [];
    const cols = stats.length <= 3 ? 3 : 4;
    return `
      <div>
        <h1 class="slide-title">${slide.title}</h1>
        <p class="slide-subtitle">${slide.subtitle}</p>
        <div class="grid-${cols} stagger" style="margin-top:32px">
          ${stats.map(s => `
            <div class="stat-card">
              <div class="stat-number">${s.value}</div>
              <div class="stat-label">${s.label}</div>
            </div>
          `).join('')}
        </div>
        ${slide.content && slide.content.source ? `<p class="text-source" style="text-align:center;margin-top:24px">${slide.content.source}</p>` : ''}
      </div>`;
  },

  discussion(slide) {
    const question = slide.discussion || slide.content?.question || slide.subtitle;
    return `
      <div class="layout-title-center">
        <div class="discussion-question animate-fade-up">${question}</div>
        ${slide.content && slide.content.hint ? `<p class="slide-subtitle" style="margin-top:32px">${slide.content.hint}</p>` : ''}
      </div>`;
  },

  activity(slide) {
    const c = slide.content || {};
    return `
      <div>
        <h1 class="slide-title">${slide.title}</h1>
        <div class="activity-box animate-fade-up" style="margin-top:32px;max-width:800px;margin-left:auto;margin-right:auto">
          <div class="activity-icon">${this._emoji(c.icon || slide.icons?.[0] || '🎯')}</div>
          <p class="activity-instructions">${c.instructions || slide.activity || slide.subtitle}</p>
          ${c.steps ? `<ul class="content-list" style="margin-top:16px;text-align:left">${c.steps.map(s => `<li>${s}</li>`).join('')}</ul>` : ''}
        </div>
      </div>`;
  },

  quiz(slide) {
    const c = slide.content || {};
    const options = c.options || [];
    return `
      <div>
        <h1 class="slide-title">${slide.title}</h1>
        <p class="slide-subtitle">${slide.subtitle}</p>
        ${options.length ? `<div class="quiz-options stagger">${options.map(o => `<div class="quiz-option">${o}</div>`).join('')}</div>` : ''}
      </div>`;
  },

  build(slide) {
    const steps = (slide.content && slide.content.steps) || [];
    return `
      <div>
        <h1 class="slide-title">${slide.title}</h1>
        <p class="slide-subtitle">${slide.subtitle}</p>
        <div style="margin-top:24px;max-width:800px">
          ${steps.map((step, i) => `
            <div class="build-step stagger">
              <div class="build-step-number">${i + 1}</div>
              <div class="build-step-content">
                <h4>${step.title}</h4>
                <p>${step.text || ''}</p>
                ${step.example ? `<code style="display:block;margin-top:8px;padding:8px 12px;background:var(--color-electric-light);border-radius:8px;font-size:0.85rem">${step.example}</code>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>`;
  },

  _image(src, alt) {
    return `<div class="image-placeholder"><img src="${src}" alt="${alt || ''}" loading="lazy" onerror="this.parentElement.innerHTML='<span>📷 ${src}</span>'"></div>`;
  },

  _emoji(name) {
    const map = {
      sparkles: '✨', brain: '🧠', robot: '🤖', chat: '💬', image: '🖼️',
      video: '🎬', code: '💻', search: '🔍', productivity: '⚡', map: '🗺️',
      youtube: '▶️', instagram: '📸', netflix: '🎬', amazon: '🛒', shield: '🛡️',
      mail: '📧', student: '🎓', professional: '💼', business: '🏢', family: '👨‍👩‍👧',
      health: '🏥', education: '📚', agriculture: '🌾', government: '🏛️',
      city: '🏙️', factory: '🏭', growth: '📈', change: '🔄', heart: '❤️',
      lightbulb: '💡', target: '🎯', laptop: '💻', handshake: '🤝', question: '❓',
      star: '⭐', check: '✓', arrow: '→', globe: '🌍', india: '🇮🇳',
      morning: '🌅', night: '🌙', food: '🥗', workout: '💪', sleep: '😴',
      motivation: '🔥', routine: '📋', habits: '✅', home: '🏠', finance: '💰',
      creativity: '🎨', leadership: '👑', thinking: '🤔', communication: '🗣️',
      adaptability: '🔄', problem: '🧩', emotional: '💛', portfolio: '📁',
      website: '🌐', presentation: '📊', project: '🚀', mentor: '👤',
      welcome: '👋', trophy: '🏆', calendar: '📅', clock: '⏰', tools: '🔧',
      ai: '🤖', data: '📊', trainer: '👨‍🏫', security: '🔒', creator: '🎥',
      engineer: '⚙️', technician: '🔧', camera: '📷', music: '🎵', write: '✍️'
    };
    return map[name] || name;
  },

  render(slide) {
    const layout = slide.layout || 'title';
    const renderer = this[layout];
    if (!renderer) {
      console.warn(`Unknown layout: ${layout}, falling back to title`);
      return this.title(slide);
    }
    return renderer.call(this, slide);
  }
};

if (typeof module !== 'undefined') module.exports = LayoutRenderers;
