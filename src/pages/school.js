import { go } from '../utils/router.js';

export function renderSchool() {
  const view = document.createElement('div');
  view.className = 'page active';
  view.dataset.title = 'AI for School Students';
  view.innerHTML = `
    <div class="shero">
      <div class="shi">
        <div class="hero-eye" style="margin-bottom:16px;display:inline-flex">🏫 Weekend Program · 4 Weeks · ₹4,999</div>
        <h1>AI for <span>School Students</span></h1>
        <p>A 1-month creative AI program for students aged 10–17. Learn AI tools, build mini projects, and develop future-ready skills in a fun environment.</p>
        <div class="apills">
          <span class="ap">👶 Age 10–12 · Junior</span>
          <span class="ap">🧒 Age 13–15 · Intermediate</span>
          <span class="ap">🧑 Age 16–17 · Senior</span>
        </div>
      </div>
    </div>
    <section>
      <div class="container-x">
        <div class="shdr ctr">
          <div class="eye">4-Week Curriculum</div>
          <h2 class="stitle">What Students Learn</h2>
          <p class="ssub">Weekend classes — Saturday &amp; Sunday. Fun, creative, and super practical.</p>
        </div>
        <div class="swgrid">
          <div class="swc"><div class="swn">Week 1</div><h3>🖥 Computer &amp; Digital World</h3><ul><li>Computer basics &amp; keyboard shortcuts</li><li>Internet safety &amp; digital citizenship</li><li>Google tools for students</li><li>What is AI and how it thinks</li></ul></div>
          <div class="swc"><div class="swn">Week 2</div><h3>🤖 AI &amp; ChatGPT Basics</h3><ul><li>Using ChatGPT for homework &amp; learning</li><li>Writing prompts to get great answers</li><li>AI image creation (draw anything!)</li><li>Voice AI tools &amp; assistants</li></ul></div>
          <div class="swc"><div class="swn">Week 3</div><h3>🎨 AI for Studies &amp; Creativity</h3><ul><li>AI for essay writing &amp; presentations</li><li>Creating a YouTube/Instagram idea</li><li>AI music &amp; story generation</li><li>AI for science &amp; math problems</li></ul></div>
          <div class="swc"><div class="swn">Week 4</div><h3>🚀 Mini Projects &amp; Showcase</h3><ul><li>Build an AI-powered presentation</li><li>Create a simple AI chatbot</li><li>Design a personal portfolio page</li><li>Project showcase &amp; certificates 🎓</li></ul></div>
        </div>
        <div class="spbox">
          <div class="spbox-l"><h3>AI for School Students</h3><p>1 month · Weekend classes · Charkhi Dadri</p></div>
          <div class="spbox-p"><div class="am">₹4,999</div><div class="no">Total fee · No hidden charges</div></div>
          <div class="spbox-m">
            <span>📍 Charkhi Dadri, Haryana</span>
            <span>🗓 4 Weekends (Sat + Sun)</span>
            <span>👥 Max 20 students per batch</span>
            <span>📜 Certificate included</span>
          </div>
          <button class="btn-bl" data-go="register" data-program="school" style="white-space:nowrap">Enroll Now →</button>
        </div>
      </div>
    </section>
    <section class="bg-gray">
      <div class="container-x">
        <div class="shdr ctr">
          <div class="eye">Why Students Love It</div>
          <h2 class="stitle">Learning That's Actually Fun</h2>
        </div>
        <div class="wgrid">
          <div class="wcard"><span class="wico">🎮</span><h4>Game-Based Learning</h4><p>Fun activities, challenges, and games make AI exciting for school kids.</p></div>
          <div class="wcard"><span class="wico">🏆</span><h4>Mini Competitions</h4><p>Weekly project challenges with prizes to keep students engaged.</p></div>
          <div class="wcard"><span class="wico">👨‍👩‍👧</span><h4>Parent Updates</h4><p>Weekly WhatsApp updates so parents stay connected to progress.</p></div>
          <div class="wcard"><span class="wico">📜</span><h4>Verified Certificate</h4><p>Every student gets a Bharat AI Academy certificate for their portfolio.</p></div>
        </div>
      </div>
    </section>
  `;
  view.addEventListener('click', (e) => {
    const t = e.target.closest('[data-go]');
    if (t) {
      const program = t.dataset.program;
      go(t.dataset.go, program ? { program } : {});
    }
  });
  return view;
}
