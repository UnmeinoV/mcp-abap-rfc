/**
 * RunClassUnitTests Handler - Start ABAP Unit run for class-based tests
 *
 * Uses AdtClient.runClassUnitTests from @mcp-abap-adt/adt-clients.
 * Low-level handler: single method call.
 */

import { createAdtClient } from '../../../lib/clients';
import type { HandlerContext } from '../../../lib/handlers/interfaces';
import {
  extractUnitTestRunId,
  parseUnitTestRunResult,
  startUnitTestRunSync,
} from '../../../lib/unitTestRun';
import {
  type AxiosResponse,
  restoreSessionInConnection,
  return_error,
  return_response,
} from '../../../lib/utils';

type ScopeOptions = {
  ownTests?: boolean;
  foreignTests?: boolean;
  addForeignTestsAsPreview?: boolean;
};

type RiskOptions = {
  harmless?: boolean;
  dangerous?: boolean;
  critical?: boolean;
};

type DurationOptions = {
  short?: boolean;
  medium?: boolean;
  long?: boolean;
};

export const TOOL_DEFINITION = {
  name: 'RunClassUnitTestsLow',
  available_in: ['onprem', 'legacy'] as const,
  description:
    '[low-level] Start an ABAP Unit test run for provided class test definitions. Returns run_id extracted from SAP response headers.',
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
      session_id: {
        type: 'string',
        description:
          'Session ID from GetSession. If not provided, a new session will be created.',
      },
      session_state: {
        type: 'object',
        description:
          'Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.',
        properties: {
          cookies: { type: 'string' },
          csrf_token: { type: 'string' },
          cookie_store: { type: 'object' },
        },
      },
    },
    required: ['tests'],
  },
} as const;

interface TestDefinitionInput {
  container_class: string;
  test_class: string;
}

interface RunClassUnitTestsArgs {
  tests: TestDefinitionInput[];
  title?: string;
  context?: string;
  scope?: {
    own_tests?: boolean;
    foreign_tests?: boolean;
    add_foreign_tests_as_preview?: boolean;
  };
  risk_level?: RiskOptions;
  duration?: DurationOptions;
  session_id?: string;
  session_state?: {
    cookies?: string;
    csrf_token?: string;
    cookie_store?: Record<string, string>;
  };
}

export async function handleRunClassUnitTests(
  context: HandlerContext,
  args: RunClassUnitTestsArgs,
) {
  const { connection, logger } = context;
  try {
    const {
      tests,
      title,
      context,
      scope,
      risk_level,
      duration,
      session_id,
      session_state,
    } = args as RunClassUnitTestsArgs;

    if (!Array.isArray(tests) || tests.length === 0) {
      return return_error(
        new Error('tests array with at least one entry is required'),
      );
    }

    const formattedTests = tests.map((test, index) => {
      if (!test?.container_class || !test?.test_class) {
        throw new Error(
          `tests[${index}] must include container_class and test_class`,
        );
      }
      return {
        containerClass: test.container_class.toUpperCase(),
        testClass: test.test_class.toUpperCase(),
      };
    });

    // Wrap the connection for sap-language pinning (side-effect); the run
    // itself goes through startUnitTestRunSync via makeAdtRequestWithTimeout.
    createAdtClient(connection, logger);

    if (session_id && session_state) {
      await restoreSessionInConnection(connection, session_id, session_state);
    }

    void scope;
    void title;
    void context;

    logger?.info(
      `Starting ABAP Unit run for ${formattedTests.length} definitions`,
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
        `✅ RunClassUnitTests completed: ${result.passed_methods}/${result.total_methods} passed`,
      );

      return return_response({
        data: JSON.stringify(
          {
            success: true,
            run_id: runId,
            result,
            status_code: response?.status,
            session_id: session_id || null,
            session_state: null, // Session state is not persisted by this server,
            message: `ABAP Unit run completed: ${result.passed_methods}/${result.total_methods} method(s) passed, ${result.failed_methods} failed.`,
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
