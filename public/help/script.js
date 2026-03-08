document.addEventListener('DOMContentLoaded', async () => {
    const contentContainer = document.getElementById('content-container');
    const navContainer = document.getElementById('nav-container');
    const lastUpdateElem = document.getElementById('last-update');

    try {
        const response = await fetch('features.json');
        const data = await response.json();

        if (data.lastUpdate) {
            const date = new Date(data.lastUpdate);
            lastUpdateElem.textContent = `Last Sync: ${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
        }

        Object.entries(data.roles).forEach(([id, role]) => {
            // Build Side Navigation
            const navLink = document.createElement('a');
            navLink.href = `#${id}`;
            navLink.textContent = role.name;
            navLink.className = 'nav-link';
            navContainer.appendChild(navLink);

            // Build Role Section
            const section = document.createElement('section');
            section.id = id;
            section.className = 'slide-up';

            section.innerHTML = `
                <div class="mb-12">
                    <h2 class="text-white/90 font-bold uppercase tracking-tighter">${role.name}</h2>
                    <p class="text-xl text-white/30 max-w-2xl leading-relaxed">${role.description}</p>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    ${role.features.map(feature => `
                        <div class="feature-box glass-item rounded-[3rem] p-10 backdrop-blur-3xl group">
                            <h4 class="text-white group-hover:text-gold transition-colors tracking-tight font-bold uppercase">${feature.title}</h4>
                            <p class="text-sm leading-relaxed mb-8 opacity-60">${feature.description}</p>
                            <div class="space-y-4 pt-6 border-t border-white/5">
                                <span class="text-[10px] tracking-[0.3em] font-bold uppercase text-white/20 mb-4 block">Tutorial Steps</span>
                                <div class="space-y-3">
                                    ${feature.steps.map(step => `
                                        <div class="p-5 rounded-2xl bg-black/40 border border-white/[0.03] text-xs text-white/60 leading-relaxed font-medium hover:border-gold/10 transition-all">
                                            ${step}
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
            contentContainer.appendChild(section);
        });

        // Initialize Lucide Icons
        if (window.lucide) {
            window.lucide.createIcons();
        }

        // Active Link Highlighting on Scroll
        const sections = document.querySelectorAll('section');
        const navLinks = document.querySelectorAll('nav a');

        window.addEventListener('scroll', () => {
            let current = "";
            sections.forEach((section) => {
                const sectionTop = section.offsetTop;
                if (pageYOffset >= sectionTop - 120) {
                    current = section.getAttribute("id");
                }
            });

            navLinks.forEach((link) => {
                link.classList.remove("active");
                if (link.getAttribute("href").includes(current)) {
                    link.classList.add("active");
                }
            });
        });

    } catch (err) {
        console.error('Error loading features:', err);
    }
});
