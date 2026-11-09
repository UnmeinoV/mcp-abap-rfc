/**
 * RunUnitTest Handler - Start ABAP Unit test run via AdtClient
 *
 * Uses AdtClient.getUnitTest().create() for high-level test run operation.
 * Starts unit test execution and returns run_id for status/result queries.
 */

import type { HandlerContext } from '../../../lib/handlers/interfaces';
import {
  extractUnitTestRunId,
  parseUnitTestRunResult,
  startUnitTestRunSync,
} from '../../../lib/unitTestRun';
import {
  type AxiosResponse,
  return_error,
  return_response,
} from '../../../lib/utils';

export const TOOL_DEFINITION = {
  name: 'RunUnitTest',
  available_in: ['onprem', 'legacy'] as const,
  description:
    'Start an ABAP Unit test run for provided class test definitions. Returns run_id for status/result queries.',
  inputSchema: {
    type: 'object',
    properties: {
      tests: {
        type: 'array',
        description: 'List of container/test class pairs to execute.',
        items: {
          type: 'object',
          properties: {
            container_class: {
              type: 'string',
              description:
                'Class that owns the test include (e.g., ZCL_MAIN_CLASS).',
            },
            test_class: {
              type: 'string',
              description:
                'Test class name inside the include (e.g., LTCL_MAIN_CLASS).',
            },
          },
          required: ['container_class', 'test_class'],
        },
      },
      title: {
        type: 'string',
        description: 'Optional title for the ABAP Unit run.',
      },
      context: {
        type: 'string',
        description: 'Optional context string shown in SAP tools.',
      },
      scope: {
        type: 'object',
        properties: {
          own_tests: { type: 'boolean' },
          foreign_tests: { type: 'boolean' },
          add_foreign_tests_as_preview: { type: 'boolean' },
        },
      },
      risk_level: {
        type: 'object',
        properties: {
          harmless: { type: 'boolean' },
          dangerous: { type: 'boolean' },
          critical: { type: 'boolean' },
        },
      },
      duration: {
        type: 'object',
        properties: {
          short: { type: 'boolean' },
          medium: { type: 'boolean' },
          long: { type: 'boolean' },
        },
      },
      summary: {
        type: 'boolean',
        description:
          'Return counts and FAILURES only, dropping the per-method detail of tests that ' +
          'PASSED. DEFAULT TRUE. Failing methods are always listed in full with their alerts, ' +
          'so nothing needed for diagnosis is lost — what is dropped is the name of every ' +
          'test that succeeded. Pass summary:false for the complete per-method tree.',
      },
      full: {
        type: 'boolean',
        description:
          'Alias for summary:false — return the complete per-method result tree, including ' +
          'every test that passed. Use when a human is reading the run as a report.',
      },
    },
    required: ['tests'],
  },
} as const;

interface RunUnitTestArgs {
  tests: Array<{
    container_class: string;
    test_class: string;
  }>;
  title?: string;
  context?: string;
  scope?: {
    own_tests?: boolean;
    foreign_tests?: boolean;
    add_foreign_tests_as_preview?: boolean;
  };
  risk_level?: {
    harmless?: boolean;
    dangerous?: boolean;
    critical?: boolean;
  };
  duration?: {
    short?: boolean;
    medium?: boolean;
    long?: boolean;
  };
  summary?: boolean;
  full?: boolean;
}

/**
 * Main handler for RunUnitTest MCP tool
 *
 * Uses AdtClient.getUnitTest().create() - high-level test run operation
 */
export async function handleRunUnitTest(
  context: HandlerContext,
  args: RunUnitTestArgs,
) {
  const { connection, logger } = context;
  try {
    const { tests, risk_level, duration } = args as RunUnitTestArgs;

    // Validation
    if (!Array.isArray(tests) || tests.length === 0) {
      return return_error(
        new Error('tests array with at least one entry is required'),
      );
    }

    // The container class name is what the /testruns objectSet references.
    const formattedTests = tests.map((test) => ({
      containerClass: test.container_class.toUpperCase(),
      testClass: test.test_class.toUpperCase(),
    }));

    logger?.info(
      `Starting ABAP Unit run for ${formattedTests.length} test definition(s)`,
    );

    try {
      // Synchronous /testruns run (bypasses the dep's 404-ing /runs path).
      const response = await startUnitTestRunSync(connection, formattedTests, {
        riskLevel: risk_level,
        duration,
      });
      const result = parseUnitTestRunResult(response);
      const runId = extractUnitTestRunId(response);

      logger?.info(
        `✅ RunUnitTest completed: ${result.passed_methods}/${result.total_methods} passed`,
      );

      // In summary mode keep every FAILURE in full and reduce the passing
      // classes to counts. A summary that hid failures would be worse than a
      // long response.
      //
      // DEFAULT TRUE since field report round 3. The parameter shipped opt-in and the
      // measured result was that it stayed unused: 36 of 50 runs did not pass
      // it, and 12 of those 36 blew the tool-output limit and had to be spilled
      // to a file and post-processed with shell commands. A token-saving option
      // that must be opted into does not save tokens. The safety argument for
      // inverting is in the shape of the summary itself — every failure is
      // still reported in full, and the totals describe the whole run.
      const summaryMode = args.full === true ? false : args.summary !== false;
      const reported = summaryMode
        ? {
            total_methods: result.total_methods,
            passed_methods: result.passed_methods,
            failed_methods: result.failed_methods,
            alerts_total: result.alerts_total,
            success: result.success,
            classes: result.test_classes.map((c) => ({
              name: c.name,
              total: c.test_methods.length,
              passed: c.test_methods.filter((m) => m.passed).length,
              failed: c.test_methods.filter((m) => !m.passed).length,
            })),
            failures: result.test_classes.flatMap((c) =>
              c.test_methods
                .filter((m) => !m.passed)
                .map((m) => ({
                  test_class: c.name,
                  method: m.name,
                  alerts: m.alerts,
                })),
            ),
          }
        : result;

      return return_response({
        data: JSON.stringify(
          {
            success: true,
            run_id: runId,
            ...(summaryMode
              ? {
                  summary: true,
                  summary_note:
                    'Counts and failures only (the default). Passing methods are not listed; ' +
                    'pass full:true for the complete per-method tree.',
                }
              : {}),
            // A run that determined NO tests is not a pass. SAP answers 200 with
            // an empty result when the object set matches nothing, and reporting
            // that as success is how a suite silently stops being executed.
            ...(result.total_methods === 0
              ? {
                  warning:
                    'The run executed but determined ZERO test methods. Check the ' +
                    'container_class/test_class names — an object set that matches nothing ' +
                    'produces an empty run, not an error.',
                }
              : {}),
            result: reported,
            message:
              `ABAP Unit run completed: ${result.passed_methods}/${result.total_methods} ` +
              `method(s) passed, ${result.failed_methods} failed.`,
          },
          null,
          2,
        ),
      } as AxiosResponse);
    } catch (error: any) {
      logger?.error(`Error starting ABAP Unit run: ${error?.message || error}`);
      return return_error(new Error(error?.message || String(error)));
    }
  } catch (error: any) {
    return return_error(error);
  }
}
