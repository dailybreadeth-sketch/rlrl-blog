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

// Dynamic Category Filtering via URL Hash
function handleCategoryHash() {
    const hash = window.location.hash;
    const prefix = '#category-';
    const postsList = document.querySelector('.posts-list');
    if (!postsList) return; // Only filter on home list page
    
    let categorySlug = 'all';
    if (hash && hash.startsWith(prefix)) {
        categorySlug = hash.substring(prefix.length);
    }
    
    // Update active state in sidebar links
    const categoryLinks = document.querySelectorAll('.category-item');
    categoryLinks.forEach(link => {
        if (link.getAttribute('data-category') === categorySlug) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
    
    // Filter card articles
    const cards = document.querySelectorAll('.post-card');
    let visibleCount = 0;
    cards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        if (categorySlug === 'all' || cardCategory === categorySlug) {
            card.style.display = 'block';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });
    
    // Show no posts placeholder if all filtered out
    let noPostsMsg = document.querySelector('.no-posts-filtered');
    if (visibleCount === 0) {
        if (!noPostsMsg) {
            noPostsMsg = document.createElement('p');
            noPostsMsg.className = 'no-posts no-posts-filtered';
            noPostsMsg.style.textAlign = 'center';
            noPostsMsg.style.padding = '3rem 0';
            noPostsMsg.textContent = '선택한 카테고리에 등록된 포스팅이 없습니다.';
            postsList.appendChild(noPostsMsg);
        } else {
            noPostsMsg.style.display = 'block';
        }
    } else if (noPostsMsg) {
        noPostsMsg.style.display = 'none';
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    handleCategoryHash();
    window.addEventListener('hashchange', handleCategoryHash);
});
