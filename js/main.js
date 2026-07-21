
document.addEventListener("DOMContentLoaded", () => {
    const toggleThemeBtn = document.getElementById('toggleTheme');
    if (toggleThemeBtn) {
        if (localStorage.getItem('theme') === 'dark') document.body.classList.add('dark');
        toggleThemeBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark');
            localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
        });
    }

    const incFont = document.getElementById('incFont');
    const decFont = document.getElementById('decFont');
    if (incFont && decFont) {
        incFont.addEventListener('click', () => {
            const currentSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
            document.documentElement.style.fontSize = (currentSize + 1) + 'px';
        });
        decFont.addEventListener('click', () => {
            const currentSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
            document.documentElement.style.fontSize = (currentSize - 1) + 'px';
        });
    }

    const disciplinasContainer = document.getElementById('disciplinas-container');
    const disciplinasAnterioresContainer = document.getElementById('disciplinas-anteriores-container');

    if (disciplinasContainer) {
        fetch('data/disciplinas.json')
            .then(r => r.json())
            .then(list => {
                // Função auxiliar para gerar o HTML do card
                const renderCard = (d) => `
                    <div class="card">
                        <h3>${d.nome} (${d.codigo}) - ${d.semestre}</h3>
                        <p><strong>Ementa:</strong> ${d.ementa}</p>
                        <p><strong>Horários de Aula:</strong> ${d.horarios}</p>
                        ${d.materiais && d.materiais.length > 0 ? `
                            <ul style="margin-top: 10px; margin-left: 20px;">
                                ${d.materiais.map(m => `<li><a href="${m.url}" target="_blank" style="color: var(--primary);">${m.titulo}</a></li>`).join('')}
                            </ul>
                        ` : ''}
                    </div>
                `;

                // Separa disciplinas atuais e anteriores
                const atuais = list.filter(d => d.status === 'atual');
                const anteriores = list.filter(d => d.status === 'anterior');

                disciplinasContainer.innerHTML = atuais.length > 0 
                    ? atuais.map(renderCard).join('') 
                    : '<p>Nenhuma disciplina em andamento neste semestre.</p>';

                if (disciplinasAnterioresContainer) {
                    disciplinasAnterioresContainer.innerHTML = anteriores.length > 0 
                        ? anteriores.map(renderCard).join('') 
                        : '<p>Nenhum histórico disponível.</p>';
                }
            });
    }

    const eventosContainer = document.getElementById('eventos-container');
    if (eventosContainer) {
        fetch('data/eventos.json').then(r => r.json()).then(dadosAgenda => {
            const semestres = Object.keys(dadosAgenda); // Recupera as chaves, ex: ["2026/2", "2026/1"]
            const semestreAtual = semestres[0]; // Considera o primeiro semestre do JSON como o atual

            eventosContainer.innerHTML = semestres.map(semestre => {
                const isOpen = (semestre === semestreAtual) ? 'open' : '';
                const eventos = dadosAgenda[semestre];

                // Gera os cards dos eventos dentro do semestre
                const cardsHTML = eventos.map(e => `
                    <div class="card" style="margin-bottom: 10px;">
                        <strong>${e.data}</strong> - ${e.titulo}
                        <p>${e.descricao}</p>
                    </div>
                `).join('');

                // Monta a estrutura retrátil para cada semestre
                return `
                    <details ${isOpen} style="margin-bottom: 20px; border: 1px solid #e0e0e0; border-radius: 8px; padding: 10px; background-color: #fcfcfc;">
                        <summary style="cursor: pointer; font-weight: bold; font-size: 1.1em; padding: 5px;">
                            Agenda ${semestre}
                        </summary>
                        <div style="margin-top: 15px;">
                            ${cardsHTML}
                        </div>
                    </details>
                `;
            }).join('');
        });
    }
// Botão Voltar ao Topo com rolagem suave
    const scrollTopBtn = document.getElementById('scrollTop');
    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }   
    const pubsContainer = document.getElementById('publicacoes-container');
    if (pubsContainer) {
        fetch('data/publicacoes.json').then(r => r.json()).then(pubs => {
            pubsContainer.innerHTML = pubs.map((p, idx) => `
                <div class="card" style="margin-bottom: 20px;">
                    <span class="badge">${p.ano}</span>
                    <h3 style="margin: 10px 0;">${p.titulo}</h3>
                    <p>${p.autores} - <i>${p.local}</i></p>
                    
                    <!-- ÁREA DOS BOTÕES -->
                    <div style="margin-top: 10px; display: flex; gap: 8px; flex-wrap: wrap;">
                        ${p.resumo ? `<button class="btn ghost" style="padding: 5px 10px;" onclick="document.getElementById('abs-${idx}').style.display = document.getElementById('abs-${idx}').style.display === 'none' ? 'block' : 'none'">[abstract]</button>` : ''}
                        ${p.bibtex ? `<button class="btn ghost" style="padding: 5px 10px;" onclick="document.getElementById('bib-${idx}').style.display = document.getElementById('bib-${idx}').style.display === 'none' ? 'block' : 'none'">[bibtex]</button>` : ''}
                        ${p.links && p.links.doi ? `<a href="${p.links.doi}" target="_blank" class="btn ghost" style="padding: 5px 10px; color: #28a745; border-color: #28a745; text-decoration: none;">[doi]</a>` : ''}
                        ${p.links && p.links.pdf ? `<a href="${p.links.pdf}" target="_blank" class="btn ghost" style="padding: 5px 10px; color: #dc3545; border-color: #dc3545; text-decoration: none;">[pdf]</a>` : ''}
                    </div>

                    <!-- CONTEÚDO OCULTO: RESUMO / ABSTRACT -->
                    ${p.resumo ? `<div id="abs-${idx}" style="display:none; background:#f9f9f9; color:#333; padding:15px; margin-top:10px; border-radius:8px; border-left: 4px solid #007bff;">
                        <strong>Abstract:</strong>
                        <p style="margin-top: 5px; font-size: 0.9em;">${p.resumo}</p>
                    </div>` : ''}

                    <!-- CONTEÚDO OCULTO: BIBTEX -->
                    ${p.bibtex ? `<pre id="bib-${idx}" style="display:none; background:#eee; color:#333; padding:10px; margin-top:10px; border-radius:8px; white-space:pre-wrap; font-size: 0.85em;">${p.bibtex}</pre>` : ''}
                </div>
            `).join('');
        });
    }
});
