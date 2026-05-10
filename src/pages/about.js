export function renderAbout() {
  const view = document.createElement('div');
  view.className = 'page active';
  view.dataset.title = 'About';
  view.innerHTML = `
    <div class="phero">
      <div class="phi">
        <div class="hero-eye" style="margin-bottom:16px;display:inline-flex">🏛 Our Story</div>
        <h1>Built for Bharat, by Bharat</h1>
        <p>We started Bharat AI Academy because we believed the AI revolution should reach every small town and district — not just metros.</p>
      </div>
    </div>
    <section>
      <div class="container-x">
        <div class="mgrid">
          <div class="mc"><div class="mi">🎯</div><h3>Our Mission</h3><p>To democratize AI education and make practical, income-generating AI skills accessible to every youth in Tier 2 &amp; 3 India.</p></div>
          <div class="mc"><div class="mi">👁</div><h3>Our Vision</h3><p>A future where every micro-entrepreneur in Bharat uses AI as their competitive advantage — from Charkhi Dadri to Chennai.</p></div>
          <div class="mc"><div class="mi">💪</div><h3>Our Values</h3><p>Practical over theoretical. Local over metro. Hindi over jargon. Community over competition. Impact over impressions.</p></div>
        </div>
      </div>
    </section>
    <section class="bg-gray">
      <div class="container-x">
        <div class="shdr ctr">
          <div class="eye">Our Impact Goals</div>
          <h2 class="stitle">What We're Building Towards</h2>
        </div>
        <div class="igrid">
          <div class="ic"><span class="big">500+</span><p>Students trained by 2026</p></div>
          <div class="ic"><span class="big">100+</span><p>AI businesses launched</p></div>
          <div class="ic"><span class="big">10+</span><p>Districts in Haryana</p></div>
          <div class="ic"><span class="big">₹1Cr+</span><p>Revenue by alumni</p></div>
        </div>
      </div>
    </section>
    <section>
      <div class="container-x">
        <div class="shdr ctr">
          <div class="eye">Our Locations</div>
          <h2 class="stitle">Starting in Haryana</h2>
          <p class="ssub">First center in Charkhi Dadri, with Rohtak, Bhiwani, and Hisar planned for 2026.</p>
        </div>
        <div class="wgrid">
          <div class="wcard"><span class="wico">📍</span><h4>Charkhi Dadri (Live)</h4><p>Our first center. Batches running from June 2026. 40 seats per batch.</p></div>
          <div class="wcard"><span class="wico">🗺</span><h4>Rohtak (Coming Soon)</h4><p>Second center planned for Q3 2026. Registrations opening soon.</p></div>
          <div class="wcard"><span class="wico">🗺</span><h4>Bhiwani (Planned)</h4><p>Third center in our Haryana expansion roadmap for 2026–27.</p></div>
          <div class="wcard"><span class="wico">🌍</span><h4>National Expansion</h4><p>Targeting 50 districts across India by 2027 through franchise model.</p></div>
        </div>
      </div>
    </section>
  `;
  return view;
}
