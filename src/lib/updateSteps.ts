/**
 * The `steps_completed` of an Update* handler that checks before writing.
 *
 * Both checks (the new source before the write, the inactive version after it)
 * run only when the caller activates, so a write without activation must not
 * report them — see updateStepsContract.test.ts.
 */
export function updateStepsCompleted(activated: boolean): string[] {
  return activated
    ? [
        'lock',
        'check_new_code',
        'update',
        'unlock',
        'check_inactive',
        'activate',
      ]
    : ['lock', 'update', 'unlock'];
}
