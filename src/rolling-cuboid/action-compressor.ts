export function compressActionSequence(actionList: string[], cuboidCount: number): string[] {
  if (actionList.length === 0) return [];

  const compressedActions: string[] = [];
  let currentAction = actionList[0];
  let actionCount = 1;

  const showCuboidId = cuboidCount > 1;

  for (let i = 1; i < actionList.length; i++) {
    if (actionList[i] === currentAction) {
      actionCount++;
    } else {
      const displayAction = showCuboidId ? currentAction : currentAction.replace(/^C\d+ /, '');
      compressedActions.push(actionCount === 1 ? displayAction : `${displayAction} ${actionCount} times`);
      currentAction = actionList[i];
      actionCount = 1;
    }
  }

  const displayAction = showCuboidId ? currentAction : currentAction.replace(/^C\d+ /, '');
  compressedActions.push(actionCount === 1 ? displayAction : `${displayAction} ${actionCount} times`);
  return compressedActions;
}
