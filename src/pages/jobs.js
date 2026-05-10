import { go } from '../utils/router.js';

export function renderJobs() {
  const view = document.createElement('div');
  view.className = 'page active';
  view.dataset.title = 'Jobs & Placement';
  view.innerHTML = `
    <div class="phero">
      <div class="phi">
        <div class="hero-eye" style="margin-bottom:16px;display:inline-flex">💼 Dedicated Placement Support</div>
        <h1>Job Placement &amp; Career Support</h1>
        <p>Graduate with real AI skills and get connected to companies hiring AI-ready talent across India.</p>
        <button class="btn-dk" data-go="register" data-program="youth">Get Started →</button>
      </div>
    </div>
    <section>
      <div class="container-x">
        <div class="alert">
          <span>✅</span>
          <span>100% placement support included FREE with the AI for Youth 8-week program — career guidance, resume building, interview prep &amp; direct employer connects.</span>
        </div>
        <div class="shdr">
          <div class="eye">Our Placement Process</div>
          <h2 class="stitle">How We Help You Get Hired</h2>
        </div>
        <div class="stgrid">
          <div class="stc"><div class="stn">1</div><h4>Build Your Portfolio</h4><p>During Weeks 7–8, create a professional AI project portfolio.</p></div>
          <div class="stc"><div class="stn">2</div><h4>Resume &amp; LinkedIn</h4><p>Professionally crafted resume and LinkedIn profile using AI.</p></div>
          <div class="stc"><div class="stn">3</div><h4>Interview Prep</h4><p>Mock interviews, AI-powered practice, and mentor feedback.</p></div>
          <div class="stc"><div class="stn">4</div><h4>Job Applications</h4><p>We apply to matching jobs on your behalf and track them.</p></div>
          <div class="stc"><div class="stn">5</div><h4>Employer Connect</h4><p>Direct intros to hiring partners through our employer network.</p></div>
        </div>
      </div>
    </section>
    <section class="bg-gray">
      <div class="container-x">
        <div class="shdr ctr">
          <div class="eye">Job Roles</div>
          <h2 class="stitle">AI Roles You Can Apply For</h2>
          <p class="ssub">After completing our program, you'll be ready for these high-demand categories.</p>
        </div>
        <div class="jgrid">
          <div class="jc"><div class="jr">AI Content Writer</div><div class="jco">Digital Agencies · Startups · Media</div><div class="jtags"><span class="jtag">₹15K–35K/mo</span><span class="jtag">Remote Possible</span><span class="jtag">High Demand</span></div></div>
          <div class="jc"><div class="jr">Social Media AI Manager</div><div class="jco">E-commerce · D2C Brands · Local Businesses</div><div class="jtags"><span class="jtag">₹12K–28K/mo</span><span class="jtag">Work From Home</span><span class="jtag">Growing Fast</span></div></div>
          <div class="jc"><div class="jr">AI Prompt Engineer</div><div class="jco">SaaS Companies · BPO · Tech Firms</div><div class="jtags"><span class="jtag">₹20K–50K/mo</span><span class="jtag">New Role</span><span class="jtag">High Pay</span></div></div>
          <div class="jc"><div class="jr">Digital Marketing Executive</div><div class="jco">Local Businesses · NGOs · Retail</div><div class="jtags"><span class="jtag">₹10K–22K/mo</span><span class="jtag">Entry Level</span><span class="jtag">Everywhere</span></div></div>
          <div class="jc"><div class="jr">AI Data Entry &amp; Analyst</div><div class="jco">BPO · Insurance · Finance Companies</div><div class="jtags"><span class="jtag">₹12K–25K/mo</span><span class="jtag">Stable Jobs</span><span class="jtag">Large Openings</span></div></div>
          <div class="jc"><div class="jr">AI Customer Support Specialist</div><div class="jco">E-commerce · Telecom · Banking</div><div class="jtags"><span class="jtag">₹12K–20K/mo</span><span class="jtag">Immediate Joining</span><span class="jtag">Gurgaon/Delhi</span></div></div>
        </div>
      </div>
    </section>
    <section>
      <div class="container-x">
        <div class="ctab">
          <h2>Also Want to Freelance?</h2>
          <p>We also train you on Fiverr and Upwork so you can earn in dollars from home. Our graduates earn ₹20,000–₹80,000/month freelancing.</p>
          <button class="btn-bl" data-go="register" data-program="youth">Start Your Journey →</button>
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
