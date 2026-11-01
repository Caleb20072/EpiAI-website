export function admissionStatusLabel(stage: string, locale: 'fr' | 'en' = 'fr') {
  const fr = locale === 'fr';
  switch (stage) {
    case 'received':
      return fr ? 'Dossier reçu' : 'Application received';
    case 'test_invited':
      return fr ? 'Test — en attente de confirmation' : 'Test — waiting for confirmation';
    case 'test_declined':
      return fr ? 'Test — a décliné' : 'Test — declined';
    case 'test_scheduled':
      return fr ? 'Test — créneau confirmé' : 'Test — slot confirmed';
    case 'test_live':
      return fr ? 'Test — en composition' : 'Test — in progress';
    case 'test_submitted':
      return fr ? 'Test — copie reçue' : 'Test — paper submitted';
    case 'test_reviewed':
      return fr ? 'Test — noté' : 'Test — graded';
    case 'interview_invited':
      return fr ? 'Entretien — en attente de confirmation' : 'Interview — waiting for confirmation';
    case 'interview_declined':
      return fr ? 'Entretien — a décliné' : 'Interview — declined';
    case 'interview_scheduled':
      return fr ? 'Entretien — créneau confirmé' : 'Interview — slot confirmed';
    case 'interview_reviewed':
      return fr ? 'Entretien — noté' : 'Interview — scored';
    case 'admitted':
      return fr ? 'Admis (membre)' : 'Admitted';
    case 'rejected':
      return fr ? 'Recalé' : 'Rejected';
    default:
      return stage;
  }
}

export function admissionStatusTone(stage: string): 'wait' | 'ok' | 'run' | 'no' | 'done' {
  if (stage.endsWith('_invited')) return 'wait';
  if (stage.endsWith('_declined') || stage === 'rejected') return 'no';
  if (stage === 'test_live') return 'run';
  if (stage === 'admitted') return 'done';
  if (stage.includes('scheduled') || stage.includes('submitted') || stage.includes('reviewed')) return 'ok';
  return 'wait';
}
