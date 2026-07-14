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
};

