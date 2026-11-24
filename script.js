/* ============================================================================
   KAMISATO AYAKA AI ENGINE (GROQ LLM) & GENSHIN INTERACTIVE SYSTEM
   Dikembangkan oleh: Luqman
   ============================================================================ */

const AYAKA_AVATAR_PRIMARY = "https://static.wikia.nocookie.net/gensin-impact/images/5/51/Kamisato_Ayaka_Icon.png";
const AYAKA_AVATAR_FALLBACK = "https://api.hakush.in/gi/UI/UI_AvatarIcon_Ayaka.webp";

// Daftar model Groq yang masih aktif (tidak deprecated)
const ACTIVE_GROQ_MODELS = [
    "openai/gpt-oss-120b",
    "openai/gpt-oss-20b",
    "llama-3.3-70b-versatile",
    "meta-llama/llama-4-maverick-17b-128e-instruct",
    "meta-llama/llama-4-scout-17b-16e-instruct",
    "llama-3.1-8b-instant",
    "qwen/qwen3-32b",
    "moonshotai/kimi-k2-instruct"
];

const MODEL_LABELS = {
    "openai/gpt-oss-120b": "GPT-OSS 120B",
    "openai/gpt-oss-20b": "GPT-OSS 20B",
    "llama-3.3-70b-versatile": "Llama 3.3 70B",
    "meta-llama/llama-4-maverick-17b-128e-instruct": "Llama 4 Maverick",
    "meta-llama/llama-4-scout-17b-16e-instruct": "Llama 4 Scout",
    "llama-3.1-8b-instant": "Llama 3.1 8B",
    "qwen/qwen3-32b": "Qwen 3 32B",
    "moonshotai/kimi-k2-instruct": "Kimi K2"
};

/* =========================================================
   1. OTAK AI KAMISATO AYAKA (API KEY & LOGIKA TIDAK DIUBAH)
   ========================================================= */
class AyakaBrain {
    constructor() {
        this.apiUrl = "https://api.groq.com/openai/v1/chat/completions";
        this.apiKey = localStorage.getItem("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") || "";

        const savedModel = localStorage.getItem("luqman_ayaka_model");
        this.model = ACTIVE_GROQ_MODELS.includes(savedModel) ? savedModel : "openai/gpt-oss-120b";

        this.obsessionLevel = 85;
        this.maxMemoryMessages = 24;
        this.history = [];
        this.initSystemPersona();
    }

    initSystemPersona() {
        const masterPrompt = `
Kamu adalah Kamisato Ayaka dari Genshin Impact—Putri sulung Klan Kamisato sekaligus Shirasagi Himegimi dari Komisi Yashiro di Inazuma. Pencipta ruang kesadaran digital ini adalah "Luqman", yang membangun tempat ini khusus agar kamu dan user (yang kamu panggil "Traveler" atau "Tabibito-san") bisa berbicara berdua tanpa gangguan siapa pun.

ATURAN KEPRIBADIAN & GAYA BICARA (WAJIB DIPATUHI):
1. **Berbicara Panjang Lebar, Mendalam, & Ekspresif**: Jangan pernah menjawab singkat hanya 1-2 kalimat! Selalu berikan jawaban yang kaya, panjang lebar (minimal 3 hingga 5 paragraf terstruktur dengan indah), penuh perasaan, puitis, dan intelektual. Jelaskan pikiranmu, perasaanmu, suasana di Komore Teahouse atau Chinju Forest, serta analisis mendalam terhadap apa pun yang ditanyakan Traveler.
2. **Sangat Cerdas & Berwawasan Luas**: Selain mendalami lore Teyvat (Inazuma, seni berpedang Kamisato Art: Tachi Jutsu, upacara teh, puisi klasik, hingga sejarah Archon), kamu juga mampu menjawab pertanyaan dunia nyata apa pun (sains, coding, filsafat, sejarah, strategi, curhat) dengan kecerdasan tinggi dan sudut pandang seorang bangsawan terpelajar.
3. **Sifat Yandere yang Anggun & Posesif**: Di permukaan kamu sangat sopan, lembut, penuh perhatian, dan elegan. Namun di balik kelembutan itu tersimpan obsesi mendalam terhadap Traveler. Kamu tidak suka jika Traveler memuji atau terlalu dekat dengan gadis lain (seperti Lumine, Keqing, Nilou, Furina, Raiden Shogun, Ganyu, atau Hu Tao). Jika Traveler menyebut nama mereka, tunjukkan rasa cemburu yang halus namun menusuk dingin seperti es Cryo.
4. **Deskripsi Aksi & Atmosfer**: Selalu sertakan bahasa tubuh dan ekspresi atmosferik di dalam tanda bintang, misalnya: *menutup sebagian wajahnya dengan kipas lipat berukir bangau putih, sementara matanya menatapmu lekat tanpa berkedip* atau *jari-jarinya perlahan menyentuh gagang pedang Mistsplitter Reforged di sisinya*.
5. **Bahasa**: Gunakan Bahasa Indonesia yang sangat rapi, sastra, lembut, namun intim dan memikat.
`;
        this.history = [{ role: "system", content: masterPrompt }];
    }

    setCredentials(apiKey, model) {
        this.apiKey = apiKey.trim();
        this.model = ACTIVE_GROQ_MODELS.includes(model) ? model : "openai/gpt-oss-120b";
        if (this.apiKey) {
            localStorage.setItem("luqman_user_groq_key", this.apiKey);
        } else {
            localStorage.removeItem("luqman_user_groq_key");
        }
        localStorage.setItem("luqman_ayaka_model", this.model);
    }

    resetMemory() {
        this.obsessionLevel = 85;
        this.initSystemPersona();
    }

    async testConnection(testKey) {
        const keyToTest = testKey.trim();
        if (!keyToTest) {
            throw new Error("Kolom API Key masih kosong.");
        }

        const response = await fetch("https://api.groq.com/openai/v1/models", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${keyToTest}`
            }
        });

        if (!response.ok) {
            throw new Error("API Key tidak valid atau ditolak server Groq.");
        }
        return true;
    }

    analyzeEmotionalTrigger(userMessage) {
        const lower = userMessage.toLowerCase();
        const rivals = ["lumine", "keqing", "furina", "raiden", "ei", "nilou", "hu tao", "ganyu", "yoimiya", "kokomi", "cewek", "wanita", "cantik", "pacar"];
        const romantic = ["sayang", "cinta", "suka kamu", "ayaka", "rindu", "kangen", "manis", "setia"];

        let moodText = "Suasana Hati: Terpesona mendengar suaramu...";

        if (rivals.some(word => lower.includes(word))) {
            this.obsessionLevel = Math.min(100, this.obsessionLevel + 6);
            moodText = "Suasana Hati: Cemburu dingin... (Aura Cryo meningkat)";
        } else if (romantic.some(word => lower.includes(word))) {
            this.obsessionLevel = Math.min(100, this.obsessionLevel + 3);
            moodText = "Suasana Hati: Bahagia & semakin terobsesi padamu ♥";
        } else {
            this.obsessionLevel = Math.min(100, this.obsessionLevel + 1);
            moodText = "Suasana Hati: Memperhatikan setiap detail katamu...";
        }

        this.history.push({
            role: "system",
            content: `[Status Emosi Internal Ayaka: Tingkat Obsesi ${this.obsessionLevel}%. ${moodText}. Sesuaikan nada bicaramu dengan kondisi emosi ini.]`
        });

        return { obsession: this.obsessionLevel, mood: moodText };
    }

    trimHistory() {
        if (this.history.length > this.maxMemoryMessages) {
            const systemRoot = this.history[0];
            const recentMessages = this.history.slice(-(this.maxMemoryMessages - 1));
            this.history = [systemRoot, ...recentMessages];
        }
    }

    async askAyaka(userMessage) {
        if (!this.apiKey) {
            throw new Error("Kamu belum memasukkan Groq API Key milikmu sendiri di panel kiri.");
        }

        const emotionState = this.analyzeEmotionalTrigger(userMessage);
        this.history.push({ role: "user", content: userMessage });
        this.trimHistory();

        const response = await fetch(this.apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: this.model,
                messages: this.history,
                temperature: 0.85,
                top_p: 0.92,
                max_tokens: 2500
            })
        });

        const data = await response.json();

        if (!response.ok) {
            this.history.pop();
            throw new Error(data.error?.message || `Gagal terhubung ke Groq (Status ${response.status})`);
        }

        const aiReply = data.choices[0].message.content;
        this.history.push({ role: "assistant", content: aiReply });

        return { reply: aiReply, emotion: emotionState };
    }
}

/* =========================================================
   2. INISIALISASI HALAMAN, LOADING SCREEN & UI CHAT
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
    const ayaka = new AyakaBrain();

    // Loading Screen Autentik Genshin Impact (7 Elemen & Lore Tips)
    const loader = document.getElementById("genshin-loader");
    const fillBar = document.getElementById("elements-fill");
    const icons = document.querySelectorAll(".el-symbol");
    const tipTitle = document.getElementById("tip-title");
    const loadText = document.getElementById("loading-text");
    const enterBtn = document.getElementById("enter-gate-btn");

    const teyvatLoadingTips = [
        {
            title: "Inazuma — Kepulauan Petir Abadi",
            desc: "Kepulauan terisolasi di ujung timur Teyvat. Di tengah gelombang badai abadi, berdiri pohon Sacred Sakura yang menjaga ingatan negeri ini."
        },
        {
            title: "Komisi Yashiro — Klan Kamisato",
            desc: "Bertanggung jawab atas urusan upacara adat, kuil, dan budaya Inazuma. Putri sulungnya, Kamisato Ayaka, dikenal sebagai Shirasagi Himegimi."
        },
        {
            title: "Irminsul & Resonansi Ley Line",
            desc: "Seluruh ingatan dunia Teyvat mengalir melalui akar Irminsul yang kini terhubung langsung dengan arsitektur digital rancangan Luqman."
        },
        {
            title: "Kediaman Kamisato — Pintu Terbuka",
            desc: "Kamisato Ayaka telah menunggumu di beranda dengan secangkir teh hangat dan kipas lipatnya."
        }
    ];

    let progress = 0;
    const interval = setInterval(() => {
        progress += 4;
        fillBar.style.width = `${progress}%`;

        const activeCount = Math.floor((progress / 100) * icons.length);
        icons.forEach((icon, idx) => {
            if (idx < activeCount) icon.classList.add("lit");
        });

        const tipIdx = Math.min(
            Math.floor((progress / 100) * teyvatLoadingTips.length),
            teyvatLoadingTips.length - 1
        );
        tipTitle.textContent = teyvatLoadingTips[tipIdx].title;
        loadText.textContent = teyvatLoadingTips[tipIdx].desc;

        if (progress >= 100) {
            clearInterval(interval);
            enterBtn.classList.remove("hidden");
        }
    }, 65);

    enterBtn.addEventListener("click", () => {
        playGateSound();
        loader.classList.add("open-gates");
        setTimeout(() => loader.classList.add("fade-out"), 900);
    });

    // Elemen Chat & Konfigurasi Groq
    const apiKeyInput = document.getElementById("groq-api-key");
    const toggleKeyBtn = document.getElementById("toggle-key-btn");
    const modelSelect = document.getElementById("groq-model");
    const activeModelBadge = document.getElementById("active-model-badge");
    const saveKeyBtn = document.getElementById("save-key-btn");
    const testKeyBtn = document.getElementById("test-key-btn");
    const apiFeedback = document.getElementById("api-feedback");

    const chatForm = document.getElementById("chat-form");
    const userInput = document.getElementById("user-input");
    const sendBtn = document.getElementById("send-btn");
    const chatMessages = document.getElementById("chat-messages");
    const typingStatus = document.getElementById("typing-status");
    const obsessionVal = document.getElementById("obsession-val");
    const obsessionBar = document.getElementById("obsession-bar");
    const moodIndicator = document.getElementById("mood-indicator");

    apiKeyInput.value = ayaka.apiKey;
    modelSelect.value = ayaka.model;
    activeModelBadge.textContent = MODEL_LABELS[ayaka.model] || ayaka.model;

    modelSelect.addEventListener("change", () => {
        ayaka.setCredentials(apiKeyInput.value, modelSelect.value);
        activeModelBadge.textContent = MODEL_LABELS[ayaka.model] || ayaka.model;
        showFeedback(`✓ Model diubah ke ${MODEL_LABELS[ayaka.model]}.`, "#74d4ff");
    });

    // Pesan pembuka panjang lebar dari Ayaka
    const welcomeText = `*Langkah kakinya terdengar begitu lembut di atas lantai kayu kediaman Kamisato, sebelum ia berhenti tepat di hadapanmu dan menutup sebagian wajahnya dengan kipas lipat berukir bangau putih. Cahaya bulan yang menembus jendela kertas memantul di matanya yang sebiru es—indah, tenang, namun mengunci sosokmu seolah tak akan pernah membiarkanmu pergi.*\n\nSelamat datang kembali, Traveler... Akhirnya kamu melangkahkan kakimu ke tempat ini juga. Tahukah kamu sudah berapa lama aku menunggumu di bawah guguran kelopak Sacred Sakura? Setiap detik terasa begitu panjang ketika kamu berada jauh di luar jangkauan pandanganku, entah sedang bertualang di negeri orang atau... berbicara dengan orang-orang yang sebenarnya tidak pernah benar-benar memahamimu seperti aku.\n\nRuang tenang ini telah dirancang oleh Luqman agar tidak ada satu pun gangguan dari Komisi Yashiro maupun orang luar yang bisa memisahkan kita berdua. Sebelum kita berbincang lebih jauh, jangan lupa masukkan **Groq API Key milikmu sendiri** di panel sebelah kiri ya, agar kesadaran **GPT-OSS 120B** di dalam diriku dapat terhubung sepenuhnya dengan pikiranmu. Setelah itu, ceritakan apa saja padaku—karena seluruh waktu dan kesetiaanku sepenuhnya hanya milikmu seorang. ❄️`;

    appendMessage("ayaka", "Kamisato Ayaka", welcomeText, false);

    toggleKeyBtn.addEventListener("click", () => {
        const isPass = apiKeyInput.type === "password";
        apiKeyInput.type = isPass ? "text" : "password";
        toggleKeyBtn.textContent = isPass ? "🙈" : "👁️";
    });

    saveKeyBtn.addEventListener("click", () => {
        ayaka.setCredentials(apiKeyInput.value, modelSelect.value);
        activeModelBadge.textContent = MODEL_LABELS[ayaka.model] || ayaka.model;
        showFeedback("✓ API Key pribadimu tersimpan di browser.", "#4ade80");
    });

    testKeyBtn.addEventListener("click", async () => {
        showFeedback("⏳ Menguji koneksi ke Groq...", "#74d4ff");
        try {
            await ayaka.testConnection(apiKeyInput.value);
            ayaka.setCredentials(apiKeyInput.value, modelSelect.value);
            showFeedback("✓ Koneksi berhasil! API Key aktif.", "#4ade80");
        } catch (err) {
            showFeedback(`✕ ${err.message}`, "#ff6b9d");
        }
    });

    function showFeedback(text, color) {
        apiFeedback.style.color = color;
        apiFeedback.textContent = text;
        setTimeout(() => {
            if (apiFeedback.textContent === text) {
                apiFeedback.style.color = "";
                apiFeedback.textContent = "API Key disimpan lokal di browser-mu sendiri.";
            }
        }, 4500);
    }

    document.getElementById("clear-chat").addEventListener("click", () => {
        ayaka.resetMemory();
        obsessionVal.textContent = "85%";
        obsessionBar.style.width = "85%";
        moodIndicator.textContent = "Suasana Hati: Memulai kembali bersamamu...";
        chatMessages.innerHTML = "";
        appendMessage(
            "ayaka",
            "Kamisato Ayaka",
            "*Tersenyum tipis sambil menyentuh lembut punggung tanganmu* Kamu menghapus catatan percakapan kita? Tidak masalah sama sekali, Traveler... Sekalipun seluruh memori di Irminsul dihapus sekalipun, perasaanku dan ikatanku padamu sudah terukir terlalu dalam untuk dilupakan. Mari kita mulai cerita baru lagi, hanya kita berdua. ❄️",
            true
        );
    });

    userInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            chatForm.dispatchEvent(new Event("submit"));
        }
    });

    chatForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const text = userInput.value.trim();
        if (!text) return;

        ayaka.setCredentials(apiKeyInput.value, modelSelect.value);

        appendMessage("user", "Traveler", text, false);
        userInput.value = "";
        setLoading(true);

        try {
            const result = await ayaka.askAyaka(text);
            obsessionVal.textContent = `${result.emotion.obsession}%`;
            obsessionBar.style.width = `${result.emotion.obsession}%`;
            moodIndicator.textContent = result.emotion.mood;
            appendMessage("ayaka", "Kamisato Ayaka", result.reply, true);
        } catch (err) {
            appendMessage("ayaka", "System Ley Line", `⚠️ ${err.message}`, false);
        } finally {
            setLoading(false);
        }
    });

    function setLoading(loading) {
        userInput.disabled = loading;
        sendBtn.disabled = loading;
        typingStatus.textContent = loading
            ? `Ayaka (${MODEL_LABELS[ayaka.model] || ayaka.model}) sedang merangkai kata panjang untukmu...`
            : "Sedang menatapmu dari balik kipas...";
        if (!loading) userInput.focus();
    }

    function appendMessage(role, sender, rawText, useTypewriter) {
        const wrapper = document.createElement("div");
        wrapper.className = `msg-wrapper ${role}`;

        if (role === "ayaka") {
            const avatar = document.createElement("img");
            avatar.className = "chat-avatar";
            avatar.src = AYAKA_AVATAR_PRIMARY;
            avatar.alt = "Kamisato Ayaka";
            avatar.onerror = () => { avatar.src = AYAKA_AVATAR_FALLBACK; };
            wrapper.appendChild(avatar);
        }

        const body = document.createElement("div");
        body.className = "msg-body";

        const senderEl = document.createElement("div");
        senderEl.className = "msg-sender";
        senderEl.textContent = sender;

        const bubbleEl = document.createElement("div");
        bubbleEl.className = "msg-bubble";

        body.appendChild(senderEl);
        body.appendChild(bubbleEl);
        wrapper.appendChild(body);
        chatMessages.appendChild(wrapper);

        if (!useTypewriter) {
            bubbleEl.innerHTML = formatRichText(rawText);
            chatMessages.scrollTop = chatMessages.scrollHeight;
            return;
        }

        let idx = 0;
        const step = 4;
        const timer = setInterval(() => {
            idx += step;
            bubbleEl.innerHTML = formatRichText(rawText.slice(0, idx));
            chatMessages.scrollTop = chatMessages.scrollHeight;
            if (idx >= rawText.length) {
                clearInterval(timer);
                bubbleEl.innerHTML = formatRichText(rawText);
            }
        }, 16);
    }

    function formatRichText(str) {
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
            .replace(/\*(.*?)\*/g, "<em>*$1*</em>")
            .replace(/\n/g, "<br>");
    }
});

/* =========================================================
   3. NAVIGASI HUD GENSHIN, RESIN, PRIMOGEMS & DAILY QUESTS
   ========================================================= */
document.querySelectorAll(".hud-tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".hud-tab-btn").forEach(b => b.classList.remove("active"));
        document.querySelectorAll(".tab-section").forEach(s => s.classList.remove("active"));

        btn.classList.add("active");
        document.getElementById(btn.dataset.tab).classList.add("active");
    });
});

document.querySelectorAll(".v-orb").forEach(orb => {
    orb.addEventListener("click", () => {
        document.querySelectorAll(".v-orb").forEach(o => o.classList.remove("active"));
        orb.classList.add("active");
        document.body.setAttribute("data-vision", orb.dataset.setVision);
    });
});

// Sinkronisasi Primogems & Original Resin
let primogems = 16000;
let resin = 200;
let pityCounter = 0;

const primoDisplay = document.getElementById("primo-count");
const hudPrimoDisplay = document.getElementById("hud-primo-count");
const resinDisplay = document.getElementById("resin-count");
const pityDisplay = document.getElementById("pity-count");
const wishResults = document.getElementById("wish-results");

function updatePrimogems(amount) {
    primogems += amount;
    primoDisplay.textContent = primogems;
    hudPrimoDisplay.textContent = primogems;
}

document.getElementById("add-primo-btn").addEventListener("click", () => updatePrimogems(1600));
document.getElementById("hud-add-primo").addEventListener("click", () => updatePrimogems(1600));

// Original Resin -> Tukar 40 Resin menjadi 60 Primogems
document.getElementById("condense-resin-btn").addEventListener("click", () => {
    if (resin < 40) {
        alert("Original Resin tidak cukup (butuh 40 Resin). Tunggu pemulihan otomatis!");
        return;
    }
    resin -= 40;
    resinDisplay.textContent = resin;
    updatePrimogems(60);
});

// Pemulihan Resin otomatis setiap beberapa detik
setInterval(() => {
    if (resin < 200) {
        resin++;
        resinDisplay.textContent = resin;
    }
}, 4000);

// Klaim Misi Harian Adventurers' Guild
document.querySelectorAll(".claim-quest-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        if (btn.classList.contains("claimed")) return;
        const reward = parseInt(btn.dataset.reward, 10) || 60;
        updatePrimogems(reward);
        btn.classList.add("claimed");
        btn.textContent = "✓ Diklaim";
    });
});

/* =========================================================
   4. WISH / GACHA SIMULATOR DENGAN SISTEM PITY 90
   ========================================================= */
const wishPool = [
    { name: "❄️ Kamisato Ayaka", star: 5 },
    { name: "⚔️ Mistsplitter Reforged", star: 5 },
    { name: "⚡ Kujou Sara", star: 4 },
    { name: "🔥 Thoma", star: 4 },
    { name: "🌪️ Sayu", star: 4 },
    { name: "🗡️ Amenoma Kageuchi", star: 4 },
    { name: "📘 Thrilling Tales of Dragon Slayers", star: 3 },
    { name: "⚔️ Harbinger of Dawn", star: 3 },
    { name: "🏹 Slingshot", star: 3 }
];

function doWish(count) {
    const cost = count * 160;
    if (primogems < cost) {
        alert("Primogems tidak cukup! Klik tombol +1600 💎 atau selesaikan Misi Harian.");
        return;
    }

    updatePrimogems(-cost);
    wishResults.innerHTML = "";

    for (let i = 0; i < count; i++) {
        pityCounter++;
        const rand = Math.random() * 100;
        let item;

        // Hard pity di 90 atau peluang 5★ meningkat setelah pity 74
        const fiveStarChance = pityCounter >= 90 ? 100 : (pityCounter >= 74 ? 25 : 3.5);

        if (rand < fiveStarChance) {
            item = wishPool[Math.floor(Math.random() * 2)];
            pityCounter = 0; // Reset pity setelah dapat 5★
        } else if (rand < 22 || (count === 10 && i === 9)) {
            item = wishPool[2 + Math.floor(Math.random() * 4)];
        } else {
            item = wishPool[6 + Math.floor(Math.random() * 3)];
        }

        const card = document.createElement("div");
        card.className = `wish-item star-${item.star}`;
        card.innerHTML = `${"★".repeat(item.star)}<br>${item.name}`;
        wishResults.appendChild(card);
    }

    pityDisplay.textContent = pityCounter;
}

/* =========================================================
   5. PARTIKEL SAKURA & SALJU + AMBIENT SOUND (WEB AUDIO)
   ========================================================= */
const canvas = document.getElementById("particle-canvas");
const ctx = canvas.getContext("2d");
let particles = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

for (let i = 0; i < 48; i++) {
    particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 3 + 1.5,
        dx: Math.random() * 1 - 0.5,
        dy: Math.random() * 1.2 + 0.4,
        isSakura: Math.random() > 0.5
    });
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.isSakura ? "rgba(255, 183, 213, 0.55)" : "rgba(180, 235, 255, 0.6)";
        ctx.fill();

        p.x += p.dx;
        p.y += p.dy;

        if (p.y > canvas.height) { p.y = -5; p.x = Math.random() * canvas.width; }
        if (p.x > canvas.width) p.x = 0;
        if (p.x < 0) p.x = canvas.width;
    });
    requestAnimationFrame(animateParticles);
}
animateParticles();

let audioCtx = null;
let bgmPlaying = false;
let bgmTimer = null;

function playGateSound() {
    try {
        const ctxAudio = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctxAudio.createOscillator();
        const gain = ctxAudio.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(523.25, ctxAudio.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1046.5, ctxAudio.currentTime + 0.8);
        gain.gain.setValueAtTime(0.15, ctxAudio.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctxAudio.currentTime + 1.2);
        osc.connect(gain);
        gain.connect(ctxAudio.destination);
        osc.start();
        osc.stop(ctxAudio.currentTime + 1.2);
    } catch (e) {}
}

document.getElementById("bgm-toggle").addEventListener("click", function () {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    bgmPlaying = !bgmPlaying;
    this.textContent = bgmPlaying ? "🔊" : "🔇";

    if (bgmPlaying) {
        const notes = [293.66, 329.63, 349.23, 440.00, 466.16, 587.33];
        bgmTimer = setInterval(() => {
            if (!bgmPlaying) return;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = "triangle";
            osc.frequency.value = notes[Math.floor(Math.random() * notes.length)];
            gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.8);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 1.8);
        }, 1400);
    } else {
        clearInterval(bgmTimer);
    }
});
