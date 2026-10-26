// Dashboard Logic & Visualizations for KHKT Gemstone Career Orientation Project
// LIGHT THEME ACADEMIC EDITION

let charts = {};
let currentGroupFilter = 'all'; // 'all', 'tn', 'ss'
let currentFactorTab = 'ALL';
let isAudioPlaying = false;
let audioAnimationInterval = null;

function initApp() {
    if (!window.KHKT_DATA) {
        console.error("Dữ liệu KHKT_DATA chưa được tải.");
        return;
    }
    if (typeof Chart === 'undefined') {
        console.error("Thư viện Chart.js chưa sẵn sàng.");
        return;
    }

    // Chart.js Light Mode Defaults
    Chart.defaults.font.family = "'Be Vietnam Pro', 'Inter', system-ui, sans-serif";
    Chart.defaults.color = '#475569';
    Chart.defaults.borderColor = '#e2e8f0';

    setupNavigation();
    setupFilterButtons();
    setupFactorTabs();
    setupSearchFilter();
    setupModalGallery();
    setupAudioWidget();
    setupPresentationMode();

    // Render initial data & charts
    updateKPIs();
    renderAllCharts();
    render36ItemsTable();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// 1. Navigation
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-tab-btn');
    navLinks.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            navLinks.forEach(b => {
                b.classList.remove('active-tab', 'bg-emerald-600', 'text-white', 'shadow-sm');
                b.classList.add('text-slate-600', 'hover:bg-slate-100');
            });
            btn.classList.add('active-tab', 'bg-emerald-600', 'text-white', 'shadow-sm');
            btn.classList.remove('text-slate-600', 'hover:bg-slate-100');
            
            if (targetId === 'all') {
                document.querySelectorAll('.view-block').forEach(el => el.classList.remove('hidden'));
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                document.querySelectorAll('.view-block').forEach(el => el.classList.remove('hidden'));
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    });
}

// 2. Filter Buttons
function setupFilterButtons() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => {
                b.classList.remove('bg-emerald-600', 'text-white', 'shadow-sm');
                b.classList.add('bg-slate-100', 'text-slate-700', 'hover:bg-slate-200');
            });
            btn.classList.add('bg-emerald-600', 'text-white', 'shadow-sm');
            btn.classList.remove('bg-slate-100', 'text-slate-700', 'hover:bg-slate-200');

            currentGroupFilter = btn.getAttribute('data-filter');
            updateKPIs();
            renderAllCharts();
            render36ItemsTable();
        });
    });
}

// 3. Update KPI Cards
function updateKPIs() {
    const meta = window.KHKT_DATA.metadata;
    const kpiSample = document.getElementById('kpi-sample');
    const kpiPreComp = document.getElementById('kpi-pre-comp');
    const kpiPostComp = document.getElementById('kpi-post-comp');
    const kpiPreHb = document.getElementById('kpi-pre-hb');
    const kpiContact = document.getElementById('kpi-contact');
    const kpiBadge = document.getElementById('kpi-badge-filter');

    if (currentGroupFilter === 'tn') {
        if (kpiSample) kpiSample.textContent = `${meta.sample_tn} HS`;
        if (kpiPreComp) kpiPreComp.textContent = `${meta.pre_competency_mean.toFixed(2)} / 5.00`;
        if (kpiPostComp) kpiPostComp.textContent = `3.92 (+${meta.diff_competency_mean.toFixed(2)})`;
        if (kpiPreHb) kpiPreHb.textContent = `${meta.pre_knowledge_mean.toFixed(2)} → ${meta.post_knowledge_mean.toFixed(2)}`;
        if (kpiContact) kpiContact.textContent = `9.8%`;
        if (kpiBadge) kpiBadge.textContent = 'Đang lọc: Nhóm Thực nghiệm (N=236)';
    } else if (currentGroupFilter === 'ss') {
        if (kpiSample) kpiSample.textContent = `${meta.sample_ss} HS`;
        if (kpiPreComp) kpiPreComp.textContent = `${meta.pre_ss_mean.toFixed(2)} / 5.00`;
        if (kpiPostComp) kpiPostComp.textContent = `1.74 (+${meta.diff_ss_mean.toFixed(2)})`;
        if (kpiPreHb) kpiPreHb.textContent = `1.48 → 1.61`;
        if (kpiContact) kpiContact.textContent = `10.2%`;
        if (kpiBadge) kpiBadge.textContent = 'Đang lọc: Nhóm So sánh / Đối chứng (N=238)';
    } else {
        if (kpiSample) kpiSample.textContent = `${meta.total_sample} HS`;
        if (kpiPreComp) kpiPreComp.textContent = `1.52 / 5.00`;
        if (kpiPostComp) kpiPostComp.textContent = `TN: 3.92 | SS: 1.74`;
        if (kpiPreHb) kpiPreHb.textContent = `1.48 / 5.00`;
        if (kpiContact) kpiContact.textContent = `10.0%`;
        if (kpiBadge) kpiBadge.textContent = 'Toàn bộ mẫu khảo sát (N=474)';
    }
}

// 4. Render All Charts
function renderAllCharts() {
    renderRadarInitialChart();
    renderContactBarChart();
    renderObstaclesChart();
    renderKnowledgeGroupedBarChart();
    renderCareerDonutCharts();
    renderRadarPrePostChart();
    renderGroupedBarImpactChart();
    renderModelFactorsChart();
}

// Chart 1: Radar Năng lực 4D ban đầu (RQ1)
function renderRadarInitialChart() {
    const ctx = document.getElementById('chart-radar-initial');
    if (!ctx) return;
    if (charts['radarInitial']) charts['radarInitial'].destroy();

    const f = window.KHKT_DATA.factors_4d;
    const labels = ['F1: Tự nhận thức', 'F2: Khám phá nghề', 'F3: Ra quyết định', 'F4: Lập kế hoạch'];
    
    let datasets = [];
    if (currentGroupFilter === 'ss') {
        datasets = [{
            label: 'Nhóm So sánh (Ban đầu)',
            data: [f.F1.pre_ss, f.F2.pre_ss, f.F3.pre_ss, f.F4.pre_ss],
            backgroundColor: 'rgba(71, 85, 105, 0.2)',
            borderColor: '#64748b',
            pointBackgroundColor: '#64748b',
            pointBorderColor: '#fff',
            borderWidth: 2.5,
            pointRadius: 5
        }];
    } else if (currentGroupFilter === 'tn') {
        datasets = [{
            label: 'Nhóm Thực nghiệm (Ban đầu)',
            data: [f.F1.pre_tn, f.F2.pre_tn, f.F3.pre_tn, f.F4.pre_tn],
            backgroundColor: 'rgba(239, 68, 68, 0.2)',
            borderColor: '#ef4444',
            pointBackgroundColor: '#ef4444',
            pointBorderColor: '#fff',
            borderWidth: 2.5,
            pointRadius: 5
        }];
    } else {
        datasets = [
            {
                label: 'Nhóm Thực nghiệm (Trước TN)',
                data: [f.F1.pre_tn, f.F2.pre_tn, f.F3.pre_tn, f.F4.pre_tn],
                backgroundColor: 'rgba(239, 68, 68, 0.18)',
                borderColor: '#ef4444',
                pointBackgroundColor: '#ef4444',
                pointBorderColor: '#fff',
                pointRadius: 5,
                borderWidth: 2.5
            },
            {
                label: 'Nhóm So sánh (Trước TN)',
                data: [f.F1.pre_ss, f.F2.pre_ss, f.F3.pre_ss, f.F4.pre_ss],
                backgroundColor: 'rgba(37, 99, 235, 0.18)',
                borderColor: '#2563eb',
                pointBackgroundColor: '#2563eb',
                pointBorderColor: '#fff',
                pointRadius: 5,
                borderWidth: 2.5
            }
        ];
    }

    charts['radarInitial'] = new Chart(ctx, {
        type: 'radar',
        data: { labels, datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    min: 0,
                    max: 5,
                    ticks: { stepSize: 1, color: '#64748b', backdropColor: 'transparent', font: { size: 10 } },
                    grid: { color: '#e2e8f0' },
                    angleLines: { color: '#cbd5e1' },
                    pointLabels: { font: { size: 12, weight: '700' }, color: '#1e293b' }
                }
            },
            plugins: {
                legend: { position: 'top', labels: { boxWidth: 14, font: { size: 11, weight: '600' }, color: '#334155' } },
                tooltip: {
                    callbacks: {
                        label: ctx => ` ${ctx.dataset.label}: ${ctx.raw} / 5.00 (Mức thấp)`
                    }
                }
            }
        }
    });
}

// Chart 2: 9 Hành vi Tiếp xúc Thực tế (RQ1 - Horizontal Bar)
function renderContactBarChart() {
    const ctx = document.getElementById('chart-contact-bar');
    if (!ctx) return;
    if (charts['contactBar']) charts['contactBar'].destroy();

    const items = window.KHKT_DATA.contact_9;
    const labels = items.map(i => {
        let t = i.title.replace(/^\d+\.\s*/, '');
        return t.length > 34 ? t.substring(0, 34) + '...' : t;
    });
    const dataEver = items.map(i => i.pct_ever);
    const dataNever = items.map(i => i.pct_never);

    charts['contactBar'] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [
                {
                    label: 'Đã từng tiếp xúc (%)',
                    data: dataEver,
                    backgroundColor: '#10b981',
                    borderRadius: 4
                },
                {
                    label: 'Chưa từng tiếp xúc / Không bao giờ (%)',
                    data: dataNever,
                    backgroundColor: '#f87171',
                    borderRadius: 4
                }
            ]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    stacked: true,
                    max: 100,
                    ticks: { callback: v => v + '%', color: '#64748b' },
                    grid: { color: '#f1f5f9' }
                },
                y: {
                    stacked: true,
                    ticks: { font: { size: 11, weight: '500' }, color: '#334155' },
                    grid: { display: false }
                }
            },
            plugins: {
                legend: { position: 'top', labels: { boxWidth: 12, font: { size: 11 }, color: '#334155' } },
                tooltip: {
                    callbacks: {
                        label: ctx => ` ${ctx.dataset.label}: ${ctx.raw}%`
                    }
                }
            }
        }
    });
}

// Chart 3: Top Rào Cản (RQ1 - Bar Chart)
function renderObstaclesChart() {
    const ctx = document.getElementById('chart-obstacles-bar');
    if (!ctx) return;
    if (charts['obstaclesBar']) charts['obstaclesBar'].destroy();

    const obs = window.KHKT_DATA.obstacles;
    const labels = obs.map(o => o.title.length > 24 ? o.title.substring(0, 24) + '...' : o.title);
    const scores = obs.map(o => o.score);

    charts['obstaclesBar'] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'ĐTB Mức độ cản trở (thang 1 - 5)',
                data: scores,
                backgroundColor: [
                    '#e11d48',
                    '#f43f5e',
                    '#f97316',
                    '#fb923c',
                    '#eab308'
                ],
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    min: 3,
                    max: 5,
                    ticks: { stepSize: 0.5, color: '#64748b' },
                    grid: { color: '#f1f5f9' }
                },
                x: {
                    ticks: { font: { size: 10, weight: '600' }, color: '#334155' },
                    grid: { display: false }
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        title: (items) => obs[items[0].dataIndex].title,
                        label: ctx => ` ĐTB Cản trở: ${ctx.raw} / 5.00 (${obs[ctx.dataIndex].pct}% học sinh phản ánh)`
                    }
                }
            }
        }
    });
}

// Chart 4: Grouped Bar 9 Chỉ Báo Hiểu Biết Nghề (RQ2)
function renderKnowledgeGroupedBarChart() {
    const ctx = document.getElementById('chart-knowledge-bar');
    if (!ctx) return;
    if (charts['knowledgeBar']) charts['knowledgeBar'].destroy();

    const items = window.KHKT_DATA.knowledge_9;
    const labels = [
        '1. Quy trình tạo tranh',
        '2. An toàn & thẩm mỹ',
        '3. Đa vị trí việc làm',
        '4. Vai trò nghệ nhân & thợ',
        '5. Công nghệ số & Phôi số',
        '6. Thương mại điện tử',
        '7. Con đường học nghề',
        '8. Cơ hội việc làm địa phương',
        '9. Định vị việc làm muốn làm'
    ];

    let preData, postData, labelPre, labelPost;

    if (currentGroupFilter === 'ss') {
        preData = items.map(i => i.pre_ss);
        postData = items.map(i => i.post_ss);
        labelPre = 'Nhóm So sánh (Trước)';
        labelPost = 'Nhóm So sánh (Sau)';
    } else {
        preData = items.map(i => i.pre_tn);
        postData = items.map(i => i.post_tn);
        labelPre = 'Trước can thiệp (Pre)';
        labelPost = 'Sau can thiệp (Post - TN)';
    }

    charts['knowledgeBar'] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [
                {
                    label: labelPre,
                    data: preData,
                    backgroundColor: '#cbd5e1',
                    borderRadius: 4
                },
                {
                    label: labelPost,
                    data: postData,
                    backgroundColor: '#059669',
                    borderRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    min: 1,
                    max: 5,
                    ticks: { stepSize: 1, color: '#64748b' },
                    grid: { color: '#f1f5f9' }
                },
                x: {
                    ticks: { font: { size: 10, weight: '500' }, color: '#334155' },
                    grid: { display: false }
                }
            },
            plugins: {
                legend: { position: 'top', labels: { boxWidth: 12, color: '#334155' } },
                tooltip: {
                    callbacks: {
                        label: ctx => ` ${ctx.dataset.label}: ${ctx.raw} / 5.00`
                    }
                }
            }
        }
    });
}

// Chart 5: Career Preference Donut (RQ2)
function renderCareerDonutCharts() {
    const ctxPre = document.getElementById('chart-career-before');
    const ctxPost = document.getElementById('chart-career-after');
    if (!ctxPre || !ctxPost) return;

    if (charts['careerPre']) charts['careerPre'].destroy();
    if (charts['careerPost']) charts['careerPost'].destroy();

    const dataPref = window.KHKT_DATA.career_preference;

    // Before
    charts['careerPre'] = new Chart(ctxPre, {
        type: 'doughnut',
        data: {
            labels: dataPref.before.map(d => d.name),
            datasets: [{
                data: dataPref.before.map(d => d.pct),
                backgroundColor: ['#64748b', '#94a3b8', '#cbd5e1', '#e2e8f0', '#f1f5f9'],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 9 }, color: '#475569' } },
                tooltip: {
                    callbacks: {
                        label: ctx => ` ${ctx.label}: ${ctx.raw}%`
                    }
                }
            },
            cutout: '62%'
        }
    });

    // After
    charts['careerPost'] = new Chart(ctxPost, {
        type: 'doughnut',
        data: {
            labels: dataPref.after.map(d => d.name),
            datasets: [{
                data: dataPref.after.map(d => d.pct),
                backgroundColor: ['#0284c7', '#059669', '#d97706', '#db2777'],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 9 }, color: '#475569' } },
                tooltip: {
                    callbacks: {
                        label: ctx => ` ${ctx.label}: ${ctx.raw}%`
                    }
                }
            },
            cutout: '62%'
        }
    });
}

// Chart 6: Radar Lồng Ghép 2 Lớp Pre vs Post (RQ3 - Trọng Tâm)
function renderRadarPrePostChart() {
    const ctx = document.getElementById('chart-radar-prepost');
    if (!ctx) return;
    if (charts['radarPrePost']) charts['radarPrePost'].destroy();

    const f = window.KHKT_DATA.factors_4d;
    const labels = [
        ['F1: Tự nhận thức', 'nghề nghiệp'],
        ['F2: Khám phá', 'thế giới nghề'],
        ['F3: Ra quyết định', 'nghề nghiệp'],
        ['F4: Lập kế hoạch', 'nghề nghiệp']
    ];

    charts['radarPrePost'] = new Chart(ctx, {
        type: 'radar',
        data: {
            labels,
            datasets: [
                {
                    label: 'Sau can thiệp (Post-test TN: 3.92)',
                    data: [f.F1.post_tn, f.F2.post_tn, f.F3.post_tn, f.F4.post_tn],
                    backgroundColor: 'rgba(5, 150, 105, 0.3)',
                    borderColor: '#059669',
                    pointBackgroundColor: '#059669',
                    pointBorderColor: '#ffffff',
                    borderWidth: 3,
                    pointRadius: 6,
                    pointHoverRadius: 8
                },
                {
                    label: 'Trước can thiệp (Pre-test TN: 1.52)',
                    data: [f.F1.pre_tn, f.F2.pre_tn, f.F3.pre_tn, f.F4.pre_tn],
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    borderColor: '#ef4444',
                    pointBackgroundColor: '#ef4444',
                    pointBorderColor: '#ffffff',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    pointRadius: 5
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    min: 0,
                    max: 5,
                    ticks: { stepSize: 1, color: '#64748b', backdropColor: 'transparent', font: { size: 10 } },
                    grid: { color: '#e2e8f0' },
                    angleLines: { color: '#cbd5e1' },
                    pointLabels: {
                        font: { size: 12, weight: '700' },
                        color: '#0f172a'
                    }
                }
            },
            plugins: {
                legend: { position: 'top', labels: { boxWidth: 14, font: { size: 12, weight: '600' }, color: '#1e293b' } },
                tooltip: {
                    callbacks: {
                        label: ctx => ` ${ctx.dataset.label}: ${ctx.raw} / 5.00`
                    }
                }
            }
        }
    });
}

// Chart 7: Grouped Bar So Sánh 2 Nhóm (RQ3)
function renderGroupedBarImpactChart() {
    const ctx = document.getElementById('chart-impact-comparison');
    if (!ctx) return;
    if (charts['impactComparison']) charts['impactComparison'].destroy();

    const f = window.KHKT_DATA.factors_4d;
    const meta = window.KHKT_DATA.metadata;

    const labels = [
        'Toàn diện 36 biến',
        'F1: Tự nhận thức',
        'F2: Khám phá nghề',
        'F3: Ra quyết định',
        'F4: Lập kế hoạch'
    ];

    const tnGains = [
        meta.diff_competency_mean,
        f.F1.post_tn - f.F1.pre_tn,
        f.F2.post_tn - f.F2.pre_tn,
        f.F3.post_tn - f.F3.pre_tn,
        f.F4.post_tn - f.F4.pre_tn
    ].map(v => Math.round(v * 100) / 100);

    const ssGains = [
        meta.diff_ss_mean,
        f.F1.post_ss - f.F1.pre_ss,
        f.F2.post_ss - f.F2.pre_ss,
        f.F3.post_ss - f.F3.pre_ss,
        f.F4.post_ss - f.F4.pre_ss
    ].map(v => Math.round(v * 100) / 100);

    charts['impactComparison'] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [
                {
                    label: 'Nhóm Thực nghiệm (Mức tăng Δ)',
                    data: tnGains,
                    backgroundColor: '#059669',
                    borderRadius: 6
                },
                {
                    label: 'Nhóm So sánh (Mức tăng Δ)',
                    data: ssGains,
                    backgroundColor: '#94a3b8',
                    borderRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    min: 0,
                    max: 3,
                    ticks: { stepSize: 0.5, color: '#64748b' },
                    grid: { color: '#f1f5f9' }
                },
                x: {
                    ticks: { font: { size: 11, weight: '600' }, color: '#334155' },
                    grid: { display: false }
                }
            },
            plugins: {
                legend: { position: 'top', labels: { boxWidth: 12, color: '#334155' } },
                tooltip: {
                    callbacks: {
                        label: ctx => ` ${ctx.dataset.label}: +${ctx.raw} điểm`
                    }
                }
            }
        }
    });
}

// Chart 8: Xếp Hạng Đóng Góp 4 Yếu Tố Mô Hình (RQ4)
function renderModelFactorsChart() {
    const ctx = document.getElementById('chart-model-factors');
    if (!ctx) return;
    if (charts['modelFactors']) charts['modelFactors'].destroy();

    const items = window.KHKT_DATA.model_factors;
    const labels = items.map(i => i.title);
    const means = items.map(i => i.mean);

    charts['modelFactors'] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Điểm đánh giá thực tế (ĐTB / 5.00)',
                data: means,
                backgroundColor: [
                    '#059669',
                    '#0284c7',
                    '#7c3aed',
                    '#d97706'
                ],
                borderRadius: 6
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    min: 3.5,
                    max: 5,
                    ticks: { stepSize: 0.5, color: '#64748b' },
                    grid: { color: '#f1f5f9' }
                },
                y: {
                    ticks: { font: { size: 11, weight: '600' }, color: '#1e293b' },
                    grid: { display: false }
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: ctx => {
                            const it = items[ctx.dataIndex];
                            return ` ĐTB: ${ctx.raw} / 5.00 | Hệ số hồi quy β = ${it.beta} (${it.p_val})`;
                        }
                    }
                }
            }
        }
    });
}

// 5. 36 Items Table Rendering & Filtering
function setupFactorTabs() {
    const tabs = document.querySelectorAll('.factor-tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => {
                t.classList.remove('bg-emerald-600', 'text-white');
                t.classList.add('bg-slate-100', 'text-slate-600', 'hover:bg-slate-200');
            });
            tab.classList.add('bg-emerald-600', 'text-white');
            tab.classList.remove('bg-slate-100', 'text-slate-600', 'hover:bg-slate-200');
            currentFactorTab = tab.getAttribute('data-factor');
            render36ItemsTable();
        });
    });
}

function setupSearchFilter() {
    const searchInput = document.getElementById('search-item-input');
    if (!searchInput) return;
    searchInput.addEventListener('input', () => {
        render36ItemsTable();
    });
}

function render36ItemsTable() {
    const tbody = document.getElementById('table-36-body');
    if (!tbody) return;

    const searchTerm = (document.getElementById('search-item-input')?.value || '').toLowerCase();
    const items = window.KHKT_DATA.items_36;

    let filtered = items.filter(it => {
        const matchTab = (currentFactorTab === 'ALL') || (it.factor === currentFactorTab);
        const matchSearch = it.code.toLowerCase().includes(searchTerm) || 
                            it.content.toLowerCase().includes(searchTerm) ||
                            it.factor_name.toLowerCase().includes(searchTerm);
        return matchTab && matchSearch;
    });

    let html = '';
    filtered.forEach(it => {
        const isTN = currentGroupFilter !== 'ss';
        const preVal = isTN ? it.pre_tn : it.pre_ss;
        const postVal = isTN ? it.post_tn : it.post_ss;
        const diffVal = isTN ? it.diff_tn : it.diff_ss;
        const pctGrowth = ((diffVal / preVal) * 100).toFixed(0);

        let factorBadgeColor = 'bg-slate-100 text-slate-700 border border-slate-200';
        if (it.factor === 'F1') factorBadgeColor = 'bg-blue-50 text-blue-700 border border-blue-200';
        if (it.factor === 'F2') factorBadgeColor = 'bg-emerald-50 text-emerald-700 border border-emerald-200';
        if (it.factor === 'F3') factorBadgeColor = 'bg-amber-50 text-amber-700 border border-amber-200';
        if (it.factor === 'F4') factorBadgeColor = 'bg-purple-50 text-purple-700 border border-purple-200';

        html += `
            <tr class="border-b border-slate-100 hover:bg-slate-50 transition">
                <td class="py-3 px-3 text-center">
                    <span class="font-mono font-bold text-xs px-2 py-0.5 rounded ${factorBadgeColor}">${it.code}</span>
                </td>
                <td class="py-3 px-3 font-semibold text-xs text-slate-500">
                    ${it.factor}
                </td>
                <td class="py-3 px-4 text-xs md:text-sm text-slate-800 font-medium">
                    ${it.content}
                </td>
                <td class="py-3 px-3 text-center font-mono text-xs md:text-sm text-slate-500">
                    ${preVal.toFixed(2)}
                </td>
                <td class="py-3 px-3 text-center font-mono text-xs md:text-sm font-bold text-emerald-600">
                    ${postVal.toFixed(2)}
                </td>
                <td class="py-3 px-3 text-center font-mono text-xs md:text-sm font-bold text-amber-600">
                    +${diffVal.toFixed(2)}
                </td>
                <td class="py-3 px-3 text-right">
                    <div class="flex items-center justify-end space-x-2">
                        <span class="text-xs font-bold text-emerald-600">+${pctGrowth}%</span>
                        <div class="w-16 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                            <div class="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 rounded-full" style="width: ${Math.min(100, Math.max(10, (diffVal / 2.5) * 100))}%"></div>
                        </div>
                    </div>
                </td>
            </tr>
        `;
    });

    if (filtered.length === 0) {
        html = `<tr><td colspan="7" class="py-8 text-center text-slate-400 text-sm">Không tìm thấy biến quan sát phù hợp</td></tr>`;
    }

    tbody.innerHTML = html;
    
    const countBadge = document.getElementById('table-count-badge');
    if (countBadge) countBadge.textContent = `Hiển thị ${filtered.length} / 36 biến`;
}

// 6. Modal Gallery Setup
function setupModalGallery() {
    const modal = document.getElementById('evidence-modal');
    const modalClose = document.getElementById('modal-close-btn');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');

    if (!modal) return;

    modalClose.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.add('hidden');
    });

    const triggerBtns = document.querySelectorAll('.evidence-trigger-btn');
    triggerBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.getAttribute('data-evidence-type');
            renderModalContent(type, modalTitle, modalBody);
            modal.classList.remove('hidden');
        });
    });
}

function renderModalContent(type, titleEl, bodyEl) {
    if (type === 'sample_art') {
        titleEl.textContent = 'Mẫu Phôi Số & Tác Phẩm Tranh Đá Quý 10 x 10 cm';
        bodyEl.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div class="space-y-4">
                    <div class="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center shadow-sm">
                        <div class="inline-block p-4 rounded-full bg-emerald-100 text-emerald-600 mb-3">
                            <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h4 class="font-bold text-lg text-emerald-800">Sản Phẩm Trải Nghiệm Chuẩn Hóa</h4>
                        <p class="text-xs text-slate-600 mt-2">Kích thước 10 × 10 cm • Sử dụng đá Ruby hồng & Thạch anh ngũ sắc Lục Yên</p>
                        <div class="mt-4 inline-flex items-center px-3 py-1 bg-emerald-600 text-white text-xs font-semibold rounded-full shadow-sm">
                            100% Học sinh hoàn thiện tại Trạm 3
                        </div>
                    </div>
                    <div class="text-xs text-slate-600 space-y-2 leading-relaxed">
                        <p><strong class="text-slate-800">• Khâu thiết kế:</strong> Phác thảo nét đồ họa trên máy tính, chia mảng khối màu theo tỷ lệ chuẩn.</p>
                        <p><strong class="text-slate-800">• Kỹ thuật rải đá:</strong> Rải hạt đá thô lót nền, rải hạt mịn tạo chiều sâu không gian, gắn đá nổi tạo điểm nhấn.</p>
                        <p><strong class="text-slate-800">• Keo gắn an toàn:</strong> Sử dụng keo chuyên dụng trong môi trường thông thoáng đảm bảo an toàn học sinh.</p>
                    </div>
                </div>
                <div class="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                    <h5 class="text-sm font-bold text-slate-900 uppercase tracking-wider">Tiêu Chí Đánh Giá Sản Phẩm (Rubric 5 Cấp Độ)</h5>
                    <div class="space-y-2 text-xs text-slate-700">
                        <div class="p-3 rounded-xl bg-white border border-slate-200 shadow-sm border-l-4 border-emerald-500">
                            <span class="font-bold text-emerald-700">Độ khít và phẳng mặt đá:</span> Đạt 94.2% yêu cầu kỹ thuật xưởng.
                        </div>
                        <div class="p-3 rounded-xl bg-white border border-slate-200 shadow-sm border-l-4 border-blue-500">
                            <span class="font-bold text-blue-700">Hòa sắc và chuyển màu:</span> Thể hiện rõ sắc thái đậm nhạt của cảnh sắc danh thắng Lục Yên.
                        </div>
                        <div class="p-3 rounded-xl bg-white border border-slate-200 shadow-sm border-l-4 border-amber-500">
                            <span class="font-bold text-amber-700">Gắn mã QR e-Portfolio:</span> Tích hợp mặt sau tranh liên kết đến nhật ký học nghề số của tác giả.
                        </div>
                    </div>
                </div>
            </div>
        `;
    } else if (type === 'roadmap') {
        titleEl.textContent = 'Bản Đồ Lộ Trình Nghề Nghiệp 6 - 12 Tháng';
        bodyEl.innerHTML = `
            <div class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="p-4 rounded-2xl bg-blue-50 border border-blue-200">
                        <div class="text-xs font-bold text-blue-700 uppercase">Giai đoạn 1 (Tháng 1 - 3)</div>
                        <h4 class="font-bold text-sm text-slate-900 mt-1">Khám phá & Nền tảng</h4>
                        <ul class="text-xs text-slate-600 mt-2 space-y-1 list-disc list-inside">
                            <li>Làm chủ phần mềm thiết kế phôi số cơ bản</li>
                            <li>Phân loại 12 nhóm đá quý tự nhiên Lục Yên</li>
                            <li>Rèn kỹ thuật rải đều hạt đá và an toàn phòng xưởng</li>
                        </ul>
                    </div>
                    <div class="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                        <div class="text-xs font-bold text-emerald-700 uppercase">Giai đoạn 2 (Tháng 4 - 6)</div>
                        <h4 class="font-bold text-sm text-slate-900 mt-1">Chuyên sâu theo nhánh nghề</h4>
                        <ul class="text-xs text-slate-600 mt-2 space-y-1 list-disc list-inside">
                            <li>Chọn 1 trong 5 nhánh nghề mũi nhọn</li>
                            <li>Thực hiện đồ án tranh ghép khổ trung (30x40cm)</li>
                            <li>Xây dựng kênh tiếp thị số trên TikTok Shop / Shopee</li>
                        </ul>
                    </div>
                    <div class="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                        <div class="text-xs font-bold text-amber-700 uppercase">Giai đoạn 3 (Tháng 7 - 12)</div>
                        <h4 class="font-bold text-sm text-slate-900 mt-1">Bảo vệ e-Portfolio & Hội nhập</h4>
                        <ul class="text-xs text-slate-600 mt-2 space-y-1 list-disc list-inside">
                            <li>Hoàn thiện hồ sơ năng lực cá nhân có xác nhận nghệ nhân</li>
                            <li>Tham gia hội chợ đá quý Lục Yên giới thiệu sản phẩm</li>
                            <li>Đăng ký học nghề nâng cao hoặc khởi nghiệp thực tế</li>
                        </ul>
                    </div>
                </div>
                <div class="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center space-x-2">
                    <svg class="w-5 h-5 flex-shrink-0 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    <span><strong>100% học sinh nhóm Thực nghiệm</strong> đã hoàn thành bản kế hoạch hành động cụ thể theo mẫu chuẩn quốc gia.</span>
                </div>
            </div>
        `;
    }
}

// 7. Audio Widget Simulator (Nghệ nhân phản hồi)
function setupAudioWidget() {
    const playBtn = document.getElementById('audio-play-btn');
    const audioBar = document.getElementById('audio-progress-bar');
    const audioTime = document.getElementById('audio-time-label');
    const waveCanvas = document.getElementById('audio-wave-canvas');
    if (!playBtn || !waveCanvas) return;

    const ctx = waveCanvas.getContext('2d');
    let progress = 0;

    function drawWave(animating = false) {
        ctx.clearRect(0, 0, waveCanvas.width, waveCanvas.height);
        const bars = 28;
        const width = waveCanvas.width / bars;
        for (let i = 0; i < bars; i++) {
            let h = animating ? Math.random() * (waveCanvas.height * 0.8) + 4 : 8;
            ctx.fillStyle = i < (bars * (progress / 100)) ? '#059669' : '#cbd5e1';
            ctx.fillRect(i * width + 2, (waveCanvas.height - h) / 2, width - 4, h);
        }
    }
    drawWave(false);

    playBtn.addEventListener('click', () => {
        isAudioPlaying = !isAudioPlaying;
        if (isAudioPlaying) {
            playBtn.innerHTML = `
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
            `;
            audioAnimationInterval = setInterval(() => {
                progress += 2;
                if (progress > 100) {
                    progress = 0;
                    isAudioPlaying = false;
                    clearInterval(audioAnimationInterval);
                    playBtn.innerHTML = `
                        <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
                        </svg>
                    `;
                    drawWave(false);
                } else {
                    drawWave(true);
                    if (audioBar) audioBar.style.width = `${progress}%`;
                    const sec = Math.floor((progress / 100) * 45);
                    if (audioTime) audioTime.textContent = `0:${sec < 10 ? '0' + sec : sec} / 0:45`;
                }
            }, 300);
        } else {
            clearInterval(audioAnimationInterval);
            playBtn.innerHTML = `
                <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
                </svg>
            `;
            drawWave(false);
        }
    });
}

// 8. Fullscreen Presentation Mode
function setupPresentationMode() {
    const presBtn = document.getElementById('presentation-btn');
    if (!presBtn) return;
    presBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                alert(`Không thể mở chế độ toàn màn hình: ${err.message}`);
            });
            presBtn.innerHTML = `
                <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                <span>Thoát Trình Chiếu</span>
            `;
        } else {
            document.exitFullscreen();
            presBtn.innerHTML = `
                <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/></svg>
                <span>Chế Độ Trình Chiếu KHKT</span>
            `;
        }
    });
}
