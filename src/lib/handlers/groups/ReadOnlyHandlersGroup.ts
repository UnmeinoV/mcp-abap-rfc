import {
  TOOL_DEFINITION as GetAccessControl_Tool,
  handleGetAccessControl,
} from '../../../handlers/access_control/readonly/handleGetAccessControl';
import {
  handleReadBehaviorDefinition,
  TOOL_DEFINITION as ReadBehaviorDefinition_Tool,
} from '../../../handlers/behavior_definition/readonly/handleReadBehaviorDefinition';
import {
  handleReadBehaviorImplementation,
  TOOL_DEFINITION as ReadBehaviorImplementation_Tool,
} from '../../../handlers/behavior_implementation/readonly/handleReadBehaviorImplementation';
import {
  TOOL_DEFINITION as GetClassMethod_Tool,
  handleGetClassMethod,
} from '../../../handlers/class/readonly/handleGetClassMethod';
import {
  TOOL_DEFINITION as GetClassMethods_Tool,
  handleGetClassMethods,
} from '../../../handlers/class/readonly/handleGetClassMethods';
import {
  handleReadClass,
  TOOL_DEFINITION as ReadClass_Tool,
} from '../../../handlers/class/readonly/handleReadClass';
import {
  handleReadDataElement,
  TOOL_DEFINITION as ReadDataElement_Tool,
} from '../../../handlers/data_element/readonly/handleReadDataElement';
import {
  handleReadDomain,
  TOOL_DEFINITION as ReadDomain_Tool,
} from '../../../handlers/domain/readonly/handleReadDomain';
import {
  TOOL_DEFINITION as GetEnhancementImpl_Tool,
  handleGetEnhancementImpl,
} from '../../../handlers/enhancement/readonly/handleGetEnhancementImpl';
import {
  TOOL_DEFINITION as GetEnhancementSpot_Tool,
  handleGetEnhancementSpot,
} from '../../../handlers/enhancement/readonly/handleGetEnhancementSpot';
import {
  TOOL_DEFINITION as GetEnhancements_Tool,
  handleGetEnhancements,
} from '../../../handlers/enhancement/readonly/handleGetEnhancements';
import {
  handleReadFunctionGroup,
  TOOL_DEFINITION as ReadFunctionGroup_Tool,
} from '../../../handlers/function_group/readonly/handleReadFunctionGroup';
import {
  handleReadFunctionModule,
  TOOL_DEFINITION as ReadFunctionModule_Tool,
} from '../../../handlers/function_module/readonly/handleReadFunctionModule';
import {
  TOOL_DEFINITION as GetInclude_Tool,
  handleGetInclude,
} from '../../../handlers/include/readonly/handleGetInclude';
import {
  TOOL_DEFINITION as GetIncludesList_Tool,
  handleGetIncludesList,
} from '../../../handlers/include/readonly/handleGetIncludesList';
import {
  handleReadInterface,
  TOOL_DEFINITION as ReadInterface_Tool,
} from '../../../handlers/interface/readonly/handleReadInterface';
import {
  TOOL_DEFINITION as GetLockObject_Tool,
  handleGetLockObject,
} from '../../../handlers/lockobject/readonly/handleGetLockObject';
import {
  TOOL_DEFINITION as GetMessageClass_Tool,
  handleGetMessageClass,
} from '../../../handlers/messageclass/readonly/handleGetMessageClass';
import {
  handleReadMetadataExtension,
  TOOL_DEFINITION as ReadMetadataExtension_Tool,
} from '../../../handlers/metadata_extension/readonly/handleReadMetadataExtension';
import {
  TOOL_DEFINITION as GetPackageContents_Tool,
  handleGetPackageContents,
} from '../../../handlers/package/readonly/handleGetPackageContents';
import {
  handleReadPackage,
  TOOL_DEFINITION as ReadPackage_Tool,
} from '../../../handlers/package/readonly/handleReadPackage';
import {
  handleReadProgram,
  TOOL_DEFINITION as ReadProgram_Tool,
} from '../../../handlers/program/readonly/handleReadProgram';
import {
  handleReadServiceBinding,
  TOOL_DEFINITION as ReadServiceBinding_Tool,
} from '../../../handlers/service_binding/readonly/handleReadServiceBinding';
import {
  handleReadServiceDefinition,
  TOOL_DEFINITION as ReadServiceDefinition_Tool,
} from '../../../handlers/service_definition/readonly/handleReadServiceDefinition';
import {
  handleReadStructure,
  TOOL_DEFINITION as ReadStructure_Tool,
} from '../../../handlers/structure/readonly/handleReadStructure';
import {
  TOOL_DEFINITION as GetTableContents_Tool,
  handleGetTableContents,
} from '../../../handlers/table/readonly/handleGetTableContents';
import {
  TOOL_DEFINITION as GetTableIndexes_Tool,
  handleGetTableIndexes,
} from '../../../handlers/table/readonly/handleGetTableIndexes';
import {
  TOOL_DEFINITION as GetTableTechnicalSettings_Tool,
  handleGetTableTechnicalSettings,
} from '../../../handlers/table/readonly/handleGetTableTechnicalSettings';
import {
  handleReadTable,
  TOOL_DEFINITION as ReadTable_Tool,
} from '../../../handlers/table/readonly/handleReadTable';
import {
  TOOL_DEFINITION as GetTransport_Tool,
  handleGetTransport,
} from '../../../handlers/transport/readonly/handleGetTransport';
import {
  handleListTransports,
  TOOL_DEFINITION as ListTransports_Tool,
} from '../../../handlers/transport/readonly/handleListTransports';
import {
  handleReadView,
  TOOL_DEFINITION as ReadView_Tool,
} from '../../../handlers/view/readonly/handleReadView';
import {
  TOOL_DEFINITION as GetXslt_Tool,
  handleGetXslt,
} from '../../../handlers/xslt/readonly/handleGetXslt';
import { BaseHandlerGroup } from '../base/BaseHandlerGroup.js';
import type { HandlerContext, HandlerEntry } from '../interfaces.js';
import {
  type IReadOnlyDedupStrategy,
  NoDedupStrategy,
} from './strategies/index.js';

/**
 * Handler group for all readonly (read-only) handlers.
 * Contains handlers that only read data without modifying the ABAP system.
 *
 * When other groups (HighLevel / LowLevel / Compact) are also exposed, some
 * readonly handlers semantically duplicate tools from those groups
 * (e.g. ReadFunctionModule vs GetFunctionModule). The group hides such
 * duplicates based on the injected override strategy and the set of tool
 * names contributed by the other groups.
 */
export class ReadOnlyHandlersGroup extends BaseHandlerGroup {
  protected groupName = 'ReadOnlyHandlers';
  private readonly overridingToolNames: ReadonlySet<string>;
  private readonly dedupStrategy: IReadOnlyDedupStrategy;

  constructor(
    context: HandlerContext,
    overridingToolNames: ReadonlySet<string> = new Set(),
    dedupStrategy: IReadOnlyDedupStrategy = new NoDedupStrategy(),
  ) {
    super(context);
    this.overridingToolNames = overridingToolNames;
    this.dedupStrategy = dedupStrategy;
  }

  /**
   * Gets all readonly handler entries, filtered by the dedup strategy.
   */
  getHandlers(): HandlerEntry[] {
    return this.getAllEntries().filter(
      (e) => !this.dedupStrategy.shouldExclude(e, this.overridingToolNames),
    );
  }

  private getAllEntries(): HandlerEntry[] {
    return [
      // Existing readonly handlers
      {
        toolDefinition: GetTableIndexes_Tool,
        handler: (args: any) => handleGetTableIndexes(this.context, args),
      },
      {
        toolDefinition: GetTableTechnicalSettings_Tool,
        handler: (args: any) =>
          handleGetTableTechnicalSettings(this.context, args),
      },
      {
        toolDefinition: GetTableContents_Tool,
        handler: (args: any) => handleGetTableContents(this.context, args),
      },
      {
        toolDefinition: GetPackageContents_Tool,
        handler: (args: any) => handleGetPackageContents(this.context, args),
      },
      {
        toolDefinition: GetInclude_Tool,
        handler: (args: any) => handleGetInclude(this.context, args),
      },
      {
        toolDefinition: GetIncludesList_Tool,
        handler: (args: any) => handleGetIncludesList(this.context, args),
      },
      {
        toolDefinition: GetEnhancements_Tool,
        handler: (args: any) => handleGetEnhancements(this.context, args),
      },
      {
        toolDefinition: GetEnhancementSpot_Tool,
        handler: (args: any) => handleGetEnhancementSpot(this.context, args),
      },
      {
        toolDefinition: GetEnhancementImpl_Tool,
        handler: (args: any) => handleGetEnhancementImpl(this.context, args),
      },
      {
        toolDefinition: GetTransport_Tool,
        handler: (args: any) => handleGetTransport(this.context, args),
      },
      {
        toolDefinition: ListTransports_Tool,
        handler: (args: any) => handleListTransports(this.context, args),
      },
      // Read object source + metadata handlers
      {
        toolDefinition: ReadClass_Tool,
        handler: (args: any) => handleReadClass(this.context, args),
      },
      {
        toolDefinition: GetClassMethods_Tool,
        handler: (args: any) => handleGetClassMethods(this.context, args),
      },
      {
        toolDefinition: GetClassMethod_Tool,
        handler: (args: any) => handleGetClassMethod(this.context, args),
      },
      {
        toolDefinition: ReadInterface_Tool,
        handler: (args: any) => handleReadInterface(this.context, args),
      },
      {
        toolDefinition: ReadProgram_Tool,
        handler: (args: any) => handleReadProgram(this.context, args),
      },
      {
        toolDefinition: ReadTable_Tool,
        handler: (args: any) => handleReadTable(this.context, args),
      },
      {
        toolDefinition: ReadStructure_Tool,
        handler: (args: any) => handleReadStructure(this.context, args),
      },
      {
        toolDefinition: ReadView_Tool,
        handler: (args: any) => handleReadView(this.context, args),
      },
      {
        toolDefinition: ReadDomain_Tool,
        handler: (args: any) => handleReadDomain(this.context, args),
      },
      {
        toolDefinition: ReadDataElement_Tool,
        handler: (args: any) => handleReadDataElement(this.context, args),
      },
      {
        toolDefinition: ReadFunctionModule_Tool,
        handler: (args: any) => handleReadFunctionModule(this.context, args),
      },
      {
        toolDefinition: ReadFunctionGroup_Tool,
        handler: (args: any) => handleReadFunctionGroup(this.context, args),
      },
      {
        toolDefinition: ReadPackage_Tool,
        handler: (args: any) => handleReadPackage(this.context, args),
      },
      {
        toolDefinition: ReadServiceDefinition_Tool,
        handler: (args: any) => handleReadServiceDefinition(this.context, args),
      },
      {
        toolDefinition: ReadMetadataExtension_Tool,
        handler: (args: any) => handleReadMetadataExtension(this.context, args),
      },
      {
        toolDefinition: ReadBehaviorDefinition_Tool,
        handler: (args: any) =>
          handleReadBehaviorDefinition(this.context, args),
      },
      {
        toolDefinition: ReadBehaviorImplementation_Tool,
        handler: (args: any) =>
          handleReadBehaviorImplementation(this.context, args),
      },
      {
        toolDefinition: ReadServiceBinding_Tool,
        handler: (args: any) => handleReadServiceBinding(this.context, args),
      },
      {
        toolDefinition: GetXslt_Tool,
        handler: (args: any) => handleGetXslt(this.context, args),
      },
      {
        toolDefinition: GetAccessControl_Tool,
        handler: (args: any) => handleGetAccessControl(this.context, args),
      },
      {
        toolDefinition: GetMessageClass_Tool,
        handler: (args: any) => handleGetMessageClass(this.context, args),
      },
      {
        toolDefinition: GetLockObject_Tool,
        handler: (args: any) => handleGetLockObject(this.context, args),
      },
    ];
  }
}
