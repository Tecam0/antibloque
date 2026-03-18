const express = require('express');
const { createServer } = require('http');
const path = require('path');
const { ultravioletPath } = require('@titaniumnetwork-dev/ultraviolet');

const app = express();
const server = createServer();

// L'astuce majeure : Servir les fichiers système Ultraviolet (Service Worker) au niveau racine
app.use(express.static(ultravioletPath));

// Dossier public qui contient le frontend (index.html)
app.use(express.static(path.join(__dirname, 'public')));

// Fallback: Redirige toutes les requêtes directes vers la page d'accueil
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Nous utilisons une fonction asynchrone pour charger l'API BareServerNode (ESM module récent)
async function start() {
    const { createBareServer } = await import('@tomphttp/bare-server-node');
    const bareServer = createBareServer('/bare/');

    // Redirige les requêtes web standards
    server.on('request', (req, res) => {
        if (bareServer.shouldRoute(req)) {
            bareServer.routeRequest(req, res);
        } else {
            app(req, res);
        }
    });

    // Redirige les websockets (Hyper important pour les jeux multi comme Roblox ou Krunker)
    server.on('upgrade', (req, socket, head) => {
        if (bareServer.shouldRoute(req)) {
            bareServer.routeUpgrade(req, socket, head);
        } else {
            socket.end();
        }
    });

    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
        console.log(`\n========================================`);
        console.log(`🛡️ Nexus Proxy (Moteur Ultraviolet Actif !)`);
        console.log(`🚀 Bare Server en écoute sur le port : ${PORT}`);
        console.log(`========================================\n`);
    });
}

// Lancement du système complet
start();
