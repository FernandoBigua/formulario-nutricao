const scriptURL = "https://script.google.com/macros/s/AKfycbxRMpd8m9M2o4_kCX_FpBeIGRrdaXMuvcGEFgjNJRXoBG-TQM_RFK1gUswgH97N9hNQow/exec";
const form = document.getElementById('formulario');
const mensagem = document.getElementById('mensagem');
const escolaSelect = document.getElementById("escola");
const modalidadeSelect = document.getElementById("modalidade");
const turmaSelect = document.getElementById("turma");
let alunosCadastradosSessao = [];

const turmasPorModalidade = {
    "Ed. Infantil": [
        "Maternal A", "Maternal B", 
        "Jardim I A", "Jardim I B", "Jardim II A", "Jardim II B",
        "Pré I A", "Pré I B", "Pré II A", "Pré II B"
    ],
    "Fund. 1": [
        "1º I", "1º II", "1º III", "2º I", "2º II", "2º III",
        "3º I", "3º II", "3º III", "4º I", "4º II", "4º III",
        "5º I", "5º II", "5º III"
    ],
    "Fund. 2": [
        "6º I", "6º II", "6º III", "7º I", "7º II", "7º III",
        "8º I", "8º II", "8º III", "9º I", "9º II", "9º III"
    ]
};

function atualizarTurmas() {
    const modalidade = modalidadeSelect.value;
    const turmas = turmasPorModalidade[modalidade] || [];

    turmaSelect.innerHTML = "";
    
    const selecioneOption = document.createElement("option");
    selecioneOption.value = "";
    selecioneOption.textContent = "Selecione";
    selecioneOption.disabled = true;
    selecioneOption.selected = true;
    turmaSelect.appendChild(selecioneOption);

    turmas.forEach(turma => {
        const option = document.createElement("option");
        option.value = turma;
        option.textContent = turma;
        turmaSelect.appendChild(option);
    });
}

function atualizarModalidadePelaEscola() {
    const escola = escolaSelect.value;
    modalidadeSelect.innerHTML = "";

    const selecioneOption = document.createElement("option");
    selecioneOption.value = "";
    selecioneOption.textContent = "Selecione";
    selecioneOption.disabled = true;
    selecioneOption.selected = true;
    modalidadeSelect.appendChild(selecioneOption);

    if (escola.startsWith("CEI")) {
        const opcao = document.createElement("option");
        opcao.value = "Ed. Infantil";
        opcao.textContent = "Ed. Infantil";
        modalidadeSelect.appendChild(opcao);
    } else {
        const opcoes = ["Fund. 1", "Fund. 2"];
        opcoes.forEach((valor) => {
            const opcao = document.createElement("option");
            opcao.value = valor;
            opcao.textContent = valor;
            modalidadeSelect.appendChild(opcao);
        });
    }

    atualizarTurmas();
}

escolaSelect.addEventListener("change", atualizarModalidadePelaEscola);
modalidadeSelect.addEventListener("change", atualizarTurmas);

document.addEventListener("DOMContentLoaded", () => {
    atualizarModalidadePelaEscola();
    atualizarTurmas();
    document.getElementById("dataHora").value = new Date().toLocaleString();
    document.getElementById("submit").style.display = "inline-block";
    document.getElementById("novo").style.display = "none";
});

document.getElementById('dataNascimento').addEventListener('input', function () {
    let dataNascimento = new Date(this.value);
    let hoje = new Date();
    let idade = hoje.getFullYear() - dataNascimento.getFullYear();
    let mes = hoje.getMonth() - dataNascimento.getMonth();
    let dia = hoje.getDate() - dataNascimento.getDate();

    if (mes < 0 || (mes === 0 && dia < 0)) {
        idade--;
    }

    document.getElementById('idade').value = idade >= 0 ? idade : "";
});

function formatarDataBrasileira(dataISO) {
    const [ano, mes, dia] = dataISO.split("-");
    return `${dia}/${mes}/${ano}`;
}

form.addEventListener('submit', function (e) {
    e.preventDefault();
    document.getElementById("dataHora").value = new Date().toLocaleString();
    
    // Transforma nome do aluno e professor em caixa alta
    const nomeAlunoEl = document.getElementById("nomeAluno");
    if (nomeAlunoEl) {
        nomeAlunoEl.value = nomeAlunoEl.value.toUpperCase();
    }

    const professorEl = document.getElementById("nomeProfessor");
    if (professorEl) {
        professorEl.value = professorEl.value.toUpperCase();
    }

    const formData = new FormData(form);

    // Substitui a data no formato brasileiro, mas sem alterar o campo do formulário
    const dataNascimentoEl = document.getElementById("dataNascimento");
    if (dataNascimentoEl.value) {
        const dataBrasileira = formatarDataBrasileira(dataNascimentoEl.value);
        formData.set("dataNascimento", dataBrasileira);
    }
    const peso = document.getElementById("peso").value.replace(".", ",");
    formData.set("peso", peso);

    const altura = document.getElementById("altura").value.replace(".", ",");
    formData.set("altura", altura);

    const loader = document.getElementById("loader");
    mensagem.textContent = "";
    loader.style.display = "flex"; // Mostra o loader

    fetch(scriptURL, {
        method: 'POST',
        mode: 'no-cors',
        body: formData
    })
    .then(() => {
        const nome = document.getElementById("nomeAluno").value.trim();
        if (nome) {
            alunosCadastradosSessao.push(nome);
            atualizarListaAlunosSessao();
        }
        mensagem.textContent = "Cadastro enviado com sucesso! Clique em Novo Cadastro.";
        loader.style.display = "none";

        form.reset();
        atualizarModalidadePelaEscola(); // Garante que tudo seja atualizado corretamente
        document.getElementById("dataHora").value = new Date().toLocaleString();
        document.getElementById("submit").style.display = "none";
        document.getElementById("novo").style.display = "inline-block";
    })
    .catch(error => {
        loader.style.display = "none";
        alert("Erro ao enviar. Tente novamente.");
        console.error("Erro!", error.message);
    });
});

function novoCadastro() {
    form.reset();
    mensagem.innerText = "";
    atualizarModalidadePelaEscola();
    document.getElementById("dataHora").value = new Date().toLocaleString();
    document.getElementById("submit").style.display = "inline-block";
    document.getElementById("novo").style.display = "none";
}

function atualizarListaAlunosSessao() {
    const lista = alunosCadastradosSessao.map((nome, i) => `<li>${i + 1}. ${nome}</li>`).join("");
    document.getElementById("listaAlunos").innerHTML = `
        <p>Alunos cadastrados nesta sessão:</p>
        <ul>${lista}</ul>
    `;
}

// Atualiza a modalidade no RELATÓRIO com base na escola selecionada
function atualizarModalidadeRelatorio() {
    const escola = document.getElementById("filtroEscola").value;
    const modalidadeSelect = document.getElementById("filtroModalidade");
    modalidadeSelect.innerHTML = "";

    // Adiciona opção vazia/Todas para modalidades
    const optionTodas = document.createElement("option");
    optionTodas.value = "";
    optionTodas.textContent = "Todas";
    modalidadeSelect.appendChild(optionTodas);

    if (escola.startsWith("CEI")) {
        const option = document.createElement("option");
        option.value = "Ed. Infantil";
        option.textContent = "Ed. Infantil";
        modalidadeSelect.appendChild(option);
    } else if (escola !== "") {
        ["Fund. 1", "Fund. 2"].forEach(valor => {
            const option = document.createElement("option");
            option.value = valor;
            option.textContent = valor;
            modalidadeSelect.appendChild(option);
        });
    } else {
        // Se nenhuma escola for selecionada, lista todas as modalidades
        ["Ed. Infantil", "Fund. 1", "Fund. 2"].forEach(valor => {
            const option = document.createElement("option");
            option.value = valor;
            option.textContent = valor;
            modalidadeSelect.appendChild(option);
        });
    }

    atualizarTurmasRelatorio(); // Atualiza turmas após mudar a modalidade
}

// Atualiza as turmas no RELATÓRIO com base na modalidade selecionada
function atualizarTurmasRelatorio() {
    const modalidade = document.getElementById("filtroModalidade").value;
    const turmaSelect = document.getElementById("filtroTurma");
    
    turmaSelect.innerHTML = "";

    // Adiciona opção vazia/Todas para turmas
    const optionTodas = document.createElement("option");
    optionTodas.value = "";
    optionTodas.textContent = "Todas";
    turmaSelect.appendChild(optionTodas);

    if (modalidade) {
        const turmas = turmasPorModalidade[modalidade] || [];
        turmas.forEach(turma => {
            const option = document.createElement("option");
            option.value = turma;
            option.textContent = turma;
            turmaSelect.appendChild(option);
        });
    } else {
        // Se nenhuma modalidade for selecionada, lista todas as turmas de todas as modalidades
        Object.values(turmasPorModalidade).flat().forEach(turma => {
            const option = document.createElement("option");
            option.value = turma;
            option.textContent = turma;
            turmaSelect.appendChild(option);
        });
    }
}

// --- NAVEGAÇÃO ENTRE AS TELAS ---

function abrirFormulario() {
    document.getElementById("telaInicial").style.display = "none";
    document.getElementById("painelRelatorio").style.display = "none";
    document.getElementById("telaFormulario").style.display = "block";
}

function abrirRelatorio() {
    document.getElementById("telaInicial").style.display = "none";
    document.getElementById("telaFormulario").style.display = "none";
    document.getElementById("painelRelatorio").style.display = "block";

    // Carrega as opções de escolas copiando do formulário principal
    const escolaSelect = document.getElementById("filtroEscola");
    escolaSelect.innerHTML = '<option value="" selected>Todas as Escolas</option>' + document.getElementById("escola").innerHTML;
    
    const optionDesabilitada = escolaSelect.querySelector('option[disabled]');
    if (optionDesabilitada) {
        optionDesabilitada.remove();
    }

    escolaSelect.replaceWith(escolaSelect.cloneNode(true));
    document.getElementById("filtroModalidade").replaceWith(document.getElementById("filtroModalidade").cloneNode(true));

    const novoEscolaSelect = document.getElementById("filtroEscola");
    const novoModalidadeSelect = document.getElementById("filtroModalidade");

    novoEscolaSelect.addEventListener("change", atualizarModalidadeRelatorio);
    novoModalidadeSelect.addEventListener("change", atualizarTurmasRelatorio);
    novoEscolaSelect.dispatchEvent(new Event("change"));

    // Pré-preenche o select de Ano com o ano atual Fazer um ajuste...
    const filtroAnoSelect = document.getElementById("filtroAno");
    const anoAtual = new Date().getFullYear();
    filtroAnoSelect.innerHTML = `<option value="${anoAtual}">${anoAtual}</option><option value="2025">2025</option>`;
    
    // Limpa a tabela e aguarda o usuário clicar em "Buscar"
    const tabela = document.getElementById('tabelaRelatorio');
    tabela.innerHTML = '<p style="text-align: center; color: #94a3b8; padding: 20px;">Use os filtros acima e clique em "Buscar" para carregar os dados.</p>';
}

function voltarTelaInicial() {
    document.getElementById("telaFormulario").style.display = "none";
    document.getElementById("painelRelatorio").style.display = "none";
    document.getElementById("telaInicial").style.display = "flex";
}
function buscarRelatorio(isInitialLoad = false) {
    const escola = document.getElementById("filtroEscola").value;
    const modalidade = document.getElementById("filtroModalidade").value;
    const turma = document.getElementById("filtroTurma").value.trim();
    const periodo = document.getElementById("filtroPeriodo").value;
    const filtroAnoSelect = document.getElementById("filtroAno");
    let anoSelecionado = filtroAnoSelect.value;
    
    const loader = document.getElementById('loader1');
    const tabela = document.getElementById('tabelaRelatorio');

    loader.style.display = 'flex'; // Mostra o loader
    tabela.innerHTML = ''; // Limpa a tabela

    function formatarDataISOParaBrasileiro(dataISO) {
        if (!dataISO) return "";
        const data = new Date(dataISO);
        if (isNaN(data.getTime())) return dataISO; // Retorna original se inválido
        const dia = String(data.getDate()).padStart(2, '0');
        const mes = String(data.getMonth() + 1).padStart(2, '0');
        const ano = data.getFullYear();
        return `${dia}/${mes}/${ano}`;
    }

    function formatarDataHoraISO(dataISO) {
        if (!dataISO) return "";
        const data = new Date(dataISO);
        if (isNaN(data.getTime())) return dataISO;
        const dia = String(data.getDate()).padStart(2, '0');
        const mes = String(data.getMonth() + 1).padStart(2, '0');
        const ano = data.getFullYear();
        const horas = String(data.getHours()).padStart(2, '0');
        const minutos = String(data.getMinutes()).padStart(2, '0');
        return `${dia}/${mes}/${ano} ${horas}:${minutos}`;
    }

    // Função para obter de forma robusta o ano do registro
    function obterAnoDoRegistro(aluno) {
        const dataString = aluno.data;
        if (!dataString) return null;
        
        // Tenta parsear direto
        const d = new Date(dataString);
        if (!isNaN(d.getTime())) {
            return d.getFullYear();
        }
        
        // Se for string no formato BR "11/06/2026"
        const match = dataString.match(/\b(20\d{2})\b/);
        if (match) {
            return parseInt(match[1], 10);
        }
        
        const partes = dataString.split('/');
        if (partes.length === 3) {
            const anoParte = partes[2].split(' ')[0];
            const anoNum = parseInt(anoParte, 10);
            if (!isNaN(anoNum)) return anoNum;
        }
        
        return null;
    }

    fetch(`${scriptURL}?action=read`)
        .then(res => res.json())
        .then(data => {
            // 1. Extrair os anos únicos existentes nos dados
            const anosEncontrados = new Set();
            data.forEach(aluno => {
                const ano = obterAnoDoRegistro(aluno);
                if (ano) anosEncontrados.add(ano);
            });

            const anoAtualSistema = new Date().getFullYear();
            if (anosEncontrados.size === 0) {
                anosEncontrados.add(anoAtualSistema);
            }

            const listaAnos = Array.from(anosEncontrados).sort((a, b) => b - a);

            // 2. Preencher o select de Ano
            const valorAtualFiltro = filtroAnoSelect.value;
            filtroAnoSelect.innerHTML = "";
            
            listaAnos.forEach(ano => {
                const option = document.createElement("option");
                option.value = ano;
                option.textContent = ano;
                filtroAnoSelect.appendChild(option);
            });

            // 3. Definir qual ano será filtrado
            if (isInitialLoad || !valorAtualFiltro) {
                if (anosEncontrados.has(anoAtualSistema)) {
                    filtroAnoSelect.value = anoAtualSistema;
                    anoSelecionado = anoAtualSistema.toString();
                } else {
                    filtroAnoSelect.value = listaAnos[0];
                    anoSelecionado = listaAnos[0].toString();
                }
            } else {
                filtroAnoSelect.value = valorAtualFiltro;
                anoSelecionado = valorAtualFiltro;
            }

            // 4. Filtrar alunos combinando todos os critérios
            const alunosFiltrados = data.filter(aluno => {
                const anoAluno = obterAnoDoRegistro(aluno);
                
                const matchesAno = !anoSelecionado || (anoAluno && anoAluno.toString() === anoSelecionado);
                const matchesEscola = !escola || aluno.escola === escola;
                const matchesModalidade = !modalidade || aluno.modalidade === modalidade;
                const matchesTurma = !turma || aluno.turma === turma;
                const matchesPeriodo = !periodo || aluno.periodo === periodo;

                return matchesAno && matchesEscola && matchesModalidade && matchesTurma && matchesPeriodo;
            });

            if (alunosFiltrados.length === 0) {
                tabela.innerHTML = "<p>Nenhum aluno encontrado com os filtros selecionados.</p>";
                loader.style.display = 'none';
                return;
            }

            // Ordenar por nome de aluno
            alunosFiltrados.sort((a, b) => {
                const nomeA = a.aluno || "";
                const nomeB = b.aluno || "";
                return nomeA.localeCompare(nomeB);
            });

            let totalAlunos = alunosFiltrados.length;
            loader.style.display = 'none';

            let html = `
                <p><strong>Total de alunos encontrados: ${totalAlunos}</strong></p>
                <table>
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Gênero</th>
                            <th>Data Nasc.</th>
                            <th>Peso (kg)</th>
                            <th>Altura (m)</th>
                            <th>Professor</th>
                            <th>Data/Hora Registro</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            alunosFiltrados.forEach(aluno => {
                html += `
                    <tr>
                        <td style="font-weight: 500;">${aluno.aluno || ""}</td>
                        <td>${aluno.genero || ""}</td>
                        <td>${formatarDataISOParaBrasileiro(aluno.nascimento)}</td>
                        <td>${aluno.peso || ""}</td>
                        <td>${aluno.altura || ""}</td>
                        <td>${aluno.professor || ""}</td>
                        <td>${formatarDataHoraISO(aluno.data)}</td>
                    </tr>
                `;
            });

            html += "</tbody></table>";
            tabela.innerHTML = html;
        })
        .catch(err => {
            console.error("Erro ao buscar relatório:", err);
            tabela.innerHTML = "<p>Erro ao carregar os dados. Verifique sua conexão.</p>";
            loader.style.display = 'none';
        });
}

function imprimirRelatorio() {
    window.print();
}
