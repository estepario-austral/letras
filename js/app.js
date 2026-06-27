// ESTEPARIO AUSTRAL - ARCHIVE TERMINAL
// Vanilla ES2022 JavaScript
// No dependencies, no build process

class ArchiveTerminal {
    constructor() {
        this.songs = [];
        this.filteredSongs = [];
        this.loadingScreen = document.getElementById('loading-screen');
        this.archive = document.getElementById('archive');
        this.filesContainer = document.getElementById('files-container');
        this.noResults = document.getElementById('no-results');
        this.searchInput = document.getElementById('search-input');
        this.expandedFileId = this.getLastOpenedFile();

        this.init();
    }

    async init() {
        try {
            // Load songs data
            await this.loadSongs();

            // Simulate authentic loading experience
            await this.delay(1200);

            // Transition to archive
            this.transitionToArchive();

            // Render archive
            this.render();

            // Setup event listeners
            this.setupEventListeners();

            // Restore last opened file
            if (this.expandedFileId) {
                this.delay(300).then(() => this.expandFile(this.expandedFileId, false));
            }
        } catch (error) {
            console.error('Archive initialization failed:', error);
            this.loadingScreen.style.opacity = '0';
            this.archive.classList.remove('hidden');
        }
    }

    async loadSongs() {
        try {
            const response = await fetch('data/songs.json');
            if (!response.ok) throw new Error('Failed to load archive');
            const data = await response.json();
            this.songs = data.songs || [];
            this.filteredSongs = [...this.songs];
        } catch (error) {
            console.error('Error loading songs:', error);
            this.songs = [];
            this.filteredSongs = [];
        }
    }

    transitionToArchive() {
        this.loadingScreen.style.animation = 'fadeOut 0.6s ease-out forwards';
        this.archive.classList.remove('hidden');
    }

    setupEventListeners() {
        // Search functionality
        this.searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));

        // File expansion
        document.addEventListener('click', (e) => {
            const header = e.target.closest('.file-header');
            if (header) {
                const file = header.closest('.archive-file');
                const id = file.dataset.id;
                this.toggleFile(id);
            }
        });

        // Copy lyrics button
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('copy-button')) {
                this.copyLyrics(e.target);
            }
        });

        // Keyboard accessibility
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.expandedFileId) {
                this.collapseFile(this.expandedFileId);
            }
        });
    }

    handleSearch(query) {
        const trimmed = query.trim().toLowerCase();

        if (!trimmed) {
            this.filteredSongs = [...this.songs];
        } else {
            this.filteredSongs = this.songs.filter((song) => {
                const titleMatch = song.title.toLowerCase().includes(trimmed);
                const lyricsMatch = song.lyrics.toLowerCase().includes(trimmed);
                const notesMatch = song.notes && song.notes.toLowerCase().includes(trimmed);
                return titleMatch || lyricsMatch || notesMatch;
            });
        }

        this.render();
    }

    render() {
        this.filesContainer.innerHTML = '';

        if (this.filteredSongs.length === 0) {
            this.noResults.classList.remove('hidden');
            return;
        }

        this.noResults.classList.add('hidden');

        this.filteredSongs.forEach((song) => {
            const fileElement = this.createFileElement(song);
            this.filesContainer.appendChild(fileElement);

            // Restore expansion state if this is the last opened file
            if (song.id === this.expandedFileId) {
                fileElement.classList.add('expanded');
            }
        });
    }

    createFileElement(song) {
        const file = document.createElement('div');
        file.className = 'archive-file';
        file.dataset.id = song.id;

        file.innerHTML = `
            <div class="file-header" role="button" tabindex="0" aria-expanded="false">
                <h2 class="file-title">${this.escapeHtml(song.title)}</h2>
                <div class="file-toggle" aria-hidden="true">▼</div>
            </div>
            <div class="file-content">
                <div class="file-details">
                    ${song.tuning ? `
                        <div class="detail-section">
                            <div class="detail-label">Tuning</div>
                            <div class="detail-value code">${this.escapeHtml(song.tuning)}</div>
                        </div>
                    ` : ''}

                    ${song.tempo ? `
                        <div class="detail-section">
                            <div class="detail-label">Tempo</div>
                            <div class="detail-value code">${this.escapeHtml(song.tempo)}</div>
                        </div>
                    ` : ''}

                    ${song.lyrics ? `
                        <div class="detail-section">
                            <div class="detail-label">Lyrics</div>
                            <div class="detail-value lyrics-text" data-lyrics="${this.escapeHtml(song.lyrics)}">${this.escapeHtml(song.lyrics)}</div>
                            <button class="copy-button">Copy Lyrics</button>
                        </div>
                    ` : ''}

                    ${song.notes ? `
                        <div class="detail-section">
                            <div class="detail-label">Notes</div>
                            <div class="detail-value">${this.escapeHtml(song.notes)}</div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        return file;
    }

    toggleFile(id) {
        const file = document.querySelector(`[data-id="${id}"]`);
        if (!file) return;

        const isExpanded = file.classList.contains('expanded');
        const header = file.querySelector('.file-header');

        if (isExpanded) {
            this.collapseFile(id);
        } else {
            this.expandFile(id);
        }
    }

    expandFile(id, saveLast = true) {
        // Collapse previous file
        if (this.expandedFileId && this.expandedFileId !== id) {
            this.collapseFile(this.expandedFileId, false);
        }

        const file = document.querySelector(`[data-id="${id}"]`);
        if (!file) return;

        file.classList.add('expanded');
        const header = file.querySelector('.file-header');
        header.setAttribute('aria-expanded', 'true');

        this.expandedFileId = id;

        if (saveLast) {
            this.saveLastOpenedFile(id);
        }

        // Smooth scroll to file
        this.delay(100).then(() => {
            file.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
    }

    collapseFile(id, saveLast = true) {
        const file = document.querySelector(`[data-id="${id}"]`);
        if (!file) return;

        file.classList.remove('expanded');
        const header = file.querySelector('.file-header');
        header.setAttribute('aria-expanded', 'false');

        if (this.expandedFileId === id) {
            this.expandedFileId = null;

            if (saveLast) {
                localStorage.removeItem('lastOpenedFile');
            }
        }
    }

    copyLyrics(button) {
        const lyricsDiv = button.closest('.detail-section').querySelector('.lyrics-text');
        const lyrics = lyricsDiv.getAttribute('data-lyrics');

        navigator.clipboard.writeText(lyrics).then(() => {
            const originalText = button.textContent;
            button.textContent = 'Copied';
            button.classList.add('copied');

            this.delay(2000).then(() => {
                button.textContent = originalText;
                button.classList.remove('copied');
            });
        }).catch((error) => {
            console.error('Failed to copy lyrics:', error);
        });
    }

    saveLastOpenedFile(id) {
        try {
            localStorage.setItem('lastOpenedFile', id);
        } catch (error) {
            console.warn('Could not save state:', error);
        }
    }

    getLastOpenedFile() {
        try {
            return localStorage.getItem('lastOpenedFile');
        } catch (error) {
            console.warn('Could not retrieve saved state:', error);
            return null;
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}

// Initialize archive when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ArchiveTerminal();
});