import { go } from '../utils/router.js';

export function renderHome() {
  const view = document.createElement('div');
  view.className = 'page active';
  view.dataset.title = 'Home';
  view.innerHTML = `
    <div class="hero">
      <div class="hero-eye">🚀 India's Offline AI Academy for Bharat</div>
      <h1>AI Skills for Every <span class="ac">Youth</span> of Bharat</h1>
      <div class="hero-tl">Apna Business, Apne Ghar Se 🏠</div>
      <p class="hero-sub">Learn AI tools, launch a business, or land a better job — through hands-on offline training in your own district.</p>
      <div class="btns">
        <button class="btn-dk" data-go="youth">View Programs →</button>
        <button class="btn-gh" data-go="contact">Talk to Us</button>
        <button class="btn-bl" data-go="register" data-program="youth">Apply Now →</button>
      </div>
      <div class="stats-row">
        <div class="stat"><span class="n">40</span><span class="l">Seats Available</span></div>
        <div class="stat"><span class="n">8 wks</span><span class="l">Youth Program</span></div>
        <div class="stat"><span class="n">₹17K</span><span class="l">Total Fee</span></div>
        <div class="stat"><span class="n">₹50K/mo</span><span class="l">Incubation Fund</span></div>
      </div>
    </div>
    <div class="stripe"></div>

    <section>
      <div class="container-x">
        <div class="shdr ctr">
          <div class="eye">Our Programs</div>
          <h2 class="stitle">What We Offer</h2>
          <p class="ssub">Practical AI education designed for the real needs of Bharat's youth and entrepreneurs.</p>
        </div>
        <div class="pgrid">
          <div class="pcard pc-bl" data-go="youth">
            <span class="pe">🧑‍💻</span>
            <h3>AI for Youth</h3>
            <p>8-week offline program for college students &amp; jobseekers. Learn AI tools, content creation, automation, and launch your AI business.</p>
            <div class="ctags"><span class="ctag">🗓 8 Weeks</span><span class="ctag">📍 Charkhi Dadri</span><span class="ctag">₹17,000</span></div>
            <div class="clink">Explore Program →</div>
          </div>
          <div class="pcard pc-gr" data-go="school">
            <span class="pe">🏫</span>
            <h3>AI for School Students</h3>
            <p>1-month weekend program for students aged 10–17. Creative AI projects, fun workshops, and future-ready skills.</p>
            <div class="ctags"><span class="ctag">🗓 4 Weeks</span><span class="ctag">👦 Age 10–17</span><span class="ctag">₹4,999</span></div>
            <div class="clink">Explore Program →</div>
          </div>
          <div class="pcard pc-pu" data-go="incubator">
            <span class="pe">🚀</span>
            <h3>AI Startup Incubator</h3>
            <p>Get up to ₹50,000/month in funding plus mentorship and full support to launch your own AI-powered business.</p>
            <div class="ctags"><span class="ctag">💸 ₹50K/month</span><span class="ctag">🤝 Mentorship</span></div>
            <div class="clink">Explore Incubator →</div>
          </div>
          <div class="pcard pc-or" data-go="jobs">
            <span class="pe">💼</span>
            <h3>Job Placement Support</h3>
            <p>Career guidance, resume building, interview prep, and direct placement with AI-ready companies across India.</p>
            <div class="ctags"><span class="ctag">🎯 Career Coaching</span><span class="ctag">📄 Resume Help</span></div>
            <div class="clink">Learn More →</div>
          </div>
        </div>
      </div>
    </section>

    <section class="bg-gray">
      <div class="container-x">
        <div class="shdr ctr">
          <div class="eye">Why Bharat AI Academy</div>
          <h2 class="stitle">Built for Real India</h2>
          <p class="ssub">Not a metro-only English program. Designed specifically for Tier 2–3 India.</p>
        </div>
        <div class="wgrid">
          <div class="wcard"><span class="wico">🗣</span><h4>Hinglish Teaching</h4><p>Sessions taught in Hindi + English so language is never a barrier to learning.</p></div>
          <div class="wcard"><span class="wico">💻</span><h4>100% Hands-On</h4><p>Every day includes a practical session. You learn by doing, not just watching.</p></div>
          <div class="wcard"><span class="wico">🏘</span><h4>Local Business Focus</h4><p>Curriculum built around businesses that actually work in small-town India.</p></div>
          <div class="wcard"><span class="wico">🤝</span><h4>Lifetime Community</h4><p>WhatsApp community of alumni, mentors, and hiring partners after graduating.</p></div>
          <div class="wcard"><span class="wico">💸</span><h4>Affordable Pricing</h4><p>₹17,000 for 8 weeks. School program at just ₹4,999 for 4 weeks.</p></div>
          <div class="wcard"><span class="wico">🏆</span><h4>Certificate + Portfolio</h4><p>Graduate with a verified certificate and real portfolio of AI projects.</p></div>
        </div>
      </div>
    </section>

    <section>
      <div class="container-x">
        <div class="shdr ctr">
          <div class="eye">Student Stories</div>
          <h2 class="stitle">What Our Students Say</h2>
        </div>
        <div class="tgrid">
          <div class="tcard"><p class="tt">Maine pehle kabhi AI ke baare mein itna nahi socha tha. Bharat AI Academy ne mujhe sikhaya ki main apna AI marketing agency start kar sakta hoon.</p><div class="ta"><div class="tav">👨</div><div><div class="tn">Rahul Sharma</div><div class="tl">Charkhi Dadri · AI Marketing Agency</div></div></div></div>
          <div class="tcard"><p class="tt">Ab main AI se content create karti hoon aur Instagram pe apna business chal raha hai. ₹17,000 investment meri life change kar di.</p><div class="ta"><div class="tav">👩</div><div><div class="tn">Priya Devi</div><div class="tl">Rohtak · Content Creator</div></div></div></div>
          <div class="tcard"><p class="tt">Job mujhe Gurgaon ki ek company mein mila AI assistant ka. Salary double ho gayi pichle 3 mahine mein. Thank you Bharat AI Academy!</p><div class="ta"><div class="tav">👨</div><div><div class="tn">Vikram Singh</div><div class="tl">Rohtak → Gurgaon · AI Assistant</div></div></div></div>
        </div>
      </div>
    </section>

    <section class="bg-gray">
      <div class="container-x">
        <div class="ctab">
          <h2>Apply Now — Only 40 Seats</h2>
          <p>Drop your name &amp; phone. Our counselor will call you within 24 hours. Batch starts 8 June 2026.</p>
          <button class="btn-bl" data-go="register" data-program="youth">Apply for AI for Youth →</button>
          <button class="btn-gh" data-go="register" data-program="school" style="margin-left:8px">Apply for School Program →</button>
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
