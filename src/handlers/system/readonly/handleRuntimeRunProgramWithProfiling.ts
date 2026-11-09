import { AdtExecutor } from '@mcp-abap-adt/adt-clients';
import type { HandlerContext } from '../../../lib/handlers/interfaces';
import { describeSapErrorPage } from '../../../lib/sapErrorPage';
import { return_error, return_response } from '../../../lib/utils';

export const TOOL_DEFINITION = {
  name: 'RuntimeRunProgramWithProfiling',
  available_in: ['onprem'] as const,
  description:
    '[runtime][deprecated] Execute ABAP program with profiler enabled and return created profilerId. Prefer RuntimeRunProgram with profile=true; this tool is kept for backward compatibility and will be removed in a future major release.',
  notes: `SELECTION-SCREEN PARAMETERS ARE NOT SUPPORTED, and that is the endpoint's
limit, not an omission here. Measured on S/4HANA 2023 FPS02:

  - Discovery advertises exactly one query parameter:
    /sap/bc/adt/programs/programrun/{programname}{?profilerId}. There is no
    parameter, select-option or variant in the template.
  - An unknown query parameter is not ignored on the synchronous endpoint — it
    answers HTTP 500 with an ICF error page.
  - The background variant, POST /programs/programrun/job/{programname}, DOES run
    the report (verified: a job appears in TBTCO and reaches status F). But it
    accepts a nonexistent variant, ?variant=ZZ_NO_SUCH_VARIANT, with HTTP 200 and
    an empty body, and ignores a selection body the same way. It validates only
    the program name (a wrong one is a 404). So a variant passed there is
    SILENTLY DISCARDED and the report runs with its default selection values.

A \`parameters\` / \`select_options\` / \`variant\` argument is therefore deliberately
NOT offered: it could only ever be an argument that looks accepted and does
nothing.

WHAT TO DO INSTEAD (contributed by a reporting project that runs a parameterised
report writing to the live Dictionary). Wrap it:

    REPORT zmy_tmp_apply.
    SUBMIT zmy_real_report WITH p_commit = abap_true
                           WITH p_dtel   = abap_true
                           AND RETURN.

then RuntimeRunProgram the wrapper and DeleteProgram it. Two cautions, neither
obvious, both worth the line:

  - Put the wrapper in $TMP. No transport, and no TADIR entry to clean out of a
    customer package afterwards — otherwise removing it needs a deletion marker
    transported.
  - Do NOT flip the real report's own DEFAULT values instead. That is the
    tempting one-liner, and it leaves a report that writes to the live
    Dictionary the moment anyone runs it with no arguments.

The program runs with its DEFAULT selection-screen values. A report with a
MANDATORY parameter will therefore fail; the ICF error page it produces is
reduced to its message by describeSapErrorPage.`,
  inputSchema: {
    type: 'object',
    properties: {
      program_name: {
        type: 'string',
        description: 'ABAP program name to execute.',
      },
      description: {
        type: 'string',
        description: 'Profiler trace description.',
      },
      all_procedural_units: { type: 'boolean' },
      all_misc_abap_statements: { type: 'boolean' },
      all_internal_table_events: { type: 'boolean' },
      all_dynpro_events: { type: 'boolean' },
      aggregate: { type: 'boolean' },
      explicit_on_off: { type: 'boolean' },
      with_rfc_tracing: { type: 'boolean' },
      all_system_kernel_events: { type: 'boolean' },
      sql_trace: { type: 'boolean' },
      all_db_events: { type: 'boolean' },
      max_size_for_trace_file: { type: 'number' },
      amdp_trace: { type: 'boolean' },
      max_time_for_tracing: { type: 'number' },
    },
    required: ['program_name'],
  },
} as const;

interface RuntimeRunProgramWithProfilingArgs {
  program_name: string;
  description?: string;
  all_procedural_units?: boolean;
  all_misc_abap_statements?: boolean;
  all_internal_table_events?: boolean;
  all_dynpro_events?: boolean;
  aggregate?: boolean;
  explicit_on_off?: boolean;
  with_rfc_tracing?: boolean;
  all_system_kernel_events?: boolean;
  sql_trace?: boolean;
  all_db_events?: boolean;
  max_size_for_trace_file?: number;
  amdp_trace?: boolean;
  max_time_for_tracing?: number;
}

export async function handleRuntimeRunProgramWithProfiling(
  context: HandlerContext,
  args: RuntimeRunProgramWithProfilingArgs,
) {
  const { connection, logger } = context;

  try {
    if (!args?.program_name) {
      throw new Error('Parameter "program_name" is required');
    }

    const programName = args.program_name.trim().toUpperCase();
    const executor = new AdtExecutor(connection, logger);
    const programExecutor = executor.getProgramExecutor();

    const result = await programExecutor.runWithProfiling(
      { programName },
      {
        profilerParameters: {
          description: args.description,
          allProceduralUnits: args.all_procedural_units,
          allMiscAbapStatements: args.all_misc_abap_statements,
          allInternalTableEvents: args.all_internal_table_events,
          allDynproEvents: args.all_dynpro_events,
          aggregate: args.aggregate,
          explicitOnOff: args.explicit_on_off,
          withRfcTracing: args.with_rfc_tracing,
          allSystemKernelEvents: args.all_system_kernel_events,
          sqlTrace: args.sql_trace,
          allDbEvents: args.all_db_events,
          maxSizeForTraceFile: args.max_size_for_trace_file,
          amdpTrace: args.amdp_trace,
          maxTimeForTracing: args.max_time_for_tracing,
        },
      },
    );

    return return_response({
      data: JSON.stringify(
        {
          success: true,
          program_name: programName,
          profiler_id: result.profilerId,
          run_status: result.response?.status,
          // trace_id is not returned — program execution is fire-and-forget.
          // Use RuntimeListProfilerTraceFiles to find the trace after execution.
        },
        null,
        2,
      ),
      status: result.response?.status,
      statusText: result.response?.statusText,
      headers: result.response?.headers,
      config: result.response?.config,
    });
  } catch (error: any) {
    // SAP forwards an ICF failure as a complete HTML error page — up to
    // 10.8 KB of markup and inline CSS around one useful sentence. Reduce
    // it to the message, the error code and the program.
    const page = describeSapErrorPage(error, 'RuntimeRunProgramWithProfiling');
    if (page) {
      logger?.error(page.message);
      return return_error(new Error(page.message));
    }
    logger?.error('Error running program with profiling:', error);
    return return_error(error);
  }
}
