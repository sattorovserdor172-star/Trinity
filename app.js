// ===================== STATE & DATA =====================
// Default mock materials (will be stored in localStorage)
const defaultMaterials = [
  {
    id: 1,
    title: "Reading Passage: The History of Tea",
    section: "Reading",
    difficulty: "Easy",
    tags: ["reading", "history", "true-false-not-given"],
    isPremium: false,
    comingSoon: false,
  },
  {
    id: 2,
    title: "Reading Passage: Climate Change Impacts",
    section: "Reading",
    difficulty: "Medium",
    tags: ["reading", "environment", "matching-headings"],
    isPremium: false,
    comingSoon: false,
  },
  {
    id: 3,
    title: "Reading Passage: Artificial Intelligence",
    section: "Reading",
    difficulty: "Hard",
    tags: ["reading", "technology", "multiple-choice"],
    isPremium: true,
    comingSoon: false,
  },
  {
    id: 4,
    title: "Listening Section: Campus Conversation",
    section: "Listening",
    difficulty: "Easy",
    tags: ["listening", "conversation", "form-completion"],
    isPremium: false,
    comingSoon: false,
  },
  {
    id: 5,
    title: "Listening Section: Marine Biology Lecture",
    section: "Listening",
    difficulty: "Medium",
    tags: ["listening", "lecture", "note-taking"],
    isPremium: false,
    comingSoon: false,
  },
  {
    id: 6,
    title: "Listening Section: News Report",
    section: "Listening",
    difficulty: "Hard",
    tags: ["listening", "news", "multiple-choice"],
    isPremium: true,
    comingSoon: false,
  },
  {
    id: 7,
    title: "Speaking Part 2: Describe a Memorable Event",
    section: "Speaking",
    difficulty: "Easy",
    tags: ["speaking", "cue-card", "fluency"],
    isPremium: true,
    comingSoon: true,
  },
  {
    id: 8,
    title: "Speaking Part 3: Discussion on Education",
    section: "Speaking",
    difficulty: "Medium",
    tags: ["speaking", "discussion", "opinion"],
    isPremium: true,
    comingSoon: true,
  },
  {
    id: 9,
    title: "Writing Task 1: Bar Chart Analysis",
    section: "Writing",
    difficulty: "Easy",
    tags: ["writing", "task1", "chart"],
    isPremium: true,
    comingSoon: true,
  },
  {
    id: 10,
    title: "Writing Task 2: Opinion Essay on Technology",
    section: "Writing",
    difficulty: "Hard",
    tags: ["writing", "task2", "essay"],
    isPremium: true,
    comingSoon: true,
  },
];

// Current scores (static for demo, can be modified later)
const scores = {
  reading: 8.0,
  listening: 7.0,
  writing: 6.0,
  speaking: 6.5,
};

// Global state
let materials = [];
let subscription = "free"; // 'free', 'pro', 'vip'
let adminLoggedIn = false;
let editingMaterialId = null;

// ===================== LOCAL STORAGE HELPERS =====================
function loadMaterials() {
  const stored = localStorage.getItem("ielts_materials");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Failed to parse materials, using defaults", e);
    }
  }
  return defaultMaterials;
}

function saveMaterials() {
  localStorage.setItem("ielts_materials", JSON.stringify(materials));
}

function loadSubscription() {
  return localStorage.getItem("ielts_subscription") || "free";
}

function saveSubscription() {
  localStorage.setItem("ielts_subscription", subscription);
}

function loadAdminLoggedIn() {
  return localStorage.getItem("ielts_admin_logged_in") === "true";
}

function saveAdminLoggedIn() {
  localStorage.setItem("ielts_admin_logged_in", adminLoggedIn.toString());
}

// ===================== UTILITY FUNCTIONS =====================
function calculateOverallBand() {
  const total = scores.reading + scores.listening + scores.writing + scores.speaking;
  const avg = total / 4;
  // IELTS overall band rounds to nearest 0.5
  return Math.round(avg * 2) / 2;
}

function showToast(message, duration = 3000) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.remove("hidden");
  setTimeout(() => {
    toast.classList.add("hidden");
  }, duration);
}

function showModal(modalId) {
  document.getElementById(modalId).classList.remove("hidden");
}

function hideModal(modalId) {
  document.getElementById(modalId).classList.add("hidden");
}

// Attach event listeners to all close buttons inside modals
document.querySelectorAll(".close-modal").forEach((btn) => {
  btn.addEventListener("click", () => {
    const modal = btn.closest(".modal");
    if (modal) modal.classList.add("hidden");
  });
});

// Close modals when clicking outside the modal content
document.querySelectorAll(".modal").forEach((modal) => {
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.add("hidden");
  });
});

// ===================== RENDER FUNCTIONS =====================
function renderScores() {
  document.getElementById("score-reading").textContent = scores.reading.toFixed(1);
  document.getElementById("score-listening").textContent = scores.listening.toFixed(1);
  document.getElementById("score-writing").textContent = scores.writing.toFixed(1);
  document.getElementById("score-speaking").textContent = scores.speaking.toFixed(1);
  document.getElementById("score-overall").textContent = calculateOverallBand().toFixed(1);
}

function renderMaterialGrid(filterSection = "all", filterDifficulty = "all") {
  const grid = document.getElementById("material-grid");
  grid.innerHTML = "";

  let filtered = materials.filter((m) => {
    if (filterSection !== "all" && m.section !== filterSection) return false;
    if (filterDifficulty !== "all" && m.difficulty !== filterDifficulty) return false;
    return true;
  });

  filtered.forEach((material) => {
    const card = createMaterialCard(material);
    grid.appendChild(card);
  });
}

function createMaterialCard(material) {
  const cardWrapper = document.createElement("div");
  cardWrapper.className = material.comingSoon ? "coming-soon" : "";

  const card = document.createElement("div");
  card.className =
    "material-card bg-white rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-all";

  // Colored top border based on section
  let borderColor = "border-gray-300";
  if (material.section === "Reading") borderColor = "border-blue-500";
  else if (material.section === "Listening") borderColor = "border-green-500";
  else if (material.section === "Speaking") borderColor = "border-orange-500";
  else if (material.section === "Writing") borderColor = "border-purple-500";

  card.innerHTML = `
    <div class="border-t-4 ${borderColor} p-5">
      <div class="flex justify-between items-start mb-3">
        <span class="text-sm font-semibold text-gray-500">${material.section}</span>
        <div class="flex space-x-2">
          ${
            material.comingSoon
              ? '<span class="bg-gray-300 text-gray-700 text-xs px-2 py-1 rounded-full">Soon</span>'
              : material.isPremium
              ? '<span class="bg-radiant-yellow text-gray-800 text-xs px-2 py-1 rounded-full font-semibold">Premium</span>'
              : '<span class="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">Free</span>'
          }
        </div>
      </div>
      <h3 class="text-lg font-bold text-gray-800 mb-2">${material.title}</h3>
      <div class="flex items-center justify-between">
        <span class="text-sm text-gray-500">Difficulty: ${material.difficulty}</span>
        <span class="text-xs text-gray-400">Tags: ${material.tags.join(", ")}</span>
      </div>
    </div>
  `;

  card.addEventListener("click", () => handleMaterialClick(material));
  cardWrapper.appendChild(card);
  return cardWrapper;
}

function renderAdminMaterialList() {
  const container = document.getElementById("admin-material-list");
  container.innerHTML = "";

  materials.forEach((material) => {
    const row = document.createElement("div");
    row.className = "flex items-center justify-between bg-gray-50 p-3 rounded-lg";
    row.innerHTML = `
      <div>
        <p class="font-semibold text-gray-800">${material.title}</p>
        <p class="text-sm text-gray-500">${material.section} | ${material.difficulty} | ${
      material.isPremium ? "Premium" : "Free"
    } ${material.comingSoon ? " | 🔒 Coming Soon" : ""}</p>
      </div>
      <div class="flex space-x-2">
        <button class="edit-material-btn bg-blue-100 text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-200 transition" data-id="${
          material.id
        }">Edit</button>
        <button class="delete-material-btn bg-red-100 text-red-700 px-3 py-1 rounded-lg hover:bg-red-200 transition" data-id="${
          material.id
        }">Delete</button>
      </div>
    `;
    container.appendChild(row);
  });

  // Attach edit/delete listeners
  document.querySelectorAll(".edit-material-btn").forEach((btn) => {
    btn.addEventListener("click", () => startEditMaterial(parseInt(btn.dataset.id)));
  });
  document.querySelectorAll(".delete-material-btn").forEach((btn) => {
    btn.addEventListener("click", () => deleteMaterial(parseInt(btn.dataset.id)));
  });
}

function renderPricingButtons() {
  const currentPlan = subscription;
  document.querySelectorAll(".subscribe-btn").forEach((btn) => {
    const plan = btn.dataset.plan;
    if (plan === currentPlan) {
      btn.textContent = "Current Plan";
      btn.disabled = true;
      btn.classList.add("cursor-default", "opacity-60");
      btn.classList.remove("hover:bg-yellow-400", "hover:bg-purple-500");
    } else {
      btn.disabled = false;
      btn.classList.remove("cursor-default", "opacity-60");
      if (plan === "pro") {
        btn.textContent = "Subscribe";
        btn.classList.add("hover:bg-yellow-400");
      } else if (plan === "vip") {
        btn.textContent = "Subscribe";
        btn.classList.add("hover:bg-purple-500");
      } else {
        btn.textContent = "Switch to Free";
      }
    }
  });
}

// ===================== EVENT HANDLERS =====================
function handleMaterialClick(material) {
  if (material.comingSoon) {
    showToast("🔜 This section is coming soon! Stay tuned.", 3000);
    return;
  }
  if (material.isPremium && subscription === "free") {
    showModal("paywall-modal");
    return;
  }
  // Show detail modal
  const titleEl = document.getElementById("detail-title");
  const contentEl = document.getElementById("detail-content");
  titleEl.textContent = material.title;
  contentEl.innerHTML = `
    <p><strong>Section:</strong> ${material.section}</p>
    <p><strong>Difficulty:</strong> ${material.difficulty}</p>
    <p><strong>Tags:</strong> ${material.tags.join(", ")}</p>
    <p class="mt-4">This is a sample material. In a full version, you would see the actual study content here.</p>
  `;
  showModal("material-detail-modal");
}

function startEditMaterial(id) {
  const material = materials.find((m) => m.id === id);
  if (!material) return;
  editingMaterialId = id;
  document.getElementById("material-id").value = id;
  document.getElementById("material-title").value = material.title;
  document.getElementById("material-section").value = material.section;
  document.getElementById("material-difficulty").value = material.difficulty;
  document.getElementById("material-tags").value = material.tags.join(", ");
  document.getElementById("material-premium").checked = material.isPremium;
  document.getElementById("form-title").textContent = "Edit Material";
  document.getElementById("form-submit-btn").textContent = "Update Material";
  document.getElementById("cancel-edit-btn").classList.remove("hidden");
  // Scroll to form
  document.getElementById("material-form").scrollIntoView({ behavior: "smooth" });
}

function cancelEdit() {
  editingMaterialId = null;
  document.getElementById("material-form").reset();
  document.getElementById("material-id").value = "";
  document.getElementById("form-title").textContent = "Add New Material";
  document.getElementById("form-submit-btn").textContent = "Add Material";
  document.getElementById("cancel-edit-btn").classList.add("hidden");
}

function deleteMaterial(id) {
  if (!confirm("Are you sure you want to delete this material?")) return;
  materials = materials.filter((m) => m.id !== id);
  saveMaterials();
  renderMaterialGrid(
    document.getElementById("filter-section").value,
    document.getElementById("filter-difficulty").value
  );
  renderAdminMaterialList();
  showToast("Material deleted successfully.");
}

function addOrUpdateMaterial(event) {
  event.preventDefault();
  const id = document.getElementById("material-id").value;
  const title = document.getElementById("material-title").value.trim();
  const section = document.getElementById("material-section").value;
  const difficulty = document.getElementById("material-difficulty").value;
  const tagsInput = document.getElementById("material-tags").value.trim();
  const isPremium = document.getElementById("material-premium").checked;
  const tags = tagsInput.split(",").map((tag) => tag.trim()).filter((tag) => tag.length > 0);

  if (!title || tags.length === 0) {
    showToast("Please fill in all fields, including at least one tag.");
    return;
  }

  // Speaking and Writing sections are always coming soon
  const comingSoon = section === "Speaking" || section === "Writing";

  if (editingMaterialId) {
    // Update existing
    const index = materials.findIndex((m) => m.id === editingMaterialId);
    if (index !== -1) {
      materials[index] = {
        ...materials[index],
        title,
        section,
        difficulty,
        tags,
        isPremium,
        comingSoon,
      };
    }
    cancelEdit();
    showToast("Material updated.");
  } else {
    // Add new
    const newId = materials.length > 0 ? Math.max(...materials.map((m) => m.id)) + 1 : 1;
    materials.push({
      id: newId,
      title,
      section,
      difficulty,
      tags,
      isPremium,
      comingSoon,
    });
    showToast("Material added.");
  }

  saveMaterials();
  renderMaterialGrid(
    document.getElementById("filter-section").value,
    document.getElementById("filter-difficulty").value
  );
  renderAdminMaterialList();
  document.getElementById("material-form").reset();
  document.getElementById("material-id").value = "";
  document.getElementById("form-title").textContent = "Add New Material";
  document.getElementById("form-submit-btn").textContent = "Add Material";
  editingMaterialId = null;
  document.getElementById("cancel-edit-btn").classList.add("hidden");
}

// ===================== AI ANALYZER LOGIC =====================
function runAIAnalysis() {
  const resultDiv = document.getElementById("ai-result");
  resultDiv.classList.remove("hidden");
  resultDiv.innerHTML = `
    <div class="bg-yellow-50 border-l-4 border-radiant-yellow p-4 mb-4">
      <p class="font-semibold text-gray-800">🤖 AI Analysis Result</p>
      <p class="text-gray-600 mt-1">You made mistakes in <strong>True/False/Not Given</strong> questions. This is a common weakness. Here are some recommended materials to improve:</p>
    </div>
    <div id="ai-recommendations" class="space-y-2"></div>
  `;

  // Find materials tagged with relevant keywords
  const recommended = materials.filter((m) =>
    m.tags.some((tag) => tag.toLowerCase().includes("true") || tag.toLowerCase().includes("false") || tag.toLowerCase().includes("not-given"))
  );

  const recContainer = document.getElementById("ai-recommendations");
  if (recommended.length === 0) {
    recContainer.innerHTML = "<p class='text-gray-500'>No matching materials found. Please add some via Admin Panel.</p>";
  } else {
    recommended.forEach((mat) => {
      const item = document.createElement("div");
      item.className = "flex items-center justify-between p-3 bg-white rounded-lg shadow-sm cursor-pointer hover:bg-gray-50";
      item.innerHTML = `
        <span class="font-medium text-gray-800">${mat.title}</span>
        <span class="text-xs ${mat.isPremium ? "bg-radiant-yellow text-gray-800" : "bg-green-100 text-green-700"} px-2 py-1 rounded-full">${
        mat.isPremium ? "Premium" : "Free"
      }</span>
      `;
      item.addEventListener("click", () => {
        // Hide AI modal and show material detail (or paywall)
        hideModal("ai-modal");
        handleMaterialClick(mat);
      });
      recContainer.appendChild(item);
    });
  }
}

// ===================== NAVIGATION =====================
function showSection(sectionId) {
  document.querySelectorAll(".section").forEach((section) => {
    section.classList.add("hidden");
  });
  document.getElementById(sectionId + "-section").classList.remove("hidden");
  // Update active nav link
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.remove("text-radiant-yellow", "font-bold");
    if (link.dataset.section === sectionId) {
      link.classList.add("text-radiant-yellow", "font-bold");
    }
  });
  // If navigating to pricing, re-render buttons
  if (sectionId === "pricing") {
    renderPricingButtons();
  }
  // If navigating to admin, ensure admin is logged in
  if (sectionId === "admin" && !adminLoggedIn) {
    showModal("admin-login-modal");
    // Hide admin section again
    document.getElementById("admin-section").classList.add("hidden");
    showSection("dashboard");
  }
  // Close mobile nav if open
  document.getElementById("mobile-nav").classList.add("hidden");
}

// ===================== INITIALIZATION =====================
function init() {
  // Load state from localStorage
  materials = loadMaterials();
  subscription = loadSubscription();
  adminLoggedIn = loadAdminLoggedIn();

  // Ensure default materials if none exist
  if (!localStorage.getItem("ielts_materials")) {
    saveMaterials();
  }

  // Render initial UI
  renderScores();
  renderMaterialGrid();
  renderAdminMaterialList();
  renderPricingButtons();
  showSection("dashboard");

  // ===================== EVENT LISTENERS =====================
  // Navigation links (desktop + mobile)
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const section = link.dataset.section;
      showSection(section);
    });
  });

  // Mobile menu toggle
  document.getElementById("mobile-menu-btn").addEventListener("click", () => {
    document.getElementById("mobile-nav").classList.toggle("hidden");
  });

  // Admin login buttons (both desktop and mobile)
  document.getElementById("admin-login-btn").addEventListener("click", () => {
    showModal("admin-login-modal");
  });
  document.getElementById("admin-login-btn-mobile").addEventListener("click", () => {
    showModal("admin-login-modal");
    document.getElementById("mobile-nav").classList.add("hidden");
  });

  // Admin login form submission
  document.getElementById("admin-login-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const password = document.getElementById("admin-password").value;
    if (password === "admin123") {
      adminLoggedIn = true;
      saveAdminLoggedIn();
      hideModal("admin-login-modal");
      document.getElementById("admin-password").value = "";
      showSection("admin");
      showToast("Welcome back, Admin!");
    } else {
      showToast("Incorrect password. Try admin123", 3000);
    }
  });

  // Admin logout
  document.getElementById("admin-logout-btn").addEventListener("click", () => {
    adminLoggedIn = false;
    saveAdminLoggedIn();
    showSection("dashboard");
    showToast("Logged out from admin panel.");
  });

  // Filter selects
  document.getElementById("filter-section").addEventListener("change", (e) => {
    renderMaterialGrid(e.target.value, document.getElementById("filter-difficulty").value);
  });
  document.getElementById("filter-difficulty").addEventListener("change", (e) => {
    renderMaterialGrid(document.getElementById("filter-section").value, e.target.value);
  });

  // AI Analyzer
  document.getElementById("open-ai-modal").addEventListener("click", () => {
    showModal("ai-modal");
    document.getElementById("ai-result").classList.add("hidden");
  });
  document.getElementById("run-ai-analysis").addEventListener("click", runAIAnalysis);

  // Paywall upgrade button
  document.getElementById("paywall-upgrade-btn").addEventListener("click", () => {
    hideModal("paywall-modal");
    showSection("pricing");
  });

  // Material form (admin)
  document.getElementById("material-form").addEventListener("submit", addOrUpdateMaterial);
  document.getElementById("cancel-edit-btn").addEventListener("click", cancelEdit);

  // Subscribe buttons (pricing)
  document.querySelectorAll(".subscribe-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const plan = btn.dataset.plan;
      if (plan === subscription) return;
      subscription = plan;
      saveSubscription();
      renderPricingButtons();
      // Re-render material grid to reflect unlocked premium
      renderMaterialGrid(
        document.getElementById("filter-section").value,
        document.getElementById("filter-difficulty").value
      );
      showToast(`Successfully subscribed to ${plan.toUpperCase()} plan!`, 3000);
      // Navigate back to dashboard after short delay
      setTimeout(() => {
        showSection("dashboard");
      }, 1500);
    });
  });

  // Also handle click on "Free" plan button if currently pro/vip (switch to free)
  document.querySelector('.subscribe-btn[data-plan="free"]')?.addEventListener("click", () => {
    if (subscription !== "free") {
      subscription = "free";
      saveSubscription();
      renderPricingButtons();
      renderMaterialGrid(
        document.getElementById("filter-section").value,
        document.getElementById("filter-difficulty").value
      );
      showToast("Switched to Free plan.", 3000);
    }
  });
}

// Start the app
init();
