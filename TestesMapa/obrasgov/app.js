class ObrasMap {
    constructor() {
        this.map = null;
        this.markers = [];
        this.markersLayer = null;
        this.data = [];
        this.filteredData = [];
        
        this.raBoundaries = {
            "RA I - Brasília": {
                latMin: -15.85, latMax: -15.75,
                lonMin: -47.95, lonMax: -47.85
            },
            "RA II - Gama": {
                latMin: -16.05, latMax: -15.95,
                lonMin: -48.10, lonMax: -48.00
            },
            "RA III - Taguatinga": {
                latMin: -15.85, latMax: -15.80,
                lonMin: -48.10, lonMax: -48.00
            },
            "RA IV - Brazlândia": {
                latMin: -15.75, latMax: -15.65,
                lonMin: -48.25, lonMax: -48.15
            },
            "RA V - Sobradinho": {
                latMin: -15.70, latMax: -15.60,
                lonMin: -47.85, lonMax: -47.75
            },
            "RA VI - Planaltina": {
                latMin: -15.65, latMax: -15.55,
                lonMin: -47.70, lonMax: -47.60
            },
            "RA VII - Paranoá": {
                latMin: -15.80, latMax: -15.70,
                lonMin: -47.75, lonMax: -47.65
            },
            "RA VIII - Núcleo Bandeirante": {
                latMin: -15.90, latMax: -15.85,
                lonMin: -47.95, lonMax: -47.90
            },
            "RA IX - Ceilândia": {
                latMin: -15.85, latMax: -15.80,
                lonMin: -48.15, lonMax: -48.05
            },
            "RA X - Guará": {
                latMin: -15.85, latMax: -15.80,
                lonMin: -47.98, lonMax: -47.90
            },
            "RA XI - Cruzeiro": {
                latMin: -15.80, latMax: -15.75,
                lonMin: -47.95, lonMax: -47.90
            },
            "RA XII - Samambaia": {
                latMin: -15.90, latMax: -15.85,
                lonMin: -48.15, lonMax: -48.05
            },
            "RA XIII - Santa Maria": {
                latMin: -16.05, latMax: -15.95,
                lonMin: -48.05, lonMax: -47.95
            },
            "RA XIV - São Sebastião": {
                latMin: -15.95, latMax: -15.85,
                lonMin: -47.85, lonMax: -47.75
            },
            "RA XV - Recanto das Emas": {
                latMin: -16.00, latMax: -15.90,
                lonMin: -48.10, lonMax: -48.00
            },
            "RA XVI - Lago Sul": {
                latMin: -15.90, latMax: -15.82,
                lonMin: -47.85, lonMax: -47.75
            },
            "RA XVII - Riacho Fundo": {
                latMin: -15.90, latMax: -15.85,
                lonMin: -48.05, lonMax: -47.95
            },
            "RA XVIII - Lago Norte": {
                latMin: -15.75, latMax: -15.70,
                lonMin: -47.85, lonMax: -47.75
            },
            "RA XIX - Candangolândia": {
                latMin: -15.87, latMax: -15.82,
                lonMin: -47.95, lonMax: -47.90
            },
            "RA XX - Águas Claras": {
                latMin: -15.85, latMax: -15.82,
                lonMin: -48.02, lonMax: -47.98
            }
        };
        
        this.init();
    }

    async init() {
        try {
            await this.loadData();
            this.processRAData();
            this.initMap();
            this.setupFilters();
            this.setupModal();
            this.displayData();
            this.updateStats();
        } catch (error) {
            console.error('Erro ao inicializar a aplicação:', error);
        }
    }

    async loadData() {
        try {
            const response = await fetch('./obras_com_lat_long.json');
            this.data = await response.json();
            this.filteredData = [...this.data];
            console.log(`Carregados ${this.data.length} projetos`);
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            this.data = [];
            this.filteredData = [];
        }
    }

    processRAData() {
        console.log('Processando dados de RA...');
        this.data.forEach((project, index) => {
            if (project.latitude && project.longitude) {
                const ra = this.determineRA(project.latitude, project.longitude);
                project.regiao_administrativa = ra;
            } else {
                project.regiao_administrativa = 'RA não identificada';
            }
        });
        
        this.filteredData = [...this.data];
        
        const raStats = {};
        this.data.forEach(project => {
            const ra = project.regiao_administrativa;
            raStats[ra] = (raStats[ra] || 0) + 1;
        });
        
        console.log('Distribuição por RA:', raStats);
    }

    determineRA(latitude, longitude) {
        const lat = parseFloat(latitude);
        const lon = parseFloat(longitude);

        if (isNaN(lat) || isNaN(lon)) {
            return 'RA não identificada';
        }

        for (const [ra, bounds] of Object.entries(this.raBoundaries)) {
            if (lat >= bounds.latMin && lat <= bounds.latMax &&
                lon >= bounds.lonMin && lon <= bounds.lonMax) {
                return ra;
            }
        }

        if (lat >= -16.1 && lat <= -15.5 && lon >= -48.3 && lon <= -47.4) {
            if (lat >= -15.85 && lat <= -15.75 && lon >= -47.95 && lon <= -47.85) {
                return "RA I - Brasília";
            } else if (lat >= -15.90 && lat <= -15.75 && lon >= -48.20 && lon <= -47.85) {
                return "Região Oeste do DF";
            } else if (lat >= -16.10 && lat <= -15.85 && lon >= -48.20 && lon <= -47.85) {
                return "Região Sul do DF";
            }
        }

        return 'RA não identificada';
    }

    initMap() {
        const center = [-15.7942, -47.8822];
        
        this.map = L.map('map').setView(center, 11);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);

        this.markersLayer = L.layerGroup().addTo(this.map);
    }

    setupFilters() {
        this.populateFilterOptions();
        
        document.getElementById('situacaoFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('especieFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('naturezaFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('raFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('searchInput').addEventListener('input', () => this.applyFilters());
    }

    populateFilterOptions() {
        const situacoes = [...new Set(this.data.map(item => item.situacao).filter(Boolean))];
        const especies = [...new Set(this.data.map(item => item.especie).filter(Boolean))];
        const naturezas = [...new Set(this.data.map(item => item.natureza).filter(Boolean))];
        const ras = [...new Set(this.data.map(item => item.regiao_administrativa).filter(Boolean))]; 

        this.populateSelect('situacaoFilter', situacoes);
        this.populateSelect('especieFilter', especies);
        this.populateSelect('naturezaFilter', naturezas);
        this.populateSelect('raFilter', ras.sort()); 
    }

    populateSelect(selectId, options) {
        const select = document.getElementById(selectId);
        const currentOptions = Array.from(select.options).slice(1);
        currentOptions.forEach(option => option.remove());
        
        options.sort().forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.textContent = option;
            select.appendChild(optionElement);
        });
    }

    applyFilters() {
        const situacaoFilter = document.getElementById('situacaoFilter').value;
        const especieFilter = document.getElementById('especieFilter').value;
        const naturezaFilter = document.getElementById('naturezaFilter').value;
        const raFilter = document.getElementById('raFilter').value; 
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();

        this.filteredData = this.data.filter(item => {
            const matchSituacao = !situacaoFilter || item.situacao === situacaoFilter;
            const matchEspecie = !especieFilter || item.especie === especieFilter;
            const matchNatureza = !naturezaFilter || item.natureza === naturezaFilter;
            const matchRA = !raFilter || item.regiao_administrativa === raFilter; 
            const matchSearch = !searchTerm || 
                item.nome?.toLowerCase().includes(searchTerm) ||
                item.descricao?.toLowerCase().includes(searchTerm) ||
                item.endereco?.toLowerCase().includes(searchTerm);

            return matchSituacao && matchEspecie && matchNatureza && matchRA && matchSearch;
        });

        this.displayData();
        this.updateStats();
        
        console.log(`Filtros aplicados: ${this.filteredData.length}/${this.data.length} obras`);
        if (raFilter) {
            console.log(`Filtro RA: ${raFilter}`);
        }
    }

    displayData() {
        this.clearMarkers();
        this.displayProjects();
        this.addMarkersToMap();
    }

    clearMarkers() {
        this.markersLayer.clearLayers();
        this.markers = [];
    }

    displayProjects() {
        const projectsContainer = document.getElementById('projects');
        projectsContainer.innerHTML = '';

        if (this.filteredData.length === 0) {
            projectsContainer.innerHTML = '<div class="loading">Nenhuma obra encontrada</div>';
            return;
        }

        this.filteredData.forEach((project, index) => {
            const projectElement = this.createProjectElement(project, index);
            projectsContainer.appendChild(projectElement);
        });
    }

    createProjectElement(project, index) {
        const div = document.createElement('div');
        div.className = 'project-item';
        div.dataset.index = index;

        const statusClass = this.getStatusClass(project.situacao);
        
        div.innerHTML = `
            <div class="project-title">${project.nome || 'Nome não informado'}</div>
            <div class="project-info"><strong>📍 RA:</strong> ${project.regiao_administrativa || 'Não identificada'}</div>
            <div class="project-info"><strong>📍 Endereço:</strong> ${project.endereco || 'Não informado'}</div>
            <div class="project-info"><strong>🏗️ Espécie:</strong> ${project.especie || 'Não informada'}</div>
            <div class="project-info"><strong>📅 Previsão:</strong> ${this.formatDate(project.dataInicialPrevista)} - ${this.formatDate(project.dataFinalPrevista)}</div>
            <span class="project-status ${statusClass}">${project.situacao || 'Status não informado'}</span>
        `;

        div.addEventListener('click', () => this.selectProject(index));
        
        return div;
    }

    getStatusClass(situacao) {
        if (!situacao) return '';
        
        const status = situacao.toLowerCase();
        if (status.includes('cadastrada')) return 'status-cadastrada';
        if (status.includes('execução') || status.includes('execucao')) return 'status-execucao';
        if (status.includes('concluída') || status.includes('concluida')) return 'status-concluida';
        if (status.includes('inativada')) return 'status-inativada';
        return 'status-cadastrada';
    }

    addMarkersToMap() {
        this.filteredData.forEach((project, index) => {
            if (project.latitude && project.longitude) {
                const marker = this.createMarker(project, index);
                this.markers.push(marker);
                this.markersLayer.addLayer(marker);
            }
        });

        if (this.markers.length > 0) {
            const group = new L.featureGroup(this.markers);
            this.map.fitBounds(group.getBounds().pad(0.05));
        }
    }

    createMarker(project, index) {
        const statusColor = this.getMarkerColor(project.situacao);
        
        const marker = L.circleMarker([project.latitude, project.longitude], {
            radius: 8,
            fillColor: statusColor,
            color: '#fff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8
        });

        const popupContent = `
            <div class="popup-title">${project.nome || 'Nome não informado'}</div>
            <div class="popup-info"><strong>🏛️ RA:</strong> ${project.regiao_administrativa || 'Não identificada'}</div>
            <div class="popup-info"><strong>📊 Situação:</strong> ${project.situacao || 'Não informada'}</div>
            <div class="popup-info"><strong>🏗️ Espécie:</strong> ${project.especie || 'Não informada'}</div>
            <div class="popup-info"><strong>📍 Endereço:</strong> ${project.endereco || 'Não informado'}</div>
            <button class="popup-button" onclick="obrasMap.showProjectDetails(${index})">Ver Detalhes</button>
        `;

        marker.bindPopup(popupContent);
        marker.on('click', () => this.selectProject(index));

        return marker;
    }

    getMarkerColor(situacao) {
        if (!situacao) return '#95a5a6';
        
        const status = situacao.toLowerCase();
        if (status.includes('cadastrada')) return '#3498db';
        if (status.includes('execução') || status.includes('execucao')) return '#27ae60';
        if (status.includes('concluída') || status.includes('concluida')) return '#9b59b6';
        if (status.includes('inativada')) return '#e74c3c';
        return '#95a5a6';
    }

    selectProject(index) {
        document.querySelectorAll('.project-item').forEach(item => {
            item.classList.remove('highlighted');
        });
        
        const projectElement = document.querySelector(`[data-index="${index}"]`);
        if (projectElement) {
            projectElement.classList.add('highlighted');
            projectElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        const project = this.filteredData[index];
        if (project.latitude && project.longitude) {
            this.map.setView([project.latitude, project.longitude], 15);
            
            const marker = this.markers[index];
            if (marker) {
                marker.openPopup();
            }
        }
    }

    setupModal() {
        const modal = document.getElementById('modal');
        const closeBtn = document.querySelector('.close');

        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    showProjectDetails(index) {
        const project = this.filteredData[index];
        const modal = document.getElementById('modal');
        const modalBody = document.getElementById('modalBody');

        modalBody.innerHTML = `
            <div class="modal-section">
                <h3>Informações Gerais</h3>
                <div class="modal-info"><span class="modal-label">Nome:</span> ${project.nome || 'Não informado'}</div>
                <div class="modal-info"><span class="modal-label">ID Único:</span> ${project.idUnico || 'Não informado'}</div>
                <div class="modal-info"><span class="modal-label">Situação:</span> ${project.situacao || 'Não informada'}</div>
                <div class="modal-info"><span class="modal-label">Espécie:</span> ${project.especie || 'Não informada'}</div>
                <div class="modal-info"><span class="modal-label">Natureza:</span> ${project.natureza || 'Não informada'}</div>
            </div>

            <div class="modal-section">
                <h3>Localização</h3>
                <div class="modal-info"><span class="modal-label">🏛️ Região Administrativa:</span> ${project.regiao_administrativa || 'Não identificada'}</div>
                <div class="modal-info"><span class="modal-label">Endereço:</span> ${project.endereco || 'Não informado'}</div>
                <div class="modal-info"><span class="modal-label">CEP:</span> ${project.cep || 'Não informado'}</div>
                <div class="modal-info"><span class="modal-label">UF:</span> ${project.uf || 'Não informada'}</div>
                <div class="modal-info"><span class="modal-label">Coordenadas:</span> ${project.latitude || 'N/A'}, ${project.longitude || 'N/A'}</div>
            </div>

            <div class="modal-section">
                <h3>Descrição</h3>
                <div class="modal-info">${project.descricao || 'Descrição não disponível'}</div>
            </div>

            <div class="modal-section">
                <h3>Função Social</h3>
                <div class="modal-info">${project.funcaoSocial || 'Função social não informada'}</div>
            </div>

            <div class="modal-section">
                <h3>Datas</h3>
                <div class="modal-info"><span class="modal-label">Data de Cadastro:</span> ${this.formatDate(project.dataCadastro)}</div>
                <div class="modal-info"><span class="modal-label">Início Previsto:</span> ${this.formatDate(project.dataInicialPrevista)}</div>
                <div class="modal-info"><span class="modal-label">Fim Previsto:</span> ${this.formatDate(project.dataFinalPrevista)}</div>
                <div class="modal-info"><span class="modal-label">Início Efetivo:</span> ${this.formatDate(project.dataInicialEfetiva)}</div>
                <div class="modal-info"><span class="modal-label">Fim Efetivo:</span> ${this.formatDate(project.dataFinalEfetiva)}</div>
            </div>

            ${project.populacaoBeneficiada ? `
            <div class="modal-section">
                <h3>População Beneficiada</h3>
                <div class="modal-info"><span class="modal-label">Quantidade:</span> ${project.populacaoBeneficiada}</div>
                <div class="modal-info"><span class="modal-label">Descrição:</span> ${project.descPopulacaoBeneficiada || 'Não informada'}</div>
            </div>
            ` : ''}

            ${project.qdtEmpregosGerados ? `
            <div class="modal-section">
                <h3>Empregos Gerados</h3>
                <div class="modal-info">${project.qdtEmpregosGerados}</div>
            </div>
            ` : ''}

            ${project.metaGlobal ? `
            <div class="modal-section">
                <h3>Meta Global</h3>
                <div class="modal-info">${project.metaGlobal}</div>
            </div>
            ` : ''}
        `;

        modal.style.display = 'block';
    }

    formatDate(dateString) {
        if (!dateString) return 'Não informada';
        
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('pt-BR');
        } catch (error) {
            return dateString;
        }
    }

    updateStats() {
        document.getElementById('totalObras').textContent = this.data.length;
        document.getElementById('obrasVisiveis').textContent = this.filteredData.length;
    }
}

let obrasMap;
document.addEventListener('DOMContentLoaded', () => {
    obrasMap = new ObrasMap();
});