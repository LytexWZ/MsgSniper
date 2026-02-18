(() => {
  console.clear();
  console.log("Lytex Sniper Panel Active");

  const CONFIG = {
    requiredWords: ["word1", "word2"],
    blockedWords: ["banned"],
    maxMessageLength: 300,
    fontSize: "14px",
    panelWidth: "800px",
    panelHeight: "500px",
  };

  let isRunning = true;
  const qualifiedUsers = new Set();

  const PANEL_ID = "MessageSniper";
  const MIN_BTN_ID = "MessageSniperMinBtn";

  document.getElementById(PANEL_ID)?.remove();
  document.getElementById(MIN_BTN_ID)?.remove();

  const panel = document.createElement("div");
  panel.id = PANEL_ID;
  Object.assign(panel.style, {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: CONFIG.panelWidth,
    height: CONFIG.panelHeight,
    display: "flex",
    fontFamily: "Consolas, monospace",
    fontSize: CONFIG.fontSize,
    zIndex: 999999,
    border: "2px solid rgba(255,255,255,0.3)",
    borderRadius: "6px",
    background: "rgba(0,0,0,0.3)",
    color: "#fff",
    overflow: "hidden",
    flexDirection: "column",
  });
  document.body.appendChild(panel);

  const topbar = document.createElement("div");
  Object.assign(topbar.style, {
    height: "28px",
    background: "rgba(0,0,0,0.5)",
    borderBottom: "1px solid rgba(255,255,255,0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 8px",
    flexShrink: 0,
    cursor: "grab",
  });
  panel.appendChild(topbar);

  const title = document.createElement("div");
  title.innerText = "Lytex Sniper Panel";
  Object.assign(title.style, { fontWeight: "bold" });
  topbar.appendChild(title);

  const topButtons = document.createElement("div");
  topbar.appendChild(topButtons);

  const minimizeBtn = document.createElement("button");
  minimizeBtn.innerText = "–";
  Object.assign(minimizeBtn.style, {
    border: "none",
    background: "transparent",
    color: "#fff",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
  });
  topButtons.appendChild(minimizeBtn);

  const closeBtn = document.createElement("button");
  closeBtn.innerText = "✕";
  Object.assign(closeBtn.style, {
    border: "none",
    background: "transparent",
    color: "#fff",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
    marginLeft: "4px",
  });
  topButtons.appendChild(closeBtn);

  let isDragging = false, offsetX = 0, offsetY = 0;
  topbar.addEventListener("mousedown", e => {
    isDragging = true;
    const rect = panel.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    topbar.style.cursor = "grabbing";
  });
  window.addEventListener("mousemove", e => {
    if (!isDragging) return;
    panel.style.left = e.clientX - offsetX + "px";
    panel.style.top = e.clientY - offsetY + "px";
    panel.style.transform = "none";
  });
  window.addEventListener("mouseup", () => {
    isDragging = false;
    topbar.style.cursor = "grab";
  });

  const flexArea = document.createElement("div");
  Object.assign(flexArea.style, { display: "flex", flex: "1", overflow: "hidden" });
  panel.appendChild(flexArea);

  const sidebar = document.createElement("div");
  Object.assign(sidebar.style, {
    width: "180px",
    background: "rgba(0,0,0,0.3)",
    borderRight: "1px solid rgba(255,255,255,0.3)",
    display: "flex",
    flexDirection: "column",
    padding: "8px",
    gap: "8px",
  });
  flexArea.appendChild(sidebar);

  const startStopBtn = document.createElement("button");
  startStopBtn.innerText = "⏹ Stop";
  Object.assign(startStopBtn.style, {
    padding: "6px", borderRadius: "4px", border: "1px solid #fff", background: "#000", color: "#fff", cursor: "pointer"
  });
  sidebar.appendChild(startStopBtn);

  const clearBtn = document.createElement("button");
  clearBtn.innerText = "🗑 Clear";
  Object.assign(clearBtn.style, {
    padding: "6px", borderRadius: "4px", border: "1px solid #fff", background: "#000", color: "#fff", cursor: "pointer"
  });
  sidebar.appendChild(clearBtn);

  // Add scrollbar styles
  const scrollbarStyle = document.createElement("style");
  scrollbarStyle.textContent = `
    #reqWords::-webkit-scrollbar, #blockWords::-webkit-scrollbar {
      width: 8px;
    }
    #reqWords::-webkit-scrollbar-track, #blockWords::-webkit-scrollbar-track {
      background: #333;
    }
    #reqWords::-webkit-scrollbar-thumb, #blockWords::-webkit-scrollbar-thumb {
      background: #666;
      border-radius: 4px;
    }
    #reqWords::-webkit-scrollbar-thumb:hover, #blockWords::-webkit-scrollbar-thumb:hover {
      background: #777;
    }
  `;
  document.head.appendChild(scrollbarStyle);

  const settingsDiv = document.createElement("div");
  Object.assign(settingsDiv.style, { marginTop: "12px", display: "flex", flexDirection: "column", gap: "4px" });
  settingsDiv.innerHTML = `
    <label style="color:#fff">Required Words:<textarea id="reqWords" style="width:100%;height:80px;margin-top:2px;border-radius:2px;border:1px solid #fff;padding:4px 8px 4px 4px;background:#000;color:#fff;resize:none;overflow:auto;font-family:inherit;font-size:inherit;box-sizing:border-box">${CONFIG.requiredWords.join(",")}</textarea></label>
    <label style="color:#fff">Blocked Words:<textarea id="blockWords" style="width:100%;height:80px;margin-top:2px;border-radius:2px;border:1px solid #fff;padding:4px 8px 4px 4px;background:#000;color:#fff;resize:none;overflow:auto;font-family:inherit;font-size:inherit;box-sizing:border-box">${CONFIG.blockedWords.join(",")}</textarea></label>
  `;
  sidebar.appendChild(settingsDiv);

  const messageArea = document.createElement("div");
  Object.assign(messageArea.style, {
    flex: "1",
    background: "rgba(0,0,0,0.3)",
    padding: "8px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    borderLeft: "1px solid rgba(255,255,255,0.3)",
  });
  flexArea.appendChild(messageArea);

  const minBtn = document.createElement("div");
  minBtn.id = MIN_BTN_ID;
  minBtn.innerText = "+";
  Object.assign(minBtn.style, {
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    border: "2px solid #fff",
    boxShadow: "0 0 6px #fff, 0 0 12px #fff",
    fontSize: "20px",
    color: "#fff",
    background: "rgba(0,0,0,0.3)",
    position: "fixed",
    bottom: "20px",
    right: "20px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
    zIndex: 1000000,
    display: "none",
  });
  document.body.appendChild(minBtn);

  minimizeBtn.addEventListener("click", () => {
    panel.style.display = "none";
    minBtn.style.display = "flex";
  });

  minBtn.addEventListener("click", () => {
    panel.style.display = "flex";
    minBtn.style.display = "none";
  });

  closeBtn.addEventListener("click", () => {
    panel.remove();
    minBtn.remove();
  });

  startStopBtn.addEventListener("click", () => {
    isRunning = !isRunning;
    startStopBtn.innerText = isRunning ? "⏹ Stop" : "▶ Start";
  });

  clearBtn.addEventListener("click", () => {
    messageArea.innerHTML = "";
    qualifiedUsers.clear();
  });

  settingsDiv.querySelector("#reqWords").addEventListener("change", e => {
    CONFIG.requiredWords = e.target.value.split(",").map(s => s.trim());
  });
  settingsDiv.querySelector("#blockWords").addEventListener("change", e => {
    CONFIG.blockedWords = e.target.value.split(",").map(s => s.trim());
  });

  function parseUsername(fullName) {
    const match = /\((@?[\w\d_-]+)\)/.exec(fullName);
    return match ? match[1].replace(/^@/, "") : fullName;
  }

  function renderNotification(fullName, text) {
    const username = parseUsername(fullName);
    const msgDiv = document.createElement("div");
    Object.assign(msgDiv.style, {
      borderLeft: "2px solid #fff",
      padding: "6px 8px",
      borderRadius: "2px",
      background: "#000",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    });

    const contentDiv = document.createElement("div");
    contentDiv.innerHTML = `
      <div style="font-weight:bold;color:#fff">This guy has it! ${username}</div>
      <div style="font-size:12px;color:#ccc">Location: ${text}</div>
    `;
    msgDiv.appendChild(contentDiv);

    const copyBtn = document.createElement("button");
    copyBtn.innerText = "📋";
    Object.assign(copyBtn.style, {
      border: "1px solid #fff",
      background: "#000",
      color: "#fff",
      cursor: "pointer",
      padding: "2px 4px",
      marginLeft: "4px",
      borderRadius: "3px"
    });
    copyBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(username);
    });
    msgDiv.appendChild(copyBtn);

    messageArea.appendChild(msgDiv);
    messageArea.scrollTop = messageArea.scrollHeight;
  }

  function checkMessage(msg) {
    if (!isRunning) return;
    const contentEl = msg.querySelector('[class*="messageContent"]');
    const nameEl = msg.querySelector('[class*="username"]');
    if (!contentEl || !nameEl) return;

    const text = contentEl.innerText.trim();
    const name = nameEl.innerText.trim();
    const lower = text.toLowerCase();

    const hasRequired = CONFIG.requiredWords.some(w => lower.includes(w.toLowerCase()));
    const hasBlocked = CONFIG.blockedWords.some(w => lower.includes(w.toLowerCase()));

    if (!hasRequired || hasBlocked) return;
    if (qualifiedUsers.has(name)) return;

    qualifiedUsers.add(name);
    renderNotification(name, text);
  }

  const observer = new MutationObserver(mutations => {
    mutations.forEach(m => {
      m.addedNodes.forEach(node => {
        if (!(node instanceof HTMLElement)) return;
        if (node.id && node.id.startsWith("chat-messages-")) checkMessage(node);
        node.querySelectorAll?.('[id^="chat-messages-"]').forEach(checkMessage);
      });
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });

  console.log("Lytex Sniper is now active and monitoring messages...");
})();
