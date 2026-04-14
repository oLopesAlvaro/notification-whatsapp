const express = require("express");
const axios = require("axios");
const fs = require("fs");

const app = express();
app.use(express.json());

const WAHA_URL = process.env.WAHA_URL || "http://localhost:9060";

// --- NOVA FUNÇÃO DE AUXÍLIO ---
// Cria uma promessa que resolve após 'ms' milissegundos
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// const gerarMensagem = (dados) => {
//   return `🎮 *Bem-vindo(a) ao IV UniEvangélica Esports!*
// Olá, *${dados.nome}*,

// Seja muito bem-vindo(a) à 4ª edição do Esports UniEvangélica! É um prazer ter você conosco na maior competição de esportes eletrônicos da nossa instituição.

// Informamos que recebemos sua inscrição na modalidade *${dados.modalidade.toUpperCase()}* e, após nossa análise técnica, ela foi pré-validada. Agora, para garantir oficialmente a sua vaga e a sua presença nas chaves do torneio, precisamos da sua confirmação final através das etapas abaixo.

// 1️⃣ *Cadastro no Battlefy (Obrigatório)*
// O gerenciamento das tabelas e resultados será feito via Battlefy. Realize o cadastro do seu perfil ou do seu time no link abaixo:
// 🔗 Link da Modalidade: ${dados.linkBattlefy}

// Dúvidas no cadastro? Em anexo a esta mensagem, enviamos um PDF Passo a Passo. Ele contém o guia visual para você não errar nada, especialmente na criação e convite de membros para o seu time (em caso de modalidades coletivas).

// 2️⃣ *Canais de Comunicação Oficial*
// A entrada em nossas comunidades é obrigatória para suporte e atualizações em tempo real:

// Discord (Coordenação e Suporte): https://discord.gg/yEtTMjPW

// WhatsApp (Comunidade de Avisos): ${dados.linkWhats}

// 🛠️ *Precisa de ajuda ou quer tratar das ressalvas?*
// Caso encontre qualquer dificuldade no cadastro ou precise de auxílio com as observações citadas acima, entre em contato imediatamente com nossa equipe via Discord ou através dos administradores do WhatsApp. Estamos aqui para ajudar você a entrar no servidor sem problemas!
// ⚠️ *PRAZO FINAL:*
// Todas as etapas devem ser concluídas até o dia *12/04/2026 às 23:59*. Inscrições sem vínculo no Battlefy ou fora dos canais oficiais após esse prazo serão desclassificadas para a entrada da lista de espera.

// Prepare seus equipamentos e boa sorte!

// Atenciosamente,

// *Comissão Organizadora*
// *IV Esports UniEvangélica*`;
// };

const gerarMensagem = (dados) => {
  return `⚠️ *AVISO IMPORTANTE: INSCRIÇÃO PENDENTE - FORTNITE*

Olá, *${dados.nome}*!

Notamos que você ainda não realizou o seu cadastro obrigatório na plataforma **Battlefy**. Sem essa etapa, sua participação não poderá ser confirmada.

🔗 *Link para Cadastro (Battlefy):* ${dados.linkBattlefy}

⏰ *PRAZO FINAL:* O cadastro deve ser concluído **HOJE (14/04) até às 23:59**.

📢 *Canais de Comunicação (Obrigatórios)*
É essencial que você esteja em nossos canais oficiais para receber as tabelas e suporte em tempo real. Se tiver qualquer problema com o cadastro, fale conosco por lá:

✅ *Grupo do WhatsApp (Obrigatório):* ${dados.linkWhats}

👾 *Discord de Suporte:* https://discord.gg/KGMrkqBy

*Por que fazer isso agora?*
O Battlefy é nossa ferramenta oficial de chaves. Sem o vínculo do seu perfil no link acima até o final do dia, você ficará de fora dos jogos deste **sábado (18/04)**.

Não deixe para a última hora! Garanta sua vaga agora. 🎮🏆`;
};

app.get("/disparar-convites", async (req, res) => {
  try {
    const dados = JSON.parse(fs.readFileSync("./jogadores.json", "utf8"));
    let logs = [];
    let count = 0;

    for (const jogador of dados) {
      try {
        // --- ADIÇÃO DA ALEATORIEDADE ---
        // Define os limites em milissegundos
        const min = 60000; // 1 minuto
        const max = 120000; // 2 minutos

        console.log(`Convite ${count + 1}`);

        // Gera um tempo aleatório entre 60.000ms e 120.000ms
        const tempoEspera = Math.floor(Math.random() * (max - min + 1)) + min;

        console.log(
          `Aguardando ${(tempoEspera / 1000).toFixed(
            1
          )} segundos antes de enviar para ${jogador.nome}...`
        );

        await delay(tempoEspera);

        await axios.post(
          `${WAHA_URL}/api/sendText`,
          {
            chatId: `55${jogador.numero}@c.us`,
            text: gerarMensagem(jogador),
            session: "default",
          },
          {
            headers: {
              "X-Api-Key": process.env.WAHA_API_KEY || "minhachave123",
            },
          }
        );
        logs.push({ numero: jogador.numero, status: "Enviado" });
        count++;
      } catch (err) {
        logs.push({
          numero: jogador.numero,
          status: "Erro",
          erro: err.message,
        });
      }
    }

    res.json({
      message: "Processo de disparo finalizado",
      detalhes: logs,
      totalEnviados: count,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erro ao ler arquivo JSON ou processar disparos." });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor de Notificação rodando na porta ${PORT}`);
});
