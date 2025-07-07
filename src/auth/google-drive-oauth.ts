import { google } from 'googleapis';
import { envs } from '../config/evns';


// npx ts-node src/auth/google-drive-oauth.ts
// ejecutar eso

// http://localhost/?code=4/0AVMBsJgsRT-aS8Eap74MNFARPtixXruHe68CWv7Ud0PkpCi0-4JZIZh4i8trAyZZqKVwhw&scope=https://www.googleapis.com/auth/drive.file
// respondera algo asi 

// npx ts-node src/auth/google-drive-oauth.ts "4/0AVMBsJgsRT-aS8Eap74MNFARPtixXruHe68CWv7Ud0PkpCi0-4JZIZh4i8trAyZZqKVwhw"
// ejecutar asi el code 
// cambiar las variables .env 

const oauth2Client = new google.auth.OAuth2(
  envs.googledriveClientId,
  envs.googledriveClientSecret,
  envs.googledriveRedirectUri,
);

const scopes = ['https://www.googleapis.com/auth/drive.file'];
// Luego, después de autorizar, copia el código y úsalo aquí para obtener tokens
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
