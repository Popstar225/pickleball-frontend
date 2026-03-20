// Tournament and event formatting utilities

export const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    draft: "Borrador",
    published: "Publicado",
    ongoing: "En curso",
    completed: "Completado",
    cancelled: "Cancelado",
    in_progress: "En progreso",
    registration_open: "Inscripciones abiertas",
    registration_closed: "Inscripciones cerradas",
    active: "Activo",
  };
  return labels[status] || status;
};

export const getSkillLevelLabel = (level: string): string => {
  const labels: Record<string, string> = {
    Beginner: "Principiante",
    Intermediate: "Intermedio",
    Advanced: "Avanzado",
    Elite: "Élite",
  };
  return labels[level] || level;
};

export const getGenderLabel = (gender: string): string => {
  const labels: Record<string, string> = {
    M: "Masculino",
    F: "Femenino",
    MX: "Mixto",
    MIXED: "Mixto",
  };
  return labels[gender] || gender;
};

export const getModalityLabel = (modality: string): string => {
  const labels: Record<string, string> = {
    Singles: "Individuales",
    Doubles: "Dobles",
    Mixed: "Mixtos",
    singles: "Individuales",
    doubles: "Dobles",
    mixed_doubles: "Dobles mixtos",
  };
  return labels[modality] || modality;
};

export const getFormatLabel = (format: string): string => {
  const labels: Record<string, string> = {
    hybrid: "Híbrido",
    single_elimination: "Eliminación Directa",
    double_elimination: "Doble Eliminación",
    round_robin: "Round Robin",
  };
  return labels[format] || format.replace(/_/g, ' ');
};

export const getSetsFormatLabel = (setsFormat: string): string => {
  const labels: Record<string, string> = {
    best_of_3: "Mejor de 3",
    best_of_5: "Mejor de 5",
    best_of_1: "Un set",
  };
  return labels[setsFormat] || setsFormat.replace(/_/g, ' ');
};

export const getRegistrationStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    confirmed: "Confirmado",
    pending: "Pendiente",
    withdrawn: "Retirado",
    waitlisted: "En lista de espera",
    rejected: "Rechazado",
  };
  return labels[status] || status;
};

export const formatDate = (date: string | Date): string => {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Translate event labels from English to Spanish
export const translateEventLabel = (label: string): string => {
  if (!label) return label;
  
  // Replace level names
  let translated = label
    .replace(/\(Beginner\)/g, "(Principiante)")
    .replace(/\(Intermediate\)/g, "(Intermedio)")
    .replace(/\(Advanced\)/g, "(Avanzado)")
    .replace(/\(Elite\)/g, "(Élite)");
  
  // Replace Block text
  translated = translated.replace(/Block /g, "Bloque ");
  
  // Replace gender names
  translated = translated
    .replace(/\sMasculine /g, " Masculino ")
    .replace(/\sFeminine /g, " Femenino ")
    .replace(/\sMIXED /g, " MIXTO ");
  
  // Replace modality names
  translated = translated
    .replace(/mixed_doubles/g, "dobles mixtos")
    .replace(/singles/g, "individuales")
    .replace(/doubles/g, "dobles");
  
  return translated;
};

/**
 * Parses backend registration error messages and returns an error map
 * for translation. The backend sends errors in format:
 * "Not eligible: {issue1}; {issue2}; ..."
 * 
 * Returns an object with translation key and interpolation data
 */
export const parseRegistrationError = (errorMessage: string): { key: string; data: Record<string, any> } => {
  if (!errorMessage) {
    return { key: 'registration_errors.generic', data: {} };
  }

  // Check for specific error patterns
  if (errorMessage.includes('deadline has passed')) {
    return { key: 'registration_errors.deadline_passed', data: {} };
  }

  if (errorMessage.includes('skill level')) {
    const playerMatch = errorMessage.match(/skill level \(([^)]+)\)/);
    const eventMatch = errorMessage.match(/event block \(([^)]+)\)/);
    
    if (playerMatch && eventMatch) {
      return {
        key: 'registration_errors.skill_level_mismatch',
        data: {
          playerLevel: playerMatch[1],
          eventBlock: eventMatch[1],
        },
      };
    }
  }

  if (errorMessage.includes('gender') && errorMessage.includes('not eligible')) {
    const playerMatch = errorMessage.match(/gender \(([^)]+)\)/);
    const eventMatch = errorMessage.match(/event \(([^)]+)\)/);
    
    if (playerMatch && eventMatch) {
      return {
        key: 'registration_errors.gender_not_eligible',
        data: {
          playerGender: playerMatch[1],
          eventGender: eventMatch[1],
        },
      };
    }
  }

  if (errorMessage.includes('Not eligible')) {
    return { key: 'registration_errors.not_eligible', data: {} };
  }

  return { key: 'registration_errors.generic', data: {} };
};
