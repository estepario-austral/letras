// ESTEPARIO AUSTRAL - RECOVERED ARCHIVE TERMINAL
// Vanilla ES2022 JavaScript
// Digital archaeology interface with metadata generation

class ArchiveTerminal {
    constructor() {
        this.songs = [];
        this.filteredSongs = [];
        this.loadingScreen = document.getElementById('loading-screen');
        this.archive = document.getElementById('archive');
        this.filesContainer = document.getElementById('files-container');
        this.noResults = document.getElementById('no-results');
        this.searchInput = document.getElementById('search-input');
        this.resultCount = document.getElementById('result-count');
        this.expandedFileId = this.getLastOpenedFile();
        this.currentSearchQuery = '';

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

            // Update result count
            this.updateResultCount();
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
        this.currentSearchQuery = trimmed;

        if (!trimmed) {
            this.filteredSongs = [...this.songs];
        } else {
            this.filteredSongs = this.songs.filter((song) => {
                const titleMatch = song.title.toLowerCase().includes(trimmed);
                const lyricsMatch = song.lyrics && song.lyrics.toLowerCase().includes(trimmed);
                const notesMatch = song.notes && song.notes.toLowerCase().includes(trimmed);
                return titleMatch || lyricsMatch || notesMatch;
            });
        }

        this.render();
        this.updateResultCount();
    }

    updateResultCount() {
        const total = this.songs.length;
        const shown = this.filteredSongs.length;

        if (this.currentSearchQuery) {
            this.resultCount.textContent = `${shown} of ${total} documents recovered`;
        } else {
            this.resultCount.textContent = `${total} documents in archive`;
        }
    }

    render() {
        this.filesContainer.innerHTML = '';

        if (this.filteredSongs.length === 0) {
            this.noResults.classList.remove('hidden');
            return;
        }

        this.noResults.classList.add('hidden');

        this.filteredSongs.forEach((song, index) => {
            const fileElement = this.createFileElement(song, index);
            this.filesContainer.appendChild(fileElement);

            // Restore expansion state if this is the last opened file
            if (song.id === this.expandedFileId) {
                fileElement.classList.add('expanded');
            }
        });
    }

    // Generate metadata for document
    generateMetadata(songIndex) {
        const archiveId = String(songIndex + 1).padStart(4, '0');
        const classifications = ['HISTORICAL', 'LINGUISTIC', 'CULTURAL', 'SCIENTIFIC', 'TRANSMISSION'];
        const sectors = ['ALPHA', 'BETA', 'GAMMA', 'DELTA', 'EPSILON'];
        const signals = ['STABLE', 'DEGRADED', 'INTERMITTENT', 'STRONG', 'WEAK'];
        const integrities = [94, 96, 91, 98, 89, 95];
        const confidences = [97, 92, 95, 99, 88, 96];

        return {
            archiveId: `EA-${archiveId}`,
            classification: classifications[songIndex % classifications.length],
            sector: sectors[songIndex % sectors.length],
            signal: signals[songIndex % signals.length],
            integrity: integrities[songIndex % integrities.length],
            confidence: confidences[songIndex % confidences.length],
            recovered: `Recovered from Sector ${sectors[songIndex % sectors.length]}`
        };
    }

    // Highlight search matches in text
    highlightMatches(text) {
        if (!this.currentSearchQuery || !text) return this.escapeHtml(text);

        const regex = new RegExp(`(${this.currentSearchQuery})`, 'gi');
        const escaped = this.escapeHtml(text);
        return escaped.replace(regex, '<span class="highlight">$1</span>');
    }

    createFileElement(song, songIndex) {
        const metadata = this.generateMetadata(songIndex);
        const file = document.createElement('div');
        file.className = 'archive-file';
        file.dataset.id = song.id;

        // Header section with metadata
        const headerHtml = `
            <div class="file-header">
                <div class="file-header-left">
                    <h2 class="file-title">${this.escapeHtml(song.title)}</h2>
                    <div class="file-metadata">
                        <div class="file-meta-item">
                            <span class="file-meta-label">ID</span>
                            <span class="file-meta-value">${metadata.archiveId}</span>
                        </div>
                        <div class="file-meta-item">
                            <span class="file-meta-label">Class</span>
                            <span class="file-meta-value">${metadata.classification}</span>
                        </div>
                        <div class="file-meta-item">
                            <span class="file-meta-label">Integrity</span>
                            <span class="file-meta-value">${metadata.integrity}%</span>
                        </div>
                        <div class="file-meta-item">
                            <span class="file-meta-label">Signal</span>
                            <span class="file-meta-value">${metadata.signal}</span>
                        </div>
                    </div>
                </div>
                <div class="file-toggle" aria-hidden="true">▼</div>
            </div>
        `;

        // Content section with document header and transcript
        const contentHtml = `
            <div class="file-content">
                <div class="file-details">
                    <!-- Recovered Fragment Header -->
                    <div class="document-header">
                        <div class="document-header-title">Recovered Fragment</div>
                        <div class="document-meta-grid">
                            <div class="document-meta-field">
                                <div class="document-meta-field-label">Archive ID</div>
                                <div class="document-meta-field-value">${metadata.archiveId}</div>
                            </div>
                            <div class="document-meta-field">
                                <div class="document-meta-field-label">Classification</div>
                                <div class="document-meta-field-value">${metadata.classification}</div>
                            </div>
                            <div class="document-meta-field">
                                <div class="document-meta-field-label">Origin</div>
                                <div class="document-meta-field-value">Sector ${metadata.sector}</div>
                            </div>
                            <div class="document-meta-field">
                                <div class="document-meta-field-label">Signal Status</div>
                                <div class="document-meta-field-value">${metadata.signal}</div>
                            </div>
                            <div class="document-meta-field">
                                <div class="document-meta-field-label">Integrity</div>
                                <div class="document-meta-field-value">${metadata.integrity}%</div>
                            </div>
                            <div class="document-meta-field">
                                <div class="document-meta-field-label">Confidence</div>
                                <div class="document-meta-field-value">${metadata.confidence}%</div>
                            </div>
                        </div>
                    </div>

                    <!-- Preamble -->
                    <div class="detail-section">
                        <div class="detail-value" style="font-size: 0.9rem; color: #999; margin-bottom: 1rem;">
                            ${metadata.recovered}. The following document appears to describe an unknown civilization's transmissions.
                        </div>
                    </div>

                    <!-- Transcript Label -->
                    <div class="transcript-section">
                        <div class="transcript-label">BEGIN TRANSMISSION</div>

                        <!-- Lyrics / Transcript -->
                        ${song.lyrics ? `
                            <div class="lyrics-text">${this.highlightMatches(song.lyrics)}</div>
                        ` : ''}

                        <!-- Transcript End -->
                        <div class="transcript-end">END TRANSMISSION</div>
                        <div class="detail-value" style="font-size: 0.85rem; margin-top: 0.75rem;">Signal interrupted. Transmission incomplete.</div>
                    </div>

                    <!-- Additional metadata if available -->
                    ${song.tuning ? `
                        <div class="detail-section">
                            <div class="detail-label">Technical Specification</div>
                            <div class="detail-value code" style="font-family: monospace; background-color: rgba(0,0,0,0.3); padding: 0.75rem; margin-top: 0.5rem;">${this.escapeHtml(song.tuning)}</div>
                        </div>
                    ` : ''}

                    ${song.tempo ? `
                        <div class="detail-section">
                            <div class="detail-label">Signal Pattern</div>
                            <div class="detail-value code" style="font-family: monospace; background-color: rgba(0,0,0,0.3); padding: 0.75rem; margin-top: 0.5rem;">${this.escapeHtml(song.tempo)}</div>
                        </div>
                    ` : ''}

                    <!-- Copy button for transcript -->
                    ${song.lyrics ? `
                        <button class="copy-button">📋 Export Transcript</button>
                    ` : ''}

                    ${song.notes ? `
                        <div class="detail-section">
                            <div class="detail-label">Analysis Notes</div>
                            <div class="detail-value">${this.escapeHtml(song.notes)}</div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        file.innerHTML = headerHtml + contentHtml;
        return file;
    }

    toggleFile(id) {
        const file = document.querySelector(`[data-id="${id}"]`);
        if (!file) return;

        const isExpanded = file.classList.contains('expanded');

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
        const lyricsDiv = button.closest('.transcript-section').querySelector('.lyrics-text');
        if (!lyricsDiv) return;

        // Extract plain text from lyrics (remove HTML)
        const lyrics = lyricsDiv.innerText;

        navigator.clipboard.writeText(lyrics).then(() => {
            const originalText = button.textContent;
            button.textContent = '✓ Exported';
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
