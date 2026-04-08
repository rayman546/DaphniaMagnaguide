function calculateMetrics(v, unit) {
    if (isNaN(v) || v <= 0) return null;

    const isGallons = unit === 'G';
    const liters = isGallons ? v * 3.78541 : v;

    const den = Math.floor(liters * 500);
    const harv = Math.floor(den * 0.25);
    const feed = parseFloat((liters * 0.0025).toFixed(3));
    const exchL = (liters * 0.20);
    const hufaL = (liters * 1.0);

    return {
        density: den,
        harvest: harv,
        feed: feed,
        exchangeLiters: exchL,
        hufaLiters: hufaL
    };
}

const treeData = {
    start: {
        q: "What is the physical appearance of the problem?",
        opts: [
            { text: "Water is incredibly cloudy, milky, or smells foul.", next: "cloudy" },
            { text: "Daphnia are turning bright red or pink.", next: "pink" },
            { text: "Daphnia are turning opaque, milk-white, and ceasing reproduction.", next: "microsporidia" },
            { text: "White fuzzy growths are attaching to the Daphnia.", next: "fungal" },
            { text: "Water is crystal clear, but Daphnia are dying or vanishing.", next: "clear_dead" }
        ]
    },
    cloudy: {
        res: "Bacterial Bloom / Ammonia Spike",
        desc: "An over-accumulation of yeast or dead organic matter has caused a massive bacterial explosion. These bacteria consume all available DO (dissolved oxygen) and release toxic ammonia. The LC50 is rapidly approaching.",
        act: "Perform an immediate 50% water change. Cease all feeding until the water is completely clear again. Ensure snails are present to eat bottom-decay.",
        danger: true
    },
    pink: {
        res: "Lethal Heat Stress / Anoxia",
        desc: "Daphnia only produce hemoglobin to turn red/pink when dying of suffocation. This almost always correlates with temperatures rising above 25°C, stripping the water's oxygen carrying capacity.",
        act: "Move the culture to a lower, cooler location. Increase the rolling aeration immediately. Do not feed, as food metabolism costs oxygen.",
        danger: true
    },
    microsporidia: {
        res: "Microsporidia / Pasteuria ramosa Infection",
        desc: "An aggressive parasitic bacterial/spore infection. Affected Daphnia become sterile, turn completely opaque white, and spread spores upon death. It is highly contagious.",
        act: "The culture cannot be saved. Cull the entire batch immediately to prevent cross-contamination. Bleach/sterilize the container and restart with a new, healthy seed culture.",
        danger: true
    },
    fungal: {
        res: "Epibiont / Vorticella Outbreak",
        desc: "Fuzzy growths are usually protozoans like Vorticella using the Daphnia as a ride. While not strictly a disease, dense infestations weigh the Daphnia down and inhibit filter feeding, usually caused by foul water high in dissolved organics.",
        act: "Increase water changes to lower dissolved organics. Adding a micro-dose of high-quality green water can help stabilize the biome.",
        danger: false
    },
    clear_dead: {
        q: "What is the recent history of the clear tank?",
        opts: [
            { text: "I just used tap water for a water change.", next: "chlorine" },
            { text: "I haven't fed them in weeks.", next: "starve" },
            { text: "I use pure Reverse Osmosis (RO) water without remineralizing.", next: "soft" }
        ]
    },
    chlorine: {
        res: "Chloramine Toxicity",
        desc: "Total catastrophic failure. Tap water disinfectants disintegrate micro-fauna.",
        act: "Add dechlorinator instantly. Check the detritus for black Ephippia resting cysts—leave the tank alone for a month, they may hatch and reboot automatically.",
        danger: true
    },
    starve: {
        res: "Total Starvation",
        desc: "They ran out of phytoplankton or yeast to filter. Reproductive shutdown triggered.",
        act: "Restart a rigorous, careful feeding schedule.",
        danger: false
    },
    soft: {
        res: "Ecdysozoan Molting Failure (Low GH/KH)",
        desc: "Crustaceans require calcium to shed their carapace. In water under 90mg/L CaCO3, they get stuck in their own exoskeleton during the molt and die rapidly. Water goes clear because they stop eating.",
        act: "Add crushed coral, a pinch of plaster of Paris, or specialized remineralizing salts (like SaltyShrimp Shrimp Mineral GH/KH+) to hit appropriate hardness.",
        danger: true
    }
};

// UI DOM bindings
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        // Tab Navigation
        const navBtns = document.querySelectorAll('.nav-btn');
        const sections = document.querySelectorAll('.section');

        navBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                navBtns.forEach(b => b.classList.remove('active'));
                sections.forEach(s => s.classList.remove('active'));

                e.target.classList.add('active');
                const targetId = e.target.getAttribute('data-target');
                document.getElementById(targetId).classList.add('active');

                if (window.innerWidth <= 900) toggleMobileMenu(); // Auto-close on mobile
            });
        });

        // Expert Toggle
        const modeToggle = document.getElementById('modeToggle');
        if (modeToggle) {
            modeToggle.addEventListener('change', () => {
                if (modeToggle.checked) {
                    document.body.classList.add('expert-mode');
                } else {
                    document.body.classList.remove('expert-mode');
                }
            });
        }

        // Mobile Menu
        const sidebar = document.getElementById('sidebar');
        window.toggleMobileMenu = function() {
            if (sidebar) sidebar.classList.toggle('open');
        };

        // Calculator
        const calcVol = document.getElementById('calc-vol');
        const unitToggle = document.getElementById('unit-toggle');
        const mDensity = document.getElementById('met-density');
        const mHarvest = document.getElementById('met-harvest');
        const mFeed = document.getElementById('met-feed');
        const mExchange = document.getElementById('met-exchange');
        const mHufa = document.getElementById('met-hufa');

        function updateCalc() {
            if (!calcVol || !unitToggle) return;
            let v = parseFloat(calcVol.value);
            const unit = unitToggle.value;

            const metrics = calculateMetrics(v, unit);
            if (!metrics) return;

            mDensity.innerText = metrics.density.toLocaleString();
            mHarvest.innerText = metrics.harvest.toLocaleString();
            mFeed.innerText = `${metrics.feed}g`;

            const isGallons = unit === 'G';
            mExchange.innerText = isGallons ? `${(metrics.exchangeLiters / 3.78541).toFixed(1)} Gal` : `${metrics.exchangeLiters.toFixed(1)} L`;
            mHufa.innerText = `${metrics.hufaLiters.toFixed(1)} ml`;
        }

        if (calcVol) {
            calcVol.addEventListener('input', updateCalc);
            unitToggle.addEventListener('change', () => {
                if (unitToggle.value === 'G' && calcVol.value === '20') calcVol.value = '5';
                if (unitToggle.value === 'L' && calcVol.value === '5') calcVol.value = '20';
                updateCalc();
            });
            updateCalc();
        }

        // Diagnostic Tree
        const treeArea = document.getElementById('diagnostic-tree');
        window.drawTree = function(id) {
            if (!treeArea) return;
            treeArea.innerHTML = '';
            const node = treeData[id];

            if (node.q) {
                const head = document.createElement('div');
                head.className = 'tree-q';
                head.innerText = node.q;
                treeArea.appendChild(head);

                node.opts.forEach(opt => {
                    const b = document.createElement('button');
                    b.className = 'tree-btn';
                    b.innerText = opt.text;
                    b.onclick = () => window.drawTree(opt.next);
                    treeArea.appendChild(b);
                });

                if (id !== 'start') {
                    const r = document.createElement('div');
                    r.style.marginTop = "20px";
                    r.style.color = "var(--accent-secondary)";
                    r.style.cursor = "pointer";
                    r.style.fontWeight = "bold";
                    r.innerText = "← Restart Diagnostics";
                    r.onclick = () => window.drawTree('start');
                    treeArea.appendChild(r);
                }
            } else if (node.res) {
                const res = document.createElement('div');
                res.className = `tree-res ${node.danger ? 'danger' : ''}`;
                res.innerHTML = `
                    <h3>${node.res}</h3>
                    <p style="margin-bottom:15px; color:#cbd5e1;"><strong>Mechanism:</strong> ${node.desc}</p>
                    <p style="color:#f8fafc;"><strong>${node.act}</strong></p>
                    <br>
                    <span style="color:var(--accent-primary); cursor:pointer; font-weight:bold;" onclick="window.drawTree('start')">↺ Restart Diagnostics</span>
                `;
                treeArea.appendChild(res);
            }
        };
        window.drawTree('start');
    });
}

// Export for Node.js / Vitest
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { calculateMetrics, treeData };
}
