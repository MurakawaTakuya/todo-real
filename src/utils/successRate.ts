export const getSuccessRate = (
  completed: number | undefined,
  failed: number | undefined
): number => {
  if (completed === undefined || failed === undefined) {
    return 0;
  }

  if (completed === 0 && failed === 0) {
    return 0;
  }

  if (completed === 0) {
    return 0;
  }

  if (failed === 0) {
    return 100;
  }

  return Math.floor((completed / (completed + failed)) * 100);
};
