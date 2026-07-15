var dataByCategory = {
    books: [
        { id: 1, name: 'Atomic Habits', meta: 'by James Clear' },
        { id: 2, name: 'Deep Work', meta: 'by Cal Newport' },
        { id: 3, name: 'Clean Code', meta: 'by Robert C. Martin' }
    ],
    laptops: [
        { id: 1, name: 'MacBook Pro', meta: 'Apple M3 • 16GB RAM' },
        { id: 2, name: 'ThinkPad X1', meta: 'Intel Ultra 7 • 16GB RAM' },
        { id: 3, name: 'Dell XPS', meta: 'Intel i7 • 16GB RAM' }
    ],
    shoes: [
        { id: 1, name: 'Running Shoes', meta: 'Lightweight daily trainer' },
        { id: 2, name: 'Sneakers', meta: 'Streetwear low-top style' },
        { id: 3, name: 'Boots', meta: 'Water-resistant leather pair' }
    ]
};

var categoryDescriptions = {
    books: 'Hand-picked reading list for focus and growth.',
    laptops: 'Developer-friendly machines with solid performance.',
    shoes: 'Everyday picks from sporty to rugged.'
};

var wakeLockSentinel = null;

function setFeatureStatus(message) {
    var statusEl = document.getElementById('featureStatus');
    if (statusEl) {
        statusEl.innerText = message;
    }
}

function syncFullscreenButton() {
    var btn = document.getElementById('fullscreenBtn');
    if (!btn) {
        return;
    }

    btn.innerText = document.fullscreenElement ? 'Exit Fullscreen' : 'Enter Fullscreen';
}

async function toggleFullscreenMode() {
    if (!document.documentElement.requestFullscreen) {
        setFeatureStatus('Fullscreen API is not supported on this browser.');
        return;
    }

    try {
        if (!document.fullscreenElement) {
            await document.documentElement.requestFullscreen();
            setFeatureStatus('Fullscreen enabled.');
        } else {
            await document.exitFullscreen();
            setFeatureStatus('Fullscreen disabled.');
        }
    } catch (err) {
        setFeatureStatus('Fullscreen failed: ' + err.message);
    }
}

function syncWakeLockButton() {
    var btn = document.getElementById('wakeLockBtn');
    if (!btn) {
        return;
    }

    btn.innerText = wakeLockSentinel ? 'Disable Wake Lock' : 'Enable Wake Lock';
}

async function enableWakeLock() {
    if (!('wakeLock' in navigator)) {
        setFeatureStatus('Wake Lock API is not supported on this browser.');
        return;
    }

    try {
        wakeLockSentinel = await navigator.wakeLock.request('screen');
        wakeLockSentinel.addEventListener('release', function () {
            wakeLockSentinel = null;
            syncWakeLockButton();
            setFeatureStatus('Wake Lock released.');
        });

        syncWakeLockButton();
        setFeatureStatus('Wake Lock enabled. Screen will stay on.');
    } catch (err) {
        setFeatureStatus('Wake Lock failed: ' + err.message);
    }
}

async function disableWakeLock() {
    if (!wakeLockSentinel) {
        return;
    }

    await wakeLockSentinel.release();
    wakeLockSentinel = null;
    syncWakeLockButton();
    setFeatureStatus('Wake Lock disabled.');
}

async function toggleWakeLock() {
    if (wakeLockSentinel) {
        await disableWakeLock();
        return;
    }

    await enableWakeLock();
}

var module = {
    renderSpecificItem: function (items) {
        var container = document.getElementById('itemsRenderer');

        if (!container) {
            return;
        }

        container.innerHTML = '';

        items.forEach(function (item) {
            var card = document.createElement('article');
            card.className = 'item-card';

            var heading = document.createElement('h3');
            heading.innerText = item.name;

            var meta = document.createElement('p');
            meta.className = 'item-meta';
            meta.innerText = item.meta;

            card.appendChild(heading);
            card.appendChild(meta);
            container.appendChild(card);
        });
    },

    setActiveCategory: function (category) {
        var tabs = document.querySelectorAll('#categories li');

        tabs.forEach(function (tab) {
            tab.classList.toggle('active', tab.id === category);
        });
    },

    renderOnPageLoadURLChange: function () {
        var currentPath = location.hash.slice(1) || 'books';
        var title = document.getElementById('categoryTitle');
        var meta = document.getElementById('categoryMeta');

        if (!dataByCategory[currentPath]) {
            location.hash = 'books';
            return;
        }

        module.setActiveCategory(currentPath);

        if (title) {
            title.innerText = currentPath.charAt(0).toUpperCase() + currentPath.slice(1);
        }

        if (meta) {
            meta.innerText = categoryDescriptions[currentPath] || '';
        }

        module.renderSpecificItem(dataByCategory[currentPath]);
    }
};

document.getElementById('categories').addEventListener('click', function (e) {
    if (e.target.tagName !== 'LI') {
        return;
    }

    location.hash = e.target.id;
});

window.addEventListener('hashchange', module.renderOnPageLoadURLChange);
window.onload = function () {
    module.renderOnPageLoadURLChange();

    var wakeLockBtn = document.getElementById('wakeLockBtn');
    var fullscreenBtn = document.getElementById('fullscreenBtn');

    if (wakeLockBtn) {
        wakeLockBtn.addEventListener('click', function () {
            toggleWakeLock();
        });
    }

    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', function () {
            toggleFullscreenMode();
        });
    }

    syncWakeLockButton();
    syncFullscreenButton();
};

document.addEventListener('fullscreenchange', syncFullscreenButton);
document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible' && wakeLockSentinel === null) {
        enableWakeLock();
    }
});

