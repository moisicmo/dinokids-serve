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
      text: 'CONTRATO PRIVADO DE PRESTACIÓN DE SERVICIOS EDUCATIVOS DEL PROGRAMA DINO CONDUCTUAL DE DINO KIDS',
      style: 'styleTitle',
    },
    {
      text: [
        { text: 'PRIMERA: PARTES CONTRATANTES.- ', bold: true },
        { text: 'El presente contrato se celebra entre ' },
        { text: 'DINO KIDS', bold: true },
        { text: ', centro psicopedagógico legalmente constituido en Bolivia, ubicado en ' },
        { text: 'Calle Batallón Colorados, Edificio Batallón Colorados, Planta Baja Oficina 4', bold: true },
        { text: ', en adelante ' },
        { text: '"EL CENTRO"', bold: true },
        { text: ', y el padre/madre/tutor del niño(a) identificado en la cláusula tercera, en adelante ' },
        { text: '"EL REPRESENTANTE"', bold: true },
        { text: ', quien suscribe el presente contrato en su calidad de responsable legal del menor.' },
      ],
      style: 'stylePagrafer',
      alignment: 'justify',
    },

    {
      text: [
        { text: 'SEGUNDA: OBJETO DEL CONTRATO.- ', bold: true },
        { text: 'Mediante el presente, ' },
        { text: 'EL CENTRO ', bold: true },
        { text: 'se obliga a prestar servicios especializados dentro del programa ' },
        { text: 'DINO CONDUCTUAL ', bold: true },
        { text: 'un programa anual integral diseñado para niños y adolescentes con trastornos del neurodesarrollo, tales como AUTISMO, Trastorno por Déficit de Atención e Hiperactividad (TDAH), Trastornos del Desarrollo del Lenguaje, Síndrome de Down,  Dificultades de Aprendizaje Específicos (Dislexia, Discalculia, Dislalia, Disortografía y Disgrafía), Trastornos Conductuales, Discapacidades (Intelectual, Auditiva, Visual y Motora), Parálisis Cerebral Infantil, entre otros.' },
      ],
      style: 'stylePagrafer',
      alignment: 'justify',
    },
    {
      stack: [
        {
          text: 'TERCERA: IDENTIFICACIÓN DEL BENEFICIARIO',
          bold: true,
          alignment: 'justify',
        },
        { text: `Nombre del niño(a): ${inscription.student?.user.name} ${inscription.student?.user.lastName}` },
        { text: `Fecha de nacimiento: ${format(new Date(inscription.student!.birthdate), 'dd-MMMM-yyyy', { locale: es })}` },
        { text: `Nombre del padre/madre/tutor: ${inscription.student?.tutors![0].user.name} ${inscription.student?.tutors![0].user.lastName}` },
        { text: `Cédula de identidad: ${inscription.student?.user.numberDocument}` },
        { text: `Domicilio: ${inscription.student?.tutors[0].user?.address?.city?.name} ${inscription.student?.tutors[0].user?.address?.zone} ${inscription.student?.tutors[0].user?.address?.detail}` },
        { text: `Teléfono de contacto: ${inscription.student?.tutors?.[0]?.user?.phone?.[0] ?? 'Sin número'}` },
      ],
      style: 'stylePagrafer',
      alignment: 'left',
    },
    {
      text: [
        { text: 'CUARTA: DURACIÓN DEL CONTRATO.- ', bold: true },
        { text: 'El presente contrato tiene la vigencia de ' },
        { text: 'un (1) año ', bold: true },
        { text: 'renovable automáticamente previo cumplimiento de las condiciones establecidas en este documento.' },
      ],
      style: 'stylePagrafer',
      alignment: 'justify',
    },
    {
      stack: [
        { text: 'QUINTA: PRINCIPIOS FUNDAMENTALES DEL PROGRAMA', bold: true },
        {
          ol: [
            [
              {
                text: [
                  { text: 'Enfoque Multidisciplinario: ', bold: true },
                  { text: 'Integración de diferentes áreas terapéuticas (conductual, ocupacional, estimulación del lenguaje, creativa, social, psicopedagógica e integración sensorial).' }
                ]
              }
            ],
            [
              {
                text: [
                  { text: 'Adaptabilidad: ', bold: true },
                  { text: 'Planes personalizados que se ajustan a las necesidades individuales del niño.' }
                ]
              }
            ],
            [
              {
                text: [
                  { text: 'Evidencia Científica: ', bold: true },
                  { text: 'Uso de metodologías respaldadas por investigaciones actuales.' }

                ]
              }
            ],
            [
              {
                text: [

                  { text: 'Participación Activa: ', bold: true },
                  { text: 'Involucrar a las familias y al entorno del niño en el proceso terapéutico sin interferir en las sesiones.' }
                ]
              }
            ],
            [
              {
                text: [
                  { text: 'Evaluaciones constantes: ', bold: true },
                  { text: 'Seguimiento continuo del progreso del niño mediante herramientas de monitoreo terapéutico.' }
                ]
              }
            ]
          ],
          margin: [20, 0, 0, 0],
        }
      ],
      style: 'stylePagrafer',
      alignment: 'justify',
    },
    {
      stack: [
        {
          text: [
            { text: 'SEXTA: ESTRUCTURA DEL PROGRAMA.-', bold: true },
            { text: 'El Programa se desarrollará en ' },
            { text: 'Etapas Individualizadas' },
            { text: ', estructuradas de acuerdo con las necesidades, características y evolución de cada niño, conforme al criterio profesional del equipo de DINO KIDS. El marco de esta estructura contempla lo siguiente:' },
          ],
        },
        {
          ol: [
            [
              { text: 'Etapa Inicial (Adaptación y Evaluación Interna): ', bold: true },
              {
                ul: [
                  {
                    text: [
                      { text: 'Esta etapa constituye un periodo de ', },
                      { text: 'adaptación progresiva ', bold: true },
                      { text: 'y ' },
                      { text: 'evaluación interna funcional ', bold: true },
                      { text: 'del niño dentro del contexto del Programa.', },
                    ]
                  },
                  {
                    stack: [
                      { text: 'Su propósito es permitir al equipo profesional:' },
                      {
                        stack: [
                          {
                            columns: [
                              { text: '○', width: 15, alignment: 'center' },
                              { text: 'Observar y analizar patrones de conducta, interacción social y respuesta emocional.', width: '*' }
                            ],
                            margin: [0, 0, 0, 4]
                          },
                          {
                            columns: [
                              { text: '○', width: 15, alignment: 'center' },
                              { text: 'Descubrir y comprender los estilos y canales preferentes de aprendizaje del niño.', width: '*' }
                            ],
                            margin: [0, 0, 0, 4]
                          },
                          {
                            columns: [
                              { text: '○', width: 15, alignment: 'center' },
                              { text: 'Identificar factores facilitadores y barreras que puedan afectar su proceso educativo y conductual.', width: '*' }
                            ],
                            margin: [0, 0, 0, 4]
                          },
                          {
                            columns: [
                              { text: '○', width: 15, alignment: 'center' },
                              { text: 'Evaluar las competencias de atención, concentración, memoria de trabajo y autorregulación emocional.', width: '*' }
                            ],
                            margin: [0, 0, 0, 4]
                          },
                          {
                            columns: [
                              { text: '○', width: 15, alignment: 'center' },
                              { text: 'Generar insumos para la personalización de estrategias y técnicas de intervención.', width: '*' }
                            ],
                            margin: [0, 0, 0, 4]
                          }
                        ]
                      }

                    ],
                  },
                  {
                    text: [
                      { text: 'Durante esta etapa, se realizarán ', },
                      { text: 'sesiones específicas de intervención conductual ', bold: true },
                      { text: 'con una frecuencia de ' },
                      { text: 'tres (3) veces por semana', bold: true },
                    ]
                  },
                  {
                    text: [
                      { text: 'La duración de cada sesión será de ', },
                      { text: 'una (1) hora.', bold: true },
                    ]
                  },
                  {
                    text: [
                      { text: 'Cada niño participará en un total de entre ', },
                      { text: 'doce (12) a treinta y seis (36) sesiones', bold: true },
                      { text: ', conforme a su evaluación inicial, a sus necesidades individuales y a su progreso durante el Programa.', },
                    ]
                  },
                  {
                    text: 'La cantidad y continuidad de las sesiones podrán ser ajustadas por el equipo profesional con base al seguimiento continuo, en consenso con los padres o tutores legales.'
                  },
                  {
                    text: [
                      { text: 'La ' },
                      { text: 'Etapa Inicial', bold: true },
                      { text: 'es de carácter obligatorio dentro del marco del Programa, pues constituye la base evaluatoria y adaptativa para la planificación de intervenciones futuras.', },
                    ]
                  },
                  {
                    text: [
                      { text: 'Las sesiones que no sean asistidas por causas imputables a los padres o tutores ' },
                      { text: 'no serán reembolsables ni reprogramadas fuera de la política de asistencia vigente', bold: true },
                      { text: ', salvo casos de fuerza mayor debidamente justificados y documentados.', },
                    ]
                  },
                  {
                    text: 'La no asistencia a las sesiones programadas dentro de esta etapa puede impactar negativamente en la correcta evaluación del niño y en la efectividad del Programa.'
                  },
                ]
              }
            ],
            [
              {
                text: [
                  { text: 'Etapa de Integración: ', bold: true },
                  { text: 'Una vez concluida la fase inicial, el niño se integrará a la segunda etapa, asistiendo ' },
                  { text: 'tres (3) veces por semana ', bold: true },
                  { text: 'con sesiones de ' },
                  { text: '1.5 horas cada una', bold: true },
                  { text: ', distribuidas en terapias de ' },
                  { text: '45 minutos', bold: true },
                  { text: ', asignadas por el centro, incluyendo:' },
                ]
              },
              {
                stack: [
                  {
                    columns: [
                      { text: '○', width: 15, alignment: 'center' },
                      { text: 'Terapia Ocupacional', width: '*' }
                    ],
                  },
                  {
                    columns: [
                      { text: '○', width: 15, alignment: 'center' },
                      { text: 'Terapias artisticas', width: '*' }
                    ],
                  },
                  {
                    columns: [
                      { text: '○', width: 15, alignment: 'center' },
                      { text: 'Estimulación del Lenguaje', width: '*' }
                    ],
                  },
                  {
                    columns: [
                      { text: '○', width: 15, alignment: 'center' },
                      { text: 'Integración Sensorial', width: '*' }
                    ],
                  },
                  {
                    columns: [
                      { text: '○', width: 15, alignment: 'center' },
                      { text: 'Psicomotricidad', width: '*' }
                    ],
                  },
                  {
                    columns: [
                      { text: '○', width: 15, alignment: 'center' },
                      { text: 'Psicopedagogía + Sociabilización', width: '*' }
                    ],
                  },
                ]
              }
            ],
          ],
          margin: [20, 0, 0, 0],
        }
      ],
      style: 'stylePagrafer',
      alignment: 'justify',
    },
    {
      text: [
        { text: 'En esta segunda etapa, el niño será integrado a ' },
        { text: 'grupos reducidos de tres (3) niños con rasgos afines', bold: true },
        { text: ', con el objetivo de fortalecer habilidades sociales, fomentar el trabajo en equipo y desarrollar estrategias de interacción en entornos controlados.' },
      ],
      style: 'stylePagrafer',
      alignment: 'justify',
    },
    {
      text: [
        { text: 'Importante: ', bold: true },
        { text: 'Cada niño es un individuo con características, necesidades y procesos de aprendizaje únicos. En consecuencia, el avance dentro del Programa DINO CONDUCTUAL se desarrolla a un ritmo propio e individualizado, determinado por múltiples factores personales, familiares y contextuales.' },
      ],
      style: 'stylePagrafer',
      alignment: 'justify',
    },
    {
      text: 'El Programa está diseñado para fomentar de manera progresiva el desarrollo de habilidades y competencias en cada niño, mediante un enfoque terapéutico, educativo integral y sostenido en el tiempo. Los resultados y progresos alcanzados dependen directamente de la regularidad en la asistencia, la participación activa en las sesiones, el compromiso de la familia en el seguimiento de las pautas recomendadas y el cumplimiento de las indicaciones profesionales.',
      style: 'stylePagrafer',
      alignment: 'justify',
    },
    {
      text: 'Dado que el proceso de avance es individualizado, los tiempos y la magnitud de los progresos pueden variar entre los participantes, de acuerdo con sus características personales y su nivel de participación. Por ello, es fundamental asegurar la continuidad y constancia en la asistencia, ya que las ausencias, retrasos reiterados o discontinuidades en la participación pueden afectar significativamente el proceso y limitar el desarrollo de los logros esperados. El trabajo conjunto entre el equipo profesional y la familia es clave para favorecer un avance sostenido y significativo para cada niño.',
      style: 'stylePagrafer',
      alignment: 'justify',
    },
    {
      stack: [
        { text: 'SÉPTIMA: OBLIGACIONES DEL "REPRESENTANTE"', bold: true },
        {
          ul: [
            {
              text: [
                { text: 'Con el objetivo de precautelar la seguridad de los niños, los tutores o padres de familia deberán ', },
                { text: 'portar la credencial al momento de dejar y recoger a su niño de manera obligatoria', bold: true, decoration: 'underline' },
                { text: ', En caso de no portar la misma la persona que lo recoja deberá presentar su carnet de identidad tanto original como fotocopia y llenar un formulario donde nos brindará todos los datos solicitados en el momento. ', },
              ]
            },
            { text: 'Cumplir con la puntualidad en los horarios de ingreso y salida del niño/a. La puntualidad es un requisito indispensable para el correcto desarrollo de las sesiones del Programa. No se permitirá el ingreso con retraso a las sesiones, ni se repondrán los minutos perdidos en caso de llegada tardía, ya que las actividades están cuidadosamente programadas y estructuradas. Asimismo, EL REPRESENTANTE se compromete a presentarse en el Centro con al menos cinco (5) minutos de antelación al horario de finalización de la sesión, dado que este tiempo será utilizado por el equipo profesional para realizar una devolución sobre el avance de la sesión y proporcionar recomendaciones relevantes para el seguimiento en casa. El incumplimiento reiterado de esta obligación podrá ser considerado como falta de compromiso con el Programa y afectará la continuidad del niño en el mismo. ', },
            { text: 'No enviar alimentos al momento de participar en las sesiones o al ingreso a aulas, salvo petición expresa de la educadora, esto con el fin de mantener la higiene y seguridad.', },
            { text: 'Pagar las mensualidades en las fechas indicadas, según el plan de pagos acordado con el Asesor Educativo. El incumplimiento podría significar un perjuicio en las actividades del niño/a. ' },
            { text: 'Fomentar el buen comportamiento de su niño/a dentro de las actividades del Centro, evitando así inconvenientes entre los miembros del Centro y el resto del alumnado.' },
            {
              text: [
                { text: 'Ser parte de la ' },
                { text: 'Red de Apoyo ', bold: true },
                { text: 'que se formará entre la educadora, la unidad educativa y el entorno familiar.' },
              ]
            },
            { text: 'Participar en las entrevistas programadas, para un buen seguimiento al desarrollo y progreso de su niño, así mismo, informar oportunamente de alguna observación respecto a las sesiones desarrolladas.' },
            { text: 'Todo cambio de horario deberá ser solicitado y autorizado solo por el tutor o titular de la inscripción. Previo llenado y firma del Formulario correspondiente.' },
            { text: 'Evitar interrumpir el desarrollo de las sesiones y metodologías empleadas dentro de las actividades del niño, ya que toda actividad estará siempre orientada hacia el respeto y desarrollo adecuado del niño.' },
            { 
              stack: [
                { text: 'Sobre ausencias, permisos y reprogramaciones:'},
                { text: '- Los permisos para reprogramación de sesiones sólo se concederán en caso de fuerza mayor o causa justificada debidamente documentada (enfermedad, situación familiar grave o eventos fortuitos), y estarán sujetos a la disponibilidad horaria del Centro. Una vez otorgado el permiso, EL REPRESENTANTE deberá agendar la sesión de reposición en la fecha y horario acordados con la administración.'},
                { text: '- En caso de que, una vez agendada la reposición, EL REPRESENTANTE o el niño no asistan a dicha sesión reprogramada, la misma se considerará como realizada a todos los efectos, y no será objeto de una nueva reprogramación ni de reembolso. Esta política es necesaria para garantizar la adecuada planificación de las sesiones y la eficiencia del Programa..'},
              ]
             },
            { text: 'Reconocer y aceptar que cada niño avanza dentro del Programa DINO CONDUCTUAL conforme a su propio ritmo de desarrollo y aprendizaje, y que dicho proceso requiere necesariamente un alto grado de compromiso, regularidad y constancia en la asistencia a las sesiones.' },
            { text: 'EL REPRESENTANTE se compromete expresamente a respetar el calendario de sesiones acordado y a evitar atrasos y faltas injustificadas, reconociendo que tales situaciones comprometen la eficacia del Programa y pueden afectar de manera directa el desarrollo integral del niño.' },
            { text: 'En caso de ausencia reiterada injustificada o falta de compromiso demostrado con el proceso, EL CENTRO se reserva el derecho de evaluar la continuidad del beneficiario dentro del Programa, en resguardo de los principios pedagógicos y terapéuticos que sustentan su metodología.' },
          ]
        }
      ]
    },
    {
      text: [
        { text: 'BENEFICIOS.-', bold: true },
        { text: 'Al participar en el Programa DINO CONDUCTUAL, el niño y su familia accederán a los siguientes beneficios exclusivos:' }
      ],
      style: 'stylePagrafer',
      alignment: 'justify',
    },
    {
      ul: [
        { text: 'Material didáctico especializado: Uso de materiales y recursos pedagógicos diseñados especialmente para el desarrollo de habilidades, proporcionados por la línea de juegos y juguetes DINO TOYS.' },
        { text: 'Informes de seguimiento y avance: Entrega periódica de informes profesionales que documentan el progreso del niño, en las fechas previamente acordadas con EL REPRESENTANTE.' },
        { text: 'Certificaciones de participación: A solicitud, EL CENTRO podrá emitir cartas de participación y/o certificados oficiales que podrán ser presentados en la unidad educativa o en centros médicos del beneficiario.' },
        { text: 'Premio a la asistencia continua: En caso de no registrar inasistencias injustificadas durante todo el Programa contratado, el niño será acreedor a una (1) sesión adicional gratuita por mes, la cual deberá ser programada con antelación.' },
        { text: 'Acceso a plataforma digital: Brindar acceso gratuito a la herramienta digital DINO LECTURA, alojada en la página web de DINO KIDS, como apoyo complementario para el desarrollo de habilidades lectoras.' },
        { text: 'Membresía DINO CLUB: Inscripción gratuita en el DINO CLUB, que ofrece la posibilidad de participar en actividades extracurriculares, talleres y eventos lúdicos organizados de manera eventual por EL CENTRO.' },
        { text: 'Equipo profesional calificado: Atención personalizada por profesionales altamente capacitados y especializados en cada una de las áreas terapéuticas y educativas del Programa, garantizando un proceso respetuoso, integral y acorde a las necesidades individuales de cada niño.' },
        { text: 'Atención personalizada por un equipo profesional de excelencia:' },
        { text: 'El Programa DINO CONDUCTUAL es impartido por un equipo multidisciplinario de profesionales altamente calificados, especializados en las diferentes áreas terapéuticas y educativas que conforman el Programa. Cada profesional cuenta con experiencia y formación específica en el abordaje de niños con trastornos del neurodesarrollo y dificultades del aprendizaje.' },
      ],
      style: 'stylePagrafer',
      alignment: 'justify',
    },
    {
      stack: [
        { text: 'EL CENTRO garantiza que la atención brindada será integral, ética, respetuosa y adaptada a las particularidades de cada niño, favoreciendo su desarrollo integral en un ambiente seguro, estimulante y de alta calidad pedagógica y terapéutica.' },
        { text: 'Además, el equipo mantiene un proceso continuo de actualización profesional, participando en capacitaciones, talleres y supervisiones clínicas para asegurar la excelencia en la intervención.' },
      ],
      style: 'stylePagrafer',
      alignment: 'justify',
    },
    {
      stack: [
        { text: 'OCTAVA: CONDICIONES DE PAGO', bold: true },
        {
          ol: [
            {
              text: [
                { text: 'El costo del programa', bold: true },
                { text: 'se cancela ' },
                { text: 'por adelantado.', bold: true },
              ],
            },
            { text: 'Se concede una prórroga máxima de cinco (5) días hábiles para pagos.' },
            { text: 'No se realizan devoluciones, ya que EL CENTRO informa previamente a los padres sobre el funcionamiento del programa antes de adquirir el servicio.' },
          ]
        },
      ],
      style: 'stylePagrafer',
      alignment: 'justify',
    },
    {
      stack: [
        { text: 'NOVENA: SEGURIDAD Y ACCESO A CÁMARAS', bold: true },
        {
          ol: [
            { text: 'El acceso a cámaras de seguridad en tiempo real está restringido en dispositivos móviles de los padres. Tomando en cuenta el artículo 143 y 144 del Código Niña, Niño y Adolescente reconocen los derechos a la privacidad, a la intimidad, a la imagen y a la confidencialidad de todo niña, niño y adolescente.' },
            { text: 'Los padres podrán solicitar ver las grabaciones desde administración, bajo  justificación.' },
          ]
        },
      ],
      style: 'stylePagrafer',
      alignment: 'justify',
    },
    {
      stack: [
        { text: 'DÉCIMA: INFORMES Y CERTIFICACIONES', bold: true },
        {
          ol: [
            {
              text: [
                { text: 'Las evaluaciones internas son constantes, ', bold: true },
                { text: 'sin embargo, los informes se entregarán ' },
                { text: 'semestralmente tras la sesión 72 y sesión 144.', bold: true },
              ],
            },
            {
              text: [
                { text: 'A solicitud del REPRESENTANTE, EL CENTRO ', bold: true },
                { text: 'podrá emitir ' },
                { text: 'certificados de asistencia ', bold: true },
                { text: 'para Unidades Educativas o Centros Médicos. ' },
              ],
            }
          ]
        },
      ],
      style: 'stylePagrafer',
      alignment: 'justify',
    },
    {
      text: [
        { text: 'DÉCIMA PRIMERA: JURISDICCIÓN Y RESOLUCIÓN DE CONFLICTOS.- ', bold: true },
        { text: 'Las partes se comprometen a resolver cualquier diferencia que pudiera surgir durante el desarrollo del Programa mediante el diálogo y la conciliación directa. De no alcanzarse un acuerdo, se someterán a la jurisdicción ordinaria competente, conforme a la legislación vigente en el Estado Plurinacional de Bolivia.' },
      ],
      style: 'stylePagrafer',
      alignment: 'justify',
    },
    {
      text: [
        { text: 'DÉCIMA SEGUNDA: ACEPTACIÓN.- ', bold: true },
        { text: 'Las partes declaran haber leído, comprendido y aceptado en su totalidad las condiciones establecidas en el presente contrato. EL REPRESENTANTE suscribe este documento con pleno conocimiento del contenido y alcance de cada una de sus cláusulas, y en un marco de mutuo respeto, confianza y colaboración con EL CENTRO.' },
      ],
      style: 'stylePagrafer',
      alignment: 'justify',
    },
  ];

  const docDefinition: TDocumentDefinitions = {
    pageSize: 'LETTER',
    pageMargins: [70, 90, 70, 60],
    header: {
      margin: [70, 20, 70, 10],
      columns: [
        {
          stack: [
            { text: 'DINO KIDS. 4758808011', bold: true, color: 'green', fontSize: 12, margin: [0, 0, 0, 2] },
            { text: 'Calle Batallón Colorados', fontSize: 10, margin: [0, 0, 0, 2] },
            { text: 'Edificio Batallón Colorados Of. 4', fontSize: 10, margin: [0, 0, 0, 2] },
            { text: 'www.dinokids.com.bo', fontSize: 10, color: 'gray' },
          ],
          width: '*'
        },
        logoBase64
          ? {
            image: `data:image/png;base64,${logoBase64}`,
            width: 100,
            alignment: 'right',
          }
          : {}
      ]
    } as any,

    content,
    defaultStyle: {
      font: 'Poppins',
      fontSize: 12,
    },
    styles: {
      styleTitle: {
        bold: true,
        fontSize: 11,
        margin: [0, 10, 0, 12],
        alignment: 'center',
      },
      stylePagrafer: {
        lineHeight: 1.15,
        fontSize: 11,
        margin: [0, 0, 0, 12],
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
