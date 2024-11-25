const express = require('express');
const fs = require('fs').promises;
const util = require('util');
const cors = require('cors');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const writeFileAsync = util.promisify(fs.writeFile);
const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Configuration de Nodemailer
// Configuration de Nodemailer pour envoyer des emails
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'techspacegroupfr@gmail.com',
        pass: 'wlwk coag lvib vfcq'
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Fonction pour envoyer un email de vérification
const sendVerificationEmail = (email, token) => {
    const verificationLink = `http://localhost:${PORT}/verify?token=${token}`;
    mailOptions = {
        from: '"Mon App" <techspacegroupfr@gmail.com>',
                to: email,
                subject: 'Vérification de votre compte',
                text: `Cliquez sur le lien pour vérifier votre compte : ${verificationLink}`,
                html: `<p>Cliquez sur le lien pour vérifier votre compte : <a href="${verificationLink}">${verificationLink}</a></p>`
    }
    console.log('Tentative d\'envoi d\'email...');
    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.error('Erreur détaillée :', err);
            return res.status(500).json({ error: 'Erreur lors de l\'envoi de l\'email.' });
        }
        console.log('Email envoyé avec succès :', info);
        res.status(201).json({ message: 'Utilisateur enregistré avec succès.' });
    });
};

// Route pour l'inscription
app.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        console.log('Requête reçue:', { username, email });

        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Tous les champs sont requis.' });
        }

        // Lecture des comptes existants
        const data = await fs.readFile('accounts.json', 'utf8');
        const accounts = data ? JSON.parse(data) : [];

        // Vérification des doublons
        if (accounts.some(acc => acc.username === username || acc.email === email)) {
            return res.status(400).json({ error: 'Email ou pseudo déjà utilisé.' });
        }

        // Création de l'utilisateur
        const token = crypto.randomBytes(32).toString('hex');
        const newUser = { username, email, password, token };
        accounts.push(newUser);

        // Sauvegarde dans le fichier
        await fs.writeFile('accounts.json', JSON.stringify(accounts, null, 2));

        // Configuration de l'email
        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: 'Vérification de votre compte',
            text: `Bienvenue ! Cliquez sur le lien pour vérifier votre compte : http://localhost:3000/verify?token=${token}`
        };

        // Envoi de l'email
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error('Erreur lors de l\'envoi de l\'email:', err);
                return res.status(500).json({ error: 'Erreur lors de l\'envoi de l\'email.' });
            }
            console.log('Email envoyé:', info.response);
            res.status(201).json({ message: 'Utilisateur enregistré. Vérifiez votre email.' });
        });
    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ error: 'Erreur interne du serveur.' });
    }
});

// Route pour vérifier un compte
app.get('/verify', (req, res) => {
    const { token } = req.query;

    if (!token) {
        return res.status(400).send('Token de vérification manquant.');
    }

    // Lecture du fichier accounts.json
    fs.readFile('accounts.json', 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Erreur lors de la lecture du fichier.');
        }

        const accounts = JSON.parse(data);
        const user = accounts.find(account => account.token === token);

        if (!user) {
            return res.status(400).send('Token de vérification invalide.');
        }

        // Suppression du token après vérification
        user.token = null;

        writeFileAsync('accounts.json', JSON.stringify(accounts, null, 2), (err) => {
            if (err) {
                return res.status(500).send('Erreur lors de la mise à jour du fichier.');
            }

            res.send('Compte vérifié avec succès !');
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

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});