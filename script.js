const scriptURL = "https://script.google.com/macros/s/AKfycbxRMpd8m9M2o4_kCX_FpBeIGRrdaXMuvcGEFgjNJRXoBG-TQM_RFK1gUswgH97N9hNQow/exec";
const form = document.getElementById('formulario');
const mensagem = document.getElementById('mensagem');
const escolaSelect = document.getElementById("escola");
const modalidadeSelect = document.getElementById("modalidade");
const turmaSelect = document.getElementById("turma");
let alunosCadastradosSessao = [];

const turmasPorModalidade = {
    "Ed. Infantil": [
        "Maternal A", "Maternal B", "Maternal A INTEGRAL", "Maternal B INTEGRAL",
        "Jardim I A", "Jardim I B", "Jardim II A", "Jardim II B", "Jardim I B INTEGRAL", "Jardim II B INTEGRAL",
        "Pré I A", "Pré I B", "Pré II A", "Pré II B",
        "Pré I A INTEGRAL", "Pré II A INTEGRAL", "Pré I B INTEGRAL", "Pré II B INTEGRAL",
        "INTEGRALG2 E G3", "INTEGRALG4 E G5"
    ],
    "Fund. 1": [
        "1º I", "1º II", "1º III", "2º I", "2º II", "2º III",
        "3º I", "3º II", "3º III", "4º I", "4º II", "4º III",
        "5º I", "5º II", "5º III", "1° INTEGRAL", "2° INTEGRAL", "3° INTEGRAL",
        "4° INTEGRAL", "5° INTEGRAL", "INTEGRAL1° E 2°", "INTEGRAL2° E 3°", "INTEGRAL4° E 5°"
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
    loader.style.display = "block"; // Mostra o loader

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
        <p><strong>Alunos cadastrados nesta sessão:</strong></p>
        <ul>${lista}</ul>
    `;
}

// Atualiza a modalidade no RELATÓRIO com base na escola selecionada
function atualizarModalidadeRelatorio() {
    const escola = document.getElementById("filtroEscola").value;
    const modalidadeSelect = document.getElementById("filtroModalidade");
    modalidadeSelect.innerHTML = "";

    if (escola.startsWith("CEI")) {
        const option = document.createElement("option");
        option.value = "Ed. Infantil";
        option.textContent = "Ed. Infantil";
        modalidadeSelect.appendChild(option);
    } else {
        ["Fund. 1", "Fund. 2"].forEach(valor => {
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
    const turmas = turmasPorModalidade[modalidade] || [];

    turmaSelect.innerHTML = "";
    turmas.forEach(turma => {
        const option = document.createElement("option");
        option.value = turma;
        option.textContent = turma;
        turmaSelect.appendChild(option);
    });
}

// Função chamada ao clicar no botão "Relatório"
function abrirRelatorio() {
    document.getElementById("formulario").style.display = "none";
    document.getElementById("painelRelatorio").style.display = "block";

    // Carrega as opções de escolas copiando do formulário principal
    const escolaSelect = document.getElementById("filtroEscola");
    escolaSelect.innerHTML = document.getElementById("escola").innerHTML;

    // Remove event listeners antigos (caso usuário volte várias vezes)
    escolaSelect.replaceWith(escolaSelect.cloneNode(true));
    document.getElementById("filtroModalidade").replaceWith(document.getElementById("filtroModalidade").cloneNode(true));

    // Reatribui os elementos clonados
    const novoEscolaSelect = document.getElementById("filtroEscola");
    const novoModalidadeSelect = document.getElementById("filtroModalidade");

    // Adiciona os listeners atualizados
    novoEscolaSelect.addEventListener("change", atualizarModalidadeRelatorio);
    novoModalidadeSelect.addEventListener("change", atualizarTurmasRelatorio);

    // Dispara evento inicial para popular os filtros corretamente
    novoEscolaSelect.dispatchEvent(new Event("change"));
    const filtroPeriodo = document.getElementById("filtroPeriodo");
    // Assumindo que filtroPeriodo seja um select com opções fixas, não precisa copiar opções dinâmicas
}



    


function voltarAoFormulario() {
    document.getElementById("painelRelatorio").style.display = "none";
    document.getElementById("formulario").style.display = "block";
}
function formatarData(dataString) {
    if (!dataString) return "";

    const data = new Date(dataString);
    if (isNaN(data.getTime())) return dataString; // Se não for data válida, retorna original

    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();

    return `${dia}/${mes}/${ano}`;
}


function buscarRelatorio() {
    const escola = document.getElementById("filtroEscola").value;
    const modalidade = document.getElementById("filtroModalidade").value;
    const turma = document.getElementById("filtroTurma").value.trim();
    const periodo = document.getElementById("filtroPeriodo").value;
    const loader = document.getElementById('loader1');
    const tabela = document.getElementById('tabelaRelatorio');

    loader.style.display = 'flex'; // Mostra o loader
    tabela.innerHTML = ''; // Limpa a tabela

        
    function formatarDataISOParaBrasileiro(dataISO) {
        const data = new Date(dataISO);
        const dia = String(data.getDate()).padStart(2, '0');
        const mes = String(data.getMonth() + 1).padStart(2, '0');
        const ano = data.getFullYear();
        return `${dia}/${mes}/${ano}`;
        }

    function formatarDataHoraISO(dataISO) {
            const data = new Date(dataISO);
            const dia = String(data.getDate()).padStart(2, '0');
            const mes = String(data.getMonth() + 1).padStart(2, '0');
            const ano = data.getFullYear();
            const horas = String(data.getHours()).padStart(2, '0');
            const minutos = String(data.getMinutes()).padStart(2, '0');
            return `${dia}/${mes}/${ano} ${horas}:${minutos}`;
        }


    fetch(`${scriptURL}?action=read`)
        .then(res => res.json())
        .then(data => {
            const alunosFiltrados = data.filter(aluno =>
                (!escola || aluno.escola === escola) &&
                (!modalidade || aluno.modalidade === modalidade) &&
                (!turma || aluno.turma === turma) &&
                (!periodo || aluno.periodo === periodo)
            );

            if (alunosFiltrados.length === 0) {
                document.getElementById("tabelaRelatorio").innerHTML = "<p>Nenhum aluno encontrado com os filtros selecionados.</p>";
                loader.style.display = 'none'; // oculta loader
                return;
            }
            alunosFiltrados.sort((a, b) => a.aluno.localeCompare(b.aluno)); // Ordenar por nome
           let totalAlunos = alunosFiltrados.length;
                loader.style.display = 'none'; // oculta loader
            let html = `
                <p><strong>Total de alunos encontrados: ${totalAlunos}</strong></p>
                <table border="1" cellpadding="5" style="width:100%; border-collapse: collapse;">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Gênero</th>
                            <th>Data Nasc.</th>
                            <th>Peso</th>
                            <th>Altura</th>
                            <th>Professor</th>
                            <th>Data/Hora</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            
            alunosFiltrados.forEach(aluno => {
                html += `
                    <tr>
                        <td>${aluno.aluno}</td>
                        <td>${aluno.genero}</td>
                        <td>${formatarDataISOParaBrasileiro(aluno.nascimento)}</td>
                        <td>${aluno.peso}</td>
                        <td>${aluno.altura}</td>
                        <td>${aluno.professor}</td>
                        <td>${formatarDataHoraISO(aluno.data)}</td>
                    </tr>
                `;

            });

            html += "</tbody></table>";
            document.getElementById("tabelaRelatorio").innerHTML = html;
        })
        .catch(err => {
            console.error("Erro ao buscar relatório:", err);
            document.getElementById("tabelaRelatorio").innerHTML = "<p>Erro ao carregar os dados.</p>";
        });
}

function imprimirRelatorio() {
    const conteudo = document.getElementById("tabelaRelatorio").innerHTML;
    const janela = window.open("", "_blank");
    janela.document.write(`<html><head><title>Relatório de Alunos</title></head><body>${conteudo}</body></html>`);
    janela.document.close();
    janela.print();
}



