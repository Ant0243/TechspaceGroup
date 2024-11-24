const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const cheerio = require('cheerio');

const app = express();
const PORT = 3000;

app.use(bodyParser.json()); // Pour traiter le JSON envoyé

// Endpoint pour recevoir les données
app.post('/update-data', (req, res) => {
  const { message, nom } = req.body;

  if (!message || !nom) {
    return res.status(400).send('Tous les champs sont requis');
  }

  // Lire le fichier HTML
  fs.readFile('../Accueil.html', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Erreur serveur lors de la lecture du fichier HTML');
    }

    // Charger le fichier HTML avec cheerio
    const $ = cheerio.load(data);

    // Ajouter le message
    $('#messages').append(`<div><strong>${nom} :</strong> ${message}</div>`);

    // Écrire les modifications dans le fichier HTML
    fs.writeFile('../Accueil.html', $.html(), (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Erreur serveur lors de l\'écriture du fichier HTML');
      }

      console.log(`Message bien ajouté : ${message}`);
      res.status(200).send('Réponse bien envoyée !');
    });
  });
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});