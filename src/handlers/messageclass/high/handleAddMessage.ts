/**
 * AddMessage — add one message to a message class (SE91).
 *
 * The message list is read from SAP and written back with one entry changed, so
 * the caller never holds the messages it is not touching. See editMessageCore.
 */

import type { HandlerContext } from '../../../lib/handlers/interfaces';
import {
  editMessage,
  type MessageEditArgs,
  MSGNO_DESC,
} from './editMessageCore';

export const TOOL_DEFINITION = {
  name: 'AddMessage',
  available_in: ['onprem', 'legacy'] as const,
  description:
    'Operation: Create. Subject: One message in a message class (SE91). Add a single message ' +
    'WITHOUT re-sending the rest of the class — the existing messages are read from SAP and ' +
    'preserved, so they cannot be lost in transit (unlike UpdateMessageClass, which replaces ' +
    'the whole list). Fails if the message number already exists, rather than overwriting a ' +
    'message that is probably already referenced in code.',
  inputSchema: {
    type: 'object',
    properties: {
      message_class_name: {
        type: 'string',
        description: 'Message class name (e.g., ZMY_MSGCLASS).',
      },
      msgno: { type: 'string', description: MSGNO_DESC },
      text: {
        type: 'string',
        description:
          'Message short text. May contain the placeholders &1 &2 &3 &4. Max 73 characters.',
      },
      self_explanatory: {
        type: 'boolean',
        description:
          'Whether the message is self-explanatory (no long text needed). Default true.',
      },
      transport_request: {
        type: 'string',
        description:
          'Transport request, when the class is in a transportable package.',
      },
    },
    required: ['message_class_name', 'msgno', 'text'],
  },
} as const;

export function handleAddMessage(
  context: HandlerContext,
  args: MessageEditArgs,
) {
  return editMessage(context, args, 'add');
}
