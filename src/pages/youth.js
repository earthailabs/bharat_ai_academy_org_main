import { go } from '../utils/router.js';

export function renderYouth() {
  const view = document.createElement('div');
  view.className = 'page active';
  view.dataset.title = 'AI for Youth';
  view.innerHTML = `
    <div class="phero">
      <div class="phi">
        <div class="hero-eye" style="margin-bottom:16px;display:inline-flex">🧑‍💻 Batch Starting 8 June 2026 · 40 Seats Only</div>
        <h1>AI for Youth Program</h1>
        <p>8-week intensive offline AI training in Charkhi Dadri. Skills to get a job, freelance, or launch your own AI business.</p>
        <div class="btns" style="justify-content:flex-start">
          <button class="btn-dk" data-go="register" data-program="youth">Reserve Your Seat →</button>
          <a class="btn-gh" href="tel:+919876543210">📞 Call Us</a>
        </div>
      </div>
    </div>
    <section>
      <div class="container-x">
        <div class="pblock">
          <div class="pl">
            <h2>Program Details</h2>
            <div class="sub">First batch · June 2026 · Haryana</div>
            <div class="prow"><span class="porig">₹84,000</span><span class="pcur">₹17,000</span></div>
            <div class="pmeta">
              <span>📍 Charkhi Dadri, Haryana</span>
              <span>🗓 8 Weeks · Mon–Fri</span>
              <span>🕐 3 hrs/day — 2 teaching + 1 practical</span>
              <span>👥 40 students max per batch</span>
              <span>⚠️ Price increases from next batch</span>
            </div>
            <button class="btn-bl" data-go="register" data-program="youth" style="width:100%;justify-content:center">Secure Your Seat →</button>
          </div>
          <div class="pr">
            <h3>What's Included</h3>
            <ul class="ilist">
              <li>8 weeks of structured classroom training</li>
              <li>Hands-on practical sessions every day</li>
              <li>AI tools access &amp; all learning materials</li>
              <li>Portfolio of 3+ real AI projects</li>
              <li>Verified completion certificate</li>
              <li>Dedicated job support &amp; career guidance</li>
              <li>AI business mentorship sessions</li>
              <li>Lifetime alumni WhatsApp community</li>
              <li>Direct incubator referral for top graduates</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
    <section class="bg-gray">
      <div class="container-x">
        <div class="shdr ctr">
          <div class="eye">Full Curriculum</div>
          <h2 class="stitle">8-Week Learning Journey</h2>
          <p class="ssub">Mon–Thu: core teaching. Friday: revision + doubt solving. Real projects from Week 5 onwards.</p>
        </div>
        <div class="wkgrid">
          <div class="wkc"><div class="wkn">Week 1 · Module 1</div><h4>Digital &amp; Computer Foundations</h4><p>Computer basics, typing, internet, Google tools, email and digital safety</p></div>
          <div class="wkc"><div class="wkn">Week 2 · Module 2</div><h4>AI Tools &amp; ChatGPT Mastery</h4><p>Intro to AI, ChatGPT, Google Gemini, how AI works, everyday use cases for Bharat</p></div>
          <div class="wkc"><div class="wkn">Week 3 · Module 3</div><h4>Prompt Engineering Deep Dive</h4><p>Masterclass on prompts, role-playing with AI, advanced techniques, research &amp; writing</p></div>
          <div class="wkc"><div class="wkn">Week 4 · Module 4</div><h4>AI Content Creation &amp; Social Media</h4><p>AI image creation, video scripts, Canva + AI, Instagram/YouTube content pipelines</p></div>
          <div class="wkc"><div class="wkn">Week 5 · Module 5</div><h4>Advanced AI Skills &amp; Digital Creation</h4><p>AI website builders, landing pages, no-code tools, AI chatbots, digital business assets</p></div>
          <div class="wkc"><div class="wkn">Week 6 · Project Week</div><h4>AI Automation &amp; No-Code Workflows</h4><p>Automation pipelines, combining tools, productivity workflows, client delivery</p></div>
          <div class="wkc"><div class="wkn">Week 7 · Career Week</div><h4>Freelancing, Jobs &amp; AI Business Models</h4><p>Resume building, Fiverr/Upwork setup, job applications, AI agency pricing and clients</p></div>
          <div class="wkc"><div class="wkn">Week 8 · Launch Week</div><h4>Projects, Presentations &amp; Graduation 🎓</h4><p>Final project demo, portfolio review, certificate ceremony, incubator referrals</p></div>
        </div>
      </div>
    </section>
    <section>
      <div class="container-x">
        <div class="shdr ctr">
          <div class="eye">After This Program</div>
          <h2 class="stitle">What You Can Become</h2>
        </div>
        <div class="wgrid">
          <div class="wcard"><span class="wico">📱</span><h4>AI Marketing Agency</h4><p>Run social media &amp; marketing for local businesses. Charge ₹5,000–₹25,000/month per client.</p></div>
          <div class="wcard"><span class="wico">🌐</span><h4>AI Website Creator</h4><p>Build websites for local shops. ₹3,000–₹15,000 per site using AI tools.</p></div>
          <div class="wcard"><span class="wico">🧘</span><h4>AI Wellness Centre</h4><p>Generate personalised diet, fitness &amp; wellness plans for clients. Physical or online.</p></div>
          <div class="wcard"><span class="wico">📚</span><h4>AI Tuition Centre</h4><p>Use AI to create personalised study material and coaching for school students.</p></div>
          <div class="wcard"><span class="wico">🎥</span><h4>AI Content Creator</h4><p>YouTube, Instagram, and Reels using AI-generated scripts, images, and voiceovers.</p></div>
          <div class="wcard"><span class="wico">💼</span><h4>Corporate AI Job</h4><p>AI assistant, digital marketing executive — 50–200% salary jump with AI skills.</p></div>
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
