import { TDocumentDefinitions } from 'pdfmake/interfaces';
import * as fs from 'fs';
import * as path from 'path';
import * as pdfMake from 'pdfmake/build/pdfmake';
import { InscriptionType } from '@/modules/inscription/entities/inscription.entity';

import { es } from 'date-fns/locale';
import { format } from 'date-fns';

const fontPath = path.join(process.cwd(), 'dist/assets');

export function buildInscriptionTemplate(inscription: InscriptionType): Promise<Buffer> {

  const logoPath = path.join(fontPath, 'logo.png');
  const logoBase64 = fs.existsSync(logoPath)
    ? fs.readFileSync(logoPath).toString('base64')
    : null;

  const content: TDocumentDefinitions['content'] = [
    {
      margin: [0, 30, 5, 0],
      layout: 'noBorders',
      table: {
        widths: ['*'], // Solo una columna para centrar el texto
        body: [
          [
            {
              margin: [0, 0, 0, 0],
              text: 'CONTRATO PRIVADO DE PRESTACIÓN DE SERVICIOS EDUCATIVOS DEL PROGRAMA DINO CONDUCTUAL DE DINO KIDS',
              fontSize: 12,
              alignment: 'center', // Centramos el texto
              bold: true,
            },
          ],
        ],
      },
    },
    ...(logoBase64
      ? [
        {
          image: `data:image/png;base64,${logoBase64}`,
          width: 100,
          absolutePosition: { x: 450, y: 30 },
          margin: [0, 0, 0, 0] as [number, number, number, number],
        },
      ]
      : []),
    {
      margin: [0, 30, 5, 0],
      layout: 'noBorders',
      table: {
        widths: ['*', '20%'],
        body: [
          [
            {
              text: 'Correspondiente este documento al número de cliente:',
              style: 'stylePagrafer',
            },
            {
              text: 'Cod: 14151617',
              style: 'stylePagrafer',
            },
          ],
        ],
      },
    },
    {
      text: [
        { text: 'PRIMERA: PARTES CONTRATANTES.- ', bold: true },
        { text: 'El presente contrato se celebra entre DINO KIDS, centro psicopedagógico legalmente constituido en Bolivia, ubicado en Calle Batallón Colorados, Edificio Batallón Colorados, Planta Baja Oficina 4, en adelante "EL CENTRO", y el padre/madre/tutor del niño(a) identificado en la cláusula tercera, en adelante "EL REPRESENTANTE", quien suscribe el presente contrato en su calidad de responsable legal del menor.' },
      ],
      style: 'stylePagrafer',
      alignment: 'justify',
    },
    {
      text: [
        { text: 'SEGUNDA: OBJETO DEL CONTRATO.- ', bold: true },
        { text: 'Mediante el presente, EL CENTRO se obliga a prestar servicios especializados dentro del programa DINO CONDUCTUAL, un programa anual integral diseñado para niños y adolescentes con trastornos del neurodesarrollo, tales como AUTISMO, Trastorno por Déficit de Atención e Hiperactividad (TDAH), Trastornos del Desarrollo del Lenguaje, Síndrome de Down,  Dificultades de Aprendizaje Específicos (Dislexia, Discalculia, Dislalia, Disortografía y Disgrafía), Trastornos Conductuales, Discapacidades (Intelectual, Auditiva, Visual y Motora), Parálisis Cerebral Infantil, entre otros.' },
      ],
      style: 'stylePagrafer',
      alignment: 'justify',
    },
    {
      text: 'TERCERA: IDENTIFICACIÓN DEL BENEFICIARIO',
      style: 'stylePagrafer',
      bold: true,
      alignment: 'justify',
    },
    {
      text: [
        { text: 'Nombre del niño(a):' },
        { text: `${inscription.student?.user.name} ${inscription.student?.user.name}` },
      ],
      style: 'stylePagrafer',
      alignment: 'justify',
    },
    {
      text: [
        { text: 'Fecha de nacimiento:' },
        { text: `${format(new Date(inscription.student!.birthdate), 'dd-MMMM-yyyy', { locale: es })}` },
      ],
      style: 'stylePagrafer',
      alignment: 'justify',
    },
    {
      text: [
        { text: 'Nombre del padre/madre/tutor:' },
        { text: `${inscription.student?.tutors![0].user.name} ${inscription.student?.tutors![0].user.lastName}` },
      ],
      style: 'stylePagrafer',
      alignment: 'justify',
    },
    {
      text: [
        { text: 'Cédula de identidad:' },
        { text: `${inscription.student?.user.numberDocument} ` },
      ],
      style: 'stylePagrafer',
      alignment: 'justify',
    },
    {
      text: [
        { text: 'Domicilio:' },
        { text: `${inscription.student?.tutors[0].user?.address?.city?.name} ${inscription.student?.tutors[0].user?.address?.zone} ${inscription.student?.tutors[0].user?.address?.detail} ` },
      ],
      style: 'stylePagrafer',
      alignment: 'justify',
    },
    {
      text: [
        { text: 'Teléfono de contacto:' },
        { text: `${inscription.student?.tutors?.[0]?.user?.phone?.[0] ?? 'Sin número'} ` },
      ],
      style: 'stylePagrafer',
      alignment: 'justify',
    },
    {
      text: [
        { text: 'CUARTA: DURACIÓN DEL CONTRATO.- ', bold: true },
        { text: 'El presente contrato tiene la vigencia de un (1) año, renovable automáticamente previo cumplimiento de las condiciones establecidas en este documento.' },
      ],
      style: 'stylePagrafer',
      alignment: 'justify',
    },



    {
      margin: [0, 20, 0, 0],
      text: [
        { text: 'Método de pago:', bold: true }, // Negrita solo para esta parte
        { text: '    Plan Mensual' }, // Texto normal
      ],
      style: 'stylePagrafer',
    },
    {
      margin: [0, 20, 0, 0],
      text: 'Los pagos se deben realizarse hasta el 5 de cada mes.',
    },
    {
      margin: [0, 20, 0, 0],
      table: {
        widths: ['*'],
        body: [
          [
            {
              text: '____________________',
              style: 'styleCenter',
            },
          ],
          [{
            margin: [0, -5, 0, 0],
            text: 'Firma del tutor principal', style: 'styleCenter'
          }],
          [{
            margin: [0, -5, 0, 0],
            text: `${inscription.student?.tutors![0].user.name} ${inscription.student?.tutors![0].user.lastName}`, style: 'styleCenter'
          }],
        ],
      },
      layout: 'noBorders',
    },
    { text: '', pageBreak: 'after' },
    {
      margin: [0, 0, 5, 0],
      layout: 'noBorders',
      table: {
        widths: ['30%', '*'],
        body: [
          [
            {
              table: {
                widths: ['*'],
                body: [
                  [
                    {
                      text: `DINO KIDS. 4758808011`,
                      alignment: 'justify',
                      fontSize: 9,
                      bold: true,
                    },
                  ],
                  [
                    {
                      text: `Calle Batallón Colorados`,
                      alignment: 'justify',
                      fontSize: 9,
                    },
                  ],
                  [
                    {
                      text: `Edificio Batallón Colorados Efic. 4`,
                      alignment: 'justify',
                      fontSize: 9,
                    },
                  ],
                  [
                    {
                      text: `www.dinokids.com.bo`,
                      alignment: 'justify',
                      fontSize: 9,
                      decoration: 'underline',
                    },
                  ],
                ],
              },
              layout: 'noBorders',
            },
            {
              table: {
                widths: ['*'],
                body: [
                  [
                    {
                      margin: [0, 0, 10, 0], // Ajustar el margen superior a 0 para alinear al tope
                      text: `Carta de compromiso`,
                      bold: true,
                      fontSize: 24,
                      alignment: 'right',
                      valign: 'top', // Alinear al tope
                    },
                  ],
                  [
                    {
                      margin: [0, 0, 10, 0], // Ajustar el margen superior a 0 para alinear al tope
                      text: `con el reglamento interno`,
                      bold: true,
                      fontSize: 24,
                      alignment: 'right',
                      valign: 'top', // Alinear al tope
                    },
                  ],
                ],
              },
              layout: 'noBorders',
            },
          ],
        ],
      },
    },

    {
      margin: [0, 10, 0, 0],
      text: `Yo ${inscription.student?.tutors![0].user.name} ${inscription.student?.tutors![0].user.lastName} con C.I: ${inscription.student?.tutors![0].user.numberDocument} Padre/Madre/Tutor del estudiante ${inscription.student?.user.name} ${inscription.student?.user.lastName}.`,
      style: 'stylePagrafer',
      alignment: 'justify',
    },
    {
      text: [
        { text: 'Quien desde la fecha forma parte del centro ' },
        { text: 'DINO KIDS', bold: true },
        { text: ' como inscrito. Con el proposito de garantizar el mejor desarrollo de las actividades dentro del centro, me comprometo a cumplir con los siguientes puntos con el fin de promover el proceso de reeducación al que accede el menor:' }, // Texto normal
      ],
      style: 'stylePagrafer',
      alignment: 'justify',
    },
    {
      text: '- Los tutores o padres de familia deberán portar la credencial al momento de dejar y recoger a su ninó de manera obligatoria',
      style: 'stylePagrafer',
      alignment: 'justify',
    },
    {
      text: '- De no portar la credencial la persona que lo recoja deberá portar su carnet de identidad tanto original como fotocopia y llenar un formulario donde nos brindará todos los datos solicitados en el momento con la finalidad de precautelar la seguridad de los niños.',
      style: 'stylePagrafer',
      alignment: 'justify',
    },
    {
      text: '- Ser puntual en el ingreso y salida de cada niño o niña dentro de las sesiones recibidas.',
      style: 'stylePagrafer',
      alignment: 'justify',
    },
    {
      text: [
        { text: '- No faltar a las sesiones programadas según el horario, leer el apartado 2.3. del Reglamento General Estudiantil ' },
        { text: 'DINO KIDS', bold: true }, // Negrita solo para esta parte
        { text: '. Considerando que la inasistencia a las sesiones entorpece el avance y progreso del niño o niña y retrocede el mismo alcanzado.' }, // Texto normal
      ],
      style: 'stylePagrafer',
      alignment: 'justify',
    },
    {
      text: '- los Permisos serán concedidos una vez al mes y el mismo podrá ser repuesto previa coordinación de horarios.',
      style: 'stylePagrafer',
      alignment: 'justify',
    },
    {
      text: '- En caso de permisos por enfermedad, el mismo debe ser respaldado para que las sesiones sean repuestas previa coordinación de días y horarios.',
      style: 'stylePagrafer',
      alignment: 'justify',
    },
    {
      text: '- No enviar alimentos al momento de participar en las sesiones o ingreso a aulas, savlo petición expresa de la educadora. Con el fin de mantener la higiene y seguridad dentro de las aulas.',
      style: 'stylePagrafer',
      alignment: 'justify',
    },
    {
      text: '- Pagar las mensualidades en las fechas indicadas, según el plan de pagos acordado con el asesor. De lo contrario se restringe el ingreso a las sesiones programadas.',
      style: 'stylePagrafer',
      alignment: 'justify',
    },

    {
      text: [
        { text: '- Fomentar el buen comportamiento de su niño dentro de las actividades del centro ' },
        { text: 'DINO KIDS', bold: true },
        { text: ', evitando así inconvenientes entre los miembros del centro ' },
        { text: 'DINO KIDS', bold: true },
        { text: ' y el resto del alumnado.' },
      ],
      style: 'stylePagrafer',
      alignment: 'justify',
    },
    {
      text: '- Formar parte de la Red de Apoyo que se formara entre, la educadora, la unidad educativa y el entorno familiar.',
      style: 'stylePagrafer',
      alignment: 'justify',
    },
    {
      text: '- Participar en las entrevistas programadas, para un buen seguimiento al desarrollo y progreso de su niño, así mismo, informar oportunamente de alguna observación respecto a las sesiones desarrolladas.',
      style: 'stylePagrafer',
      alignment: 'justify',
    },
    {
      text: '- Todo cambio de horario deberá ser solicitado y autorizado solo por el tutor o titular de la inscripción. Previo llenado y firma del Formulario correspondiente.',
      style: 'stylePagrafer',
      alignment: 'justify',
    },
    {
      text: '- Evitar interrumpir el desarrollo de las sesiones y metodologías empleadas dentro de las actividades del niño, ya que toda actividad estará siempre orientada hacia el respeto y desarrollo adecuado del niño.',
      style: 'stylePagrafer',
      alignment: 'justify',
    },
    {
      text: [
        { text: '- Bajo el cumplimiento de cada uno de los puntos existentes en el presente compromiso, el Centro ' },
        { text: 'DINO KIDS', bold: true },
        { text: ' ogrece los siguientes beneficios:' }, // Texto normal
      ],
      style: 'stylePagrafer',
      alignment: 'justify',
    },
    {
      text: [
        { text: '- Material didáctico exclusivo desarrollado por la línea de juegos y juguetes ' }, // Texto normal
        { text: 'DINO TOYS', bold: true },
        { text: '.' }, // Texto normal
      ],
      style: 'stylePagrafer',
      alignment: 'justify',
    },
    {
      text: '- Entrega de los informes de seguimiento y de avance den las fechas acordadas.',
      style: 'stylePagrafer',
      alignment: 'justify',
    },
    {
      text: [
        { text: '- En caso de ser solicitado el centro podrá emitir una carta de participación en el centro ' },
        { text: 'DINO KIDS', bold: true },
        { text: ' la misma podrá ser presentada en su unidad enducativa.' }, // Texto normal
      ],
      style: 'stylePagrafer',
      alignment: 'justify',
    },
    {
      text: '- En caso de no contar con faltas en todo el programa adquirido, el niño será acreedor de 1 sesión extra al mes sin costo. La misma debe ser programada.',
      style: 'stylePagrafer',
      alignment: 'justify',
    },
    {
      text: [
        { text: '- Brindar acceso a la herramienta digital de ' },
        { text: 'DINO KIDS', bold: true },
        { text: ', en su página web ' }, // Texto normal
        { text: 'DINO LECTURA', bold: true },
        { text: ', como una herramienta que fomenta el desarrollo de la lectura para niños.' }, // Texto normal
      ],
      style: 'stylePagrafer',
      alignment: 'justify',
    },
    {
      text: [
        { text: '- Membresia gratuita a ' },
        { text: 'DINO CLUB', bold: true },
        { text: ', el cual conlleva actividades extracurriculares organizadas de manera eventual por el centro ' }, // Texto normal
        { text: 'DINO KIDS', bold: true },
        { text: '.' }, // Texto normal
      ],
      style: 'stylePagrafer',
      alignment: 'justify',
    },
    {
      text: '- Contar con profesionales calificados en cada una de las áreas para brindar un proceso educativo respetuoso, adecuado y acorde a cada niño o niña.',
      style: 'stylePagrafer',
      alignment: 'justify',
    },
    {
      text: [
        { text: 'Con la firma de este convenio el centro ' },
        { text: 'DINO KIDS', bold: true },
        { text: ' y en colaboración de nuestro Reglamento General Estudiantil busca una mejor comunicación y aceptación de las actividades para el desarrollo adecuado de su niño o niña. Bajo los procesos de información oportuna, comunicación y continuidad en el proceso de aprendizaje, mejora y educación según la necesidad de cada uno de los niños.' }, // Texto normal
      ],
      style: 'stylePagrafer',
      alignment: 'justify',
    },
    {
      text: 'Realizada la inscripción no se aceptan devoluciones.',
      style: 'stylePagrafer',
      alignment: 'justify',
    },
    {
      margin: [0, 10, 0, 0],
      table: {
        widths: ['*'],
        body: [
          [
            {
              text: '____________________',
              style: 'styleCenter',
            },
          ],
          [{
            margin: [0, -5, 0, 0],
            text: 'Firma del tutor principal', style: 'styleCenter',
          }],
          [{
            margin: [0, -5, 0, 0],
            text: `${inscription.student?.tutors![0].user.name} ${inscription.student?.tutors![0].user.lastName}`, style: 'styleCenter'
          }],
        ],
      },
      layout: 'noBorders',
    },

    // { text: 'Ficha de Inscripción', style: 'header', fontSize: 18, bold: true },
    // { text: `Nombre del estudiante: ${inscription.student?.fullName ?? 'N/A'}` },
    // { text: `Curso: ${inscription.booking?.course ?? 'N/A'}` },
    // { text: `Monto: ${inscription.prices?.[0]?.inscriptionPrice ?? 'N/A'}` },
  ];

  const docDefinition: TDocumentDefinitions = {
    pageSize: 'LETTER',
    pageMargins: [40, 50, 40, 50],
    content,
    defaultStyle: {
      font: 'Poppins',
      fontSize: 12,
    },
    styles: {
      stylePagrafer: {
        margin: [0, 0, 0, 0],
        lineHeight: 1.5,
        fontSize: 9,
      },
      styleCenter: {
        alignment: 'center',
        fontSize: 12,
        margin: [0, 0, 0, 0],
        lineHeight: 1.5,
      },
      styleLeft: {
        alignment: 'left',
      },
      styleRight: {
        alignment: 'right',
      },
      styleLineCentered: {
        alignment: 'center',
        fontSize: 12,
      },
    },
  };


  return new Promise((resolve, reject) => {
    const pdfDoc = pdfMake.createPdf(docDefinition);

    pdfDoc.getBuffer((buffer) => {
      resolve(buffer);
    });

    pdfDoc.getStream().on('error', reject);
  });
}
