const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();

const PORT = 3000;

app.use(cors());
app.use(express.json());

app.post('/save-user', (req, res) => {
    console.log(`Une requête est demandée dans le /save-user !`)

    const { username, email, password } = req.body;
    const newUser = { username, email, password };

    fs.readFile('accounts.json', 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Erreur lors de la lecture du fichier.' });

        const accounts = data ? JSON.parse(data) : [];
        accounts.push(newUser);

        fs.writeFile('accounts.json', JSON.stringify(accounts, null, 2), (err) => {
            if (err) return res.status(500).json({ error: 'Erreur lors de l\'enregistrement.' });
            res.status(201).json({ message: 'Utilisateur enregistré avec succès !' });
        });
    });
});

app.post('/login', (req, res) => {
    console.log(`Tentative de connexion...`);

    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Tous les champs sont requis.' });
    }

    fs.readFile('accounts.json', 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Erreur lors de la lecture du fichier.' });
        }

        const accounts = data ? JSON.parse(data) : [];
        const user = accounts.find(u => u.username === username && u.password === password);

        if (user) {
            res.status(200).json({ success: true, message: 'Connexion réussie.' });
        } else {
            res.status(401).json({ success: false, message: 'Nom d’utilisateur ou mot de passe incorrect.' });
        }
    });
});

app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});