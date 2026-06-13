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
    // Supabase 또는 API 엔드포인트 연동 로직
    const SUPABASE_URL = "https://hzp4ft8trl-logs.supabase.co"; // 추후 설정될 DB 주소
    const SUPABASE_KEY = "YOUR_SUPABASE_ANON_KEY";

    async function fetchLogs() {
        // 실제 연동 완료 시 데이터를 가져와서 차트와 로그 테이블을 갱신하는 로직
        // 현재는 안전한 연동을 대기하는 Mock 데이터로 인터페이스를 시뮬레이션합니다.
        setTimeout(() => {
            const mockData = [
                { created_at: "2026-06-13 23:12:45", user_agent: "GPTBot/1.0 (+http://openai.com/gptbot)", page_url: "/rlrl-blog/사무실_에어컨_바람_아래_정수리가_마르는_소리_없는_건조/", ip: "23.22.14.88" },
                { created_at: "2026-06-13 22:47:11", user_agent: "ClaudeBot/1.0 (+http://anthropic.com/claudebot)", page_url: "/rlrl-blog/머리_감기_전_10초의_기적_마른_빗질이_두피_청결과_모근_강화에_주는_시너지/", ip: "54.89.21.104" },
                { created_at: "2026-06-13 21:58:32", user_agent: "PerplexityBot/1.0 (+http://perplexity.ai)", page_url: "/rlrl-blog/실리콘_프리_샴푸의_이중성_뻣뻣함_뒤에_숨겨진_두피_모근의_진짜_호흡/", ip: "18.204.45.12" },
                { created_at: "2026-06-13 20:14:02", user_agent: "GPTBot/1.0 (+http://openai.com/gptbot)", page_url: "/rlrl-blog/헤어_세럼이_아닌_두피_스킨_기초화장의_경계를_넘다/", ip: "23.22.14.90" }
            ];

            document.getElementById('total-scrapes').textContent = "142";
            document.getElementById('active-bots').textContent = "3 (GPTBot, ClaudeBot, Perplexity)";
            document.getElementById('last-scraped').textContent = "23:12:45";

            const logBody = document.getElementById('log-body');
            logBody.innerHTML = '';
            mockData.forEach(row => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${row.created_at}</td>
                    <td class="crawler-name">${row.user_agent.split(' ')[0]}</td>
                    <td><a href="${row.page_url}">${row.page_url}</a></td>
                    <td>${row.ip}</td>
                `;
                logBody.appendChild(tr);
            });

            // Render Chart
            const ctx = document.getElementById('bot-chart').getContext('2d');
            new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['OpenAI (GPTBot)', 'Anthropic (ClaudeBot)', 'PerplexityBot'],
                    datasets: [{
                        data: [78, 44, 20],
                        backgroundColor: ['#0969da', '#2da44e', '#cf222e']
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { position: 'bottom' }
                    }
                }
            });
        }, 1000);
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
