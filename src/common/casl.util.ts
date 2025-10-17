/**
 * 🔍 Verifica si un filtro CASL está vacío o sin restricciones.
 * Esto ocurre cuando el usuario tiene permisos globales ("all").
 */
export function isCaslFilterEmpty(filter: any): boolean {
  if (!filter) return true;

  const isPlainEmpty = Object.keys(filter).length === 0;

  const isOrEmpty =
    Array.isArray(filter.OR) &&
    filter.OR.every((o) => Object.keys(o).length === 0);

  return isPlainEmpty || isOrEmpty;
}


export function cleanCaslFilterForModel(filter: any, model: string): any {
  if (!filter || typeof filter !== 'object') return filter;

  // Mapa de campos válidos por modelo
  const validFields: Record<string, string[]> = {
    student: ['userId', 'schoolId', 'active', 'createdById', 'createdAt'],
    tutor: ['userId', 'active', 'createdById', 'createdAt'],
    teacher: ['userId', 'branches', 'active', 'createdById', 'createdAt'],
    staff: ['userId', 'branches', 'active', 'createdById', 'createdAt'],
    specialty: ['id', 'branchSpecialties', 'active', 'createdAt'],
  };

  const fields = validFields[model] ?? [];

  // Si el filtro contiene un OR, limpiamos recursivamente
  if (filter.OR && Array.isArray(filter.OR)) {
    return {
      OR: filter.OR.map((sub) => cleanCaslFilterForModel(sub, model)).filter(
        (sub) => Object.keys(sub).length > 0,
      ),
    };
  }

  // Elimina los campos que no pertenecen al modelo
  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(filter)) {
    if (fields.includes(key)) cleaned[key] = value;
  }

  return cleaned;
}
