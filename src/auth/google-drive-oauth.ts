import * as http from 'http';
import { google } from 'googleapis';
import { envs } from '../config/evns';

// ejecutar npx ts-node src/auth/google-drive-oauth.ts
const oauth2Client = new google.auth.OAuth2(
  envs.googledriveClientId,
  envs.googledriveClientSecret,
  'http://localhost:3000',
);

const scopes = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/gmail.send',
];


const url = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  prompt: 'consent',
  scope: scopes,
});

console.log('🔗 Ve a esta URL y autoriza la app:\n', url);

// eslint-disable-next-line @typescript-eslint/no-misused-promises
http.createServer(async (req, res) => {
  if (!req.url) return;

  const urlParams = new URL(req.url, 'http://localhost');
  const code = urlParams.searchParams.get('code');

  if (code) {
    try {
      const { tokens } = await oauth2Client.getToken(code);
      console.log('✅ Tokens obtenidos:', tokens);

      oauth2Client.setCredentials(tokens);

      res.end('Autenticación completada. Ya puedes cerrar esta ventana.');
    } catch (err) {
      console.error('❌ Error al obtener tokens:', err);
      res.end('Error al autenticar.');
    }
  } else {
    res.end('No se encontró code.');
  }
}).listen(3000, () => {
  console.log('🌍 Servidor escuchando en http://localhost:3000');
});
