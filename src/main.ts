import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const logger = new Logger('Main-Gateway');
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService); // Obtiene ConfigService

  app.enableCors({
    origin: ['http://localhost:4300', 'https://dinokids.com', '*'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Configuración de Swagger (opcional)
  const config = new DocumentBuilder()
    .setTitle('APIS DOCUMENTATION')
    .setDescription("Documentation API's DINOKIDS")
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(configService.get<number>('PORT', 3000));  // Si PORT no existe, usa 3000
  logger.log(`Gateway running on port ${configService.get<number>('PORT')}`);
}
void bootstrap();