const express = require("express");
const axios = require("axios");
const fs = require("fs");

const app = express();
app.use(express.json());

const WAHA_URL = process.env.WAHA_URL || "http://localhost:9060";

// Função para formatar a mensagem personalizada
const gerarMensagem = (dados) => {
  return `🎮 *Bem-vindo(a) ao IV UniEvangélica Esports!*
Olá, *${dados.nome}*,

Seja muito bem-vindo(a) à 4ª edição do Esports UniEvangélica! É um prazer ter você conosco na maior competição de esportes eletrônicos da nossa instituição.

Informamos que recebemos sua inscrição para a equipe *${
    dados.equipe
  }* na modalidade *${dados.modalidade.toUpperCase()}* e, após nossa análise técnica, ela foi pré-validada. Agora, para garantir oficialmente a sua vaga e a sua presença nas chaves do torneio, precisamos da sua confirmação final através das etapas abaixo.

1️⃣ *Cadastro no Battlefy (Obrigatório)*
O gerenciamento das tabelas e resultados será feito via Battlefy. Realize o cadastro do seu perfil ou do seu time no link abaixo:
🔗 Link da Modalidade: ${dados.linkBattlefy}

Dúvidas no cadastro? Em anexo a esta mensagem, enviamos um PDF Passo a Passo. Ele contém o guia visual para você não errar nada, especialmente na criação e convite de membros para o seu time (em caso de modalidades coletivas).

2️⃣ *Canais de Comunicação Oficial*
A entrada em nossas comunidades é obrigatória para suporte e atualizações em tempo real:

Discord (Coordenação e Suporte): https://discord.gg/yEtTMjPW

WhatsApp (Comunidade de Avisos): ${dados.linkWhats}

🛠️ *Precisa de ajuda ou quer tratar das ressalvas?*
Caso encontre qualquer dificuldade no cadastro ou precise de auxílio com as observações citadas acima, entre em contato imediatamente com nossa equipe via Discord ou através dos administradores do WhatsApp. Estamos aqui para ajudar você a entrar no servidor sem problemas!

⚠️ *PRAZO FINAL:*
Todas as etapas devem ser concluídas até o dia *12/04/2026 às 23:59*. Inscrições sem vínculo no Battlefy ou fora dos canais oficiais após esse prazo serão desclassificadas para a entrada da lista de espera.

Prepare seus equipamentos e boa sorte!

Atenciosamente,

*Comissão Organizadora*
*IV Esports UniEvangélica*`;
};
// Rota para disparar as mensagens para todo o JSON
app.get("/disparar-convites", async (req, res) => {
  try {
    const dados = JSON.parse(fs.readFileSync("./jogadores.json", "utf8"));
    let logs = [];

    for (const jogador of dados) {
      try {
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
      } catch (err) {
        logs.push({
          numero: jogador.numero,
          status: "Erro",
          erro: err.message,
        });
      }
    }

    res.json({ message: "Processo de disparo finalizado", detalhes: logs });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erro ao ler arquivo JSON ou processar disparos." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor de Notificação rodando na porta ${PORT}`);
});
