import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
  PORT: number;
  JWT_SECRET: string;
  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;
  GOOGLEDRIVE_CLIENT_ID: string;
  GOOGLEDRIVE_CLIENT_SECRET: string;
  GOOGLEDRIVE_REDIRECT_URI:string;
  GOOGLEDRIVE_ACCESS_TOKEN:string;
  GOOGLEDRIVE_REFRESH_TOKEN:string;
  GOOGLE_SENDER_EMAIL:string;
}

const envsSchema = joi
  .object({
    PORT: joi.number().required(),
    JWT_SECRET: joi.string().required(),
    CLOUDINARY_CLOUD_NAME: joi.string().required(),
    CLOUDINARY_API_KEY: joi.string().required(),
    CLOUDINARY_API_SECRET: joi.string().required(),
    GOOGLEDRIVE_CLIENT_ID: joi.string().required(),
    GOOGLEDRIVE_CLIENT_SECRET: joi.string().required(),
    GOOGLEDRIVE_REDIRECT_URI: joi.string().required(),
    GOOGLEDRIVE_ACCESS_TOKEN: joi.string().required(),
    GOOGLEDRIVE_REFRESH_TOKEN: joi.string().required(),
    GOOGLE_SENDER_EMAIL: joi.string().required(),
  })
  .unknown(true);

const { error, value } = envsSchema.validate({
  ...process.env,
});

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const envVars: EnvVars = value;

export const envs = {
  port: envVars.PORT,
  jwtSecret: envVars.JWT_SECRET,
  cloudinaryCloudName: envVars.CLOUDINARY_CLOUD_NAME,
  cloudinaryApiKey: envVars.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: envVars.CLOUDINARY_API_SECRET,
  googledriveClientId: envVars.GOOGLEDRIVE_CLIENT_ID,
  googledriveClientSecret: envVars.GOOGLEDRIVE_CLIENT_SECRET,
  googledriveRedirectUri: envVars.GOOGLEDRIVE_REDIRECT_URI,
  googledriveAccessToken: envVars.GOOGLEDRIVE_ACCESS_TOKEN,
  googledriveRefreshToken: envVars.GOOGLEDRIVE_REFRESH_TOKEN,
  googleSenderEmail: envVars.GOOGLE_SENDER_EMAIL,
};