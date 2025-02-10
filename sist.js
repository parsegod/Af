const container = document.createElement("div");
Object.assign(container.style, {
    position: "fixed",
    top: "10px",
    right: "10px",
    zIndex: "1000",
    backgroundColor: "#2c3e50",
    padding: "20px",
    border: "1px solid #34495e",
    borderRadius: "10px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
    width: "320px",
    fontFamily: "Arial, sans-serif",
    transition: "all 0.3s ease",
});

function createButton(text, backgroundColor, onClick, ariaLabel) {
    const button = document.createElement("button");
    Object.assign(button.style, {
        padding: "10px 15px",
        backgroundColor: backgroundColor,
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        marginRight: "10px",
        fontSize: "14px",
        transition: "background-color 0.3s, transform 0.2s",
    });
    button.innerText = text;
    button.setAttribute("aria-label", ariaLabel);
    button.addEventListener("mouseover", () => {
        button.style.backgroundColor = darkenColor(backgroundColor, 20);
        button.style.transform = "scale(1.05)";
    });
    button.addEventListener("mouseout", () => {
        button.style.backgroundColor = backgroundColor;
        button.style.transform = "scale(1)";
    });
    button.addEventListener("click", onClick);
    return button;
}

function darkenColor(color, percent) {
    const num = parseInt(color.slice(1), 16);
    const amt = Math.floor(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 + (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 + (B < 255 ? (B < 1 ? 0 : B) : 255)).toString(16).slice(1);
}

const closeButton = createButton("❌ Close", "#e74c3c", () => {
    container.style.display = "none";
}, "Close the UI");

const refreshButton = createButton("🔄 Refresh", "#2ecc71", () => {
    logMessage("Page refreshed", "gold");
    location.reload();
}, "Refresh the page");

container.appendChild(closeButton);
container.appendChild(refreshButton);

const checkboxContainer = document.createElement("div");
Object.assign(checkboxContainer.style, {
    display: "flex",
    alignItems: "center",
    marginTop: "10px",
});

const checkbox = document.createElement("input");
checkbox.type = "checkbox";
checkbox.id = "snipeBongCheckbox";

const label = document.createElement("label");
label.htmlFor = "snipeBongCheckbox";
label.innerText = "🔍 Find The Raccoon";
label.style.marginLeft = "5px";
label.style.color = "white";
label.style.fontSize = "14px";

const timeCheckbox = document.createElement("input");
timeCheckbox.type = "checkbox";
timeCheckbox.id = "startAt50Minutes";
timeCheckbox.checked = true;

const timeLabel = document.createElement("label");
timeLabel.htmlFor = "startAt50Minutes";
timeLabel.innerText = "⏰ Start search at 50 minutes";
timeLabel.style.marginLeft = "5px";
timeLabel.style.color = "white";
timeLabel.style.fontSize = "14px";

const detailedLoggingCheckbox = document.createElement("input");
detailedLoggingCheckbox.type = "checkbox";
detailedLoggingCheckbox.id = "detailedLogging";
detailedLoggingCheckbox.checked = false;

const detailedLoggingLabel = document.createElement("label");
detailedLoggingLabel.htmlFor = "detailedLogging";
detailedLoggingLabel.innerText = "📝 Detailed Logging";
detailedLoggingLabel.style.marginLeft = "5px";
detailedLoggingLabel.style.color = "white";
detailedLoggingLabel.style.fontSize = "14px";

checkboxContainer.append(checkbox, label, timeCheckbox, timeLabel, detailedLoggingCheckbox, detailedLoggingLabel);
container.appendChild(checkboxContainer);

const logContainer = document.createElement("div");
logContainer.style.marginTop = "10px";
logContainer.style.height = "150px";
logContainer.style.overflowY = "auto";
logContainer.style.backgroundColor = "#34495e";
logContainer.style.color = "white";
logContainer.style.padding = "10px";
logContainer.style.borderRadius = "5px";
logContainer.style.border = "1px solid #2c3e50";
logContainer.style.fontFamily = "monospace";
logContainer.style.fontSize = "12px";
container.appendChild(logContainer);

function logMessage(message, color = "white") {
    const logEntry = document.createElement("div");
    logEntry.style.color = color;
    logEntry.innerText = message;
    logContainer.appendChild(logEntry);
    logContainer.scrollTop = logContainer.scrollHeight;
}

function logButtonDetails(button) {
    const buttonDetails = `Button detected: ${button.innerText} | Type: ${button.type} | Time: ${new Date().toLocaleTimeString()}`;
    logMessage(buttonDetails, "cyan");
}

function logSearchStartTime(startTime) {
    const elapsedTime = Math.round((Date.now() - startTime) / 1000);
    logMessage(`Search started after ${elapsedTime} seconds`, "orange");
}

let isClicking = false;
let clickedButtons = new Set();
let searchStartTime;

function clickButtons() {
    const buttons = document.querySelectorAll('button[role="button"][type="button"]');
    let foundButton = false;

    const now = new Date();
    const currentMinutes = now.getMinutes();

    if (timeCheckbox.checked && currentMinutes < 50) {
        return;
    }

    buttons.forEach((button) => {
        if (button.offsetParent !== null && !clickedButtons.has(button)) {
            button.click();
            clickedButtons.add(button);
            logButtonDetails(button);
            foundButton = true;
        }
    });

    if (foundButton && !searchStartTime) {
        searchStartTime = Date.now();
        logSearchStartTime(searchStartTime);
    }

    if (foundButton) {
        squareIndicator.style.backgroundColor = "green";
        searchIndicator.style.backgroundColor = "gray";
    } else {
        squareIndicator.style.backgroundColor = "red";
        searchIndicator.style.backgroundColor = "yellow";
    }

    if (isClicking) {
        requestAnimationFrame(clickButtons);
    }
}

checkbox.addEventListener("change", () => {
    if (checkbox.checked) {
        label.style.textDecoration = "line-through";
        logMessage("Checkbox checked: Finding The Raccoon", "yellow");
        isClicking = true;
        clickedButtons.clear();
        clickButtons();
    } else {
        label.style.textDecoration = "none";
        isClicking = false;
        squareIndicator.style.backgroundColor = "red";
        searchIndicator.style.backgroundColor = "gray";
        logMessage("Checkbox unchecked: Stopped finding The Raccoon", "yellow");
        searchStartTime = null;
    }
});

const observer = new MutationObserver(() => {
    if (isClicking) {
        clickButtons();
    }
});

observer.observe(document.body, {
    childList: true,
    subtree: true,
});

const jsContainer = document.createElement("div");
Object.assign(jsContainer.style, {
    marginTop: "10px",
    padding: "10px",
    backgroundColor: "#34495e",
    borderRadius: "5px",
    border: "1px solid #2c3e50",
});

const jsCodeInput = document.createElement("textarea");
jsCodeInput.placeholder = "🔧 Enter JavaScript code here...";
Object.assign(jsCodeInput.style, {
    width: "100%",
    height: "60px",
    marginBottom: "10px",
    border: "1px solid #666",
    borderRadius: "5px",
    resize: "none",
    backgroundColor: "#2c3e50",
    color: "white",
    padding: "5px",
});

const injectButton = createButton("➡️ Inject JS", "#007BFF", () => {
    const jsCode = jsCodeInput.value;
    if (jsCode) {
        try {
            eval(jsCode);
            logMessage(`Injected JS: ${jsCode}`, "gold");
        } catch (e) {
            logMessage(`Error injecting JS: ${e.message}`, "red");
        }
    } else {
        logMessage("No JavaScript code provided.", "orange");
    }
}, "Inject JavaScript code");

const deleteButton = createButton("🗑️ Delete JS", "#e74c3c", () => {
    jsCodeInput.value = "";
    logMessage("JavaScript code deleted.", "orange");
}, "Delete JavaScript code");

jsContainer.append(jsCodeInput, injectButton, deleteButton);
container.appendChild(jsContainer);

const timeDisplayContainer = document.createElement("div");
Object.assign(timeDisplayContainer.style, {
    marginTop: "10px",
    padding: "10px",
    backgroundColor: "#34495e",
    borderRadius: "5px",
    border: "1px solid #2c3e50",
    color: "white",
    textAlign: "center",
});

const timeDisplay = document.createElement('div');
timeDisplay.style.fontSize = '20px';
timeDisplayContainer.appendChild(timeDisplay);
container.appendChild(timeDisplayContainer);

function updateTime() {
    const now = new Date();
    const formattedTime = now.toLocaleTimeString('en-US', {
        hour12: false
    });
    timeDisplay.innerHTML = `<div style="font-size: 24px; font-weight: bold; color: gold;">Current Time: ${formattedTime}</div>`;
}

setInterval(updateTime, 1000);
updateTime();

let isDragging = false,
    offsetX, offsetY;
container.addEventListener("mousedown", (e) => {
    isDragging = true;
    offsetX = e.clientX - container.getBoundingClientRect().left;
    offsetY = e.clientY - container.getBoundingClientRect().top;
});

document.addEventListener("mousemove", (e) => {
    if (isDragging) {
        container.style.left = e.clientX - offsetX + "px";
        container.style.top = e.clientY - offsetY + "px";
    }
});

document.addEventListener("mouseup", () => {
    isDragging = false;
});

document.body.appendChild(container);

const themeSwitcher = createButton("🌈 Switch Theme", "#f39c12", () => {
    const currentBgColor = container.style.backgroundColor;
    container.style.backgroundColor = currentBgColor === "rgb(44, 62, 80)" ? "#ecf0f1" : "#2c3e50";
    container.style.color = currentBgColor === "rgb(44, 62, 80)" ? "#2c3e50" : "white";
    logMessage("Theme switched!", "gold");
}, "Switch between light and dark themes");

container.appendChild(themeSwitcher);