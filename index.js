let draggedElement = null;
let selectedElement = null;
let elementCounter = 0;
let isDragging = false;
let dragOffset = { x: 0, y: 0 };


document.querySelectorAll('.draggable-element').forEach(element => {
    element.addEventListener('dragstart', handleDragStart);
});

const canvas = document.getElementById('canvas');
canvas.addEventListener('dragover', handleDragOver);
canvas.addEventListener('drop', handleDrop);
canvas.addEventListener('dragleave', handleDragLeave);

function handleDragStart(e) {
    draggedElement = e.target.closest('.draggable-element');
    e.dataTransfer.effectAllowed = 'copy';
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    canvas.classList.add('drag-over');
}

function handleDragLeave(e) {
    if (!canvas.contains(e.relatedTarget)) {
        canvas.classList.remove('drag-over');
    }
}

function handleDrop(e) {
    e.preventDefault();
    canvas.classList.remove('drag-over');

    if (!draggedElement) return;

    const elementType = draggedElement.dataset.type;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    createElement(elementType, x, y);
    draggedElement = null;
}

function createElement(type, x, y) {
    elementCounter++;
    const element = document.createElement('div');
    element.className = 'canvas-element';
    element.dataset.type = type;
    element.dataset.id = elementCounter;
    element.style.left = x + 'px';
    element.style.top = y + 'px';


    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.innerHTML = '×';
    deleteBtn.onclick = (e) => {
        e.stopPropagation();
        deleteElement(element);
    };
    element.appendChild(deleteBtn);

    let content;
    switch (type) {
        case 'text':
            content = document.createElement('div');
            content.className = 'canvas-text';
            content.textContent = 'Sample Text';
            content.style.fontSize = '16px';
            content.style.color = '#1f2937';
            content.style.backgroundColor = 'white';
            break;
        case 'button':
            content = document.createElement('button');
            content.className = 'canvas-button';
            content.textContent = 'Click Me';
            content.style.fontSize = '14px';
            content.style.color = 'white';
            content.style.backgroundColor = '#3b82f6';
            break;
        case 'image':
            content = document.createElement('img');
            content.className = 'canvas-image';
            content.src = 'https://via.placeholder.com/150x100/3b82f6/ffffff?text=Image';
            content.alt = 'Sample Image';
            break;
    }

    element.appendChild(content);
    canvas.appendChild(element);


    const emptyState = canvas.querySelector('.canvas-empty');
    if (emptyState) {
        emptyState.style.display = 'none';
    }


    makeElementDraggable(element);


    selectElement(element);
}

function makeElementDraggable(element) {
    element.addEventListener('mousedown', startDrag);
    element.addEventListener('click', (e) => {
        e.stopPropagation();
        selectElement(element);
    });
}

function startDrag(e) {
    if (e.target.classList.contains('delete-btn')) return;

    isDragging = true;
    selectedElement = e.currentTarget;
    selectElement(selectedElement);

    const rect = selectedElement.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();

    dragOffset.x = e.clientX - rect.left;
    dragOffset.y = e.clientY - rect.top;

    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDrag);

    e.preventDefault();
}

function drag(e) {
    if (!isDragging || !selectedElement) return;

    const canvasRect = canvas.getBoundingClientRect();
    const newX = e.clientX - canvasRect.left - dragOffset.x;
    const newY = e.clientY - canvasRect.top - dragOffset.y;

    selectedElement.style.left = Math.max(0, newX) + 'px';
    selectedElement.style.top = Math.max(0, newY) + 'px';
}

function stopDrag() {
    isDragging = false;
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('mouseup', stopDrag);
}

function selectElement(element) {

    document.querySelectorAll('.canvas-element').forEach(el => {
        el.classList.remove('selected');
    });


    element.classList.add('selected');
    selectedElement = element;


    showProperties(element);
}

function deleteElement(element) {
    element.remove();
    selectedElement = null;
    hideProperties();


    const elements = canvas.querySelectorAll('.canvas-element');
    if (elements.length === 0) {
        const emptyState = canvas.querySelector('.canvas-empty');
        if (emptyState) {
            emptyState.style.display = 'block';
        }
    }
}

function showProperties(element) {
    const panel = document.getElementById('properties-panel');
    const content = document.getElementById('properties-content');

    panel.classList.add('active');

    const type = element.dataset.type;
    const contentElement = element.querySelector('.canvas-text, .canvas-button, .canvas-image');

    let html = '';

    if (type === 'text' || type === 'button') {
        const currentText = contentElement.textContent;
        const currentFontSize = parseInt(contentElement.style.fontSize) || 16;
        const currentColor = rgbToHex(contentElement.style.color) || '#1f2937';
        const currentBgColor = rgbToHex(contentElement.style.backgroundColor) || (type === 'text' ? '#ffffff' : '#3b82f6');

        html = `
                    <div class="property-group">
                        <label class="property-label">Text Content</label>
                        <input type="text" class="property-input" value="${currentText}" onchange="updateElementProperty('text', this.value)">
                    </div>
                    <div class="property-group">
                        <label class="property-label">Font Size</label>
                        <input type="range" class="property-input" min="12" max="48" value="${currentFontSize}" onchange="updateElementProperty('fontSize', this.value + 'px')">
                        <div style="text-align: center; font-size: 12px; color: #64748b; margin-top: 4px;">${currentFontSize}px</div>
                    </div>
                    <div class="property-group">
                        <label class="property-label">Colors</label>
                        <div class="property-row">
                            <div style="flex: 1;">
                                <label style="font-size: 10px; color: #64748b;">Text</label>
                                <input type="color" class="property-input" value="${currentColor}" onchange="updateElementProperty('color', this.value)">
                            </div>
                            <div style="flex: 1;">
                                <label style="font-size: 10px; color: #64748b;">Background</label>
                                <input type="color" class="property-input" value="${currentBgColor}" onchange="updateElementProperty('backgroundColor', this.value)">
                            </div>
                        </div>
                    </div>
                `;
    } else if (type === 'image') {
        const currentSrc = contentElement.src;

        html = `
                    <div class="property-group">
                        <label class="property-label">Image URL</label>
                        <input type="url" class="property-input" value="${currentSrc}" onchange="updateElementProperty('src', this.value)" placeholder="https://example.com/image.jpg">
                    </div>
                    <div class="property-group">
                        <label class="property-label">Size</label>
                        <input type="range" class="property-input" min="50" max="400" value="150" onchange="updateElementProperty('size', this.value + 'px')">
                        <div style="text-align: center; font-size: 12px; color: #64748b; margin-top: 4px;">150px</div>
                    </div>
                `;
    }

    content.innerHTML = html;
}

function hideProperties() {
    const panel = document.getElementById('properties-panel');
    panel.classList.remove('active');
}

function updateElementProperty(property, value) {
    if (!selectedElement) return;

    const contentElement = selectedElement.querySelector('.canvas-text, .canvas-button, .canvas-image');

    switch (property) {
        case 'text':
            contentElement.textContent = value;
            break;
        case 'fontSize':
            contentElement.style.fontSize = value;

            const sizeDisplay = document.querySelector('.property-group input[type="range"] + div');
            if (sizeDisplay) {
                sizeDisplay.textContent = value;
            }
            break;
        case 'color':
            contentElement.style.color = value;
            break;
        case 'backgroundColor':
            contentElement.style.backgroundColor = value;
            break;
        case 'src':
            contentElement.src = value;
            break;
        case 'size':
            contentElement.style.maxWidth = value;
            contentElement.style.maxHeight = value;
            break;
    }
}

function rgbToHex(rgb) {
    if (!rgb || rgb === '') return '';


    if (rgb.charAt(0) === '#') return rgb;


    const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    if (!match) return '';

    const r = parseInt(match[1]);
    const g = parseInt(match[2]);
    const b = parseInt(match[3]);

    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}


canvas.addEventListener('click', (e) => {
    if (e.target === canvas) {

        document.querySelectorAll('.canvas-element').forEach(el => {
            el.classList.remove('selected');
        });
        selectedElement = null;
        hideProperties();
    }
});


function clearCanvas() {
    if (confirm('Are you sure you want to clear the canvas?')) {
        canvas.querySelectorAll('.canvas-element').forEach(el => el.remove());
        selectedElement = null;
        hideProperties();

        const emptyState = canvas.querySelector('.canvas-empty');
        if (emptyState) {
            emptyState.style.display = 'block';
        }
    }
}

