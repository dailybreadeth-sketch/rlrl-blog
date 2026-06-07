// Theme Toggle Functionality
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    const checkbox = document.getElementById('theme-checkbox');
    if (checkbox) {
        checkbox.checked = savedTheme === 'dark';
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

// Client-side Search Functionality
function searchPosts() {
    const input = document.getElementById('search-input');
    const filter = input.value.trim().toLowerCase();
    const resultsContainer = document.getElementById('search-results');
    
    // Clear previous results
    resultsContainer.innerHTML = '';
    
    if (!filter) {
        resultsContainer.style.display = 'none';
        return;
    }
    
    // Check global postsData (populated via Liquid in default.html)
    if (typeof postsData === 'undefined' || postsData.length === 0) {
        resultsContainer.style.display = 'none';
        return;
    }
    
    const matched = postsData.filter(post => 
        post.title.toLowerCase().includes(filter) || 
        post.desc.toLowerCase().includes(filter)
    );
    
    if (matched.length === 0) {
        const noResult = document.createElement('div');
        noResult.className = 'search-result-item';
        noResult.innerHTML = '<span class="search-result-title">일치하는 결과가 없습니다.</span>';
        resultsContainer.appendChild(noResult);
    } else {
        matched.forEach(post => {
            const item = document.createElement('a');
            item.href = post.url;
            item.className = 'search-result-item';
            item.style.display = 'block';
            item.innerHTML = `
                <span class="search-result-title">${post.title}</span>
                <span class="search-result-desc">${post.desc}</span>
            `;
            resultsContainer.appendChild(item);
        });
    }
    
    resultsContainer.style.display = 'block';
}

// Close search result dropdown when clicking outside
document.addEventListener('click', function(e) {
    const searchBox = document.querySelector('.search-box');
    const resultsContainer = document.getElementById('search-results');
    if (searchBox && !searchBox.contains(e.target) && resultsContainer) {
        resultsContainer.style.display = 'none';
    }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
});
