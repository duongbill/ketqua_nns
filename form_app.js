// GOOGLE FORMS RESPONSES VIEW LOGIC
// Matches Google Forms UI & Features 100%

let currentSurvey = 'post'; // 'pre', 'post', 'compare'
let currentGroup = 'all';    // 'all', 'Thực nghiệm', 'So sánh'
let currentClass = 'all';    // 'all', '10A1', etc.
let currentGender = 'all';   // 'all', 'Nam', 'Nữ'

let chartInstances = {};

// Google Forms 5-Color Palette
const GF_COLORS = [
    '#1a73e8', // 1: Blue
    '#ea4335', // 2: Red
    '#fbbc04', // 3: Yellow
    '#34a853', // 4: Green
    '#9334e6'  // 5: Purple
];

document.addEventListener('DOMContentLoaded', () => {
    initGoogleFormsView();
});

function initGoogleFormsView() {
    if (!window.GOOGLE_FORM_DATA) {
        console.error("Dữ liệu GOOGLE_FORM_DATA chưa được nạp!");
        return;
    }

    populateClassDropdown();
    setupControls();
    renderView();
}

function populateClassDropdown() {
    const classSelect = document.getElementById('filter-class');
    if (!classSelect) return;
    const classes = window.GOOGLE_FORM_DATA.classes;
    classes.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c;
        opt.textContent = `Lớp ${c}`;
        classSelect.appendChild(opt);
    });
}

function setupControls() {
    // Survey Tabs (Pre vs Post vs Compare)
    document.querySelectorAll('.survey-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.survey-tab-btn').forEach(b => {
                b.classList.remove('border-purple-700', 'text-purple-700', 'font-bold');
                b.classList.add('border-transparent', 'text-slate-600');
            });
            btn.classList.add('border-purple-700', 'text-purple-700', 'font-bold');
            btn.classList.remove('border-transparent', 'text-slate-600');
            
            currentSurvey = btn.getAttribute('data-survey');
            renderView();
        });
    });

    // Group Filter
    document.querySelectorAll('.group-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.group-filter-btn').forEach(b => {
                b.classList.remove('bg-purple-700', 'text-white', 'shadow-sm');
                b.classList.add('bg-slate-100', 'text-slate-700', 'hover:bg-slate-200');
            });
            btn.classList.add('bg-purple-700', 'text-white', 'shadow-sm');
            btn.classList.remove('bg-slate-100', 'text-slate-700', 'hover:bg-slate-200');

            currentGroup = btn.getAttribute('data-group');
            renderView();
        });
    });

    // Class Dropdown
    const classSelect = document.getElementById('filter-class');
    if (classSelect) {
        classSelect.addEventListener('change', () => {
            currentClass = classSelect.value;
            renderView();
        });
    }

    // Gender Dropdown
    const genderSelect = document.getElementById('filter-gender');
    if (genderSelect) {
        genderSelect.addEventListener('change', () => {
            currentGender = genderSelect.value;
            renderView();
        });
    }
}

// Filter Records
function getFilteredRecords(surveyKey) {
    const survey = window.GOOGLE_FORM_DATA[surveyKey];
    if (!survey) return [];
    
    return survey.records.filter(r => {
        const matchGroup = (currentGroup === 'all') || (r.group === currentGroup);
        const matchClass = (currentClass === 'all') || (r.class === currentClass);
        const matchGender = (currentGender === 'all') || (r.gender === currentGender);
        return matchGroup && matchClass && matchGender;
    });
}

function renderView() {
    // Destroy old charts
    Object.keys(chartInstances).forEach(k => {
        if (chartInstances[k]) chartInstances[k].destroy();
    });
    chartInstances = {};

    const container = document.getElementById('form-sections-container');
    if (!container) return;
    container.innerHTML = '';

    const records = getFilteredRecords(currentSurvey === 'compare' ? 'post' : currentSurvey);
    const countBadge = document.getElementById('response-count-badge');
    if (countBadge) {
        countBadge.textContent = records.length;
    }

    const titleEl = document.getElementById('survey-main-title');
    if (titleEl) {
        if (currentSurvey === 'pre') {
            titleEl.textContent = 'PHIẾU KHẢO SÁT 01 (TRƯỚC THỰC NGHIỆM)';
        } else if (currentSurvey === 'post') {
            titleEl.textContent = 'PHIẾU KHẢO SÁT 02 (SAU THỰC NGHIỆM)';
        } else {
            titleEl.textContent = 'SO SÁNH ĐỐI CHỨNG: TRƯỚC vs SAU THỰC NGHIỆM';
        }
    }

    // 1. Demographic Cards (Group, Class, Gender)
    renderDemographicCards(container, records);

    // 2. Question Sections
    const surveyData = window.GOOGLE_FORM_DATA[currentSurvey === 'compare' ? 'post' : currentSurvey];
    
    surveyData.sections.forEach((sec, secIdx) => {
        // Section Header Banner (Google Forms Purple)
        const secHeader = document.createElement('div');
        secHeader.className = 'bg-[#673ab7] text-white font-bold text-base px-6 py-3.5 rounded-t-xl shadow-xs tracking-wide uppercase mt-6';
        secHeader.textContent = sec.title;
        container.appendChild(secHeader);

        const secContent = document.createElement('div');
        secContent.className = 'space-y-5 mb-8';

        sec.subsections.forEach((sub, subIdx) => {
            const chartId = `chart_${secIdx}_${subIdx}`;
            const isMobile = window.innerWidth < 640;
            const colWidth = isMobile ? 125 : 145;
            const canvasMinWidth = Math.max(isMobile ? 320 : 700, sub.questions.length * colWidth);
            const canvasHeight = isMobile ? 340 : 380;
            
            const card = document.createElement('div');
            card.className = 'bg-white border border-slate-200 rounded-xl p-3 sm:p-5 shadow-xs';
            card.innerHTML = `
                <div class="flex items-center justify-between border-b border-slate-100 pb-2.5 sm:pb-3 mb-3 sm:mb-4">
                    <h3 class="font-bold text-xs sm:text-sm text-slate-800 leading-snug">${sub.title}</h3>
                    <button class="copy-chart-btn text-[11px] sm:text-xs font-semibold text-[#1a73e8] hover:bg-blue-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg flex items-center space-x-1 sm:space-x-1.5 transition flex-shrink-0" data-chart="${chartId}">
                        <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#1a73e8]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"/></svg>
                        <span class="hidden sm:inline">Sao chép biểu đồ</span>
                        <span class="sm:hidden">Sao chép</span>
                    </button>
                </div>
                <div class="block sm:hidden text-[10px] text-purple-600 font-medium mb-1.5 flex items-center space-x-1">
                    <span>👉 Vuốt ngang để xem các câu hỏi khác</span>
                </div>
                <div class="chart-scroll-wrap relative w-full pb-2">
                    <div style="min-width: ${canvasMinWidth}px; height: ${canvasHeight}px;">
                        <canvas id="${chartId}"></canvas>
                    </div>
                </div>
            `;
            secContent.appendChild(card);

            // Compute grouped bar data
            setTimeout(() => {
                renderGroupedBarChart(chartId, sub, records);
            }, 10);
        });

        container.appendChild(secContent);
    });

    // 3. Open-Ended Questions (Hidden per user request)
    // renderOpenEndedQuestions(container, surveyData, records);

    // Setup Copy Chart Handlers
    setTimeout(() => {
        document.querySelectorAll('.copy-chart-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const cId = btn.getAttribute('data-chart');
                const canvas = document.getElementById(cId);
                if (!canvas) return;
                canvas.toBlob(blob => {
                    if (navigator.clipboard && navigator.clipboard.write) {
                        navigator.clipboard.write([
                            new ClipboardItem({ 'image/png': blob })
                        ]).then(() => {
                            btn.innerHTML = `<span class="text-emerald-600 font-bold">✓ Đã sao chép!</span>`;
                            setTimeout(() => {
                                btn.innerHTML = `
                                    <svg class="w-4 h-4 text-[#1a73e8]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"/></svg>
                                    <span>Sao chép biểu đồ</span>
                                `;
                            }, 2000);
                        }).catch(() => {
                            downloadChartImage(canvas);
                        });
                    } else {
                        downloadChartImage(canvas);
                    }
                });
            });
        });
    }, 100);
}

function downloadChartImage(canvas) {
    const link = document.createElement('a');
    link.download = 'bieu_do_google_forms.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
}

// Demographic charts: Group, Gender (Optimized for Mobile & Desktop)
function renderDemographicCards(container, records) {
    const isMobile = window.innerWidth < 640;
    const card = document.createElement('div');
    card.className = 'bg-white border border-slate-200 rounded-xl p-3 sm:p-5 shadow-xs mb-4 sm:mb-6';
    card.innerHTML = `
        <div class="flex items-center justify-between border-b border-slate-100 pb-2.5 sm:pb-3 mb-3 sm:mb-4">
            <h3 class="font-bold text-xs sm:text-sm text-slate-800">I. THÔNG TIN PHÂN BỐ MẪU KHẢO SÁT</h3>
            <span class="text-[11px] sm:text-xs text-slate-500 font-medium">${records.length} câu trả lời</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 items-center max-w-2xl mx-auto">
            <!-- Group Pie Chart -->
            <div class="flex flex-col items-center">
                <div class="text-xs font-bold text-slate-700 mb-1.5 sm:mb-2">Mã nhóm</div>
                <div style="height: 180px; width: 100%;">
                    <canvas id="chart-demo-group"></canvas>
                </div>
            </div>
            <!-- Gender Pie Chart -->
            <div class="flex flex-col items-center">
                <div class="text-xs font-bold text-slate-700 mb-1.5 sm:mb-2">Giới tính</div>
                <div style="height: 180px; width: 100%;">
                    <canvas id="chart-demo-gender"></canvas>
                </div>
            </div>
        </div>
    `;
    container.appendChild(card);

    setTimeout(() => {
        const legendPos = isMobile ? 'bottom' : 'right';

        // Group chart
        const grpCounts = {};
        records.forEach(r => { grpCounts[r.group] = (grpCounts[r.group] || 0) + 1; });
        const ctxGrp = document.getElementById('chart-demo-group');
        if (ctxGrp) {
            chartInstances['demo_group'] = new Chart(ctxGrp, {
                type: 'pie',
                data: {
                    labels: Object.keys(grpCounts),
                    datasets: [{
                        data: Object.values(grpCounts),
                        backgroundColor: ['#1a73e8', '#ea4335'],
                        borderWidth: 1,
                        borderColor: '#ffffff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: legendPos, labels: { boxWidth: 10, font: { size: 10 } } },
                        tooltip: {
                            callbacks: {
                                label: ctx => {
                                    const total = records.length;
                                    const pct = ((ctx.raw / total) * 100).toFixed(1);
                                    return ` ${ctx.label}: ${ctx.raw} (${pct}%)`;
                                }
                            }
                        }
                    }
                }
            });
        }

        // Gender chart
        const gCounts = {};
        records.forEach(r => {
            const g = r.gender || 'Khác';
            gCounts[g] = (gCounts[g] || 0) + 1;
        });
        const ctxG = document.getElementById('chart-demo-gender');
        if (ctxG) {
            chartInstances['demo_gender'] = new Chart(ctxG, {
                type: 'pie',
                data: {
                    labels: Object.keys(gCounts),
                    datasets: [{
                        data: Object.values(gCounts),
                        backgroundColor: ['#34a853', '#fbbc04', '#9334e6'],
                        borderWidth: 1,
                        borderColor: '#ffffff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: legendPos, labels: { boxWidth: 10, font: { size: 10 } } },
                        tooltip: {
                            callbacks: {
                                label: ctx => {
                                    const total = records.length;
                                    const pct = ((ctx.raw / total) * 100).toFixed(1);
                                    return ` ${ctx.label}: ${ctx.raw} (${pct}%)`;
                                }
                            }
                        }
                    }
                }
            });
        }
    }, 10);
}

// Smart Word Wrap for Full Text without cutting words
function wrapText(str, maxChars = 22) {
    if (!str) return [];
    const words = str.trim().split(/\s+/);
    const lines = [];
    let curLine = '';

    words.forEach(w => {
        if (!curLine) {
            curLine = w;
        } else if ((curLine + ' ' + w).length <= maxChars) {
            curLine += ' ' + w;
        } else {
            lines.push(curLine);
            curLine = w;
        }
    });
    if (curLine) lines.push(curLine);
    return lines;
}

// Grouped Bar Chart (5 Columns per Question with FULL TEXT labels)
function renderGroupedBarChart(canvasId, sub, records) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    // Full text multiline labels (No truncation, no "...")
    const multilineLabels = sub.questions.map(q => wrapText(q.label, 20));
    const fullLabels = sub.questions.map(q => q.label);

    // 5 scale levels: 1, 2, 3, 4, 5
    const datasets = sub.scale_labels.map((lvlLabel, lvlIdx) => {
        const levelNum = lvlIdx + 1;
        const counts = sub.questions.map(q => {
            const qIndex = parseInt(q.id.replace('q_', ''));
            let cnt = 0;
            records.forEach(r => {
                if (r.s && r.s[qIndex] === levelNum) {
                    cnt++;
                }
            });
            return cnt;
        });

        return {
            label: lvlLabel,
            data: counts,
            backgroundColor: GF_COLORS[lvlIdx],
            borderColor: '#ffffff',
            borderWidth: 0.5,
            borderRadius: 2
        };
    });

    chartInstances[canvasId] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: multilineLabels,
            datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 20,
                        color: '#64748b',
                        font: { size: 11 }
                    },
                    grid: { color: '#f1f5f9' }
                },
                x: {
                    ticks: {
                        color: '#202124',
                        font: { size: 11, weight: '500' },
                        maxRotation: 0,
                        minRotation: 0,
                        autoSkip: false,
                        padding: 8
                    },
                    grid: { display: false }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        boxWidth: 12,
                        font: { size: 11, weight: '500' },
                        color: '#334155',
                        padding: 14
                    }
                },
                tooltip: {
                    callbacks: {
                        title: items => {
                            const idx = items[0].dataIndex;
                            return fullLabels[idx];
                        },
                        label: ctx => {
                            const total = records.length;
                            const pct = total > 0 ? ((ctx.raw / total) * 100).toFixed(1) : 0;
                            return ` ${ctx.dataset.label}: ${ctx.raw} lượt (${pct}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Render open-ended questions list like Google Forms
function renderOpenEndedQuestions(container, surveyData, records) {
    if (!surveyData.text_titles || surveyData.text_titles.length === 0) return;

    surveyData.text_titles.forEach((qTitle, qIdx) => {
        const textKey = qIdx === 0 ? 't1' : 't2';
        const answers = records.map(r => ({ name: r.name, class: r.class, group: r.group, text: r[textKey] }))
                               .filter(a => a.text && a.text.trim().length > 0);

        const card = document.createElement('div');
        card.className = 'bg-white border border-slate-200 rounded-xl p-5 shadow-xs mb-6';
        
        let answersHtml = '';
        answers.slice(0, 20).forEach(a => {
            answersHtml += `
                <div class="p-3 bg-slate-50 border border-slate-100 rounded-lg text-xs text-slate-700 leading-relaxed flex items-start justify-between">
                    <span>${a.text}</span>
                    <span class="ml-2 flex-shrink-0 text-[10px] text-slate-400 font-medium">(${a.class} • ${a.group})</span>
                </div>
            `;
        });

        card.innerHTML = `
            <div class="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                <h3 class="font-bold text-sm text-slate-800">${qTitle}</h3>
                <span class="text-xs text-slate-500 font-semibold">${answers.length} câu trả lời</span>
            </div>
            <div class="space-y-2 max-h-80 overflow-y-auto pr-2">
                ${answersHtml}
            </div>
        `;
        container.appendChild(card);
    });
}
