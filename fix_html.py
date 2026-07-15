import re

html_content = '''
          <!-- Phone 1 -->
          <div class="pg-phone">
            <div class="pg-frame">
              <div class="pg-screen">
                <img src="img/creator3.png" alt="Marie Gonzales" class="pg-img">
                <div class="pg-overlay"></div>
                <div class="pg-top-tags">
                  <span class="pg-pill pg-pill-orange"><span class="pg-pill-dot orange-dot"></span>100K+ Views</span>
                  <span class="pg-pill pg-pill-green"><span class="pg-pill-dot green-dot"></span>300+ Enrollments</span>
                </div>
                <div class="pg-actions">
                  <div class="pg-action-btn"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg><span>6,552</span></div>
                  <div class="pg-action-btn"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg><span>2,120</span></div>
                  <div class="pg-action-btn"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg><span>994</span></div>
                </div>
                <div class="pg-creator-bar">
                  <div class="pg-avatar av-pink">M</div>
                  <div class="pg-creator-text">
                    <p class="pg-creator-name">Marie Gonzales <span class="pg-verified">✓</span></p>
                    <p class="pg-creator-caption">Enrollments to my new…</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Phone 2 -->
          <div class="pg-phone pg-phone-featured">
            <div class="pg-frame pg-frame-featured">
              <div class="pg-screen">
                <img src="img/creator2.png" alt="Cameron" class="pg-img">
                <div class="pg-overlay"></div>
                <div class="pg-top-tags">
                  <span class="pg-pill pg-pill-orange"><span class="pg-pill-dot orange-dot"></span>200K+ Views</span>
                  <span class="pg-pill pg-pill-green"><span class="pg-pill-dot green-dot"></span>50+ Calls Booked</span>
                </div>
                <div class="pg-actions">
                  <div class="pg-action-btn"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg><span>4,654</span></div>
                  <div class="pg-action-btn"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg><span>264</span></div>
                  <div class="pg-action-btn"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg><span>1,200</span></div>
                </div>
                <div class="pg-creator-bar">
                  <div class="pg-avatar av-blue">C</div>
                  <div class="pg-creator-text">
                    <p class="pg-creator-name">Cameron <span class="pg-verified">✓</span></p>
                    <p class="pg-creator-caption">Watch me speak LIVE at…</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Phone 3 -->
          <div class="pg-phone">
            <div class="pg-frame">
              <div class="pg-screen">
                <img src="img/creator1.png" alt="Raw Footage" class="pg-img pg-img-raw">
                <div class="pg-overlay"></div>
                <div class="pg-top-tags">
                  <span class="pg-pill pg-pill-raw">Raw Footage</span>
                </div>
                <div class="pg-actions">
                  <div class="pg-action-btn"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg><span>—</span></div>
                  <div class="pg-action-btn"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg><span>—</span></div>
                  <div class="pg-action-btn"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg><span>—</span></div>
                </div>
                <div class="pg-creator-bar">
                  <div class="pg-avatar av-gray">?</div>
                  <div class="pg-creator-text">
                    <p class="pg-creator-name">Unedited Clip</p>
                    <p class="pg-creator-caption">Before Surya's edit…</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
'''

with open('d:/Project/Surya_portfolio_new/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the broken hero section entirely
start = content.find('<section class="hero">')
end = content.find('</section>') + len('</section>')

if start != -1 and end != -1:
    # 4 blocks of the 3 phones = 12 phones
    full_inner = html_content * 4
    
    new_hero = '''
    <section class="hero">
      <div class="hero-glow"></div>
      <div class="hero-grid-overlay"></div>
      <div class="phone-gallery-wrap fade-up-delay">
        <div class="phone-gallery-inner">
''' + full_inner + '''
        </div>
      </div>
    </section>
'''
    
    content = content[:start] + new_hero + content[end:]
    
    with open('d:/Project/Surya_portfolio_new/index.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print("HTML fixed.")
else:
    print("Could not find hero section boundaries.")
