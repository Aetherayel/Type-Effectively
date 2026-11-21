// A shared build records the release where its inputs were first generated.
// Opening that link later recalculates with the current engine. Keep the
// original release and the actual rendering release distinct.
const VERSION=/^v(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)$/;

export function normalizeBuildVersion(value) {
  return typeof value==='string' && VERSION.test(value) ? value : null;
}

export function cardVersionLabels(build) {
  const created=normalizeBuildVersion(build?.createdVersion);
  const rendered=normalizeBuildVersion(build?.renderVersion);
  return {
    created:created?'CREATED '+created:'CREATED VERSION UNRECORDED',
    recalculated:created && created===rendered ? null :
      'RECALCULATED '+(rendered||'VERSION UNKNOWN')
  };
}

export function cardVersionFooter(build) {
  const labels=cardVersionLabels(build);
  return labels.created+(labels.recalculated?' · '+labels.recalculated:'');
}
