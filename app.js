// Before vs During baseline
let normalLatency = null;
let normalSpeed = null;
let normalPacketLoss = null;
let latestPacketLoss = 0;
// Network data
let healthScore = 92;
let latency = 28;
let packetLoss = 0.2;
let downloadSpeed = 92;
let uploadSpeed = 21;
let dnsResponse = 18;
const rssi = -48;


// Find HTML elements
const healthElement = document.getElementById("health-score");
const latencyElement = document.getElementById("latency-value");
const packetLossElement = document.getElementById("packet-loss-value");
const downloadElement = document.getElementById("download-value");
const uploadElement = document.getElementById("upload-value");
const dnsElement = document.getElementById("dns-value");
const rssiElement = document.getElementById("rssi-value");


// Update dashboard
healthElement.textContent = healthScore;
latencyElement.textContent =
    window.currentLatency ?? latency;

packetLossElement.textContent =
    (window.currentPacketLoss ?? packetLoss).toFixed(1);

downloadElement.textContent =
    (window.currentDownloadSpeed ?? downloadSpeed).toFixed(1);
uploadElement.textContent = uploadSpeed;
dnsElement.textContent = dnsResponse;
rssiElement.textContent = rssi;
// Latency chart

const chartCanvas = document.getElementById("latency-chart");

const latencyChart = new Chart(chartCanvas, {

    type: "line",

    data: {

        labels: [
            "10:00",
            "10:01",
            "10:02",
            "10:03",
            "10:04",
            "10:05",
            "10:06",
            "10:07",
            "10:08",
            "10:09"
        ],

        datasets: [
            {
                label: "Latency (ms)",

                data: [
                    24,
                    27,
                    25,
                    29,
                    31,
                    28,
                    35,
                    32,
                    30,
                    28
                ],

                tension: 0.3
            }
        ]

    },

    options: {

        responsive: true,

        maintainAspectRatio: false,

        scales: {

            y: {
                beginAtZero: true
            }

        }

    }

});
// Simulate live latency measurements

setInterval(() => {

    // Generate a random latency between 20 and 80 ms
    const newLatency = Math.floor(Math.random() * 150) + 20;
    checkNetworkHealth(newLatency);

    // Add new value to chart
    latencyChart.data.datasets[0].data.push(newLatency);

    // Remove oldest value
    latencyChart.data.datasets[0].data.shift();

    // Update chart
    latencyChart.update();
    measureUploadSpeed();
    measureDNSResponse();

}, 2000);
// Diagnostic button

const diagnosticButton = document.getElementById("diagnostic-button");

diagnosticButton.addEventListener("click", () => {

    diagnosticButton.textContent = "Running...";

    diagnosticButton.disabled = true;

    setTimeout(() => {

        diagnosticButton.textContent = "Diagnostic Complete";

        diagnosticButton.disabled = false;

    }, 3000);

});
// Anomaly detection

const anomalyAlert = document.getElementById("anomaly-alert");
const anomalyLatency = document.getElementById("anomaly-latency");
const resultSpeed = document.getElementById("result-speed");
const resultDuration = document.getElementById("result-duration");
const resultData = document.getElementById("result-data");

function checkNetworkHealth(latency) {

    if (latency > 100) {

        anomalyAlert.classList.remove("hidden");

        anomalyLatency.textContent = latency + " ms";

    } else {

        anomalyAlert.classList.add("hidden");

    }

}
// ===== REAL SPEED TEST =====

const speedButton = document.getElementById("start-speed-test");
const speedValue = document.getElementById("speed-value");
const speedNeedle = document.getElementById("speed-needle");
const gaugeProgress = document.getElementById("gauge-progress");
const testStatus = document.getElementById("test-status");
const testMessage = document.getElementById("test-message");
const progressBar = document.getElementById("test-progress-bar");

speedButton.addEventListener("click", async function () {

    speedButton.disabled = true;
    speedButton.textContent = "Testing...";

    testStatus.textContent = "TESTING";
    testMessage.textContent = "Measuring real download speed...";

    progressBar.style.width = "0%";

    speedValue.textContent = "0";

    speedNeedle.style.transform = "rotate(-90deg)";

    gaugeProgress.style.strokeDashoffset = "345";

    try {

        // 15 MB test file
        const testSize = 15 * 1024 * 1024;

        // Cloudflare download endpoint
        const url =
            `https://speed.cloudflare.com/__down?bytes=${testSize}&cache=${Date.now()}`;

        const startTime = performance.now();

        const response = await fetch(url, {
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error("Download failed");
        }

        const reader = response.body.getReader();

        let receivedBytes = 0;

        while (true) {

            const { done, value } = await reader.read();

            if (done) {
                break;
            }

            receivedBytes += value.length;

            const progress =
                Math.min(
                    (receivedBytes / testSize) * 100,
                    100
                );

            progressBar.style.width =
                progress + "%";

            // Calculate current speed
            const elapsed =
                (performance.now() - startTime) / 1000;

            const bits =
                receivedBytes * 8;

            const mbps =
                bits / elapsed / 1000000;

            const displaySpeed =
                Math.round(mbps);

            speedValue.textContent =
                displaySpeed;

            // Move needle
            const limitedSpeed =
                Math.min(displaySpeed, 1000);

            const angle =
                -90 + (limitedSpeed / 1000) * 180;

            speedNeedle.style.transform =
                `rotate(${angle}deg)`;

            // Move gauge
            const gaugeLength = 345;

            gaugeProgress.style.strokeDashoffset =
                gaugeLength -
                (gaugeLength * limitedSpeed / 1000);
        }

        // Final measurement
        const totalTime =
            (performance.now() - startTime) / 1000;

        const finalMbps =
            (receivedBytes * 8) /
            totalTime /
            1000000;

        const finalSpeed =
            Math.round(finalMbps);
            resultSpeed.textContent =
    `${finalSpeed} Mbps`;

resultDuration.textContent =
    `${totalTime.toFixed(1)} sec`;

resultData.textContent =
    `${(receivedBytes / 1024 / 1024).toFixed(1)} MB`;

        speedValue.textContent =
            finalSpeed;

        const finalLimitedSpeed =
            Math.min(finalSpeed, 1000);

        const finalAngle =
            -90 +
            (finalLimitedSpeed / 1000) * 180;

        speedNeedle.style.transform =
            `rotate(${finalAngle}deg)`;

        gaugeProgress.style.strokeDashoffset =
            345 -
            (345 * finalLimitedSpeed / 1000);

        progressBar.style.width = "100%";

        testStatus.textContent =
            "COMPLETE";

        testMessage.textContent =
            `Measured ${finalSpeed} Mbps download speed`;

        speedButton.disabled = false;
        speedButton.textContent =
            "Run Again";

    } catch (error) {

        console.error(error);

        testStatus.textContent =
            "ERROR";

        testMessage.textContent =
            "Unable to complete the speed test.";

        speedButton.disabled = false;
        speedButton.textContent =
            "Try Again";
    }

});
// ===== REAL LATENCY MEASUREMENT =====

async function addLatencyPoint() {

    const now =
        new Date().toLocaleTimeString([], {
            minute: "2-digit",
            second: "2-digit"
        });

    const startTime = performance.now();

    try {

        const response = await fetch(
            `https://speed.cloudflare.com/__down?bytes=1024&cache=${Date.now()}`,
            {
                cache: "no-store"
            }
        );

        if (!response.ok) {
            throw new Error("Latency request failed");
        }

        await response.arrayBuffer();

        const endTime = performance.now();

        const latency =
            Math.round(endTime - startTime);
        // Update global latency for Health Score
window.currentLatency = latency;
if (latencyElement) {
    latencyElement.textContent = latency;
}
calculateHealthScore();
           // ===== NETWORK HEALTH SCORE =====
function calculateHealthScore() {

    const currentLatency =
        window.currentLatency ?? latency;

    const currentPacketLoss =
        window.currentPacketLoss ?? packetLoss;

    const currentDownloadSpeed =
        window.currentDownloadSpeed ?? downloadSpeed;

    let latencyScore;
    let packetLossScore;
    let downloadScore;

    // Latency score
    if (currentLatency < 50) {
        latencyScore = 100;
    } else if (currentLatency < 100) {
        latencyScore = 70;
    } else {
        latencyScore = 40;
    }

    // Packet loss score
    if (currentPacketLoss === 0) {
        packetLossScore = 100;
    } else if (currentPacketLoss < 2) {
        packetLossScore = 70;
    } else {
        packetLossScore = 40;
    }

    // Download speed score
    if (currentDownloadSpeed >= 50) {
        downloadScore = 100;
    } else if (currentDownloadSpeed >= 20) {
        downloadScore = 70;
    } else {
        downloadScore = 40;
    }

    // Overall score
    healthScore = Math.round(
        latencyScore * 0.5 +
        downloadScore * 0.3 +
        packetLossScore * 0.2
    );

    healthElement.textContent = healthScore;
    healthElement.classList.remove("warning", "critical");

if (healthScore < 50) {
    healthElement.classList.add("critical");
} else if (healthScore < 80) {
    healthElement.classList.add("warning");
}
}

const healthStatusElement =
    document.getElementById("health-status");

if (healthStatusElement) {

    healthStatusElement.classList.remove("warning", "critical");

    if (latency >= 100) {
        healthStatusElement.textContent = "Poor Connection";
        healthStatusElement.classList.add("critical");

    } else if (latency >= 50) {
        healthStatusElement.textContent = "Degraded Connection";
        healthStatusElement.classList.add("warning");

    } else {
        healthStatusElement.textContent = "Good Connection";
    }
}
        // Capture normal latency baseline
if (normalLatency === null && latency < 50) {
    normalLatency = latency;

    const normalLatencyElement =
        document.getElementById("normal-latency");

    if (normalLatencyElement) {
        normalLatencyElement.textContent =
            `${normalLatency} ms`;
    }
}

        networkChart.data.labels.push(now);

        networkChart.data.datasets[0].data.push(latency);

        if (networkChart.data.labels.length > 20) {

            networkChart.data.labels.shift();

            networkChart.data.datasets[0].data.shift();
        }

        networkChart.update();

        console.log(
            `Real latency: ${latency} ms`
        );
        if (latency >= 100) {
            // Capture latency during critical incident
const issueLatencyElement =
    document.getElementById("issue-latency");

if (issueLatencyElement) {
    issueLatencyElement.textContent =
        `${latency} ms`;
}
const issuePacketLossElement =
    document.getElementById("issue-packet-loss");
if (issuePacketLossElement) {
    issuePacketLossElement.textContent =
        `${latestPacketLoss.toFixed(1)} %`;
}

    if (previousNetworkState !== "critical") {
        const issueSpeed = await measureDownloadSpeed();

const issueSpeedElement =
    document.getElementById("issue-speed");

if (issueSpeedElement && issueSpeed !== null) {
    issueSpeedElement.textContent =
        `${issueSpeed.toFixed(1)} Mbps`;
}


        addIncident(
            "Severe latency detected",
            `Latency: ${latency} ms • Download: ${issueSpeed !== null ? issueSpeed.toFixed(1) : "--"} Mbps • Packet Loss: ${latestPacketLoss.toFixed(1)}%`,
            "critical"
        );

        previousNetworkState = "critical";
        if (incidentStatus) {
    incidentStatus.textContent = "LIVE — CRITICAL";
    incidentStatus.classList.remove("warning");
    incidentStatus.classList.add("critical");
}
    }

} else if (latency >= 50) {
    // Capture latency during warning
const warningLatencyElement =
    document.getElementById("issue-latency");

if (warningLatencyElement) {
    warningLatencyElement.textContent =
        `${latency} ms`;
}
// Capture packet loss during warning
const warningPacketLossElement =
    document.getElementById("issue-packet-loss");

if (warningPacketLossElement) {
    warningPacketLossElement.textContent =
        `${latestPacketLoss.toFixed(1)} %`;
}
    if (previousNetworkState !== "warning") {

    const issueSpeed = await measureDownloadSpeed();

    const issueSpeedElement =
        document.getElementById("issue-speed");

    if (issueSpeedElement && issueSpeed !== null) {
        issueSpeedElement.textContent =
            `${issueSpeed.toFixed(1)} Mbps`;
    }

    addIncident(
        "Latency increasing",
        `Latency: ${latency} ms • Download: ${issueSpeed !== null ? issueSpeed.toFixed(1) : "--"} Mbps • Packet Loss: ${latestPacketLoss.toFixed(1)}%`,
        "warning"
    );

    previousNetworkState = "warning";
    if (incidentStatus) {
    incidentStatus.textContent = "LIVE — DEGRADED";
    incidentStatus.classList.remove("critical");
    incidentStatus.classList.add("warning");
}
}

} else {

    if (previousNetworkState !== "normal") {

        addIncident(
            "Network operating normally",
            `Latency measured at ${latency} ms`,
            "normal"
        );

        previousNetworkState = "normal";
        if (incidentStatus) {
    incidentStatus.textContent = "LIVE — NORMAL";
    incidentStatus.classList.remove("warning", "critical");
}
    }
}

    } catch (error) {

        console.error(
            "Latency measurement failed:",
            error
        );
    }
}

// First measurement immediately
addLatencyPoint();

// Then measure every 2 seconds
setInterval(addLatencyPoint, 2000);
// ===== NETWORK PERFORMANCE CHART =====

const networkCanvas =
    document.getElementById("network-chart");

const networkChart =
    new Chart(networkCanvas, {

        type: "line",

        data: {

            labels: [],

            datasets: [{
                label: "Latency",

                data: [],

                borderWidth: 2,

                tension: 0.4,

                pointRadius: 0,

                fill: false
            }]
        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            animation: false,

            plugins: {

                legend: {
                    display: false
                }
            },

            scales: {

                x: {
                    display: true,

                    ticks: {
                        color: "#475569"
                    },

                    grid: {
                        color:
                            "rgba(96,165,250,0.06)"
                    }
                },

                y: {

                    beginAtZero: true,

                    ticks: {
                        color: "#475569"
                    },

                    grid: {
                        color:
                            "rgba(96,165,250,0.06)"
                    }
                }
            }
        }
    });
    // ===== DOWNLOAD SPEED MEASUREMENT =====

async function measureDownloadSpeed() {
    try {
        const startTime = performance.now();

        const response = await fetch(
            `https://speed.cloudflare.com/__down?bytes=20000000&cache=${Date.now()}`,
            {
                cache: "no-store"
            }
        );

        if (!response.ok) {
            throw new Error("Download speed request failed");
        }

        const data = await response.arrayBuffer();

        const endTime = performance.now();

        const durationSeconds =
            (endTime - startTime) / 1000;

        const bitsDownloaded =
            data.byteLength * 8;

        const speedMbps =
            bitsDownloaded / durationSeconds / 1000000;
            // Update global download speed for Health Score
window.currentDownloadSpeed = speedMbps;
if (downloadElement) {
    downloadElement.textContent =
        speedMbps.toFixed(1);
}
calculateHealthScore();
            // Capture normal download speed baseline
if (normalSpeed === null) {
    normalSpeed = speedMbps;

    const normalSpeedElement =
        document.getElementById("normal-speed");

    if (normalSpeedElement) {
        normalSpeedElement.textContent =
            `${normalSpeed.toFixed(1)} Mbps`;
    }
}

        console.log(
            `Real Download Speed: ${speedMbps.toFixed(2)} Mbps`
        );

        return speedMbps;

    } catch (error) {
        console.error(
            "Download speed measurement failed:",
            error
        );

        return null;
    }
}
// ===== UPLOAD SPEED MEASUREMENT =====

async function measureUploadSpeed() {
    try {
        const uploadSize = 2 * 1024 * 1024; // 2 MB

        const data = new Uint8Array(uploadSize);

        const startTime = performance.now();

        const response = await fetch(
            `https://speed.cloudflare.com/__up?cache=${Date.now()}`,
            {
                method: "POST",
                body: data,
                cache: "no-store"
            }
        );

        if (!response.ok) {
            throw new Error("Upload speed request failed");
        }

        await response.arrayBuffer();

        const endTime = performance.now();

        const durationSeconds =
            (endTime - startTime) / 1000;

        const bitsUploaded =
            uploadSize * 8;

        const speedMbps =
            bitsUploaded / durationSeconds / 1000000;

        uploadSpeed = speedMbps;

        if (uploadElement) {
            uploadElement.textContent =
                speedMbps.toFixed(1);
        }

        console.log(
            `Upload Speed: ${speedMbps.toFixed(2)} Mbps`
        );

        return speedMbps;

    } catch (error) {
        console.error(
            "Upload measurement failed:",
            error
        );

        return null;
    }
}


// ===== DNS RESPONSE MEASUREMENT =====

async function measureDNSResponse() {
    try {
        const startTime = performance.now();

        const response = await fetch(
            `https://cloudflare-dns.com/dns-query?name=example.com&type=A&cache=${Date.now()}`,
            {
                headers: {
                    "Accept": "application/dns-json"
                },
                cache: "no-store"
            }
        );

        if (!response.ok) {
            throw new Error("DNS request failed");
        }

        await response.json();

        const endTime = performance.now();

        const dnsTime =
            Math.round(endTime - startTime);

        dnsResponse = dnsTime;

        if (dnsElement) {
            dnsElement.textContent =
                dnsTime;
        }

        console.log(
            `DNS Response: ${dnsTime} ms`
        );

        return dnsTime;

    } catch (error) {
        console.error(
            "DNS measurement failed:",
            error
        );

        return null;
    }
}
    // ===== PACKET LOSS MEASUREMENT =====

async function measurePacketLoss() {

    const totalProbes = 10;
    let failedProbes = 0;

    for (let i = 0; i < totalProbes; i++) {

        try {

            const response = await fetch(
                `https://speed.cloudflare.com/__down?bytes=256&cache=${Date.now()}-${i}`,
                {
                    cache: "no-store"
                }
            );

            if (!response.ok) {
                failedProbes++;
            }

            await response.arrayBuffer();

        } catch (error) {

            failedProbes++;
        }
    }

    const packetLoss =
        (failedProbes / totalProbes) * 100;
        // Update global packet loss for Health Score
window.currentPacketLoss = packetLoss;
if (packetLossElement) {
    packetLossElement.textContent =
        packetLoss.toFixed(1);
}
calculateHealthScore();
    latestPacketLoss = packetLoss;
    // Capture normal packet loss baseline
if (normalPacketLoss === null && packetLoss === 0) {
    normalPacketLoss = packetLoss;

    const normalPacketLossElement =
        document.getElementById("normal-packet-loss");

    if (normalPacketLossElement) {
        normalPacketLossElement.textContent =
            `${normalPacketLoss.toFixed(1)} %`;
    }
}

    console.log(
        `Packet Loss: ${packetLoss.toFixed(1)}%`
    );
    if (packetLoss > 0 || latency >= 50) {

    // Capture packet loss during issue
    const issuePacketLossElement =
        document.getElementById("issue-packet-loss");

    if (issuePacketLossElement) {
        issuePacketLossElement.textContent =
            `${packetLoss.toFixed(1)} %`;
    }

    if (packetLoss > 0) {
        addIncident(
            "Packet loss detected",
            `Packet loss measured at ${packetLoss.toFixed(1)}%`
        );
    }

} else {

    addIncident(
        "Connection stable",
        "No packet loss detected"
    );
}

    // Update dashboard packet loss
}
// Start packet loss monitoring
measurePacketLoss();

setInterval(measurePacketLoss, 10000);
// ===== INCIDENT TIMELINE =====

const incidentTimeline =
    document.getElementById("incident-timeline");
    const incidentStatus =
    document.querySelector(".incident-status");
let previousNetworkState = null;

function addIncident(title, description, severity = "normal") {

    if (!incidentTimeline) return;

    const emptyMessage =
        incidentTimeline.querySelector(".timeline-empty");

    if (emptyMessage) {
        emptyMessage.remove();
    }

    const event = document.createElement("div");

    event.className =
        `timeline-event severity-${severity}`;

    const time =
        new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });

    let severityLabel = "NORMAL";

    if (severity === "warning") {
        severityLabel = "WARNING";
    }

    if (severity === "critical") {
        severityLabel = "CRITICAL";
    }

    // Get latest live network values
    const currentLatency =
        window.currentLatency ?? latency;

    const currentPacketLoss =
        window.currentPacketLoss ?? packetLoss;

    const currentDownloadSpeed =
        window.currentDownloadSpeed ?? downloadSpeed;

    event.innerHTML = `
        <div class="timeline-time">
            ${time}
        </div>

        <div class="timeline-title">
            ${severityLabel} — ${title}
        </div>

        <div class="timeline-description">
            ${description}
        </div>

        <div class="timeline-metrics">
            <span>Latency: ${currentLatency} ms</span>
            <span>Download: ${currentDownloadSpeed.toFixed(1)} Mbps</span>
            <span>Packet Loss: ${currentPacketLoss.toFixed(1)}%</span>
        </div>
    `;

    incidentTimeline.prepend(event);

    const events =
        incidentTimeline.querySelectorAll(
            ".timeline-event"
        );

    if (events.length > 8) {
        events[events.length - 1].remove();
    }
}