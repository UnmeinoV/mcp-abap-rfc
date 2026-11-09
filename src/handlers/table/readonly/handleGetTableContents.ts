import * as z from 'zod';
import { createAdtClient } from '../../../lib/clients';
import {
  describeDataPreviewError,
  isSessionError,
} from '../../../lib/dataPreviewParser';
import type { HandlerContext } from '../../../lib/handlers/interfaces';
import { ErrorCode, McpError } from '../../../lib/utils';
import { parseSqlQueryXml } from '../../system/readonly/handleGetSqlQuery';

export const TOOL_DEFINITION = {
  name: 'GetTableContents',
  available_in: ['onprem'] as const,
  description:
    '[read-only] Retrieve contents (data preview) of an ABAP database table or CDS view. Returns rows ' +
    'of data like SE16/SE16N. A blank cell is returned as an empty string, never as a missing row. ' +
    'The result is trimmed to max_rows and has_more:true is set when SAP indicated more rows exist. ' +
    'IMPORTANT: total_rows is SAP’s own <totalRows> and is 0 unless a count was requested — ' +
    'branch on returned_rows, never on total_rows.',
  inputSchema: {
    table_name: z.string().describe('Name of the ABAP table'),
    max_rows: z
      .number()
      .optional()
      .describe('Maximum number of rows to retrieve (default 100)'),
  },
} as const;

export async function handleGetTableContents(
  context: HandlerContext,
  args: any,
) {
  const { connection, logger } = context;
  try {
    if (!args?.table_name) {
      throw new McpError(ErrorCode.InvalidParams, 'Table name is required');
    }

    const tableName = args.table_name;
    const maxRows = args.max_rows || 100;

    logger?.info(`Reading table contents: ${tableName} (max_rows=${maxRows})`);

    const client = createAdtClient(connection, logger);
    const read = () =>
      client
        .getUtils()
        .getTableContents({ table_name: tableName, max_rows: maxRows });

    // Session-class failures surface as HTTP 400 and are transient; retry once
    // rather than handing the caller something that looks like a bad request.
    let response: any;
    try {
      response = await read();
    } catch (error) {
      if (!isSessionError(error)) throw error;
      logger?.warn(
        'Table contents read failed with a session-level error; retrying once transparently',
      );
      response = await read();
    }

    if (response.status === 200 && response.data) {
      logger?.info('Table contents request completed successfully');

      // maxRows is passed as the bound: the /datapreview/ddic endpoint answers
      // rowNumber+1 rows (measured: max_rows 10 -> 11), and returning one more
      // row than the caller budgeted for is how a "returned_rows disagrees with
      // max_rows" report gets written.
      const parsedData = parseSqlQueryXml(
        response.data,
        `SELECT * FROM ${tableName}`,
        maxRows,
        logger,
      );

      logger?.debug(
        `Parsed table data: rows=${parsedData.rows.length}, columns=${parsedData.columns.length}`,
      );

      return {
        isError: false,
        content: [
          {
            type: 'text',
            text: JSON.stringify(parsedData, null, 2),
          },
        ],
      };
    } else {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to read table contents. Status: ${response.status}`,
      );
    }
  } catch (error) {
    logger?.error('Failed to read table contents', error as any);
    return {
      isError: true,
      content: [
        {
          type: 'text',
          text:
            error instanceof McpError
              ? String(error.message)
              : describeDataPreviewError(error),
        },
      ],
    };
  }
}
