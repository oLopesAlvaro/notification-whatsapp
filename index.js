const express = require("express");
const axios = require("axios");
const fs = require("fs");

const app = express();
app.use(express.json());

const WAHA_URL = process.env.WAHA_URL || "http://localhost:9060";
const API_KEY = process.env.WAHA_API_KEY || "minhachave123";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const gerarMensagem = (dados) => {
  return `⚠️ *AVISO IMPORTANTE: INSCRIÇÃO PENDENTE - FORTNITE*

Olá, *${dados.nome}*!

Notamos que você ainda não realizou o seu cadastro para a modalidade *FORTNITE* obrigatório na plataforma **Battlefy**. Sem essa etapa, sua participação não poderá ser confirmada.

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

// --- FUNÇÃO PARA SIMULAR COMPORTAMENTO HUMANO ---

const enviarMensagemComSimulacao = async (chatId, texto) => {
  const config = { headers: { "X-Api-Key": API_KEY } };
  const payloadBase = { chatId, session: "default" };

  // 1. Envia "Visto" (Mark as Seen)
  await axios.post(`${WAHA_URL}/api/sendSeen`, payloadBase, config);

  // 2. Inicia "Digitando..."
  await axios.post(`${WAHA_URL}/api/startTyping`, payloadBase, config);

  // 3. Aguarda um tempo proporcional ao tamanho do texto (simulando escrita)
  // Mínimo de 3 segundos, máximo de 7 segundos para essa mensagem
  const minDigita = 60000;
  const maxDigita = 120000;
  const tempoDigitando =
    Math.floor(Math.random() * (maxDigita - minDigita + 1)) + minDigita;

  console.log(
    `|-> Simulando digitação por ${(tempoDigitando / 1000).toFixed(
      1
    )} segundos...`
  );
  await delay(tempoDigitando);

  // 4. Para de digitar
  await axios.post(`${WAHA_URL}/api/stopTyping`, payloadBase, config);

  // 5. Envia o texto final
  return axios.post(
    `${WAHA_URL}/api/sendText`,
    { ...payloadBase, text: texto },
    config
  );
};

app.get("/disparar-convites", async (req, res) => {
  try {
    const dados = JSON.parse(fs.readFileSync("./jogadores.json", "utf8"));
    let logs = [];
    let count = 0;

    for (const jogador of dados) {
      try {
        const min = 3000; // 1 minuto
        const max = 6000; // 2 minutos
        const tempoEspera = Math.floor(Math.random() * (max - min + 1)) + min;
        const chatId = `55${jogador.numero}@c.us`;

        console.log(`\n[${count + 1}] Processando: ${jogador.nome}`);
        console.log(
          `Aguardando ${(tempoEspera / 1000).toFixed(1)}s de intervalo...`
        );

        await delay(tempoEspera);

        // Chama a nova função com simulação
        await enviarMensagemComSimulacao(chatId, gerarMensagem(jogador));

        console.log(`✅ Enviado para ${jogador.nome}`);
        logs.push({ numero: jogador.numero, status: "Enviado" });
        count++;
      } catch (err) {
        console.error(`❌ Erro ao enviar para ${jogador.numero}:`, err.message);
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
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
