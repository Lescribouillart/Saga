window.__braveReady = (async function() {
    try {
        if (navigator.brave && typeof navigator.brave.isBrave === 'function') {
            return await navigator.brave.isBrave();
        }
        return false;
    } catch (e) {
        return false;
    }
})();
