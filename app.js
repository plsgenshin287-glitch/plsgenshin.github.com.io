// File Storage Management
class FileStorage {
    constructor() {
        this.files = this.loadFiles();
        this.currentPath = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.render();
    }

    setupEventListeners() {
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');

        uploadArea.addEventListener('click', () => fileInput.click());

        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            this.handleFiles(e.dataTransfer.files);
        });

        fileInput.addEventListener('change', (e) => {
            this.handleFiles(e.target.files);
            fileInput.value = '';
        });
    }

    handleFiles(files) {
        for (let file of files) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const fileData = {
                    id: this.generateId(),
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    data: e.target.result,
                    uploadedAt: new Date().toLocaleString(),
                    path: [...this.currentPath]
                };
                this.files.push(fileData);
                this.saveFiles();
                this.render();
            };
            reader.readAsDataURL(file);
        }
    }

    getFileIcon(fileName) {
        const extension = fileName.split('.').pop().toLowerCase();
        const icons = {
            pdf: '📄',
            doc: '📝', docx: '📝', txt: '📝',
            jpg: '🖼️', jpeg: '🖼️', png: '🖼️', gif: '🖼️',
            mp3: '🎵', wav: '🎵', m4a: '🎵',
            mp4: '🎬', avi: '🎬', mov: '🎬',
            zip: '📦', rar: '📦', 7z: '📦',
            xls: '📊', xlsx: '📊', csv: '📊',
            folder: '📁'
        };
        return icons[extension] || '📎';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    getCurrentFiles() {
        return this.files.filter(f => 
            JSON.stringify(f.path) === JSON.stringify(this.currentPath)
        );
    }

    downloadFile(fileId) {
        const file = this.files.find(f => f.id === fileId);
        if (!file) return;

        const link = document.createElement('a');
        link.href = file.data;
        link.download = file.name;
        link.click();
    }

    deleteFile(fileId) {
        if (confirm('Are you sure you want to delete this file?')) {
            this.files = this.files.filter(f => f.id !== fileId);
            this.saveFiles();
            this.render();
        }
    }

    shareFile(fileId) {
        const file = this.files.find(f => f.id === fileId);
        if (!file) return;

        const shareLink = `${window.location.origin}?file=${file.id}`;
        navigator.clipboard.writeText(shareLink).then(() => {
            alert('Share link copied to clipboard!');
        });
    }

    generateId() {
        return '_' + Math.random().toString(36).substr(2, 9);
    }

    saveFiles() {
        localStorage.setItem('tasekTujFiles', JSON.stringify(this.files));
    }

    loadFiles() {
        const saved = localStorage.getItem('tasekTujFiles');
        return saved ? JSON.parse(saved) : [];
    }

    render() {
        const filesGrid = document.getElementById('filesGrid');
        const currentFiles = this.getCurrentFiles();

        if (currentFiles.length === 0) {
            filesGrid.innerHTML = '<p class="empty-state">No files in this folder</p>';
            return;
        }

        filesGrid.innerHTML = currentFiles.map(file => `
            <div class="file-item">
                <div class="file-icon">${this.getFileIcon(file.name)}</div>
                <div class="file-name">${file.name}</div>
                <div class="file-size">${this.formatFileSize(file.size)}</div>
                <div class="file-actions">
                    <button onclick="storage.downloadFile('${file.id}')">⬇️ Download</button>
                    <button onclick="storage.shareFile('${file.id}')">🔗 Share</button>
                    <button class="delete-btn" onclick="storage.deleteFile('${file.id}')">🗑️ Delete</button>
                </div>
            </div>
        `).join('');
    }
}

// Initialize storage
const storage = new FileStorage();

// Global helper functions
function goToRoot() {
    storage.currentPath = [];
    storage.render();
}
