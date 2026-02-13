// State Management
let currentData = null;

const loadData = () => {
    try {
        const savedData = localStorage.getItem('cv_data');
        if (savedData) {
            currentData = JSON.parse(savedData);

            // Schema validation: check if new fields exist
            const requiredFields = ['creativeArsenal', 'coreSkills', 'freelance', 'socials'];
            const hasAllFields = requiredFields.every(field => currentData[field] !== undefined);

            if (!hasAllFields) {
                console.warn('Schema mismatch detected. Resetting to default data.');
                localStorage.removeItem('cv_data');
                currentData = JSON.parse(JSON.stringify(cvData));
            } else {
                // Force update image path if needed
                if (currentData.personalInfo && cvData.personalInfo) {
                    currentData.personalInfo.image = cvData.personalInfo.image;
                }
            }
        } else {
            currentData = (typeof cvData !== 'undefined') ? JSON.parse(JSON.stringify(cvData)) : null; // Deep clone from data.js
        }
    } catch (e) {
        console.error("Error loading data:", e);
        localStorage.removeItem('cv_data');
        currentData = (typeof cvData !== 'undefined') ? JSON.parse(JSON.stringify(cvData)) : null;
    }
};

const saveData = () => {
    localStorage.setItem('cv_data', JSON.stringify(currentData));
    renderCV(currentData);
};

// Safe DOM update helper
const setSafeText = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
};

const setSafeHTML = (id, html) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
};

const renderCV = (data) => {
    if (!data) return;

    // --- Sidebar ---

    // Header
    const userNameEl = document.getElementById('user-name');
    if (userNameEl) {
        // Find parent to insert Title if needed, but data.js implies name is h1
        userNameEl.textContent = data.personalInfo.name;
    }
    const profileImg = document.getElementById('profile-img-src');
    if (profileImg && data.personalInfo) profileImg.src = data.personalInfo.image;

    // Contact Info (Phone, Email, Location with links)
    setSafeHTML('contact-info-list', `
        <div class="space-y-3 relative">
            <a href="tel:${data.personalInfo.phone}" class="contact-link text-[11px]">
                <i class="fas fa-phone w-5 text-blue-300"></i> ${data.personalInfo.phone}
            </a>
            <a href="mailto:${data.personalInfo.email}" class="contact-link text-[11px]">
                <i class="fas fa-envelope w-5 text-blue-300"></i> ${data.personalInfo.email}
            </a>
            <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.personalInfo.location)}" target="_blank" class="contact-link text-[11px]">
                <i class="fas fa-map-marker-alt w-5 text-blue-300"></i> ${data.personalInfo.location}
            </a>
            <div class="edit-trigger" onclick="openSectionEditor('personalInfo')"><i class="fas fa-pen"></i></div>
        </div>
    `);

    // Creative Suite (Badges)
    setSafeHTML('creative-suite-list', `
        <div class="grid grid-cols-1 gap-2 relative">
            ${data.creativeArsenal.map((tool, index) => `
                <div class="software-badge flex items-center gap-3 p-2.5 rounded-lg group cursor-default">
                    <i class="${tool.icon} text-blue-300 text-[14px] w-5 text-center"></i>
                    <span class="text-[11px] font-medium">${tool.name}</span>
                </div>
            `).join('')}
            <div class="edit-trigger" onclick="openSectionEditor('creativeArsenal')"><i class="fas fa-pen"></i></div>
        </div>
    `);

    // Professional Focus (Progress Bars)
    setSafeHTML('professional-focus-list', `
        <div class="space-y-3 relative">
            ${data.coreSkills.map((skill, index) => `
                <div class="group">
                    <div class="flex justify-between text-[10px] text-white/90"><span>${skill.name}</span><span>${skill.level}</span></div>
                    <div class="progress-line bg-white/10"><div class="progress-fill bg-blue-400" style="width: ${skill.level};" data-width="${skill.level}"></div></div>
                </div>
            `).join('')}
            <div class="edit-trigger" onclick="openSectionEditor('coreSkills')"><i class="fas fa-pen"></i></div>
        </div>
    `);

    // Footer Socials
    setSafeHTML('footer-socials', `
        <div class="flex justify-center gap-4 mb-6 relative">
            ${data.socials.map(social => `
                <a href="${social.url}" target="_blank" class="social-icon-link" title="${social.name}">
                    <i class="${social.icon}"></i>
                </a>
            `).join('')}
            <div class="edit-trigger" style="right: -20px;" onclick="openSectionEditor('socials')"><i class="fas fa-pen"></i></div>
        </div>
    `);

    // --- Main Content ---

    // Summary (Professional Philosophy)
    setSafeHTML('summary-content', `
        <div style="position: relative;">
            <p class="text-gray-600 leading-relaxed text-justify border-l-4 border-blue-600 pl-4 py-2 bg-blue-50/30 rounded-r-lg">
                ${data.summary}
            </p>
            <div class="edit-trigger" onclick="openSectionEditor('summary')"><i class="fas fa-pen"></i></div>
        </div>
    `);

    // Experience
    setSafeHTML('experience-list', `
        <div class="space-y-3 relative">
            ${data.experience.map((exp, index) => `
                <div class="card-interaction p-4 rounded-xl reveal border border-gray-100 group relative">
                    <div class="flex justify-between items-baseline">
                        <h3 class="font-bold text-gray-800 text-sm group-hover:text-blue-700 transition-colors">${exp.title}</h3>
                        <span class="text-[10px] font-bold ${exp.badgeColor || 'text-blue-600 bg-blue-50'} px-2 py-1 rounded-full uppercase">${exp.period}</span>
                    </div>
                    <p class="text-[11px] font-semibold mt-1">
                        <a href="${exp.url || '#'}" target="_blank" class="company-link text-blue-800">${exp.company}</a>
                    </p>
                    <p class="text-gray-500 text-[11px] mt-1 italic">${exp.description}</p>
                </div>
            `).join('')}
            <div class="edit-trigger" onclick="openSectionEditor('experience')"><i class="fas fa-pen"></i></div>
        </div>
    `);

    // Collaborations (Freelance)
    setSafeHTML('freelance-list', `
        <div class="space-y-4 relative">
            ${data.freelance.map((free, index) => `
                <div class="card-interaction p-4 rounded-xl reveal border ${free.borderColor || 'border-amber-50'} group relative">
                    <div class="flex justify-between items-baseline">
                        <h3 class="font-bold text-gray-800 text-sm group-hover:text-amber-600 transition-colors">${free.title}</h3>
                        <span class="text-[10px] font-bold ${free.badgeColor || 'text-amber-600'} uppercase">${free.period}</span>
                    </div>
                    <p class="text-blue-800 text-[11px] font-semibold">${free.company}</p>
                    <ul class="text-gray-500 text-[11px] list-disc pl-4 mt-2 space-y-1">
                        ${free.tasks.map(task => `<li>${task}</li>`).join('')}
                    </ul>
                </div>
            `).join('')}
            <div class="edit-trigger" onclick="openSectionEditor('freelance')"><i class="fas fa-pen"></i></div>
        </div>
    `);

    // Education
    setSafeHTML('education-list', `
        ${data.education.map((edu, index) => `
            <div class="bg-gray-50 p-4 rounded-xl border-t-2 border-blue-600 hover:shadow-md transition-shadow">
                <h4 class="font-bold text-[12px] text-gray-800">${edu.degree}</h4>
                <p class="text-[11px] text-gray-500">${edu.major} | ${edu.university}</p>
                <p class="text-[11px] text-blue-700 font-bold mt-2 italic flex items-center gap-1">
                    Grade: ${edu.grade} (${edu.year})
                </p>
            </div>
        `).join('')}
        <div class="edit-trigger" onclick="openSectionEditor('education')"><i class="fas fa-pen"></i></div>
    `);

    // Certifications
    setSafeHTML('certifications-list', `
        <div class="grid grid-cols-1 gap-2 relative">
            ${data.certifications.map((cert, index) => `
                <div class="cert-item flex items-center gap-3 p-3 bg-slate-50 rounded-xl group cursor-default">
                    <i class="fas fa-check-circle text-blue-600"></i>
                    <div class="text-[10px] font-medium text-gray-700">${cert.title} - ${cert.provider} ${cert.year ? '(' + cert.year + ')' : ''}</div>
                </div>
            `).join('')}
            <div class="edit-trigger" onclick="openSectionEditor('certifications')"><i class="fas fa-pen"></i></div>
        </div>
    `);

    initObserver();
};

const initObserver = () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                entry.target.querySelectorAll('.progress-fill').forEach(fill => {
                    fill.style.width = fill.getAttribute('data-width');
                });
            }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
};

// --- Editor Logic ---
let activeSection = null;

const openSectionEditor = (section) => {
    activeSection = section;
    const modal = document.getElementById('editor-modal');
    const formFields = document.getElementById('form-fields');
    const title = document.getElementById('modal-title');

    if (!modal || !formFields) return;

    modal.classList.remove('hidden');
    formFields.innerHTML = '';

    switch (section) {
        case 'personalInfo':
            title.textContent = 'Edit Personal Info';
            formFields.innerHTML = `
                <div class="form-group"><label>Name</label><input type="text" name="name" class="form-input" value="${currentData.personalInfo.name}"></div>
                <div class="form-group"><label>Phone</label><input type="text" name="phone" class="form-input" value="${currentData.personalInfo.phone}"></div>
                <div class="form-group"><label>Email</label><input type="text" name="email" class="form-input" value="${currentData.personalInfo.email}"></div>
                <div class="form-group"><label>Location (City, Country)</label><input type="text" name="location" class="form-input" value="${currentData.personalInfo.location}"></div>
            `;
            break;
        case 'summary':
            title.textContent = 'Edit Professional Philosophy';
            formFields.innerHTML = `
                <div class="form-group"><label>Summary Text</label><textarea name="summary" class="form-input h-32">${currentData.summary}</textarea></div>
            `;
            break;
        case 'coreSkills':
            title.textContent = 'Edit Professional Focus';
            formFields.innerHTML = currentData.coreSkills.map((s, i) => `
                <div class="flex gap-2 mb-2">
                    <input type="text" name="skill_name_${i}" class="form-input flex-1" value="${s.name}">
                    <input type="text" name="skill_level_${i}" class="form-input w-20" value="${s.level}">
                </div>
            `).join('');
            break;
        case 'creativeArsenal':
            title.textContent = 'Edit Creative Suite';
            formFields.innerHTML = currentData.creativeArsenal.map((t, i) => `
                <div class="flex gap-2 mb-2 items-center">
                    <input type="text" name="tool_name_${i}" class="form-input flex-1" value="${t.name}">
                    <input type="text" name="tool_icon_${i}" class="form-input w-1/3" placeholder="fa-icon class" value="${t.icon}">
                </div>
            `).join('');
            break;
        case 'socials':
            title.textContent = 'Edit Social Links';
            formFields.innerHTML = currentData.socials.map((s, i) => `
                 <div class="flex gap-2 mb-2 items-center">
                    <input type="text" name="social_name_${i}" class="form-input w-1/4" value="${s.name}" readonly>
                    <input type="text" name="social_url_${i}" class="form-input flex-1" value="${s.url}">
                </div>
            `).join('');
            break;
        case 'experience':
            title.textContent = 'Edit Experience';
            formFields.innerHTML = currentData.experience.map((e, i) => `
                <div class="border-b pb-4 mb-4">
                    <div class="form-group"><label>Title</label><input type="text" name="exp_title_${i}" class="form-input" value="${e.title}"></div>
                    <div class="form-group"><label>Company</label><input type="text" name="exp_company_${i}" class="form-input" value="${e.company}"></div>
                    <div class="form-group"><label>Company URL</label><input type="text" name="exp_url_${i}" class="form-input" value="${e.url || ''}"></div>
                    <div class="form-group"><label>Period</label><input type="text" name="exp_period_${i}" class="form-input" value="${e.period}"></div>
                    <div class="form-group"><label>Description</label><textarea name="exp_desc_${i}" class="form-input h-20">${e.description}</textarea></div>
                </div>
            `).join('');
            break;
        case 'freelance':
            title.textContent = 'Edit Collaborations';
            formFields.innerHTML = currentData.freelance.map((f, i) => `
                <div class="border-b pb-4 mb-4">
                    <div class="form-group"><label>Title</label><input type="text" name="free_title_${i}" class="form-input" value="${f.title}"></div>
                    <div class="form-group"><label>Client/Entity</label><input type="text" name="free_company_${i}" class="form-input" value="${f.company}"></div>
                    <div class="form-group"><label>Period</label><input type="text" name="free_period_${i}" class="form-input" value="${f.period}"></div>
                    <div class="form-group"><label>Tasks (One per line)</label><textarea name="free_tasks_${i}" class="form-input h-24">${f.tasks.join('\n')}</textarea></div>
                </div>
            `).join('');
            break;
        case 'education':
            title.textContent = 'Edit Education';
            formFields.innerHTML = currentData.education.map((edu, i) => `
                <div class="border-b pb-4 mb-4">
                    <div class="form-group"><label>Degree</label><input type="text" name="edu_degree_${i}" class="form-input" value="${edu.degree}"></div>
                    <div class="form-group"><label>Major</label><input type="text" name="edu_major_${i}" class="form-input" value="${edu.major}"></div>
                    <div class="form-group"><label>University</label><input type="text" name="edu_uni_${i}" class="form-input" value="${edu.university}"></div>
                    <div class="flex gap-2">
                        <div class="form-group flex-1"><label>Year</label><input type="text" name="edu_year_${i}" class="form-input" value="${edu.year}"></div>
                        <div class="form-group flex-1"><label>Grade</label><input type="text" name="edu_grade_${i}" class="form-input" value="${edu.grade}"></div>
                    </div>
                </div>
            `).join('');
            break;
        case 'certifications':
            title.textContent = 'Edit Certifications';
            formFields.innerHTML = currentData.certifications.map((c, i) => `
                <div class="border-b pb-4 mb-4">
                    <div class="form-group"><label>Title</label><input type="text" name="cert_title_${i}" class="form-input" value="${c.title}"></div>
                    <div class="form-group"><label>Provider</label><input type="text" name="cert_provider_${i}" class="form-input" value="${c.provider}"></div>
                    <div class="form-group"><label>Year (Optional)</label><input type="text" name="cert_year_${i}" class="form-input" value="${c.year || ''}"></div>
                </div>
            `).join('');
            break;
        default:
            formFields.innerHTML = '<p class="text-gray-500 italic">No editable fields.</p>';
    }
};

const closeEditor = () => {
    const modal = document.getElementById('editor-modal');
    if (modal) modal.classList.add('hidden');
};

const handleFormSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    if (activeSection === 'personalInfo') {
        currentData.personalInfo.name = formData.get('name');
        currentData.personalInfo.phone = formData.get('phone');
        currentData.personalInfo.email = formData.get('email');
        currentData.personalInfo.location = formData.get('location');
    } else if (activeSection === 'summary') {
        currentData.summary = formData.get('summary');
    } else if (activeSection === 'coreSkills') {
        currentData.coreSkills.forEach((s, i) => {
            s.name = formData.get(`skill_name_${i}`);
            s.level = formData.get(`skill_level_${i}`);
        });
    } else if (activeSection === 'creativeArsenal') {
        currentData.creativeArsenal.forEach((t, i) => {
            t.name = formData.get(`tool_name_${i}`);
            t.icon = formData.get(`tool_icon_${i}`);
        });
    } else if (activeSection === 'socials') {
        currentData.socials.forEach((s, i) => {
            s.url = formData.get(`social_url_${i}`);
        });
    } else if (activeSection === 'experience') {
        currentData.experience.forEach((exp, i) => {
            exp.title = formData.get(`exp_title_${i}`);
            exp.company = formData.get(`exp_company_${i}`);
            exp.url = formData.get(`exp_url_${i}`);
            exp.period = formData.get(`exp_period_${i}`);
            exp.description = formData.get(`exp_desc_${i}`);
        });
    } else if (activeSection === 'freelance') {
        currentData.freelance.forEach((f, i) => {
            f.title = formData.get(`free_title_${i}`);
            f.company = formData.get(`free_company_${i}`);
            f.period = formData.get(`free_period_${i}`);
            const tasksRaw = formData.get(`free_tasks_${i}`);
            f.tasks = tasksRaw.split('\n').filter(line => line.trim().length > 0);
        });
    } else if (activeSection === 'education') {
        currentData.education.forEach((edu, i) => {
            edu.degree = formData.get(`edu_degree_${i}`);
            edu.major = formData.get(`edu_major_${i}`);
            edu.university = formData.get(`edu_uni_${i}`);
            edu.year = formData.get(`edu_year_${i}`);
            edu.grade = formData.get(`edu_grade_${i}`);
        });
    } else if (activeSection === 'certifications') {
        currentData.certifications.forEach((c, i) => {
            c.title = formData.get(`cert_title_${i}`);
            c.provider = formData.get(`cert_provider_${i}`);
            c.year = formData.get(`cert_year_${i}`);
        });
    }

    saveData();
    closeEditor();
};

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    renderCV(currentData);

    
    const closeModalBtn = document.getElementById('close-modal');
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeEditor);

    const cancelEditBtn = document.getElementById('cancel-edit');
    if (cancelEditBtn) cancelEditBtn.addEventListener('click', closeEditor);

    const editorForm = document.getElementById('editor-form');
    if (editorForm) editorForm.addEventListener('submit', handleFormSubmit);

    // --- Portfolio Specific Logic ---
    if (document.body.classList.contains('portfolio-page')) {
        gsap.registerPlugin(ScrollTrigger);

        // Initial Hero Animation
        const heroTl = gsap.timeline();
        heroTl.from("#hero-title", { opacity: 0, y: 100, duration: 1.5, ease: "power4.out" })
            .to("#hero-desc", { opacity: 1, y: 0, duration: 1 }, "-=0.8")
            .from("#hero-line", { height: 0, duration: 1 }, "-=0.5");

        // Universal Reveal Animation for Blocks
        gsap.utils.toArray(".image-block").forEach((block) => {
            gsap.to(block, {
                scrollTrigger: {
                    trigger: block,
                    start: "top 85%",
                    toggleActions: "play none none none"
                },
                opacity: 1,
                y: 0,
                duration: 1,
                ease: "power2.out"
            });
        });

        // Parallax Effects
        gsap.utils.toArray(".hero-image").forEach((img) => {
            gsap.to(img, {
                scrollTrigger: {
                    trigger: img.parentElement,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true
                },
                y: "-15%",
                ease: "none"
            });
        });

        gsap.utils.toArray(".detail-image").forEach((img) => {
            gsap.to(img, {
                scrollTrigger: {
                    trigger: img.parentElement,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true
                },
                y: "-10%",
                ease: "none"
            });
        });

        // Sticky Nav Transformation
        ScrollTrigger.create({
            start: 'top -50',
            onEnter: () => gsap.to('nav', {
                paddingTop: '1rem',
                paddingBottom: '1rem',
                backgroundColor: "rgba(255,255,255,0.95)",
                boxShadow: "0 10px 40px rgba(0,0,0,0.05)",
                duration: 0.4
            }),
            onLeaveBack: () => gsap.to('nav', {
                paddingTop: '1.25rem',
                paddingBottom: '1.25rem',
                backgroundColor: "rgba(255,255,255,0.8)",
                boxShadow: "none",
                duration: 0.4
            })
        });

        // Custom Cursor
        const cursor = document.querySelector('.custom-cursor');
        if (cursor) {
            window.addEventListener('mousemove', (e) => {
                gsap.to(cursor, {
                    x: e.clientX,
                    y: e.clientY,
                    duration: 0.1
                });
            });
        }
    }
});
