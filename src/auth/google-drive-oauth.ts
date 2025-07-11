import { google } from 'googleapis';
import * as dotenv from 'dotenv';

dotenv.config(); // 👈 Carga variables desde .env

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLEDRIVE_CLIENT_ID,
  process.env.GOOGLEDRIVE_CLIENT_SECRET,
  process.env.GOOGLEDRIVE_REDIRECT_URI,
);

const scopes = ['https://www.googleapis.com/auth/drive.file'];

async function getTokens(code: string) {
  const { tokens } = await oauth2Client.getToken(code);
  console.log('Tokens obtenidos:', tokens);
}

(async () => {
  const args = process.argv.slice(2);
  
  if (args[0]) {
    try {
      await getTokens(args[0]);
      console.log('✅ Proceso terminado');
    } catch (err) {
      console.error('❌ Error al obtener tokens:', err);
    }
  } else {
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
    });
    console.log('🔗 Ve a esta URL y autoriza la app:\n', url);
  }
})();
