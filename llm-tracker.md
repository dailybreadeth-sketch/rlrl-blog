---
layout: default
title: "LLM Bot Tracking Dashboard"
permalink: /llm-tracker/
---

<div class="tracker-container">
    <h2 class="section-title">🤖 LLM 크롤러 수집 실시간 현황</h2>
    <p class="tracker-desc">
        블로그 본문에 심어진 트래킹 픽셀을 통해 자바스크립트를 실행하지 않는 봇(GPTBot, ClaudeBot 등)까지 포함한 실시간 AI 크롤링 로그를 수집하여 모니터링합니다.
    </p>

    <!-- Stats summary grid -->
    <div class="stats-grid">
        <div class="stat-card">
            <span class="stat-label">총 수집 횟수</span>
            <span class="stat-value" id="total-scrapes">0</span>
        </div>
        <div class="stat-card">
            <span class="stat-label">식별된 봇 종류</span>
            <span class="stat-value" id="active-bots">0</span>
        </div>
        <div class="stat-card">
            <span class="stat-label">최근 수집 시점</span>
            <span class="stat-value" id="last-scraped">--</span>
        </div>
    </div>

    <!-- Chart layout -->
    <div class="chart-container">
        <h3 class="chart-title">📊 봇 종류별 수집 비중</h3>
        <canvas id="bot-chart" width="400" height="200"></canvas>
    </div>

    <!-- Log Table -->
    <div class="log-table-container">
        <h3 class="chart-title">🪵 실시간 수집 액세스 로그</h3>
        <table class="log-table">
            <thead>
                <tr>
                    <th>일시</th>
                    <th>크롤러 (User-Agent)</th>
                    <th>수집한 포스팅 경로</th>
                    <th>접속 IP</th>
                </tr>
            </thead>
            <tbody id="log-body">
                <tr>
                    <td colspan="4" class="no-logs">실시간 로깅 인프라를 연결하고 대기하는 중...</td>
                </tr>
            </tbody>
        </table>
    </div>
</div>

<!-- Add Chart.js and Dashboard Script -->
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
    const bucketUrl = "https://kvdb.io/AxwRJPGgoYFP4dTbKsL92U/";

    async function fetchLogs() {
        try {
            // 1. Get total count
            const totalRes = await fetch(bucketUrl + "total_scrapes");
            const totalVal = await totalRes.text();
            const totalCount = parseInt(totalVal) || 0;
            document.getElementById('total-scrapes').textContent = totalCount;

            // 2. Get logs
            const logsRes = await fetch(bucketUrl + "logs");
            const logs = await logsRes.json();
            
            if (Array.isArray(logs) && logs.length > 0) {
                // Last scraped time
                const lastLogTime = logs[0].created_at.split(' ')[1] || logs[0].created_at;
                document.getElementById('last-scraped').textContent = lastLogTime;
                
                // Active bots counting
                const botCounts = {};
                const logBody = document.getElementById('log-body');
                logBody.innerHTML = '';
                
                logs.forEach(row => {
                    // Extract bot name from agent
                    let botName = "기타 크롤러 (Other)";
                    const ua = row.user_agent.toLowerCase();
                    if (ua.includes('gptbot')) botName = 'OpenAI (GPTBot)';
                    else if (ua.includes('claudebot')) botName = 'Anthropic (ClaudeBot)';
                    else if (ua.includes('perplexity')) botName = 'PerplexityBot';
                    else if (ua.includes('applebot')) botName = 'Applebot-Extended';
                    else if (ua.includes('oai-search')) botName = 'OAI-SearchBot';
                    else if (ua.includes('google-extended')) botName = 'Google-Extended';
                    else if (ua.includes('cohere')) botName = 'CohereBot';
                    else if (ua.includes('meta-') || ua.includes('facebook')) botName = 'MetaBot';
                    else if (ua.includes('chrome') || ua.includes('safari')) {
                        botName = 'Manual Test Bot';
                    }
                    
                    botCounts[botName] = (botCounts[botName] || 0) + 1;
                    
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${row.created_at}</td>
                        <td class="crawler-name">${botName}</td>
                        <td><a href="${row.page_url}">${row.page_url}</a></td>
                        <td>${row.ip}</td>
                    `;
                    logBody.appendChild(tr);
                });
                
                document.getElementById('active-bots').textContent = `${Object.keys(botCounts).length} 종 (${Object.keys(botCounts).join(', ')})`;
                
                // 3. Render Chart
                const ctx = document.getElementById('bot-chart').getContext('2d');
                new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: Object.keys(botCounts),
                        datasets: [{
                            data: Object.values(botCounts),
                            backgroundColor: ['#0969da', '#2da44e', '#cf222e', '#8250df', '#bf3989', '#d4a72c']
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: { position: 'bottom' }
                        }
                    }
                });
            } else {
                document.getElementById('log-body').innerHTML = '<tr><td colspan="4" class="no-logs">아직 감지된 크롤러 수집 이력이 없습니다. (?test=bot 주소로 직접 테스트해 보세요!)</td></tr>';
            }
        } catch (e) {
            console.error("Failed to load logs:", e);
            document.getElementById('log-body').innerHTML = '<tr><td colspan="4" class="no-logs">실시간 데이터베이스 연결 중 오류가 발생했습니다.</td></tr>';
        }
    }

    document.addEventListener('DOMContentLoaded', fetchLogs);
</script>

<style>
    .tracker-container {
        padding-bottom: 4rem;
    }
    .tracker-desc {
        color: var(--sidebar-text);
        margin-bottom: 2rem;
        font-size: 0.95rem;
    }
    .stats-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1.5rem;
        margin-bottom: 2.5rem;
    }
    .stat-card {
        background-color: var(--card-bg);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 1.5rem;
        text-align: center;
        box-shadow: 0 1px 3px var(--shadow-color);
    }
    .stat-label {
        font-size: 0.85rem;
        color: var(--sidebar-text);
        display: block;
        margin-bottom: 0.5rem;
    }
    .stat-value {
        font-size: 1.6rem;
        font-weight: 800;
        color: var(--text-color);
    }
    .chart-container {
        background-color: var(--card-bg);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 2rem;
        margin-bottom: 2.5rem;
        box-shadow: 0 1px 3px var(--shadow-color);
        max-width: 600px;
        margin-left: auto;
        margin-right: auto;
    }
    .chart-title {
        font-size: 1.15rem;
        font-weight: 700;
        margin-bottom: 1.5rem;
        letter-spacing: -0.5px;
    }
    .log-table-container {
        background-color: var(--card-bg);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 2rem;
        box-shadow: 0 1px 3px var(--shadow-color);
    }
    .log-table {
        width: 100%;
        border-collapse: collapse;
    }
    .log-table th, .log-table td {
        padding: 1rem;
        font-size: 0.9rem;
        text-align: left;
        border-bottom: 1px solid var(--border-color);
    }
    .log-table th {
        background-color: var(--table-header-bg);
        font-weight: 700;
    }
    .crawler-name {
        font-weight: 700;
        color: var(--link-color);
    }
    .no-logs {
        text-align: center;
        color: var(--sidebar-text);
        padding: 2rem 0;
    }
    @media (max-width: 768px) {
        .stats-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
        }
    }
</style>
